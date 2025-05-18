/**
 * Dataset of common foods for the manual entry form
 * Categorized by food groups with Arabic and English names
 */

export interface CommonFood {
  nameEn: string;
  name: string; // Arabic name
  calories: number;
  carbs: number;
  protein: number;
  fat: number;
  sugar: number;
  glycemicIndex: number;
  diabeticSuitability: string; // "safe", "moderate", or "avoid"
  category: string;
}

export const commonFoods: CommonFood[] = [
  // Grains - الحبوب
  {
    nameEn: "White Rice",
    name: "أرز أبيض",
    calories: 130,
    carbs: 28,
    protein: 2.7,
    fat: 0.3,
    sugar: 0.1,
    glycemicIndex: 73,
    diabeticSuitability: "avoid",
    category: "grains"
  },
  {
    nameEn: "Brown Rice",
    name: "أرز بني",
    calories: 112,
    carbs: 24,
    protein: 2.6,
    fat: 0.9,
    sugar: 0.4,
    glycemicIndex: 68,
    diabeticSuitability: "moderate",
    category: "grains"
  },
  {
    nameEn: "Quinoa",
    name: "كينوا",
    calories: 120,
    carbs: 21,
    protein: 4.4,
    fat: 1.9,
    sugar: 0.9,
    glycemicIndex: 53,
    diabeticSuitability: "safe",
    category: "grains"
  },
  {
    nameEn: "Whole Wheat Bread",
    name: "خبز القمح الكامل",
    calories: 81,
    carbs: 15,
    protein: 4,
    fat: 1.1,
    sugar: 1.5,
    glycemicIndex: 51,
    diabeticSuitability: "moderate",
    category: "grains"
  },
  {
    nameEn: "White Bread",
    name: "خبز أبيض",
    calories: 77,
    carbs: 14.3,
    protein: 2.6,
    fat: 1,
    sugar: 1.4,
    glycemicIndex: 75,
    diabeticSuitability: "avoid",
    category: "grains"
  },
  {
    nameEn: "Pita Bread",
    name: "خبز عربي",
    calories: 165,
    carbs: 33.4,
    protein: 5.5,
    fat: 0.8,
    sugar: 0.4,
    glycemicIndex: 57,
    diabeticSuitability: "moderate",
    category: "grains"
  },
  {
    nameEn: "Oatmeal",
    name: "شوفان",
    calories: 68,
    carbs: 12,
    protein: 2.5,
    fat: 1.4,
    sugar: 0.5,
    glycemicIndex: 55,
    diabeticSuitability: "safe",
    category: "grains"
  },
  {
    nameEn: "Bulgur Wheat",
    name: "برغل",
    calories: 151,
    carbs: 33.8,
    protein: 5.6,
    fat: 0.4,
    sugar: 0.1,
    glycemicIndex: 48,
    diabeticSuitability: "safe",
    category: "grains"
  },
  {
    nameEn: "Couscous",
    name: "كسكس",
    calories: 112,
    carbs: 23.2,
    protein: 3.8,
    fat: 0.2,
    sugar: 0.3,
    glycemicIndex: 65,
    diabeticSuitability: "moderate",
    category: "grains"
  },
  {
    nameEn: "Freekeh",
    name: "فريكة",
    calories: 114,
    carbs: 18.8,
    protein: 5.1,
    fat: 0.9,
    sugar: 0.5,
    glycemicIndex: 43,
    diabeticSuitability: "safe",
    category: "grains"
  },
  
  // Proteins - البروتينات
  {
    nameEn: "Chicken Breast",
    name: "صدر دجاج",
    calories: 165,
    carbs: 0,
    protein: 31,
    fat: 3.6,
    sugar: 0,
    glycemicIndex: 0,
    diabeticSuitability: "safe",
    category: "proteins"
  },
  {
    nameEn: "Beef",
    name: "لحم بقري",
    calories: 250,
    carbs: 0,
    protein: 26,
    fat: 17,
    sugar: 0,
    glycemicIndex: 0,
    diabeticSuitability: "safe",
    category: "proteins"
  },
  {
    nameEn: "Lamb",
    name: "لحم ضأن",
    calories: 294,
    carbs: 0,
    protein: 25,
    fat: 21,
    sugar: 0,
    glycemicIndex: 0,
    diabeticSuitability: "moderate",
    category: "proteins"
  },
  {
    nameEn: "Fish (Salmon)",
    name: "سمك السلمون",
    calories: 208,
    carbs: 0,
    protein: 20,
    fat: 13,
    sugar: 0,
    glycemicIndex: 0,
    diabeticSuitability: "safe",
    category: "proteins"
  },
  {
    nameEn: "Tuna",
    name: "تونة",
    calories: 132,
    carbs: 0,
    protein: 28,
    fat: 1.3,
    sugar: 0,
    glycemicIndex: 0,
    diabeticSuitability: "safe",
    category: "proteins"
  },
  {
    nameEn: "Eggs",
    name: "بيض",
    calories: 78,
    carbs: 0.6,
    protein: 6.3,
    fat: 5.3,
    sugar: 0.6,
    glycemicIndex: 0,
    diabeticSuitability: "safe",
    category: "proteins"
  },
  {
    nameEn: "Tofu",
    name: "توفو",
    calories: 76,
    carbs: 1.9,
    protein: 8,
    fat: 4.2,
    sugar: 0.5,
    glycemicIndex: 15,
    diabeticSuitability: "safe",
    category: "proteins"
  },
  {
    nameEn: "Lentils",
    name: "عدس",
    calories: 116,
    carbs: 20,
    protein: 9,
    fat: 0.4,
    sugar: 1.8,
    glycemicIndex: 32,
    diabeticSuitability: "safe",
    category: "proteins"
  },
  {
    nameEn: "Chickpeas",
    name: "حمص",
    calories: 164,
    carbs: 27,
    protein: 8.9,
    fat: 2.6,
    sugar: 4.8,
    glycemicIndex: 28,
    diabeticSuitability: "safe",
    category: "proteins"
  },
  {
    nameEn: "Fava Beans",
    name: "فول",
    calories: 110,
    carbs: 19.7,
    protein: 7.6,
    fat: 0.4,
    sugar: 2.1,
    glycemicIndex: 40,
    diabeticSuitability: "safe",
    category: "proteins"
  },
  
  // Vegetables - الخضروات
  {
    nameEn: "Spinach",
    name: "سبانخ",
    calories: 23,
    carbs: 3.6,
    protein: 2.9,
    fat: 0.4,
    sugar: 0.4,
    glycemicIndex: 15,
    diabeticSuitability: "safe",
    category: "vegetables"
  },
  {
    nameEn: "Broccoli",
    name: "بروكلي",
    calories: 34,
    carbs: 6.6,
    protein: 2.8,
    fat: 0.4,
    sugar: 1.7,
    glycemicIndex: 15,
    diabeticSuitability: "safe",
    category: "vegetables"
  },
  {
    nameEn: "Carrots",
    name: "جزر",
    calories: 41,
    carbs: 9.6,
    protein: 0.9,
    fat: 0.2,
    sugar: 4.7,
    glycemicIndex: 35,
    diabeticSuitability: "safe",
    category: "vegetables"
  },
  {
    nameEn: "Tomatoes",
    name: "طماطم",
    calories: 18,
    carbs: 3.9,
    protein: 0.9,
    fat: 0.2,
    sugar: 2.6,
    glycemicIndex: 15,
    diabeticSuitability: "safe",
    category: "vegetables"
  },
  {
    nameEn: "Cucumber",
    name: "خيار",
    calories: 15,
    carbs: 3.6,
    protein: 0.7,
    fat: 0.1,
    sugar: 1.7,
    glycemicIndex: 15,
    diabeticSuitability: "safe",
    category: "vegetables"
  },
  {
    nameEn: "Bell Peppers",
    name: "فلفل رومي",
    calories: 31,
    carbs: 6,
    protein: 1,
    fat: 0.3,
    sugar: 4.2,
    glycemicIndex: 15,
    diabeticSuitability: "safe",
    category: "vegetables"
  },
  {
    nameEn: "Zucchini",
    name: "كوسة",
    calories: 17,
    carbs: 3.1,
    protein: 1.2,
    fat: 0.3,
    sugar: 2.5,
    glycemicIndex: 15,
    diabeticSuitability: "safe",
    category: "vegetables"
  },
  {
    nameEn: "Eggplant",
    name: "باذنجان",
    calories: 25,
    carbs: 6,
    protein: 1,
    fat: 0.2,
    sugar: 3.2,
    glycemicIndex: 15,
    diabeticSuitability: "safe",
    category: "vegetables"
  },
  {
    nameEn: "Okra",
    name: "بامية",
    calories: 33,
    carbs: 7,
    protein: 2,
    fat: 0.1,
    sugar: 1.5,
    glycemicIndex: 20,
    diabeticSuitability: "safe",
    category: "vegetables"
  },
  {
    nameEn: "Cabbage",
    name: "ملفوف",
    calories: 25,
    carbs: 5.8,
    protein: 1.3,
    fat: 0.1,
    sugar: 3.2,
    glycemicIndex: 15,
    diabeticSuitability: "safe",
    category: "vegetables"
  },
  
  // Fruits - الفواكه
  {
    nameEn: "Apple",
    name: "تفاح",
    calories: 52,
    carbs: 13.8,
    protein: 0.3,
    fat: 0.2,
    sugar: 10.4,
    glycemicIndex: 38,
    diabeticSuitability: "moderate",
    category: "fruits"
  },
  {
    nameEn: "Orange",
    name: "برتقال",
    calories: 47,
    carbs: 11.8,
    protein: 0.9,
    fat: 0.1,
    sugar: 9.4,
    glycemicIndex: 40,
    diabeticSuitability: "moderate",
    category: "fruits"
  },
  {
    nameEn: "Banana",
    name: "موز",
    calories: 89,
    carbs: 22.8,
    protein: 1.1,
    fat: 0.3,
    sugar: 12.2,
    glycemicIndex: 51,
    diabeticSuitability: "moderate",
    category: "fruits"
  },
  {
    nameEn: "Grapes",
    name: "عنب",
    calories: 69,
    carbs: 18,
    protein: 0.7,
    fat: 0.2,
    sugar: 15.5,
    glycemicIndex: 59,
    diabeticSuitability: "avoid",
    category: "fruits"
  },
  {
    nameEn: "Strawberries",
    name: "فراولة",
    calories: 32,
    carbs: 7.7,
    protein: 0.7,
    fat: 0.3,
    sugar: 4.9,
    glycemicIndex: 40,
    diabeticSuitability: "safe",
    category: "fruits"
  },
  {
    nameEn: "Watermelon",
    name: "بطيخ",
    calories: 30,
    carbs: 7.6,
    protein: 0.6,
    fat: 0.2,
    sugar: 6.2,
    glycemicIndex: 72,
    diabeticSuitability: "avoid",
    category: "fruits"
  },
  {
    nameEn: "Dates",
    name: "تمر",
    calories: 282,
    carbs: 75,
    protein: 2.5,
    fat: 0.4,
    sugar: 63,
    glycemicIndex: 55,
    diabeticSuitability: "avoid",
    category: "fruits"
  },
  {
    nameEn: "Pomegranate",
    name: "رمان",
    calories: 83,
    carbs: 18.7,
    protein: 1.7,
    fat: 1.2,
    sugar: 13.7,
    glycemicIndex: 35,
    diabeticSuitability: "moderate",
    category: "fruits"
  },
  {
    nameEn: "Figs",
    name: "تين",
    calories: 74,
    carbs: 19.2,
    protein: 0.8,
    fat: 0.3,
    sugar: 16.3,
    glycemicIndex: 61,
    diabeticSuitability: "avoid",
    category: "fruits"
  },
  {
    nameEn: "Avocado",
    name: "أفوكادو",
    calories: 160,
    carbs: 8.5,
    protein: 2,
    fat: 14.7,
    sugar: 0.7,
    glycemicIndex: 15,
    diabeticSuitability: "safe",
    category: "fruits"
  },
  
  // Dairy - منتجات الألبان
  {
    nameEn: "Whole Milk",
    name: "حليب كامل الدسم",
    calories: 61,
    carbs: 4.8,
    protein: 3.2,
    fat: 3.3,
    sugar: 5.1,
    glycemicIndex: 31,
    diabeticSuitability: "moderate",
    category: "dairy"
  },
  {
    nameEn: "Low-Fat Milk",
    name: "حليب قليل الدسم",
    calories: 42,
    carbs: 5,
    protein: 3.4,
    fat: 1,
    sugar: 5.1,
    glycemicIndex: 32,
    diabeticSuitability: "moderate",
    category: "dairy"
  },
  {
    nameEn: "Yogurt (Plain)",
    name: "زبادي سادة",
    calories: 59,
    carbs: 3.6,
    protein: 10,
    fat: 0.4,
    sugar: 3.2,
    glycemicIndex: 36,
    diabeticSuitability: "safe",
    category: "dairy"
  },
  {
    nameEn: "Cheese (White)",
    name: "جبنة بيضاء",
    calories: 264,
    carbs: 4.1,
    protein: 18.9,
    fat: 18.8,
    sugar: 0.5,
    glycemicIndex: 0,
    diabeticSuitability: "moderate",
    category: "dairy"
  },
  {
    nameEn: "Labneh",
    name: "لبنة",
    calories: 101,
    carbs: 3.8,
    protein: 7,
    fat: 6.8,
    sugar: 3.8,
    glycemicIndex: 15,
    diabeticSuitability: "safe",
    category: "dairy"
  },
  
  // Traditional Middle Eastern Dishes - أطباق شرق أوسطية تقليدية
  {
    nameEn: "Hummus",
    name: "حمص بطحينة",
    calories: 166,
    carbs: 14.3,
    protein: 7.9,
    fat: 9.6,
    sugar: 0.4,
    glycemicIndex: 25,
    diabeticSuitability: "safe",
    category: "middle-eastern"
  },
  {
    nameEn: "Tabbouleh",
    name: "تبولة",
    calories: 120,
    carbs: 16,
    protein: 3,
    fat: 6,
    sugar: 1.2,
    glycemicIndex: 45,
    diabeticSuitability: "safe",
    category: "middle-eastern"
  },
  {
    nameEn: "Fattoush",
    name: "فتوش",
    calories: 110,
    carbs: 12,
    protein: 2,
    fat: 7,
    sugar: 2.5,
    glycemicIndex: 40,
    diabeticSuitability: "safe",
    category: "middle-eastern"
  },
  {
    nameEn: "Mujadara",
    name: "مجدرة",
    calories: 145,
    carbs: 24,
    protein: 6,
    fat: 3,
    sugar: 1.5,
    glycemicIndex: 35,
    diabeticSuitability: "moderate",
    category: "middle-eastern"
  },
  {
    nameEn: "Shawarma (Chicken)",
    name: "شاورما دجاج",
    calories: 400,
    carbs: 25,
    protein: 32,
    fat: 20,
    sugar: 2.5,
    glycemicIndex: 45,
    diabeticSuitability: "moderate",
    category: "middle-eastern"
  },
  {
    nameEn: "Kibbeh",
    name: "كبة",
    calories: 290,
    carbs: 25,
    protein: 15,
    fat: 14,
    sugar: 1.2,
    glycemicIndex: 50,
    diabeticSuitability: "moderate",
    category: "middle-eastern"
  },
  {
    nameEn: "Mansaf",
    name: "منسف",
    calories: 680,
    carbs: 42,
    protein: 43,
    fat: 37,
    sugar: 4.5,
    glycemicIndex: 60,
    diabeticSuitability: "avoid",
    category: "middle-eastern"
  },
  {
    nameEn: "Maqluba",
    name: "مقلوبة",
    calories: 420,
    carbs: 45,
    protein: 18,
    fat: 20,
    sugar: 3.5,
    glycemicIndex: 65,
    diabeticSuitability: "moderate",
    category: "middle-eastern"
  },
  {
    nameEn: "Kousa Mahshi",
    name: "كوسا محشي",
    calories: 230,
    carbs: 20,
    protein: 12,
    fat: 11,
    sugar: 3.8,
    glycemicIndex: 40,
    diabeticSuitability: "moderate",
    category: "middle-eastern"
  },
  {
    nameEn: "Warak Enab",
    name: "ورق عنب",
    calories: 220,
    carbs: 32,
    protein: 5,
    fat: 9,
    sugar: 3.2,
    glycemicIndex: 45,
    diabeticSuitability: "moderate",
    category: "middle-eastern"
  },
  
  // Nuts & Seeds - المكسرات والبذور
  {
    nameEn: "Almonds",
    name: "لوز",
    calories: 579,
    carbs: 21.7,
    protein: 21.2,
    fat: 49.9,
    sugar: 3.9,
    glycemicIndex: 15,
    diabeticSuitability: "safe",
    category: "nuts-seeds"
  },
  {
    nameEn: "Walnuts",
    name: "جوز",
    calories: 654,
    carbs: 13.7,
    protein: 15.2,
    fat: 65.2,
    sugar: 2.6,
    glycemicIndex: 15,
    diabeticSuitability: "safe",
    category: "nuts-seeds"
  },
  {
    nameEn: "Pistachios",
    name: "فستق حلبي",
    calories: 560,
    carbs: 27.5,
    protein: 20.6,
    fat: 45.4,
    sugar: 7.7,
    glycemicIndex: 15,
    diabeticSuitability: "safe",
    category: "nuts-seeds"
  },
  {
    nameEn: "Sunflower Seeds",
    name: "بذور عباد الشمس",
    calories: 585,
    carbs: 20,
    protein: 20.8,
    fat: 51.5,
    sugar: 2.6,
    glycemicIndex: 15,
    diabeticSuitability: "safe",
    category: "nuts-seeds"
  },
  {
    nameEn: "Chia Seeds",
    name: "بذور الشيا",
    calories: 486,
    carbs: 42.1,
    protein: 16.5,
    fat: 30.7,
    sugar: 0,
    glycemicIndex: 1,
    diabeticSuitability: "safe",
    category: "nuts-seeds"
  },
  
  // Desserts - الحلويات
  {
    nameEn: "Baklava",
    name: "بقلاوة",
    calories: 334,
    carbs: 43,
    protein: 6,
    fat: 16,
    sugar: 26,
    glycemicIndex: 65,
    diabeticSuitability: "avoid",
    category: "desserts"
  },
  {
    nameEn: "Kunafa",
    name: "كنافة",
    calories: 457,
    carbs: 64,
    protein: 8,
    fat: 20,
    sugar: 37,
    glycemicIndex: 75,
    diabeticSuitability: "avoid",
    category: "desserts"
  },
  {
    nameEn: "Halawa",
    name: "حلاوة طحينية",
    calories: 469,
    carbs: 56,
    protein: 12,
    fat: 25,
    sugar: 38,
    glycemicIndex: 55,
    diabeticSuitability: "avoid",
    category: "desserts"
  },
  {
    nameEn: "Mamoul",
    name: "معمول",
    calories: 423,
    carbs: 68,
    protein: 6,
    fat: 16,
    sugar: 29,
    glycemicIndex: 60,
    diabeticSuitability: "avoid",
    category: "desserts"
  },
  {
    nameEn: "Basbousa",
    name: "بسبوسة",
    calories: 367,
    carbs: 62,
    protein: 4,
    fat: 12,
    sugar: 33,
    glycemicIndex: 70,
    diabeticSuitability: "avoid",
    category: "desserts"
  },
  
  // Beverages - المشروبات
  {
    nameEn: "Arabic Coffee",
    name: "قهوة عربية",
    calories: 5,
    carbs: 1,
    protein: 0.3,
    fat: 0.1,
    sugar: 0,
    glycemicIndex: 0,
    diabeticSuitability: "safe",
    category: "beverages"
  },
  {
    nameEn: "Mint Tea",
    name: "شاي بالنعناع",
    calories: 10,
    carbs: 2,
    protein: 0.1,
    fat: 0,
    sugar: 0,
    glycemicIndex: 0,
    diabeticSuitability: "safe",
    category: "beverages"
  },
  {
    nameEn: "Orange Juice",
    name: "عصير برتقال",
    calories: 45,
    carbs: 10.4,
    protein: 0.7,
    fat: 0.2,
    sugar: 8.3,
    glycemicIndex: 50,
    diabeticSuitability: "avoid",
    category: "beverages"
  },
  {
    nameEn: "Pomegranate Juice",
    name: "عصير رمان",
    calories: 66,
    carbs: 16.3,
    protein: 0.2,
    fat: 0.1,
    sugar: 12.6,
    glycemicIndex: 53,
    diabeticSuitability: "moderate",
    category: "beverages"
  },
  {
    nameEn: "Lemonade",
    name: "ليموناضة",
    calories: 31,
    carbs: 8,
    protein: 0.1,
    fat: 0.1,
    sugar: 7.1,
    glycemicIndex: 25,
    diabeticSuitability: "moderate",
    category: "beverages"
  }
];

// Export just the English and Arabic food names for quick lookup
export const foodNames = commonFoods.map(food => ({ 
  id: food.nameEn.toLowerCase().replace(/\s+/g, '-'), 
  nameEn: food.nameEn,
  name: food.name
}));