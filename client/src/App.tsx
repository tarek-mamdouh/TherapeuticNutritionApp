import { Switch, Route } from "wouter";
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

function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={MealAnalysis} />
      <ProtectedRoute path="/chatbot" component={ChatbotPage} />
      <ProtectedRoute path="/meal-log" component={MealLog} />
      <ProtectedRoute path="/profile" component={Profile} />
      <Route path="/auth" component={AuthPage} />
      <Route component={NotFound} />
    </Switch>
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
          <Router />
          <Toaster />
        </UserProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
