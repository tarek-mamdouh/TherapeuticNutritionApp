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
    // Speak all nutrient values with their units
    
    // Prepare all nutrition data with correct units
    const nutrients = [
      {
        name: t("nutritionAnalysis.calories"),
        value: nutritionInfo.calories,
        unit: "" // no unit for calories
      },
      {
        name: t("nutritionAnalysis.carbs"),
        value: nutritionInfo.carbs,
        unit: "g"
      },
      {
        name: t("nutritionAnalysis.protein"),
        value: nutritionInfo.protein,
        unit: "g"
      },
      {
        name: t("nutritionAnalysis.fat"),
        value: nutritionInfo.fat,
        unit: "g"
      },
      {
        name: t("nutritionAnalysis.sugar"),
        value: nutritionInfo.sugar,
        unit: "g"
      },
      {
        name: t("nutritionAnalysis.glycemicIndex"),
        value: nutritionInfo.glycemicIndex,
        unit: "" // no unit for glycemic index
      }
    ];
    
    // Format all nutrients as a single text with pauses between them
    const fullText = nutrients
      .map(nutrient => `${nutrient.name}: ${nutrient.value}${nutrient.unit}`)
      .join(". ");
    
    // Speak all nutrition values when the button is clicked
    speak(fullText);
  };
  
  return (
    <section className="border-b border-neutral-medium dark:border-gray-700 pb-4 mb-6" aria-labelledby="nutrition-analysis-title">
      <div className="flex items-center mb-4">
        <h3 id="nutrition-analysis-title" className="text-xl font-bold">{t("nutritionAnalysis.title")}</h3>
        <Button
          size="icon"
          variant="ghost"
          onClick={handleSpeakNutrition}
          className="mr-2 ml-2 p-1 bg-primary text-white rounded-full hover:bg-primary-dark transition-colors accessibility-focus"
          aria-label={t("nutritionAnalysis.listen")}
          title={t("nutritionAnalysis.listen")}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15.536a5 5 0 017.072 0m-9.9-2.828a9 9 0 0112.728 0" />
          </svg>
        </Button>
      </div>

      <div className="bg-neutral-lightest dark:bg-gray-700 rounded-lg p-5 border border-neutral-medium dark:border-gray-600" role="region" aria-label={t("nutritionAnalysis.title")}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="flex flex-col items-center p-3 bg-white dark:bg-gray-800 rounded-lg border border-neutral-medium dark:border-gray-600" role="group" aria-label={t("nutritionAnalysis.calories")}>
            <span className="text-sm text-neutral-dark mb-1" id="calories-label">{t("nutritionAnalysis.calories")}</span>
            <span className="text-xl font-bold text-neutral-darkest dark:text-white" aria-labelledby="calories-label">{nutritionInfo.calories}</span>
          </div>
          <div className="flex flex-col items-center p-3 bg-white dark:bg-gray-800 rounded-lg border border-neutral-medium dark:border-gray-600" role="group" aria-label={t("nutritionAnalysis.carbs")}>
            <span className="text-sm text-neutral-dark mb-1" id="carbs-label">{t("nutritionAnalysis.carbs")}</span>
            <span className="text-xl font-bold text-neutral-darkest dark:text-white" aria-labelledby="carbs-label">{nutritionInfo.carbs}g</span>
          </div>
          <div className="flex flex-col items-center p-3 bg-white dark:bg-gray-800 rounded-lg border border-neutral-medium dark:border-gray-600" role="group" aria-label={t("nutritionAnalysis.protein")}>
            <span className="text-sm text-neutral-dark mb-1" id="protein-label">{t("nutritionAnalysis.protein")}</span>
            <span className="text-xl font-bold text-neutral-darkest dark:text-white" aria-labelledby="protein-label">{nutritionInfo.protein}g</span>
          </div>
          <div className="flex flex-col items-center p-3 bg-white dark:bg-gray-800 rounded-lg border border-neutral-medium dark:border-gray-600" role="group" aria-label={t("nutritionAnalysis.fat")}>
            <span className="text-sm text-neutral-dark mb-1" id="fat-label">{t("nutritionAnalysis.fat")}</span>
            <span className="text-xl font-bold text-neutral-darkest dark:text-white" aria-labelledby="fat-label">{nutritionInfo.fat}g</span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col items-center p-3 bg-white dark:bg-gray-800 rounded-lg border border-neutral-medium dark:border-gray-600" role="group" aria-label={t("nutritionAnalysis.sugar")}>
            <span className="text-sm text-neutral-dark mb-1" id="sugar-label">{t("nutritionAnalysis.sugar")}</span>
            <span className="text-xl font-bold text-neutral-darkest dark:text-white" aria-labelledby="sugar-label">{nutritionInfo.sugar}g</span>
          </div>
          <div className="flex flex-col items-center p-3 bg-white dark:bg-gray-800 rounded-lg border border-neutral-medium dark:border-gray-600" role="group" aria-label={t("nutritionAnalysis.glycemicIndex")}>
            <span className="text-sm text-neutral-dark mb-1" id="glycemic-index-label">{t("nutritionAnalysis.glycemicIndex")}</span>
            <span className="text-xl font-bold text-neutral-darkest dark:text-white" aria-labelledby="glycemic-index-label">{nutritionInfo.glycemicIndex}</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NutritionAnalysis;
