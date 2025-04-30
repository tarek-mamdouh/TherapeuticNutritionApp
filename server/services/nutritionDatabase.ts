import { storage } from "../storage";
import { mapRecognizedFoodsToDatabase } from "./foodRecognition";
import { FoodAnalysisResponse } from "@shared/schema";

/**
 * Get nutritional information for a list of foods
 * @param foodNames Array of food names
 * @returns Promise with nutritional summary data
 */
export async function getFoodNutrition(foodNames: string[]): Promise<FoodAnalysisResponse["nutritionInfo"]> {
  try {
    // Map food names to database entries
    const foods = await mapRecognizedFoodsToDatabase(foodNames);
    
    // If no foods were found in the database, return default values
    if (foods.length === 0) {
      return getDefaultNutritionInfo();
    }
    
    // Calculate nutritional totals
    const nutritionInfo = {
      calories: foods.reduce((sum, food) => sum + food.calories, 0),
      carbs: foods.reduce((sum, food) => sum + food.carbs, 0),
      protein: foods.reduce((sum, food) => sum + food.protein, 0),
      fat: foods.reduce((sum, food) => sum + food.fat, 0),
      sugar: foods.reduce((sum, food) => sum + food.sugar, 0),
      glycemicIndex: Math.round(
        foods.reduce((sum, food) => sum + (food.glycemicIndex || 0), 0) / foods.length
      )
    };
    
    return nutritionInfo;
  } catch (error) {
    console.error("Error getting food nutrition:", error);
    return getDefaultNutritionInfo();
  }
}

/**
 * Analyze the suitability of foods for diabetic patients
 * @param foodNames Array of food names
 * @param nutritionInfo Nutritional summary data
 * @returns Object with suitability assessment
 */
export function analyzeFoodSuitability(
  foodNames: string[],
  nutritionInfo: FoodAnalysisResponse["nutritionInfo"]
): FoodAnalysisResponse["diabetesSuitability"] {
  try {
    // Get foods from database to check individual suitability
    const allFoods = storage.getAllFoods();
    
    // Details for each food
    const details: {
      [foodName: string]: {
        suitability: string;
        reason: string;
      };
    } = {};
    
    // Check each food name
    for (const name of foodNames) {
      // Find the food in the database
      const food = Array.from(allFoods).find(f => 
        f.name.toLowerCase() === name.toLowerCase() || 
        f.nameEn.toLowerCase() === name.toLowerCase()
      );
      
      if (food) {
        // Use the database's suitability assessment
        details[name] = {
          suitability: food.diabeticSuitability,
          reason: getSuitabilityReason(food.diabeticSuitability, food.name)
        };
      } else {
        // Default to "moderate" if not found
        details[name] = {
          suitability: "moderate",
          reason: "لا توجد معلومات كافية عن هذا الطعام، يفضل تناوله باعتدال."
        };
      }
    }
    
    // Determine overall suitability
    let overall = "safe";
    
    // If any food is "avoid", the overall is "avoid"
    if (Object.values(details).some(d => d.suitability === "avoid")) {
      overall = "avoid";
    } 
    // If no "avoid" but at least one "moderate", the overall is "moderate"
    else if (Object.values(details).some(d => d.suitability === "moderate")) {
      overall = "moderate";
    }
    
    // Check additional nutritional factors for diabetes
    if (nutritionInfo.sugar > 15) {
      overall = "avoid";
    } else if (nutritionInfo.sugar > 10) {
      overall = overall === "avoid" ? "avoid" : "moderate";
    }
    
    if (nutritionInfo.carbs > 60) {
      overall = "avoid";
    } else if (nutritionInfo.carbs > 45) {
      overall = overall === "avoid" ? "avoid" : "moderate";
    }
    
    if (nutritionInfo.glycemicIndex > 70) {
      overall = "avoid";
    } else if (nutritionInfo.glycemicIndex > 55) {
      overall = overall === "avoid" ? "avoid" : "moderate";
    }
    
    return {
      overall,
      details
    };
  } catch (error) {
    console.error("Error analyzing food suitability:", error);
    
    // Return default suitability assessment
    return {
      overall: "moderate",
      details: foodNames.reduce((obj, name) => {
        obj[name] = {
          suitability: "moderate",
          reason: "يفضل تناول هذا الطعام باعتدال ومراقبة مستوى السكر بعد تناوله."
        };
        return obj;
      }, {} as { [key: string]: { suitability: string; reason: string } })
    };
  }
}

/**
 * Get default nutrition info for when calculation fails
 * @returns Default nutritional summary
 */
function getDefaultNutritionInfo(): FoodAnalysisResponse["nutritionInfo"] {
  return {
    calories: 450,
    carbs: 48,
    protein: 35,
    fat: 12,
    sugar: 3,
    glycemicIndex: 52
  };
}

/**
 * Get human-readable reason for suitability assessment
 * @param suitability Suitability level ("safe", "moderate", "avoid")
 * @param foodName Name of the food
 * @returns Explanation string in Arabic
 */
function getSuitabilityReason(suitability: string, foodName: string): string {
  switch (suitability) {
    case "safe":
      return `${foodName} آمن لمرضى السكري، منخفض المؤشر الجلايسيمي ومناسب للاستهلاك.`;
    case "moderate":
      return `${foodName} مناسب بشكل معتدل، يفضل تناوله بكميات محدودة ومراقبة تأثيره على مستوى السكر.`;
    case "avoid":
      return `يفضل تجنب ${foodName} لأنه غني بالكربوهيدرات سريعة الامتصاص ويمكن أن يرفع مستوى السكر بسرعة.`;
    default:
      return `يرجى توخي الحذر عند تناول ${foodName} ومراقبة تأثيره على مستوى السكر.`;
  }
}
