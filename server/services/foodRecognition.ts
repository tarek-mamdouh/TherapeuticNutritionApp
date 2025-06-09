import { recognizeFoodWithPerplexity } from "./perplexity";
import { recognizeFoodWithOpenAI } from "./openai";
import { recognizeFoodWithGemini } from "./gemini";
import { RecognizedFood } from "@shared/schema";
import { storage } from "../storage";

/**
 * Recognize food from an image buffer using multiple AI models
 * @param imageBuffer Binary image data
 * @returns Promise with array of recognized foods
 */
export async function recognizeFood(imageBuffer: Buffer): Promise<RecognizedFood[]> {
  try {
    // Convert buffer to base64
    const base64Image = imageBuffer.toString("base64");
    
    // Store results from all APIs to combine later
    let allRecognizedFoods: RecognizedFood[] = [];
    let anyApiSucceeded = false;
    
    // Try Gemini API first (best at image analysis)
    try {
      console.log("Attempting food recognition with Gemini API...");
      const geminiFoods = await recognizeFoodWithGemini(base64Image);
      
      if (geminiFoods && geminiFoods.length > 0) {
        console.log("Successfully recognized foods with Gemini:", geminiFoods);
        allRecognizedFoods = [...allRecognizedFoods, ...geminiFoods];
        anyApiSucceeded = true;
      }
    } catch (geminiError) {
      console.error("Gemini API error:", geminiError);
    }
    
    // Also try Perplexity API for additional insights
    try {
      console.log("Attempting food recognition with Perplexity API...");
      const perplexityFoods = await recognizeFoodWithPerplexity(base64Image);
      
      if (perplexityFoods && perplexityFoods.length > 0) {
        console.log("Successfully recognized foods with Perplexity:", perplexityFoods);
        allRecognizedFoods = [...allRecognizedFoods, ...perplexityFoods];
        anyApiSucceeded = true;
      }
    } catch (perplexityError) {
      console.error("Perplexity API error:", perplexityError);
    }
    
    // Try OpenAI as another alternative
    try {
      console.log("Attempting food recognition with OpenAI API...");
      const openAIFoods = await recognizeFoodWithOpenAI(base64Image);
      
      if (openAIFoods && openAIFoods.length > 0) {
        console.log("Successfully recognized foods with OpenAI:", openAIFoods);
        allRecognizedFoods = [...allRecognizedFoods, ...openAIFoods];
        anyApiSucceeded = true;
      }
    } catch (openAIError) {
      console.error("OpenAI API error:", openAIError);
    }
    
    // Combine and deduplicate results if any API succeeded
    if (anyApiSucceeded && allRecognizedFoods.length > 0) {
      // Group similar items and calculate average confidence
      const foodMap = new Map<string, {count: number, totalConfidence: number}>();
      
      // Group foods by name
      allRecognizedFoods.forEach(food => {
        const normalizedName = food.name.trim().toLowerCase();
        if (foodMap.has(normalizedName)) {
          const existing = foodMap.get(normalizedName)!;
          existing.count += 1;
          existing.totalConfidence += food.confidence;
        } else {
          foodMap.set(normalizedName, {count: 1, totalConfidence: food.confidence});
        }
      });
      
      // Convert back to array, calculating average confidence
      const combinedFoods = Array.from(foodMap).map(([name, {count, totalConfidence}]) => {
        // Find the original food with this name to preserve proper case
        const originalFood = allRecognizedFoods.find(f => 
          f.name.trim().toLowerCase() === name
        );
        
        return {
          name: originalFood?.name || name,
          confidence: totalConfidence / count
        };
      });
      
      // Sort by confidence descending
      combinedFoods.sort((a, b) => b.confidence - a.confidence);
      
      // Limit to top 5 foods
      const topFoods = combinedFoods.slice(0, 5);
      
      console.log("Combined food recognition results:", topFoods);
      return topFoods;
    }
    
    // If all API attempts fail or return empty arrays, return empty result
    console.log("Food recognition returned no results from any API - image likely contains no food");
    return [];
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
