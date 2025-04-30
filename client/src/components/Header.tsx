import React from "react";
import { useLanguage } from "@/hooks/useLanguage";
import { useTheme } from "@/components/ThemeProvider";
import { useUser } from "@/contexts/UserContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ClipboardList, Moon, Sun } from "lucide-react";
import { t } from "@/lib/i18n";

const Header: React.FC = () => {
  const { toggleLanguage, language } = useLanguage();
  const { theme, setTheme } = useTheme();
  const { user } = useUser();
  
  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };
  
  return (
    <header className="bg-primary text-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-2 space-x-reverse rtl:space-x-reverse ltr:space-x-normal">
          <ClipboardList className="h-8 w-8" />
          <h1 className="text-xl md:text-2xl font-bold">
            {t("app.title")}
          </h1>
        </div>
        
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleTheme}
            className="rounded-full hover:bg-primary-light accessibility-focus"
            aria-label={t("app.toggleTheme")}
          >
            {theme === "light" ? <Moon className="h-6 w-6" /> : <Sun className="h-6 w-6" />}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={toggleLanguage}
            className="rounded-md border border-white hover:bg-primary-light flex items-center accessibility-focus"
            aria-label={t("app.changeLanguage")}
          >
            <span lang={language}>
              {language === "ar" ? "EN" : "عربي"}
            </span>
          </Button>
          
          <Avatar className="accessibility-focus h-10 w-10 border-2 border-white cursor-pointer">
            <AvatarImage src={user?.avatarUrl} alt={t("profile.userAvatar")} />
            <AvatarFallback>{user?.name?.[0] || "U"}</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
};

export default Header;
