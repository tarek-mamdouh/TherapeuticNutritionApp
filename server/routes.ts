import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { chatWithOpenAI } from "./services/openai";
import { recognizeFood } from "./services/foodRecognition";
import { getFoodNutrition, analyzeFoodSuitability } from "./services/nutritionDatabase";
import multer from "multer";
import { FoodAnalysisResponse, insertChatMessageSchema } from "@shared/schema";
import { z } from "zod";

// Configure multer for handling file uploads
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Create HTTP server
  const httpServer = createServer(app);

  // Initialize database with sample data if empty
  await initializeSampleData();

  // ===== Authentication Routes =====
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }
      
      // Find user
      let user = await storage.getUserByUsername(username);
      
      // Create user if doesn't exist (for demo purposes)
      if (!user) {
        user = await storage.createUser({
          username,
          password, // In a real app, this would be hashed
          name: "",
          age: null,
          diabetesType: "none",
          preferences: null,
          language: "ar"
        });
      }
      
      // In a real app, you would verify the password here
      
      return res.status(200).json(user);
    } catch (error) {
      console.error("Login error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    return res.status(200).json({ message: "Logged out successfully" });
  });

  // ===== User Profile Routes =====
  app.get("/api/user/profile", async (req, res) => {
    try {
      // For demo purposes, return a default user
      // In a real app, you would get the user ID from the session
      const user = await storage.getUser(1);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      return res.status(200).json(user);
    } catch (error) {
      console.error("Get profile error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/user/profile", async (req, res) => {
    try {
      const userId = 1; // In a real app, get from session
      const userData = req.body;
      
      const updatedUser = await storage.updateUser(userId, userData);
      
      return res.status(200).json(updatedUser);
    } catch (error) {
      console.error("Update profile error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // ===== Foods Routes =====
  app.get("/api/foods", async (req, res) => {
    try {
      const foods = await storage.getAllFoods();
      return res.status(200).json(foods);
    } catch (error) {
      console.error("Get foods error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/foods/:id", async (req, res) => {
    try {
      const foodId = parseInt(req.params.id);
      
      if (isNaN(foodId)) {
        return res.status(400).json({ message: "Invalid food ID" });
      }
      
      const food = await storage.getFood(foodId);
      
      if (!food) {
        return res.status(404).json({ message: "Food not found" });
      }
      
      return res.status(200).json(food);
    } catch (error) {
      console.error("Get food error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // ===== Meal Analysis Routes =====
  app.post("/api/analyze/image", upload.single("image"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No image file provided" });
      }
      
      // Get image buffer
      const imageBuffer = req.file.buffer;
      
      // Recognize food from image
      const recognizedFoods = await recognizeFood(imageBuffer);
      
      // Get nutrition info for each recognized food
      const nutritionInfo = await getFoodNutrition(recognizedFoods.map(food => food.name));
      
      // Analyze suitability for diabetics
      const diabetesSuitability = analyzeFoodSuitability(recognizedFoods.map(food => food.name), nutritionInfo);
      
      const response: FoodAnalysisResponse = {
        recognizedFoods,
        nutritionInfo,
        diabetesSuitability
      };
      
      return res.status(200).json(response);
    } catch (error) {
      console.error("Analyze image error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/analyze/manual", async (req, res) => {
    try {
      const schema = z.object({
        foodIds: z.array(z.number())
      });

      const { foodIds } = schema.parse(req.body);
      
      if (!foodIds || foodIds.length === 0) {
        return res.status(400).json({ message: "No foods selected" });
      }
      
      // Get foods from storage
      const foods = await Promise.all(foodIds.map(id => storage.getFood(id)));
      const validFoods = foods.filter(Boolean);
      
      if (validFoods.length === 0) {
        return res.status(404).json({ message: "No valid foods found" });
      }
      
      // Get nutrition info by aggregating the food data
      const nutritionInfo = {
        calories: validFoods.reduce((sum, food) => sum + food.calories, 0),
        carbs: validFoods.reduce((sum, food) => sum + food.carbs, 0),
        protein: validFoods.reduce((sum, food) => sum + food.protein, 0),
        fat: validFoods.reduce((sum, food) => sum + food.fat, 0),
        sugar: validFoods.reduce((sum, food) => sum + food.sugar, 0),
        glycemicIndex: Math.round(validFoods.reduce((sum, food) => sum + (food.glycemicIndex || 0), 0) / validFoods.length)
      };
      
      // Create recognizedFoods array for the response (with 100% confidence for manual entries)
      const recognizedFoods = validFoods.map(food => ({
        name: food.name,
        confidence: 1.0
      }));
      
      // Determine diabetes suitability
      const foodNames = validFoods.map(food => food.name);
      const diabetesSuitability = analyzeFoodSuitability(foodNames, nutritionInfo);
      
      const response: FoodAnalysisResponse = {
        recognizedFoods,
        nutritionInfo,
        diabetesSuitability
      };
      
      return res.status(200).json(response);
    } catch (error) {
      console.error("Analyze manual error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // ===== Meal Logs Routes =====
  app.get("/api/meal-logs", async (req, res) => {
    try {
      const userId = 1; // In a real app, get from session
      
      const mealLogs = await storage.getMealLogsByUser(userId);
      
      // Fetch food details for each meal log
      const mealLogsWithFood = await Promise.all(
        mealLogs.map(async (log) => {
          const food = await storage.getFood(log.foodId);
          return { ...log, food };
        })
      );
      
      return res.status(200).json(mealLogsWithFood);
    } catch (error) {
      console.error("Get meal logs error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/meal-logs", async (req, res) => {
    try {
      const schema = z.object({
        foods: z.array(z.object({
          foodId: z.number(),
          amount: z.number().optional().default(100)
        }))
      });

      const { foods } = schema.parse(req.body);
      const userId = 1; // In a real app, get from session
      
      if (!foods || foods.length === 0) {
        return res.status(400).json({ message: "No foods provided" });
      }
      
      // Create meal logs for each food
      const mealLogs = await Promise.all(
        foods.map(async (food) => {
          return storage.createMealLog({
            userId,
            foodId: food.foodId,
            amount: food.amount,
            notes: null
          });
        })
      );
      
      return res.status(201).json(mealLogs);
    } catch (error) {
      console.error("Add meal log error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/meal-logs/:id", async (req, res) => {
    try {
      const logId = parseInt(req.params.id);
      
      if (isNaN(logId)) {
        return res.status(400).json({ message: "Invalid log ID" });
      }
      
      const success = await storage.deleteMealLog(logId);
      
      if (!success) {
        return res.status(404).json({ message: "Meal log not found" });
      }
      
      return res.status(200).json({ message: "Meal log deleted successfully" });
    } catch (error) {
      console.error("Delete meal log error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // ===== Chatbot Routes =====
  app.post("/api/chat", async (req, res) => {
    try {
      const schema = insertChatMessageSchema.pick({ message: true });
      const { message } = schema.parse(req.body);
      const userId = 1; // In a real app, get from session
      
      // Save user message
      await storage.createChatMessage({
        userId,
        message,
        isUser: true
      });
      
      // Generate response from OpenAI
      const answer = await chatWithOpenAI(message);
      
      // Save bot response
      await storage.createChatMessage({
        userId,
        message: answer,
        isUser: false
      });
      
      return res.status(200).json({ answer });
    } catch (error) {
      console.error("Chat error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  return httpServer;
}

// Helper function to initialize sample data
async function initializeSampleData() {
  try {
    // Check if foods already exist
    const existingFoods = await storage.getAllFoods();
    
    if (existingFoods.length === 0) {
      // Add sample foods
      const foods = [
        {
          name: "أرز بسمتي",
          nameEn: "Basmati Rice",
          calories: 150,
          carbs: 32,
          protein: 3,
          fat: 0,
          sugar: 0,
          glycemicIndex: 58,
          diabeticSuitability: "moderate",
          imageUrl: null
        },
        {
          name: "خبز أسمر",
          nameEn: "Whole Wheat Bread",
          calories: 80,
          carbs: 15,
          protein: 4,
          fat: 1,
          sugar: 2,
          glycemicIndex: 51,
          diabeticSuitability: "moderate",
          imageUrl: null
        },
        {
          name: "تفاح",
          nameEn: "Apple",
          calories: 95,
          carbs: 25,
          protein: 0,
          fat: 0,
          sugar: 19,
          glycemicIndex: 38,
          diabeticSuitability: "moderate",
          imageUrl: null
        },
        {
          name: "صدر دجاج مشوي",
          nameEn: "Grilled Chicken Breast",
          calories: 165,
          carbs: 0,
          protein: 31,
          fat: 3,
          sugar: 0,
          glycemicIndex: 0,
          diabeticSuitability: "safe",
          imageUrl: null
        },
        {
          name: "خضروات مشكلة",
          nameEn: "Mixed Vegetables",
          calories: 65,
          carbs: 13,
          protein: 2,
          fat: 0,
          sugar: 4,
          glycemicIndex: 15,
          diabeticSuitability: "safe",
          imageUrl: null
        }
      ];
      
      for (const food of foods) {
        await storage.createFood(food);
      }
      
      console.log("Sample foods created");
    }
    
    // Check if QA database exists
    const existingQA = await storage.getAllQA();
    
    if (existingQA.length === 0) {
      // Add sample Q&A pairs
      const qaItems = [
        // Arabic Q&A pairs
        {
          question: "هل يمكنني تناول الفاكهة؟",
          answer: "نعم، يمكنك تناول الفاكهة، لكن باعتدال وحساب الكربوهيدرات. فاكهة مثل التوت والتفاح والكمثرى تعتبر خيارات جيدة لأنها منخفضة المؤشر الجلايسيمي.",
          language: "ar"
        },
        {
          question: "ما هي الأطعمة التي تساعد في خفض نسبة السكر؟",
          answer: "الأطعمة الغنية بالألياف مثل الخضروات الورقية، والحبوب الكاملة، والبقوليات، والمكسرات يمكن أن تساعد في استقرار نسبة السكر في الدم. كذلك البروتينات الخالية من الدهون والدهون الصحية.",
          language: "ar"
        },
        {
          question: "كم حصة من الكربوهيدرات يمكنني تناولها يومياً؟",
          answer: "يختلف ذلك حسب الفرد، لكن بشكل عام، يوصى بتناول 45-60 جرام من الكربوهيدرات في كل وجبة رئيسية و15-20 جرام في الوجبات الخفيفة. يفضل استشارة أخصائي التغذية لخطة غذائية مخصصة.",
          language: "ar"
        },
        
        // English Q&A pairs
        {
          question: "Can I eat fruits?",
          answer: "Yes, you can eat fruits, but in moderation and counting the carbohydrates. Fruits like berries, apples, and pears are good choices as they have a lower glycemic index.",
          language: "en"
        },
        {
          question: "What foods help lower blood sugar?",
          answer: "Foods rich in fiber such as leafy greens, whole grains, legumes, and nuts can help stabilize blood sugar. Lean proteins and healthy fats are also beneficial.",
          language: "en"
        },
        {
          question: "How many carb servings can I have daily?",
          answer: "This varies by individual, but generally, it's recommended to have 45-60 grams of carbohydrates per main meal and 15-20 grams for snacks. It's best to consult with a nutritionist for a personalized meal plan.",
          language: "en"
        }
      ];
      
      for (const qa of qaItems) {
        await storage.createQA(qa);
      }
      
      console.log("Sample Q&A pairs created");
    }
    
  } catch (error) {
    console.error("Error initializing sample data:", error);
  }
}
