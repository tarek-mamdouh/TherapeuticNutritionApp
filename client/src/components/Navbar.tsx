import React from "react";
import { useLocation, Link } from "wouter";
import { cn } from "@/lib/utils";
import { useUser } from "@/contexts/UserContext";
import { useLanguage } from "@/hooks/useLanguage";
import { MdFoodBank, MdLibraryBooks, MdPerson, MdOutlineHistory, MdLogout, MdChat } from "react-icons/md";

export function Navbar() {
  const [location] = useLocation();
  const { t } = useLanguage();
  const { logout } = useUser();
  
  const navItems = [
    {
      path: "/",
      icon: <MdFoodBank className="h-6 w-6" />,
      label: t("navbar.foodAnalysis"),
    },
    {
      path: "/meal-log",
      icon: <MdOutlineHistory className="h-6 w-6" />,
      label: t("navbar.mealLog"),
    },
    {
      path: "/chatbot",
      icon: <MdChat className="h-6 w-6" />,
      label: t("navbar.chatbot"),
    },
    {
      path: "/profile",
      icon: <MdPerson className="h-6 w-6" />,
      label: t("navbar.profile"),
    },
  ];

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="bg-primary/95 backdrop-blur-sm text-primary-foreground fixed bottom-0 left-0 right-0 z-50 shadow-lg py-2 px-1 md:px-4">
      <div className="container max-w-screen-xl mx-auto flex justify-between items-center">
        <div className="flex flex-1 justify-around md:justify-start md:gap-6">
          {navItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
            >
              <a
                className={cn(
                  "flex flex-col items-center justify-center p-2 rounded-md cursor-pointer transition-colors",
                  "hover:bg-primary-dark",
                  location === item.path
                    ? "text-white font-medium"
                    : "text-primary-foreground/80"
                )}
              >
                {item.icon}
                <span className="text-xs mt-1">{item.label}</span>
              </a>
            </Link>
          ))}
        </div>
        
        <button 
          onClick={handleLogout}
          className="hidden md:flex items-center gap-2 bg-primary-dark hover:bg-primary-dark/80 text-white py-2 px-4 rounded-md transition-colors"
        >
          <MdLogout className="h-5 w-5" />
          <span>{t("auth.logout")}</span>
        </button>
      </div>
    </div>
  );
}

export default Navbar;