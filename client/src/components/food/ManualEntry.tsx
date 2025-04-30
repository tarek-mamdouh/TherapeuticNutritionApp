import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PlusIcon, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { t } from "@/lib/i18n";
import { apiRequest } from "@/lib/queryClient";
import { Food } from "@shared/schema";

interface ManualEntryProps {
  onFoodsSelected: (foods: Food[]) => void;
}

const ManualEntry: React.FC<ManualEntryProps> = ({ onFoodsSelected }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [foods, setFoods] = useState<Food[]>([]);
  const [filteredFoods, setFilteredFoods] = useState<Food[]>([]);
  const [selectedFoods, setSelectedFoods] = useState<Food[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Load food database on mount
  useEffect(() => {
    const loadFoods = async () => {
      setIsLoading(true);
      try {
        const response = await apiRequest("GET", "/api/foods", undefined);
        const data = await response.json();
        setFoods(data);
        setFilteredFoods(data);
      } catch (error) {
        console.error("Error loading foods:", error);
        toast({
          title: t("manualEntry.loadError"),
          description: t("manualEntry.loadErrorDesc"),
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadFoods();
  }, [toast]);

  // Filter foods based on search term
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredFoods(foods);
      return;
    }

    const lowerCaseSearch = searchTerm.toLowerCase();
    const filtered = foods.filter(
      (food) =>
        food.name.toLowerCase().includes(lowerCaseSearch) ||
        food.nameEn.toLowerCase().includes(lowerCaseSearch)
    );
    setFilteredFoods(filtered);
  }, [searchTerm, foods]);

  const handleAddFood = (food: Food) => {
    if (!selectedFoods.some((f) => f.id === food.id)) {
      setSelectedFoods([...selectedFoods, food]);
    }
  };

  const handleContinue = () => {
    if (selectedFoods.length === 0) {
      toast({
        title: t("manualEntry.noFoodSelected"),
        description: t("manualEntry.selectFood"),
        variant: "destructive",
      });
      return;
    }
    
    onFoodsSelected(selectedFoods);
  };

  return (
    <div className="flex-1">
      <h3 className="text-xl font-bold mb-3">{t("manualEntry.title")}</h3>
      
      <div className="mb-4">
        <label htmlFor="food-search" className="block text-lg mb-2 font-medium">
          {t("manualEntry.searchLabel")}
        </label>
        <div className="relative">
          <Input
            id="food-search"
            type="text"
            className="w-full px-4 py-3 rounded-lg text-lg pr-10 accessibility-focus"
            placeholder={t("manualEntry.searchPlaceholder")}
            aria-label={t("manualEntry.searchLabel")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 rtl:right-auto rtl:left-0 rtl:pr-0 rtl:pl-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-neutral-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      <div className="mb-4 border border-neutral-medium dark:border-gray-600 rounded-lg p-4 h-48 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="grid grid-cols-1 gap-2">
            {isLoading ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : filteredFoods.length > 0 ? (
              filteredFoods.map((food) => (
                <button
                  key={food.id}
                  className="text-right flex items-center justify-between p-2 rounded-md hover:bg-neutral-light dark:hover:bg-gray-700 transition-colors accessibility-focus"
                  onClick={() => handleAddFood(food)}
                  disabled={selectedFoods.some((f) => f.id === food.id)}
                >
                  <span className="font-bold">{food.name}</span>
                  <PlusIcon className={`h-5 w-5 ${selectedFoods.some((f) => f.id === food.id) ? 'text-neutral-dark' : 'text-primary'}`} />
                </button>
              ))
            ) : (
              <div className="text-center py-6 text-neutral-dark">
                {t("manualEntry.noResults")}
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      <Button 
        className="w-full flex items-center justify-center accessibility-focus"
        onClick={handleContinue}
        disabled={selectedFoods.length === 0}
      >
        <ArrowRight className="h-5 w-5 rtl:ml-2 ltr:mr-2 rtl:rotate-180" />
        {t("manualEntry.continue")}
      </Button>
    </div>
  );
};

export default ManualEntry;
