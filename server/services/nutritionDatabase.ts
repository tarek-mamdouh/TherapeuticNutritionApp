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
export async function analyzeFoodSuitability(
  foodNames: string[],
  nutritionInfo: FoodAnalysisResponse["nutritionInfo"]
): Promise<FoodAnalysisResponse["diabetesSuitability"]> {
  try {
    // Get foods from database to check individual suitability
    const allFoods = await storage.getAllFoods();
    
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
      const food = allFoods.find(f => 
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
        // If not found in database, provide a more helpful message
        details[name] = {
          suitability: "moderate",
          reason: `${name} من الأطعمة المعتدلة المؤشر الجلايسيمي. ينصح بتناوله بكميات معتدلة ومراقبة مستوى السكر بعد تناوله.`
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
          reason: `${name} مناسب بشكل معتدل، ينصح بتناوله بكميات صغيرة ومراقبة مستوى السكر في الدم.`
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
  // Get a food-specific reason if available in our database
  const foodSpecificReasons: Record<string, Record<string, string>> = {
    "أرز أبيض": {
      "safe": `${foodName} بكميات صغيرة (٣٠-٤٠ جرام) مع البروتين والألياف يمكن أن يكون مناسباً لمرضى السكري.`,
      "moderate": `${foodName} متوسط المؤشر الجلايسيمي، تناوله باعتدال مع الخضار والبروتين لتقليل تأثيره على سكر الدم.`,
      "avoid": `يفضل تجنب ${foodName} لأنه يرفع مستوى السكر بسرعة، استبدله بالأرز البني أو الكينوا.`
    },
    "بطاطا": {
      "safe": `البطاطا المسلوقة بكميات صغيرة ومع إضافة الزيتون أو زيت الزيتون تكون مناسبة لمرضى السكري.`,
      "moderate": `البطاطا متوسطة المؤشر الجلايسيمي، يمكن تناولها بحذر ومراقبة نسبة السكر بعد تناولها.`,
      "avoid": `يفضل تجنب البطاطا المقلية أو المهروسة لأنها ترفع نسبة السكر بسرعة.`
    },
    "فواكه": {
      "safe": `الفواكه منخفضة المؤشر الجلايسيمي مثل التفاح والفراولة مناسبة لمرضى السكري بكميات معتدلة.`,
      "moderate": `تناول الفواكه باعتدال (حصة واحدة) مع مراعاة محتواها من السكر الطبيعي.`,
      "avoid": `يفضل تحديد كميات الفواكه عالية السكر مثل المانجو والعنب والموز الناضج.`
    },
    "خبز": {
      "safe": `الخبز الأسمر كامل الحبوب يحتوي على ألياف تبطئ امتصاص السكر وتجعله خيارًا أفضل لمرضى السكري.`,
      "moderate": `تناول الخبز باعتدال (شريحة واحدة) مع البروتين والخضار لموازنة تأثيره على سكر الدم.`,
      "avoid": `يفضل تجنب الخبز الأبيض لأنه يرفع مستوى السكر بسرعة.`
    },
    "حلويات": {
      "safe": ``,  // حلويات rarely safe for diabetics
      "moderate": `يمكن تناول كميات صغيرة جدًا من الحلويات المحلاة بالستيفيا أو مع وجبة متوازنة على فترات متباعدة.`,
      "avoid": `يفضل تجنب الحلويات العادية لاحتوائها على نسب عالية من السكر الذي يرفع مستوى الجلوكوز بشكل سريع.`
    },
    "لحوم": {
      "safe": `اللحوم قليلة الدهون مصدر جيد للبروتين ولا تؤثر مباشرة على مستوى السكر في الدم.`,
      "moderate": `تناول اللحوم باعتدال مع مراعاة كمية الدهون والطريقة المستخدمة في الطهي.`,
      "avoid": `يفضل تجنب اللحوم عالية الدهون والمصنعة لتأثيرها السلبي على صحة القلب ومقاومة الأنسولين.`
    },
    "سلطة": {
      "safe": `السلطة الخضراء غنية بالألياف وتساعد في إبطاء امتصاص السكر، مما يجعلها خيارًا مثاليًا لمرضى السكري.`,
      "moderate": `تناول السلطة مع صلصات قليلة الدهون والسكر للحصول على أقصى فائدة.`,
      "avoid": ``  // سلطة rarely needs to be avoided
    }
  };

  // Get category-specific reason based on broad food type if specific food not found
  const foodCategories = [
    { keywords: ["أرز", "rice", "مكرونة", "pasta", "نودلز"], category: "نشويات" },
    { keywords: ["لحم", "meat", "دجاج", "chicken", "سمك", "fish"], category: "بروتين" },
    { keywords: ["خضار", "vegetables", "سلطة", "salad"], category: "خضروات" },
    { keywords: ["فواكه", "fruits", "تفاح", "apple", "موز", "banana"], category: "فواكه" },
    { keywords: ["حلوى", "dessert", "كيك", "cake", "شوكولاتة", "chocolate"], category: "حلويات" },
    { keywords: ["خبز", "bread", "toast", "معجنات", "pastry"], category: "خبز" }
  ];

  // Check if we have a specific reason for this food
  if (foodSpecificReasons[foodName] && foodSpecificReasons[foodName][suitability]) {
    return foodSpecificReasons[foodName][suitability];
  }

  // If no specific reason, try to match by category
  let matchedCategory = "";
  for (const cat of foodCategories) {
    if (cat.keywords.some(keyword => foodName.includes(keyword))) {
      matchedCategory = cat.category;
      break;
    }
  }

  // If we've matched a category, get the category reason
  if (matchedCategory && foodSpecificReasons[matchedCategory] && foodSpecificReasons[matchedCategory][suitability]) {
    return foodSpecificReasons[matchedCategory][suitability].replace(matchedCategory, foodName);
  }

  // Generic reasons as fallback
  switch (suitability) {
    case "safe":
      return `${foodName} آمن لمرضى السكري، منخفض المؤشر الجلايسيمي ومناسب للاستهلاك المعتدل.`;
    case "moderate":
      return `${foodName} مناسب بشكل معتدل، يفضل تناوله بكميات محدودة ومراقبة تأثيره على مستوى السكر في الدم.`;
    case "avoid":
      return `يفضل تجنب ${foodName} لأنه غني بالكربوهيدرات سريعة الامتصاص ويمكن أن يرفع مستوى السكر بسرعة.`;
    default:
      return `يرجى توخي الحذر عند تناول ${foodName} ومراقبة تأثيره على مستوى السكر بشكل منتظم.`;
  }
}
