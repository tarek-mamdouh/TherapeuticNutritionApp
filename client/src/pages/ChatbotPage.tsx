import React from "react";
import ChatbotAssistant from "@/components/chatbot/ChatbotAssistant";
import { Card } from "@/components/ui/card";
import { t } from "@/lib/i18n";

const ChatbotPage: React.FC = () => {
  return (
    <>
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">{t("chatbot.pageTitle")}</h2>
        <p className="text-neutral-dark text-lg">{t("chatbot.pageDescription")}</p>
      </div>
      
      <Card className="mb-8 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-neutral-lightest dark:bg-gray-700 p-4 rounded-lg border border-neutral-medium dark:border-gray-600">
            <h3 className="font-bold text-lg mb-2">{t("chatbot.nutritionQuestionsTitle")}</h3>
            <ul className="space-y-2 text-neutral-dark">
              <li>• {t("chatbot.question1")}</li>
              <li>• {t("chatbot.question2")}</li>
              <li>• {t("chatbot.question3")}</li>
            </ul>
          </div>
          
          <div className="bg-neutral-lightest dark:bg-gray-700 p-4 rounded-lg border border-neutral-medium dark:border-gray-600">
            <h3 className="font-bold text-lg mb-2">{t("chatbot.mealSuggestionsTitle")}</h3>
            <ul className="space-y-2 text-neutral-dark">
              <li>• {t("chatbot.suggestion1")}</li>
              <li>• {t("chatbot.suggestion2")}</li>
              <li>• {t("chatbot.suggestion3")}</li>
            </ul>
          </div>
        </div>
      </Card>
      
      <ChatbotAssistant />
    </>
  );
};

export default ChatbotPage;
