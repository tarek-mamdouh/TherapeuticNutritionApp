import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AccessibilityMenu from "@/components/AccessibilityMenu";
import TabNavigation from "@/components/TabNavigation";
import { useIsMobile } from "@/hooks/use-mobile";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const isMobile = useIsMobile();
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <TabNavigation />
      <main className="flex-1 container mx-auto px-4 py-6 pb-20 md:pb-10">
        {children}
      </main>
      <Footer />
      <AccessibilityMenu />
    </div>
  );
};

export default Layout;
