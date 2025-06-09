/**
 * Perplexity AI API service
 * Uses the Perplexity API to generate conversational responses for the chatbot
 * and for image recognition tasks
 */

// Ensure we have the API key
if (!process.env.PERPLEXITY_API_KEY) {
  console.error('PERPLEXITY_API_KEY is not set in environment variables');
}

/**
 * Recognize food from an image using Perplexity's vision capabilities
 * @param imageBase64 Base64-encoded image
 * @returns Promise with array of recognized foods and confidence scores
 */
export async function recognizeFoodWithPerplexity(imageBase64: string): Promise<{ name: string, confidence: number }[]> {
  try {
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "llama-3.1-sonar-small-128k-online",
        messages: [
          {
            role: "system",
            content: "أنت خبير في تحليل الصور والتعرف على الأطعمة. قم أولاً بتحديد ما إذا كانت الصورة تحتوي على طعام أم لا. إذا لم تحتوي الصورة على أي طعام (مثل الأشخاص، الأشياء، المناظر الطبيعية، النصوص، إلخ)، أجب بمصفوفة فارغة: []. إذا كانت الصورة تحتوي على طعام، حدد جميع الأطعمة المرئية واذكرها باللغة العربية. قدم إجابتك بصيغة JSON تحتوي على مصفوفة، حيث كل عنصر يحتوي على name (اسم الطعام بالعربية) وconfidence (قيمة الثقة بين 0 و1). لا تذكر سوى الأطعمة الواضحة (بحد أقصى 5 عناصر)."
          },
          {
            role: "user",
            content: "تحليل الصورة: هل تحتوي على طعام؟ إذا نعم، حدد الأطعمة. قدم الإجابة بصيغة JSON فقط بدون نص إضافي."
          }
        ],
        temperature: 0.2,
        max_tokens: 500,
        top_p: 0.9,
        stream: false,
        presence_penalty: 0,
        frequency_penalty: 1
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error(`Perplexity API error (${response.status}):`, errorData);
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    
    // Extract the assistant's message from the response
    const content = data.choices[0].message.content;
    
    // Try to find and extract JSON from the text
    console.log("Raw content from Perplexity:", content);
    
    // Different patterns to match JSON in the response
    const jsonMatch = 
      content.match(/```json\s*([\s\S]*?)\s*```/) || // Match JSON in code blocks
      content.match(/```\s*([\s\S]*?)\s*```/) ||     // Match any code block
      content.match(/{[\s\S]*?}/);                   // Match any JSON-like structure
    
    let jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : content;
    
    // Clean up the string (remove markdown code blocks if present)
    jsonStr = jsonStr.replace(/```json|```/g, '').trim();
    
    console.log("Extracted JSON string:", jsonStr);
    
    try {
      // Try to parse the JSON string
      const result = JSON.parse(jsonStr);
      
      // Ensure we have the expected format with foods array
      if (result && Array.isArray(result.foods)) {
        return result.foods.map((food: any) => ({
          name: food.name,
          confidence: parseFloat(food.confidence) || 0.8
        }));
      } 
      
      // Alternative format: check if it's a direct array
      if (result && Array.isArray(result)) {
        return result.map((food: any) => ({
          name: food.name || food.food || food,
          confidence: parseFloat(food.confidence) || 0.8
        }));
      }
      
      // Try to look for foods array in various places
      for (const key in result) {
        if (result[key] && Array.isArray(result[key])) {
          return result[key].map((food: any) => ({
            name: typeof food === 'string' ? food : (food.name || food.food || "Unknown food"),
            confidence: typeof food === 'object' ? (parseFloat(food.confidence) || 0.8) : 0.8
          }));
        }
      }
      
      console.log("Could not find foods array in result:", result);
      return [];
    } catch (jsonError) {
      console.error("Error parsing JSON from Perplexity response:", jsonError);
      
      // As a last resort, try to extract food names using regex
      try {
        const foodNames = content.match(/"name":\s*"([^"]+)"/g) || [];
        if (foodNames.length > 0) {
          return foodNames.map(match => {
            const name = match.replace(/"name":\s*"([^"]+)"/, '$1');
            return { name, confidence: 0.8 };
          });
        }
      } catch (e) {
        console.error("Regex extraction failed:", e);
      }
      
      return [];
    }
  } catch (error) {
    console.error("Error calling Perplexity Vision API:", error);
    return [];
  }
}

/**
 * Generate a chatbot response using Perplexity API
 * @param query User's message/question
 * @param language Language code ('ar' or 'en')
 * @returns Promise with chatbot's response
 */
export async function chatWithPerplexity(query: string, language: string = 'ar'): Promise<string> {
  try {
    // API reference: https://docs.perplexity.ai/reference/post_chat_completions
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "llama-3.1-sonar-small-128k-online",
        messages: [
          {
            role: "system",
            content: language === 'ar' 
              ? "أنت مساعد طبي متخصص في التغذية العلاجية لمرضى السكري. قدم إجابات قصيرة وموجزة جداً (لا تزيد عن 1-3 جمل) بناءً على المعرفة الطبية الحديثة. تحدث بلغة بسيطة وواضحة وتجنب المصطلحات المعقدة. إجاباتك باللغة العربية فقط. ركز على المعلومات الطبية المتعلقة بالسكري والنصائح التغذوية العلاجية. تأكد من أن إجاباتك مختصرة وسهلة الفهم. لا تدعي أن تكون طبيبا أو تقدم تشخيصات طبية."
              : "You are a medical assistant specializing in therapeutic nutrition for diabetic patients. Provide VERY brief and concise answers (no more than 1-3 sentences) based on current medical knowledge. Use simple, clear language and avoid complex terminology. Focus on essential medical information related to diabetes and therapeutic nutrition advice. Ensure your responses are short and easy to understand. Do not claim to be a doctor or provide medical diagnoses."
          },
          {
            role: "user",
            content: query
          }
        ],
        temperature: 0.2,
        max_tokens: 500,
        top_p: 0.9,
        stream: false,
        presence_penalty: 0,
        frequency_penalty: 1
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error(`Perplexity API error (${response.status}):`, errorData);
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    
    // Extract the assistant's message from the response
    const answer = data.choices[0].message.content;
    
    return answer;
  } catch (error) {
    console.error('Error in chatWithPerplexity:', error);
    
    // Return a friendly error message in the appropriate language
    return language === 'ar'
      ? "عذراً، حدث خطأ في الاتصال. يرجى المحاولة مرة أخرى لاحقاً."
      : "Sorry, there was a connection error. Please try again later.";
  }
}