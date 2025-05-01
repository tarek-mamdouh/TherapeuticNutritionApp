import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Trash2, Upload, Info } from "lucide-react";
import { Food, RecognizedFood } from "@shared/schema";
import { t } from "@/lib/i18n";
import NutritionAnalysis from "./NutritionAnalysis";
import DiabetesSuitability from "./DiabetesSuitability";
import ActionButtons from "./ActionButtons";
import { useSpeech } from "@/hooks/useSpeech";

interface RecognizedFoodProps {
  image?: string;
  recognizedFoods: (Food & { confidence: number })[];
  nutritionInfo: {
    calories: number;
    carbs: number;
    protein: number;
    fat: number;
    sugar: number;
    glycemicIndex: number;
  };
  diabetesSuitability: {
    overall: string;
    details: {
      [foodName: string]: {
        suitability: string;
        reason: string;
      };
    };
  };
  onReupload: () => void;
  onRemoveFood: (foodId: number) => void;
  onAddAnotherFood: () => void;
  onAnalyzeNewMeal: () => void;
  onSaveToLog: () => void;
  onConsultChatbot: () => void;
}

const RecognizedFoodComponent: React.FC<RecognizedFoodProps> = ({
  image,
  recognizedFoods,
  nutritionInfo,
  diabetesSuitability,
  onReupload,
  onRemoveFood,
  onAddAnotherFood,
  onAnalyzeNewMeal,
  onSaveToLog,
  onConsultChatbot
}) => {
  const { speak } = useSpeech();
  
  const speakRecognizedFoods = () => {
    // Join food names with proper commas and pauses for better pronunciation
    const foodNames = recognizedFoods.map(food => food.name).join(", ");
    
    // Format the confidence percentages for better pronunciation
    const foodWithConfidence = recognizedFoods.map(food => {
      const confidencePercent = Math.round(food.confidence * 100);
      return `${food.name}: ${confidencePercent}%`;
    }).join(", ");
    
    // Create a comprehensive speech text with both food names and confidence
    const text = t("speech.recognizedFoods", { foods: foodNames }) + 
                 ". " + foodWithConfidence;
    
    speak(text);
  };
  
  return (
    <div className="flex flex-col md:flex-row items-start gap-6">
      <div className="md:w-1/3">
        <div className="relative rounded-lg overflow-hidden border border-neutral-medium dark:border-gray-600 mb-4">
          {image ? (
            <img
              src={image}
              alt={t("recognizedFood.foodImage")}
              className="w-full object-cover aspect-square"
            />
          ) : (
            <div className="w-full aspect-square bg-neutral-light dark:bg-gray-700 flex items-center justify-center">
              <Info className="h-12 w-12 text-neutral-dark dark:text-gray-400" />
            </div>
          )}
          <div className="absolute top-2 right-2">
            <Button
              size="icon"
              variant="secondary"
              className="bg-white dark:bg-gray-700 hover:bg-neutral-light transition-colors rounded-full shadow-md accessibility-focus"
              aria-label={t("recognizedFood.reupload")}
              onClick={onReupload}
            >
              <Upload className="h-5 w-5 text-neutral-darkest dark:text-white" />
            </Button>
          </div>
        </div>
        
        <div className="bg-neutral-lightest dark:bg-gray-700 rounded-lg p-4 border border-neutral-medium dark:border-gray-600">
          <div className="flex items-center mb-2">
            <h4 className="font-bold text-lg flex items-center">
              <Info className="h-5 w-5 rtl:ml-2 ltr:mr-2 text-primary" />
              {t("recognizedFood.foodsTitle")}
            </h4>
            <Button
              size="icon"
              variant="ghost"
              className="ml-2 p-1 rounded-full text-primary hover:bg-neutral-light dark:hover:bg-gray-600 accessibility-focus"
              onClick={speakRecognizedFoods}
              aria-label={t("recognizedFood.listenToFoods")}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15.536a5 5 0 017.072 0m-9.9-2.828a9 9 0 0112.728 0" />
              </svg>
            </Button>
          </div>
          
          <ScrollArea className="h-52">
            <ul className="space-y-2">
              {recognizedFoods.map((food) => (
                <li
                  key={food.id}
                  className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded-md border border-neutral-medium dark:border-gray-600"
                >
                  <span className="font-medium">{food.name}</span>
                  <div className="flex items-center">
                    <span className="text-sm text-neutral-dark">
                      {Math.round(food.confidence * 100)}% {t("recognizedFood.confidence")}
                    </span>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="p-1 rtl:mr-2 ltr:ml-2 text-error rounded-full hover:bg-neutral-light dark:hover:bg-gray-700 transition-colors accessibility-focus"
                      aria-label={t("recognizedFood.deleteFood", { food: food.name })}
                      onClick={() => onRemoveFood(food.id)}
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </ScrollArea>
          
          <Button
            variant="outline"
            className="w-full mt-4 flex items-center justify-center bg-neutral-lightest dark:bg-gray-600 border border-primary dark:border-gray-500 hover:bg-neutral-light dark:hover:bg-gray-700 transition-colors accessibility-focus"
            onClick={onAddAnotherFood}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 rtl:ml-1 ltr:mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            {t("recognizedFood.addAnother")}
          </Button>
        </div>
      </div>
      
      <div className="md:w-2/3">
        <NutritionAnalysis nutritionInfo={nutritionInfo} />
        <DiabetesSuitability 
          overall={diabetesSuitability.overall} 
          details={diabetesSuitability.details}
          foods={recognizedFoods} 
        />
        <ActionButtons 
          onSaveToLog={onSaveToLog}
          onConsultChatbot={onConsultChatbot}
          onAnalyzeNewMeal={onAnalyzeNewMeal}
        />
      </div>
    </div>
  );
};

export default RecognizedFoodComponent;
