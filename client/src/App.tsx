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
import Layout from "@/components/Layout";
import { useLanguage } from "@/hooks/useLanguage";
import { useEffect } from "react";

function Router() {
  return (
    <Switch>
      <Route path="/" component={MealAnalysis} />
      <Route path="/chatbot" component={ChatbotPage} />
      <Route path="/meal-log" component={MealLog} />
      <Route path="/profile" component={Profile} />
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
        <Layout>
          <Router />
        </Layout>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
