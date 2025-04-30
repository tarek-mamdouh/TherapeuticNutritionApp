import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const MODEL = "gpt-4o";

// Initialize OpenAI client
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * Get a chatbot response using OpenAI's API
 * @param query User's message/question
 * @param language Language code ('ar' or 'en')
 * @returns Promise with the chatbot's response
 */
export async function chatWithOpenAI(query: string, language: string = 'ar'): Promise<string> {
  try {
    // Determine if the query is in Arabic or English
    const isArabic = /[\u0600-\u06FF]/.test(query);
    const responseLanguage = isArabic ? 'ar' : language;
    
    // Create system prompt with language instruction
    let systemPrompt = "You are a helpful nutrition assistant for diabetic patients. ";
    systemPrompt += "Provide accurate, evidence-based information about diet and nutrition for diabetic management. ";
    systemPrompt += "Keep responses concise (max 3 paragraphs). ";
    
    if (responseLanguage === 'ar') {
      systemPrompt += "Always respond in fluent, grammatically correct Arabic. ";
    } else {
      systemPrompt += "Always respond in fluent, grammatically correct English. ";
    }
    
    systemPrompt += "If you don't know the answer, say so rather than making up information. ";
    systemPrompt += "Focus specifically on diabetic nutrition information.";

    // Make API call
    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: query }
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    // Return the response text
    return response.choices[0].message.content?.trim() || "I'm sorry, I couldn't generate a response.";
  } catch (error) {
    console.error("Error calling OpenAI:", error);
    
    // Return a friendly error message in the appropriate language
    if (language === 'ar') {
      return "عذراً، حدث خطأ أثناء معالجة سؤالك. يرجى المحاولة مرة أخرى لاحقاً.";
    } else {
      return "Sorry, an error occurred while processing your question. Please try again later.";
    }
  }
}

/**
 * Get food recognition from an image using OpenAI's vision capabilities
 * @param imageBase64 Base64-encoded image
 * @returns Promise with array of recognized foods and confidence scores
 */
export async function recognizeFoodWithOpenAI(imageBase64: string): Promise<{ name: string, confidence: number }[]> {
  try {
    // Create prompt for vision model
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a food recognition expert. Analyze the image and identify all food items present. Return the result as a JSON array of objects, each with 'name' (in Arabic) and 'confidence' (0-1 value) properties. Include only the most likely foods (max 5 items)."
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Identify all food items in this image. Return only JSON without any other text."
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${imageBase64}`
              }
            }
          ]
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 300
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    // Ensure we have the expected format
    if (Array.isArray(result.foods)) {
      return result.foods.map((food: any) => ({
        name: food.name,
        confidence: parseFloat(food.confidence) || 0.8
      }));
    }
    
    return [];
  } catch (error) {
    console.error("Error calling OpenAI Vision:", error);
    // Return empty array and let the calling function handle the fallback logic
    return [];
  }
}
