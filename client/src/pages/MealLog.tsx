import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { t } from "@/lib/i18n";
import { MealLog, Food } from "@shared/schema";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { Calendar, Clock, Trash2 } from "lucide-react";

interface MealLogWithFood extends MealLog {
  food: Food;
}

const MealLogPage: React.FC = () => {
  const [logs, setLogs] = useState<MealLogWithFood[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  // Weekly data for charts
  const [weeklyData, setWeeklyData] = useState<
    {
      day: string;
      calories: number;
      carbs: number;
      protein: number;
      sugar: number;
    }[]
  >([]);
  
  useEffect(() => {
    fetchMealLogs();
  }, []);
  
  const fetchMealLogs = async () => {
    setIsLoading(true);
    try {
      const response = await apiRequest("GET", "/api/meal-logs", undefined);
      const data = await response.json();
      setLogs(data);
      
      // Process weekly data for charts
      processWeeklyData(data);
    } catch (error) {
      console.error("Error fetching meal logs:", error);
      toast({
        title: t("mealLog.fetchError"),
        description: t("mealLog.fetchErrorDesc"),
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const processWeeklyData = (logData: MealLogWithFood[]) => {
    // Get dates for the last 7 days
    const days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return {
        date,
        day: format(date, "E"), // Abbreviated day name
        dayFull: format(date, "yyyy-MM-dd"), // Full date for comparing
        calories: 0,
        carbs: 0,
        protein: 0,
        sugar: 0
      };
    });
    
    // Sum up nutritional values for each day
    logData.forEach(log => {
      const logDate = new Date(log.date);
      const logDateStr = format(logDate, "yyyy-MM-dd");
      
      const dayIndex = days.findIndex(d => d.dayFull === logDateStr);
      if (dayIndex >= 0) {
        const amount = log.amount / 100; // Convert amount to percentage (100g base)
        days[dayIndex].calories += log.food.calories * amount;
        days[dayIndex].carbs += log.food.carbs * amount;
        days[dayIndex].protein += log.food.protein * amount;
        days[dayIndex].sugar += log.food.sugar * amount;
      }
    });
    
    // Format for chart
    setWeeklyData(days.map(d => ({
      day: d.day,
      calories: Math.round(d.calories),
      carbs: Math.round(d.carbs),
      protein: Math.round(d.protein),
      sugar: Math.round(d.sugar)
    })));
  };
  
  const handleDeleteLog = async (logId: number) => {
    try {
      await apiRequest("DELETE", `/api/meal-logs/${logId}`, undefined);
      
      // Remove from local state
      setLogs(prev => prev.filter(log => log.id !== logId));
      
      toast({
        title: t("mealLog.deleteSuccess"),
        description: t("mealLog.deleteSuccessDesc")
      });
      
      // Update chart data
      processWeeklyData(logs.filter(log => log.id !== logId));
    } catch (error) {
      console.error("Error deleting meal log:", error);
      toast({
        title: t("mealLog.deleteError"),
        description: t("mealLog.deleteErrorDesc"),
        variant: "destructive"
      });
    }
  };
  
  const groupLogsByDate = () => {
    const grouped: { [date: string]: MealLogWithFood[] } = {};
    
    logs.forEach(log => {
      const date = format(new Date(log.date), "yyyy-MM-dd");
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(log);
    });
    
    return Object.entries(grouped)
      .sort(([dateA], [dateB]) => new Date(dateB).getTime() - new Date(dateA).getTime())
      .map(([date, logs]) => ({
        date,
        logs
      }));
  };
  
  return (
    <>
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">{t("mealLog.title")}</h2>
        <p className="text-neutral-dark text-lg">{t("mealLog.description")}</p>
      </div>
      
      <Card className="p-6 mb-8">
        <Tabs defaultValue="overview">
          <TabsList className="mb-6">
            <TabsTrigger value="overview">{t("mealLog.tabs.overview")}</TabsTrigger>
            <TabsTrigger value="daily">{t("mealLog.tabs.daily")}</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            <h3 className="text-xl font-bold mb-4">{t("mealLog.weeklyAnalysis")}</h3>
            
            <div className="bg-neutral-lightest dark:bg-gray-700 rounded-lg p-4 border border-neutral-medium dark:border-gray-600 mb-6">
              <div className="h-64">
                {weeklyData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weeklyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="calories" name={t("nutritionAnalysis.calories")} fill="hsl(var(--chart-1))" />
                      <Bar dataKey="carbs" name={t("nutritionAnalysis.carbs")} fill="hsl(var(--chart-2))" />
                      <Bar dataKey="protein" name={t("nutritionAnalysis.protein")} fill="hsl(var(--chart-3))" />
                      <Bar dataKey="sugar" name={t("nutritionAnalysis.sugar")} fill="hsl(var(--chart-4))" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-neutral-dark">{t("mealLog.noData")}</p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-4 bg-primary/10 border-primary">
                <h4 className="font-bold mb-2">{t("mealLog.stats.avgCalories")}</h4>
                <p className="text-2xl font-bold">
                  {weeklyData.length > 0
                    ? Math.round(weeklyData.reduce((sum, day) => sum + day.calories, 0) / 7)
                    : 0}
                </p>
              </Card>
              
              <Card className="p-4 bg-secondary/10 border-secondary">
                <h4 className="font-bold mb-2">{t("mealLog.stats.avgCarbs")}</h4>
                <p className="text-2xl font-bold">
                  {weeklyData.length > 0
                    ? Math.round(weeklyData.reduce((sum, day) => sum + day.carbs, 0) / 7)
                    : 0}g
                </p>
              </Card>
              
              <Card className="p-4 bg-accent/10 border-accent">
                <h4 className="font-bold mb-2">{t("mealLog.stats.avgSugar")}</h4>
                <p className="text-2xl font-bold">
                  {weeklyData.length > 0
                    ? Math.round(weeklyData.reduce((sum, day) => sum + day.sugar, 0) / 7)
                    : 0}g
                </p>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="daily">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : logs.length > 0 ? (
              <div className="space-y-6">
                {groupLogsByDate().map(({ date, logs }) => (
                  <div key={date} className="border border-neutral-medium dark:border-gray-600 rounded-lg overflow-hidden">
                    <div className="bg-neutral-light dark:bg-gray-700 p-3 flex items-center">
                      <Calendar className="h-5 w-5 mr-2" />
                      <h4 className="font-bold">{format(new Date(date), "PPPP")}</h4>
                    </div>
                    
                    <div className="divide-y divide-neutral-medium dark:divide-gray-600">
                      {logs.map(log => (
                        <div key={log.id} className="p-4 flex justify-between items-center">
                          <div>
                            <p className="font-medium">{log.food.name}</p>
                            <div className="text-sm text-neutral-dark flex items-center mt-1">
                              <Clock className="h-4 w-4 mr-1" />
                              {format(new Date(log.date), "p")}
                            </div>
                          </div>
                          
                          <div className="flex items-center">
                            <div className="text-right mr-4">
                              <p className="font-bold">{log.food.calories} {t("nutritionAnalysis.calories")}</p>
                              <p className="text-sm text-neutral-dark">
                                {log.food.carbs}g {t("nutritionAnalysis.carbs")} • {log.food.protein}g {t("nutritionAnalysis.protein")}
                              </p>
                            </div>
                            
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteLog(log.id)}
                              className="text-error hover:bg-error/10 rounded-full"
                            >
                              <Trash2 className="h-5 w-5" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-neutral-lightest dark:bg-gray-700 rounded-lg">
                <p className="text-xl font-medium mb-2">{t("mealLog.noLogs")}</p>
                <p className="text-neutral-dark mb-6">{t("mealLog.startTracking")}</p>
                <Button onClick={() => window.location.href = "/"}>
                  {t("mealLog.analyzeFirstMeal")}
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </Card>
    </>
  );
};

export default MealLogPage;
