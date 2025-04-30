import React from "react";
import { t } from "@/lib/i18n";

const Footer: React.FC = () => {
  return (
    <footer className="bg-neutral-darkest dark:bg-gray-900 text-white py-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <h2 className="text-xl font-bold">{t("app.title")}</h2>
            <p className="text-neutral-medium">{t("app.tagline")}</p>
          </div>
          
          <div className="flex flex-col md:flex-row gap-3 md:gap-6">
            <a href="#" className="accessibility-focus text-neutral-light hover:text-white transition-colors">
              {t("footer.terms")}
            </a>
            <a href="#" className="accessibility-focus text-neutral-light hover:text-white transition-colors">
              {t("footer.privacy")}
            </a>
            <a href="#" className="accessibility-focus text-neutral-light hover:text-white transition-colors">
              {t("footer.contact")}
            </a>
          </div>
        </div>
        
        <div className="mt-6 pt-6 border-t border-neutral-dark text-center text-sm text-neutral-medium">
          <p>{t("footer.copyright", { year: new Date().getFullYear() })}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
