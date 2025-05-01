/**
 * Perplexity AI API service
 * Uses the Perplexity API to generate conversational responses for the chatbot
 */

// Ensure we have the API key
if (!process.env.PERPLEXITY_API_KEY) {
  console.error('PERPLEXITY_API_KEY is not set in environment variables');
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
              ? "أنت مساعد متخصص في التغذية العلاجية لمرضى السكري. قدم إجابات دقيقة ومفيدة بناءً على المعرفة الطبية الحديثة. تحدث بلغة بسيطة وواضحة وتجنب المصطلحات المعقدة. إجاباتك باللغة العربية فقط."
              : "You are a therapeutic nutrition assistant for diabetic patients. Provide accurate and helpful answers based on current medical knowledge. Use simple, clear language and avoid complex terminology."
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