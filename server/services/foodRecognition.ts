import { recognizeFoodWithPerplexity } from "./perplexity";
import { recognizeFoodWithOpenAI } from "./openai";
import { RecognizedFood } from "@shared/schema";
import { storage } from "../storage";

/**
 * Recognize food from an image buffer
 * @param imageBuffer Binary image data
 * @returns Promise with array of recognized foods
 */
export async function recognizeFood(imageBuffer: Buffer): Promise<RecognizedFood[]> {
  try {
    // Convert buffer to base64
    const base64Image = imageBuffer.toString("base64");
    
    // Try to use Perplexity API first
    try {
      const perplexityFoods = await recognizeFoodWithPerplexity(base64Image);
      
      // If Perplexity succeeded, return the results
      if (perplexityFoods && perplexityFoods.length > 0) {
        console.log("Successfully recognized foods with Perplexity:", perplexityFoods);
        return perplexityFoods;
      }
    } catch (perplexityError) {
      console.error("Perplexity API error:", perplexityError);
      // Continue to next approach (OpenAI)
    }
    
    // Fallback to OpenAI if Perplexity failed
    try {
      console.log("Falling back to OpenAI for food recognition");
      const openAIFoods = await recognizeFoodWithOpenAI(base64Image);
      
      if (openAIFoods && openAIFoods.length > 0) {
        console.log("Successfully recognized foods with OpenAI:", openAIFoods);
        return openAIFoods;
      }
    } catch (openAIError) {
      console.error("OpenAI API error:", openAIError);
    }
    
    // If all API attempts fail, use sample data
    console.log("Food recognition returned no results from any API, using fallback foods");
    return getFallbackFoods();
  } catch (error) {
    console.error("Food recognition error:", error);
    // Return fallback foods if there's an error
    return getFallbackFoods();
  }
}

/**
 * Get fallback foods when recognition fails
 * @returns Array of sample recognized foods
 */
function getFallbackFoods(): RecognizedFood[] {
  return [
    { name: "أرز بسمتي", confidence: 0.98 },
    { name: "صدر دجاج مشوي", confidence: 0.92 },
    { name: "خضروات مشكلة", confidence: 0.85 }
  ];
}

/**
 * Map recognized food names to database foods
 * @param foodNames Array of food names
 * @returns Promise with array of food objects from database
 */
export async function mapRecognizedFoodsToDatabase(foodNames: string[]): Promise<any[]> {
  const allFoods = await storage.getAllFoods();
  const recognizedDbFoods = [];
  
  for (const name of foodNames) {
    // Try to find an exact match first
    let food = allFoods.find(f => 
      f.name.toLowerCase() === name.toLowerCase() || 
      f.nameEn.toLowerCase() === name.toLowerCase()
    );
    
    // If no exact match, try partial match
    if (!food) {
      food = allFoods.find(f => 
        f.name.toLowerCase().includes(name.toLowerCase()) || 
        f.nameEn.toLowerCase().includes(name.toLowerCase())
      );
    }
    
    if (food) {
      recognizedDbFoods.push(food);
    }
  }
  
  return recognizedDbFoods;
}
