import OpenAI from "openai";
import { storage } from '../storage';

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
    systemPrompt += "KEEP RESPONSES EXTREMELY BRIEF (1-3 SENTENCES ONLY). ";
    
    if (responseLanguage === 'ar') {
      systemPrompt += "Always respond in fluent, grammatically correct Arabic. Make responses very concise and direct. ";
    } else {
      systemPrompt += "Always respond in fluent, grammatically correct English. Make responses very concise and direct. ";
    }
    
    systemPrompt += "If you don't know the answer, say so briefly rather than making up information. ";
    systemPrompt += "Focus specifically on diabetic nutrition information and keep all explanations extremely short.";

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
    
    // Try to get a response from our QA database as fallback
    try {
      // Use our searchQADatabase function
      const qaEntries = await searchQADatabase(query, language);
      if (qaEntries && qaEntries.length > 0) {
        return qaEntries[0].answer;
      }
    } catch (dbError) {
      console.error("Error accessing QA database:", dbError);
    }
    
    // Return predetermined responses for common diabetes nutrition questions
    if (query.toLowerCase().includes("banana") || query.toLowerCase().includes("موز")) {
      if (language === 'ar') {
        return "الموز يحتوي على نسبة متوسطة من السكر. يمكن لمرضى السكري تناوله باعتدال (نصف موزة متوسطة) كجزء من نظام غذائي متوازن. المؤشر الجلايسيمي للموز الناضج هو 51، وهو معتدل. تأكد من مراقبة مستويات السكر في الدم بانتظام.";
      } else {
        return "Bananas contain a moderate amount of sugar. Diabetics can consume them in moderation (half a medium banana) as part of a balanced diet. The glycemic index of a ripe banana is 51, which is moderate. Make sure to monitor your blood sugar levels regularly.";
      }
    }
    
    if (query.toLowerCase().includes("rice") || query.toLowerCase().includes("أرز")) {
      if (language === 'ar') {
        return "الأرز الأبيض له مؤشر جلايسيمي مرتفع، مما قد يؤدي إلى ارتفاع سريع في نسبة السكر بالدم. يُفضل استبداله بالأرز البني أو البسمتي، واستهلاكه بكميات معتدلة. حصة مناسبة هي حوالي ثلث كوب من الأرز المطبوخ للوجبة.";
      } else {
        return "White rice has a high glycemic index, which can lead to rapid blood sugar spikes. It's preferable to substitute with brown or basmati rice, and consume it in moderate portions. An appropriate serving is about 1/3 cup of cooked rice per meal.";
      }
    }
    
    if (query.toLowerCase().includes("sugar") || query.toLowerCase().includes("سكر")) {
      if (language === 'ar') {
        return "يجب على مرضى السكري تقليل استهلاك السكر المضاف قدر الإمكان. يمكن استخدام بدائل السكر مثل الستيفيا أو الإريثريتول باعتدال. تأكد من قراءة الملصقات الغذائية للكشف عن السكريات المخفية في الأطعمة المصنعة.";
      } else {
        return "Diabetics should minimize added sugar consumption as much as possible. Sugar alternatives like stevia or erythritol can be used in moderation. Make sure to read nutrition labels to detect hidden sugars in processed foods.";
      }
    }
    
    // Return a friendly error message if no matching response found
    if (language === 'ar') {
      return "عذراً، لا يمكنني الإجابة على هذا السؤال حاليًا. يمكنك تجربة أسئلة أخرى حول التغذية لمرضى السكري مثل 'هل يمكنني تناول الموز؟' أو 'ما هي البدائل الصحية للأرز الأبيض؟'";
    } else {
      return "Sorry, I can't answer this question at the moment. You can try other questions about diabetic nutrition like 'Can I eat bananas?' or 'What are healthy alternatives to white rice?'";
    }
  }
}

// Function to get responses from QA database
/**
 * Search the QA database for relevant answers
 * @param query User's message/question
 * @param language Language code ('ar' or 'en')
 * @returns Promise with matching QA entries
 */
export async function searchQADatabase(query: string, language: string = 'ar'): Promise<any[]> {
  try {
    // Get all QA entries that match the language from the storage instance
    const qaEntries = await storage.getQAByLanguage(language);
    
    // Simple matching algorithm - check if the question contains keywords from the query
    // In a real app, this would use more sophisticated NLP techniques
    const matches = qaEntries.filter(qa => {
      const normalizedQuery = query.toLowerCase();
      const normalizedQuestion = qa.question.toLowerCase();
      
      // Check if query terms appear in the question
      const queryTerms = normalizedQuery.split(/\s+/);
      return queryTerms.some(term => 
        term.length > 3 && normalizedQuestion.includes(term)
      );
    });
    
    return matches;
  } catch (error) {
    console.error("Error querying QA database:", error);
    return [];
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
          content: "You are a food recognition expert. First, determine if this image contains any food items, meals, or edible ingredients. If the image does NOT contain food (e.g., shows people, objects, scenery, text, etc.), return an empty array: []. If the image DOES contain food, identify all visible food items and return a JSON array with 'name' (in Arabic) and 'confidence' (0-1) properties. Only include clearly visible foods (max 5 items)."
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Analyze this image: Does it contain food? If yes, identify the foods. Return only JSON array without any other text."
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
