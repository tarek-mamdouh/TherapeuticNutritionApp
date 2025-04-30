import React from "react";
import { Link, useLocation } from "wouter";
import { MessageSquare, Camera, ClipboardList, User } from "lucide-react";
import { t } from "@/lib/i18n";

const TabNavigation: React.FC = () => {
  const [location] = useLocation();
  
  const tabs = [
    { 
      path: "/", 
      label: t("tabs.mealAnalysis"), 
      icon: <Camera className="h-5 w-5 rtl:ml-2 ltr:mr-2" />,
      active: location === "/"
    },
    { 
      path: "/chatbot", 
      label: t("tabs.chatbot"), 
      icon: <MessageSquare className="h-5 w-5 rtl:ml-2 ltr:mr-2" />,
      active: location === "/chatbot"
    },
    { 
      path: "/meal-log", 
      label: t("tabs.mealLog"), 
      icon: <ClipboardList className="h-5 w-5 rtl:ml-2 ltr:mr-2" />,
      active: location === "/meal-log"
    },
    { 
      path: "/profile", 
      label: t("tabs.profile"), 
      icon: <User className="h-5 w-5 rtl:ml-2 ltr:mr-2" />,
      active: location === "/profile"
    }
  ];
  
  return (
    <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-neutral-medium dark:border-gray-700">
      <div className="container mx-auto">
        <div className="flex overflow-x-auto" role="tablist" aria-label={t("navigation.mainNav")}>
          {tabs.map((tab) => (
            <Link
              key={tab.path}
              href={tab.path}
              className={`
                px-4 py-3 whitespace-nowrap accessibility-focus
                ${tab.active 
                  ? "border-b-2 border-primary text-primary font-bold" 
                  : "text-neutral-dark hover:text-primary"
                }
              `}
              role="tab"
              aria-selected={tab.active}
            >
              <div className="flex items-center">
                {tab.icon}
                <span>{tab.label}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TabNavigation;
