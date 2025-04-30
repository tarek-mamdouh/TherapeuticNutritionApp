import React from "react";
import { Button } from "@/components/ui/button";
import { Save, MessageSquare, RefreshCw } from "lucide-react";
import { t } from "@/lib/i18n";

interface ActionButtonsProps {
  onSaveToLog: () => void;
  onConsultChatbot: () => void;
  onAnalyzeNewMeal: () => void;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  onSaveToLog,
  onConsultChatbot,
  onAnalyzeNewMeal
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-3 mt-6">
      <Button
        variant="default"
        className="flex-1 flex items-center justify-center accessibility-focus"
        onClick={onSaveToLog}
      >
        <Save className="h-5 w-5 rtl:ml-2 ltr:mr-2" />
        {t("actionButtons.saveToLog")}
      </Button>
      
      <Button
        variant="secondary"
        className="flex-1 flex items-center justify-center accessibility-focus"
        onClick={onConsultChatbot}
      >
        <MessageSquare className="h-5 w-5 rtl:ml-2 ltr:mr-2" />
        {t("actionButtons.consultChatbot")}
      </Button>
      
      <Button
        variant="outline"
        className="flex items-center justify-center border-2 border-neutral-medium dark:border-gray-600 hover:bg-neutral-light dark:hover:bg-gray-700 transition-colors accessibility-focus"
        onClick={onAnalyzeNewMeal}
      >
        <RefreshCw className="h-5 w-5 rtl:ml-2 ltr:mr-2" />
        {t("actionButtons.analyzeNew")}
      </Button>
    </div>
  );
};

export default ActionButtons;
