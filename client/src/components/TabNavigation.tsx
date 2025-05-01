import React from "react";
import { useLocation } from "wouter";
import { MessageSquare, Camera, ClipboardList, User } from "lucide-react";
import { t } from "@/lib/i18n";
import { useUser } from "@/contexts/UserContext";

const TabNavigation: React.FC = () => {
  const [location, navigate] = useLocation();
  const { user } = useUser();
  
  const tabs = [
    { 
      path: "/", 
      label: t("tabs.mealAnalysis"), 
      icon: <Camera className="h-5 w-5" />,
      active: location === "/"
    },
    { 
      path: "/chatbot", 
      label: t("tabs.chatbot"), 
      icon: <MessageSquare className="h-5 w-5" />,
      active: location === "/chatbot"
    },
    { 
      path: "/meal-log", 
      label: t("tabs.mealLog"), 
      icon: <ClipboardList className="h-5 w-5" />,
      active: location === "/meal-log",
      protected: true
    },
    { 
      path: "/profile", 
      label: t("tabs.profile"), 
      icon: <User className="h-5 w-5" />,
      active: location === "/profile",
      protected: true
    }
  ];

  const handleTabClick = (path: string, isProtected: boolean = false) => {
    if (isProtected && !user) {
      navigate("/auth");
    } else {
      navigate(path);
    }
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 shadow-md border-b border-neutral-medium dark:border-gray-700 sticky top-0 z-10">
      <div className="container mx-auto">
        <div className="flex overflow-x-auto" role="tablist" aria-label={t("navigation.mainNav")}>
          {tabs.map((tab) => (
            <button
              key={tab.path}
              onClick={() => handleTabClick(tab.path, tab.protected)}
              className={`
                px-4 py-3 whitespace-nowrap accessibility-focus flex-1
                ${tab.active 
                  ? "border-b-2 border-primary text-primary font-bold" 
                  : "text-neutral-dark hover:text-primary"
                }
                transition-all duration-200 ease-in-out
              `}
              role="tab"
              aria-selected={tab.active}
            >
              <div className="flex flex-col items-center justify-center gap-1 sm:flex-row sm:justify-start">
                {tab.icon}
                <span className="text-xs sm:text-sm md:text-base">{tab.label}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TabNavigation;
