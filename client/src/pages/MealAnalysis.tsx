import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { t } from "@/lib/i18n";
import { useSpeech } from "@/hooks/useSpeech";
import ImageUpload from "@/components/food/ImageUpload";
import ManualEntry from "@/components/food/ManualEntry";
import RecognizedFood from "@/components/food/RecognizedFood";
import { Food, FoodAnalysisResponse } from "@shared/schema";

const MealAnalysis: React.FC = () => {
  const [isManualEntry, setIsManualEntry] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [recognizedFoods, setRecognizedFoods] = useState<(Food & { confidence: number })[]>([]);
  const [nutritionInfo, setNutritionInfo] = useState<FoodAnalysisResponse["nutritionInfo"] | null>(null);
  const [diabetesSuitability, setDiabetesSuitability] = useState<FoodAnalysisResponse["diabetesSuitability"] | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { speak } = useSpeech();

  const toggleEntryMethod = () => {
    setIsManualEntry(!isManualEntry);
    // Reset selections when switching entry methods
    setSelectedImage(null);
    setImagePreview(null);
    setRecognizedFoods([]);
    setShowResults(false);
  };

  const handleImageSelect = async (file: File) => {
    setSelectedImage(file);
    setImagePreview(URL.createObjectURL(file));
    await analyzeImage(file);
  };

  const handleManualSelect = async (foods: Food[]) => {
    setIsAnalyzing(true);
    try {
      const response = await apiRequest("POST", "/api/analyze/manual", { 
        foodIds: foods.map(food => food.id) 
      });
      const data: FoodAnalysisResponse = await response.json();
      
      // Transform foods to include confidence
      const foodsWithConfidence = foods.map(food => ({
        ...food,
        confidence: 1 // 100% confidence for manual entries
      }));
      
      setRecognizedFoods(foodsWithConfidence);
      setNutritionInfo(data.nutritionInfo);
      setDiabetesSuitability(data.diabetesSuitability);
      setShowResults(true);
    } catch (error) {
      console.error("Error analyzing foods:", error);
      toast({
        title: t("mealAnalysis.analysisError"),
        description: t("mealAnalysis.analysisErrorDesc"),
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const analyzeImage = async (file: File) => {
    setIsAnalyzing(true);
    
    try {
      // Create form data
      const formData = new FormData();
      formData.append("image", file);
      
      // Call API to analyze image
      const response = await fetch("/api/analyze/image", {
        method: "POST",
        body: formData,
        credentials: "include"
      });
      
      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }
      
      const data: FoodAnalysisResponse = await response.json();
      
      // Transform recognized foods to full Food objects with confidence
      const foodsWithDetails = data.recognizedFoods.map(item => {
        // This is a simplification, in real app you'd get full food details from API
        return {
          id: 0, // This would be filled with real data from API
          name: item.name,
          nameEn: "", // This would be filled with real data from API
          calories: 0,
          carbs: 0,
          protein: 0,
          fat: 0,
          sugar: 0,
          glycemicIndex: 0,
          diabeticSuitability: "",
          imageUrl: "",
          confidence: item.confidence
        };
      });
      
      setRecognizedFoods(foodsWithDetails);
      setNutritionInfo(data.nutritionInfo);
      setDiabetesSuitability(data.diabetesSuitability);
      setShowResults(true);
    } catch (error) {
      console.error("Error analyzing image:", error);
      toast({
        title: t("mealAnalysis.imageAnalysisError"),
        description: t("mealAnalysis.imageAnalysisErrorDesc"),
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReupload = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setRecognizedFoods([]);
    setShowResults(false);
  };

  const handleRemoveFood = (foodId: number) => {
    setRecognizedFoods(prev => prev.filter(food => food.id !== foodId));
    
    // If all foods are removed, go back to selection screen
    if (recognizedFoods.length <= 1) {
      setShowResults(false);
    }
  };

  const handleSaveToLog = async () => {
    try {
      await apiRequest("POST", "/api/meal-log", {
        foods: recognizedFoods.map(food => ({
          foodId: food.id,
          amount: 100 // Default amount in grams
        }))
      });
      
      toast({
        title: t("mealAnalysis.savedToLog"),
        description: t("mealAnalysis.savedToLogDesc")
      });
      
      // Navigate to meal log
      setLocation("/meal-log");
    } catch (error) {
      console.error("Error saving to log:", error);
      toast({
        title: t("mealAnalysis.saveError"),
        description: t("mealAnalysis.saveErrorDesc"),
        variant: "destructive"
      });
    }
  };

  const handleConsultChatbot = () => {
    // Navigate to chatbot page
    setLocation("/chatbot");
  };
  
  // Effect to read recognized foods aloud when they're loaded
  useEffect(() => {
    if (recognizedFoods.length > 0 && !isAnalyzing && showResults) {
      // Create a string of food names
      const foodNames = recognizedFoods.map(food => food.name).join(', ');
      
      // Speak the introduction and food names
      const introMessage = t("mealAnalysis.recognizedFoodsIntro");
      speak(`${introMessage}: ${foodNames}`);
    }
  }, [recognizedFoods, isAnalyzing, showResults, speak, t]);

  return (
    <>
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">{t("mealAnalysis.title")}</h2>
        <p className="text-neutral-dark text-lg">{t("mealAnalysis.description")}</p>
      </div>

      {isAnalyzing && (
        <Card className="p-12 mb-8 flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mb-4"></div>
          <p className="text-lg font-medium">{t("mealAnalysis.analyzing")}</p>
        </Card>
      )}

      {!isAnalyzing && !showResults && (
        <Card className="p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            {isManualEntry ? (
              <ManualEntry onFoodsSelected={handleManualSelect} />
            ) : (
              <ImageUpload onImageSelect={handleImageSelect} onSwitch={toggleEntryMethod} />
            )}

            <div className="hidden md:block border-l border-neutral-medium dark:border-gray-700 h-64"></div>

            {isManualEntry ? (
              <ImageUpload onImageSelect={handleImageSelect} onSwitch={toggleEntryMethod} />
            ) : (
              <ManualEntry onFoodsSelected={handleManualSelect} />
            )}
          </div>
        </Card>
      )}

      {!isAnalyzing && showResults && nutritionInfo && diabetesSuitability && (
        <Card className="p-6 mb-8">
          <RecognizedFood
            image={imagePreview || undefined}
            recognizedFoods={recognizedFoods}
            nutritionInfo={nutritionInfo}
            diabetesSuitability={diabetesSuitability}
            onReupload={handleReupload}
            onRemoveFood={handleRemoveFood}
            onAddAnotherFood={toggleEntryMethod}
            onAnalyzeNewMeal={handleReupload}
            onSaveToLog={handleSaveToLog}
            onConsultChatbot={handleConsultChatbot}
          />
        </Card>
      )}
    </>
  );
};

export default MealAnalysis;
