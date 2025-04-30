import React from "react";
import Header from "@/components/Header";
import TabNavigation from "@/components/TabNavigation";
import Footer from "@/components/Footer";
import AccessibilityMenu from "@/components/AccessibilityMenu";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <TabNavigation />
      <main className="flex-1 container mx-auto px-4 py-6">
        {children}
      </main>
      <Footer />
      <AccessibilityMenu />
    </div>
  );
};

export default Layout;
