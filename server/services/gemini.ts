/**
 * Gemini AI API service
 * Uses the Google Gemini API for enhanced image analysis and food recognition
 */
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

// Initialize the Google Generative AI with the API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Gemini model for vision tasks - using the Vision model
const geminiVisionModel = genAI.getGenerativeModel({ 
  model: "gemini-1.5-flash",
  safetySettings: [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
  ],
});

// Text-only model for chat
const geminiTextModel = genAI.getGenerativeModel({ 
  model: "gemini-1.5-flash",
  safetySettings: [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
  ],
});

/**
 * Recognize food from an image using Gemini's vision capabilities
 * @param imageBase64 Base64-encoded image
 * @returns Promise with array of recognized foods and confidence scores
 */
export async function recognizeFoodWithGemini(imageBase64: string): Promise<{ name: string, confidence: number }[]> {
  try {
    // Create prompt with the image
    const prompt = "Analyze this image and identify all food items present. Look for individual ingredients, dishes, and any visible food components. Be comprehensive and detailed in your analysis. Return your response as a JSON array of objects with 'name' (in Arabic) and 'confidence' (0-1 value) properties. Format your response with only the JSON array, without any additional explanation or text.";
    
    // Prepare the image for the API
    const imageParts = [
      {
        inlineData: {
          data: imageBase64,
          mimeType: "image/jpeg"
        }
      }
    ];

    // Generate content with the vision model
    const result = await geminiVisionModel.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }, ...imageParts] }],
    });
    
    const response = result.response;
    const text = response.text();
    
    // Try to find and extract JSON from the text
    console.log("Raw content from Gemini:", text);
    
    // Different patterns to match JSON in the response
    const jsonMatch = 
      text.match(/```json\s*([\s\S]*?)\s*```/) || // Match JSON in code blocks
      text.match(/```\s*([\s\S]*?)\s*```/) ||     // Match any code block
      text.match(/{[\s\S]*?}/);                   // Match any JSON-like structure
    
    let jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : text;
    
    // Clean up the string (remove markdown code blocks if present)
    jsonStr = jsonStr.replace(/```json|```/g, '').trim();
    
    console.log("Extracted JSON string:", jsonStr);
    
    try {
      // Try to parse the JSON string
      const result = JSON.parse(jsonStr);
      
      // Ensure we have the expected format - this handles multiple possible response formats
      if (result && Array.isArray(result)) {
        return result.map((food: any) => ({
          name: food.name || food.food || food,
          confidence: parseFloat(food.confidence) || 0.8
        }));
      }
      
      if (result && Array.isArray(result.foods)) {
        return result.foods.map((food: any) => ({
          name: food.name,
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
      console.error("Error parsing JSON from Gemini response:", jsonError);
      
      // As a last resort, try to extract food names using regex
      try {
        const foodNames = text.match(/"name":\s*"([^"]+)"/g) || [];
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
    console.error("Error calling Gemini Vision API:", error);
    return [];
  }
}

/**
 * Generate a chatbot response using Gemini API
 * @param query User's message/question
 * @param language Language code ('ar' or 'en')
 * @returns Promise with chatbot's response
 */
export async function chatWithGemini(query: string, language: string = 'ar'): Promise<string> {
  try {
    // Create a chat session
    const chat = geminiTextModel.startChat({
      history: [
        {
          role: "user",
          parts: [{text: "I'll be asking questions about diabetes and nutrition. Please provide answers that are accurate, helpful, and tailored to diabetic patients."}],
        },
        {
          role: "model",
          parts: [{text: "I understand. I'll provide evidence-based information about diabetes management and nutrition. My responses will be tailored to the specific needs of people with diabetes, focusing on clinical guidelines, nutritional science, and practical advice. I'll aim to be clear, helpful, and accurate in addressing your questions about diabetic nutrition and health management."}],
        },
      ],
      generationConfig: {
        temperature: 0.2,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 500,
      },
    });
    
    // Create system prompt based on language
    let systemPrompt = language === 'ar' 
      ? "أنت مساعد طبي متخصص في التغذية العلاجية لمرضى السكري. قدم إجابات دقيقة ومفيدة باللغة العربية الفصحى. تجنب المصطلحات المعقدة، وركز على تقديم معلومات دقيقة وعملية عن التغذية لمرضى السكري."
      : "You are a medical assistant specializing in therapeutic nutrition for diabetic patients. Provide accurate and helpful answers in English. Avoid complex terminology and focus on providing accurate and practical information about nutrition for diabetic patients.";
    
    // Send the message with system prompt
    const result = await chat.sendMessage(systemPrompt + "\n\n" + query);
    const response = result.response;
    
    return response.text();
  } catch (error) {
    console.error('Error in chatWithGemini:', error);
    
    // Return a friendly error message in the appropriate language
    return language === 'ar'
      ? "عذراً، حدث خطأ في الاتصال. يرجى المحاولة مرة أخرى لاحقاً."
      : "Sorry, there was a connection error. Please try again later.";
  }
}