import React from "react";
import { Button } from "@/components/ui/button";
import { t } from "@/lib/i18n";
import { useSpeech } from "@/hooks/useSpeech";

interface NutritionAnalysisProps {
  nutritionInfo: {
    calories: number;
    carbs: number;
    protein: number;
    fat: number;
    sugar: number;
    glycemicIndex: number;
  };
}

const NutritionAnalysis: React.FC<NutritionAnalysisProps> = ({
  nutritionInfo
}) => {
  const { speak } = useSpeech();
  
  const handleSpeakNutrition = () => {
    // Format the speech with enhanced formatting for better pronunciation of numbers and units
    const text = t("speech.nutritionInfo", {
      calories: nutritionInfo.calories,
      carbs: nutritionInfo.carbs + "g",
      protein: nutritionInfo.protein + "g",
      fat: nutritionInfo.fat + "g",
      sugar: nutritionInfo.sugar + "g",
      glycemicIndex: nutritionInfo.glycemicIndex
    });
    
    speak(text);
  };
  
  return (
    <div className="border-b border-neutral-medium dark:border-gray-700 pb-4 mb-6">
      <div className="flex items-center mb-4">
        <h3 className="text-xl font-bold">{t("nutritionAnalysis.title")}</h3>
        <Button
          size="icon"
          variant="ghost"
          onClick={handleSpeakNutrition}
          className="mr-2 p-1 bg-primary text-white rounded-full hover:bg-primary-dark transition-colors accessibility-focus"
          aria-label={t("nutritionAnalysis.listen")}
          title={t("nutritionAnalysis.listen")}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15.536a5 5 0 017.072 0m-9.9-2.828a9 9 0 0112.728 0" />
          </svg>
        </Button>
      </div>

      <div className="bg-neutral-lightest dark:bg-gray-700 rounded-lg p-5 border border-neutral-medium dark:border-gray-600">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="flex flex-col items-center p-3 bg-white dark:bg-gray-800 rounded-lg border border-neutral-medium dark:border-gray-600">
            <span className="text-sm text-neutral-dark mb-1">{t("nutritionAnalysis.calories")}</span>
            <span className="text-xl font-bold text-neutral-darkest dark:text-white">{nutritionInfo.calories}</span>
          </div>
          <div className="flex flex-col items-center p-3 bg-white dark:bg-gray-800 rounded-lg border border-neutral-medium dark:border-gray-600">
            <span className="text-sm text-neutral-dark mb-1">{t("nutritionAnalysis.carbs")}</span>
            <span className="text-xl font-bold text-neutral-darkest dark:text-white">{nutritionInfo.carbs}g</span>
          </div>
          <div className="flex flex-col items-center p-3 bg-white dark:bg-gray-800 rounded-lg border border-neutral-medium dark:border-gray-600">
            <span className="text-sm text-neutral-dark mb-1">{t("nutritionAnalysis.protein")}</span>
            <span className="text-xl font-bold text-neutral-darkest dark:text-white">{nutritionInfo.protein}g</span>
          </div>
          <div className="flex flex-col items-center p-3 bg-white dark:bg-gray-800 rounded-lg border border-neutral-medium dark:border-gray-600">
            <span className="text-sm text-neutral-dark mb-1">{t("nutritionAnalysis.fat")}</span>
            <span className="text-xl font-bold text-neutral-darkest dark:text-white">{nutritionInfo.fat}g</span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col items-center p-3 bg-white dark:bg-gray-800 rounded-lg border border-neutral-medium dark:border-gray-600">
            <span className="text-sm text-neutral-dark mb-1">{t("nutritionAnalysis.sugar")}</span>
            <span className="text-xl font-bold text-neutral-darkest dark:text-white">{nutritionInfo.sugar}g</span>
          </div>
          <div className="flex flex-col items-center p-3 bg-white dark:bg-gray-800 rounded-lg border border-neutral-medium dark:border-gray-600">
            <span className="text-sm text-neutral-dark mb-1">{t("nutritionAnalysis.glycemicIndex")}</span>
            <span className="text-xl font-bold text-neutral-darkest dark:text-white">{nutritionInfo.glycemicIndex}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NutritionAnalysis;
