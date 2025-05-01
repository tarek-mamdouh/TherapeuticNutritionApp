import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import MealAnalysis from "@/pages/MealAnalysis";
import ChatbotPage from "@/pages/ChatbotPage";
import MealLog from "@/pages/MealLog";
import Profile from "@/pages/Profile";
import AuthPage from "@/pages/auth-page";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useLanguage } from "@/hooks/useLanguage";
import { useEffect } from "react";
import { UserProvider } from "@/contexts/UserContext";
import Layout from "@/components/Layout";

function AppContent() {
  const [location] = useLocation();
  const isAuthPage = location === "/auth";
  
  return (
    <>
      {isAuthPage ? (
        <Switch>
          <Route path="/auth" component={AuthPage} />
        </Switch>
      ) : (
        <Layout>
          <Switch>
            <Route path="/" component={MealAnalysis} />
            <Route path="/chatbot" component={ChatbotPage} />
            <ProtectedRoute path="/meal-log" component={MealLog} />
            <ProtectedRoute path="/profile" component={Profile} />
            <Route component={NotFound} />
          </Switch>
        </Layout>
      )}
      <Toaster />
    </>
  );
}

function App() {
  const { language, direction } = useLanguage();
  
  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = direction;
    document.title = language === 'ar' 
      ? 'تطبيق التغذية العلاجية لمرضى السكري' 
      : 'Therapeutic Nutrition App for Diabetics';
  }, [language, direction]);
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <UserProvider>
          <AppContent />
        </UserProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
