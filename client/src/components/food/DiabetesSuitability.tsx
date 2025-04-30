import React from "react";
import { AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Food } from "@shared/schema";
import { t } from "@/lib/i18n";
import { useSpeech } from "@/hooks/useSpeech";

interface DiabetesSuitabilityProps {
  overall: string; // "safe", "moderate", "avoid"
  details: {
    [foodName: string]: {
      suitability: string;
      reason: string;
    };
  };
  foods: Food[];
}

const DiabetesSuitability: React.FC<DiabetesSuitabilityProps> = ({
  overall,
  details,
  foods
}) => {
  const { speak } = useSpeech();
  
  const handleSpeakSuitability = () => {
    const text = t(`speech.suitability.${overall}`, {
      foods: foods.map(food => food.name).join(", ")
    });
    
    speak(text);
  };
  
  // Map overall suitability to UI elements
  const suitabilityConfig = {
    safe: {
      bgColor: "bg-safe-light/10",
      borderColor: "border-safe",
      icon: <CheckCircle className="h-6 w-6 text-white" />,
      iconBg: "bg-safe",
      title: t("diabetesSuitability.safe"),
      titleColor: "text-safe"
    },
    moderate: {
      bgColor: "bg-moderate-light/10",
      borderColor: "border-moderate",
      icon: <AlertTriangle className="h-6 w-6 text-white" />,
      iconBg: "bg-moderate",
      title: t("diabetesSuitability.moderate"),
      titleColor: "text-moderate"
    },
    avoid: {
      bgColor: "bg-avoid-light/10",
      borderColor: "border-avoid",
      icon: <XCircle className="h-6 w-6 text-white" />,
      iconBg: "bg-avoid",
      title: t("diabetesSuitability.avoid"),
      titleColor: "text-avoid"
    }
  };
  
  const config = suitabilityConfig[overall as keyof typeof suitabilityConfig];
  
  return (
    <div className="mb-6">
      <div className="flex items-center mb-4">
        <h3 className="text-xl font-bold">{t("diabetesSuitability.title")}</h3>
        <Button
          size="icon"
          variant="ghost"
          onClick={handleSpeakSuitability}
          className="mr-2 p-1 bg-primary text-white rounded-full hover:bg-primary-dark transition-colors accessibility-focus"
          aria-label={t("diabetesSuitability.listen")}
          title={t("diabetesSuitability.listen")}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15.536a5 5 0 017.072 0m-9.9-2.828a9 9 0 0112.728 0" />
          </svg>
        </Button>
      </div>
      
      <div className={`${config.bgColor} border-2 ${config.borderColor} rounded-lg p-5 mb-6 relative`}>
        <div className="flex items-center">
          <div className={`${config.iconBg} rounded-full p-2 mr-3`}>
            {config.icon}
          </div>
          <h4 className={`text-xl font-bold ${config.titleColor}`}>{config.title}</h4>
        </div>
        <p className="mt-4 text-neutral-darkest dark:text-white text-lg">
          {t(`diabetesSuitability.description.${overall}`)}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {foods.map((food) => {
          const detail = details[food.name];
          if (!detail) return null;
          
          const suitabilityColor = detail.suitability === "safe" 
            ? "bg-safe" 
            : detail.suitability === "moderate" 
            ? "bg-moderate" 
            : "bg-avoid";
          
          return (
            <div key={food.id} className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-neutral-medium dark:border-gray-600">
              <div className="flex items-center mb-2">
                <div className={`w-3 h-3 rounded-full ${suitabilityColor} mr-2`}></div>
                <h5 className="font-bold">{food.name}</h5>
              </div>
              <p className="text-sm text-neutral-dark dark:text-gray-300">{detail.reason}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DiabetesSuitability;
