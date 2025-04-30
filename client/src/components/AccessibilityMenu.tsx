import React from "react";
import { Button } from "@/components/ui/button";
import { Eye, Palette, ZoomIn } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { t } from "@/lib/i18n";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const AccessibilityMenu: React.FC = () => {
  const { toggleHighContrast, setTextSize, highContrast, textSize } = useTheme();

  return (
    <div className="fixed bottom-6 left-6 z-20">
      <div className="bg-white dark:bg-gray-800 rounded-full shadow-lg border border-neutral-medium dark:border-gray-700 flex">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full p-3 hover:bg-neutral-light dark:hover:bg-gray-700 accessibility-focus"
          aria-label={t("accessibility.options")}
          title={t("accessibility.options")}
        >
          <Eye className="h-6 w-6 text-primary" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="rounded-full p-3 hover:bg-neutral-light dark:hover:bg-gray-700 accessibility-focus"
          onClick={toggleHighContrast}
          aria-label={t("accessibility.toggleContrast")}
          title={t("accessibility.toggleContrast")}
        >
          <Palette className={`h-6 w-6 ${highContrast ? "text-accent" : "text-primary"}`} />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full p-3 hover:bg-neutral-light dark:hover:bg-gray-700 accessibility-focus"
              aria-label={t("accessibility.textSize")}
              title={t("accessibility.textSize")}
            >
              <ZoomIn className="h-6 w-6 text-primary" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem 
              onClick={() => setTextSize("normal")}
              className={textSize === "normal" ? "bg-primary/10" : ""}
            >
              {t("accessibility.textSizeNormal")}
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => setTextSize("large")}
              className={textSize === "large" ? "bg-primary/10" : ""}
            >
              {t("accessibility.textSizeLarge")}
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => setTextSize("xl")}
              className={textSize === "xl" ? "bg-primary/10" : ""}
            >
              {t("accessibility.textSizeXL")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default AccessibilityMenu;
