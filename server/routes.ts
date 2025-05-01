import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { chatWithOpenAI } from "./services/openai";
import { chatWithPerplexity } from "./services/perplexity";
import { recognizeFood } from "./services/foodRecognition";
import { getFoodNutrition, analyzeFoodSuitability } from "./services/nutritionDatabase";
import multer from "multer";
import { FoodAnalysisResponse, insertChatMessageSchema, userSignupSchema, userLoginSchema, AuthResponse } from "@shared/schema";
import { z } from "zod";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Auth middleware
interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    username: string;
  };
}

const authenticate = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number, username: string };
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized: Invalid token" });
  }
};

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
  // User registration route
  app.post("/api/register", async (req, res) => {
    try {
      console.log("Registration request received:", req.body);
      
      // Create simplified validation instead of using Zod schema
      const { username, email, password, name, language } = req.body;
      
      // Basic validation
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }
      
      // Check if user already exists
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Create new user with hashed password
      const newUser = await storage.createUser({
        username,
        email: email || `${username}@example.com`,
        password: hashedPassword,
        name: name || null,
        language: language || "ar",
        age: null,
        diabetesType: null,
        preferences: null,
        createdAt: new Date()
      });
      
      console.log("User created successfully:", username);
      
      // Create and sign JWT token
      const token = jwt.sign(
        { id: newUser.id, username: newUser.username },
        JWT_SECRET,
        { expiresIn: '1d' }
      );
      
      // Return user data and token (excluding password)
      const { password: _, ...userWithoutPassword } = newUser;
      return res.status(201).json({
        user: userWithoutPassword,
        token
      });
    } catch (error) {
      console.error("Registration error:", error);
      if (error.name === "ZodError") {
        return res.status(400).json({ message: error.errors });
      }
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // User login route
  app.post("/api/login", async (req, res) => {
    try {
      console.log("Login request received:", JSON.stringify({...req.body, password: "******"}));
      
      // Get username and password from request
      const { username, password } = req.body;
      
      // Basic validation
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }
      
      // Find user by username
      const user = await storage.getUserByUsername(username);
      if (!user) {
        console.log(`User not found: ${username}`);
        return res.status(401).json({ message: "Invalid username or password" });
      }
      
      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        console.log(`Invalid password for user: ${username}`);
        return res.status(401).json({ message: "Invalid username or password" });
      }
      
      // Generate JWT token
      const token = jwt.sign(
        { id: user.id, username: user.username },
        JWT_SECRET,
        { expiresIn: '1d' }
      );
      
      // Return user data and token (excluding password)
      const { password: _, ...userWithoutPassword } = user;
      return res.status(200).json({
        user: userWithoutPassword,
        token
      });
    } catch (error) {
      console.error("Login error:", error);
      if (error.name === "ZodError") {
        return res.status(400).json({ message: error.errors });
      }
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // User logout route (just for API consistency)
  app.post("/api/logout", (req, res) => {
    // JWT is stateless, so actual logout happens on client side by removing the token
    return res.status(200).json({ message: "Logged out successfully" });
  });

  // ===== User Profile Routes =====
  // Get current user info
  app.get("/api/user", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const user = await storage.getUser(req.user.id);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Return user data without password
      const { password: _p1, ...userWithoutPassword } = user;
      return res.status(200).json(userWithoutPassword);
    } catch (error) {
      console.error("Get user error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.get("/api/user/profile", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const user = await storage.getUser(req.user.id);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Return user data without password
      const { password: _p2, ...userWithoutPassword } = user;
      return res.status(200).json(userWithoutPassword);
    } catch (error) {
      console.error("Get profile error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/user/profile", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const userId = req.user.id;
      const userData = req.body;
      
      // Don't allow changing username or email through this endpoint
      delete userData.username;
      delete userData.email;
      
      // If password is being updated, hash it
      if (userData.password) {
        userData.password = await bcrypt.hash(userData.password, 10);
      }
      
      const updatedUser = await storage.updateUser(userId, userData);
      
      // Return updated user without password
      const { password, ...userWithoutPassword } = updatedUser;
      return res.status(200).json(userWithoutPassword);
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
  app.get("/api/meal-logs", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const userId = req.user.id;
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

  app.post("/api/meal-logs", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const schema = z.object({
        foods: z.array(z.object({
          foodId: z.number(),
          amount: z.number().optional().default(100),
          notes: z.string().optional().nullable()
        }))
      });

      const { foods } = schema.parse(req.body);
      const userId = req.user.id;
      
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
            notes: food.notes
          });
        })
      );
      
      // Fetch food details for the newly created meal logs
      const mealLogsWithFood = await Promise.all(
        mealLogs.map(async (log) => {
          const food = await storage.getFood(log.foodId);
          return { ...log, food };
        })
      );
      
      return res.status(201).json(mealLogsWithFood);
    } catch (error) {
      console.error("Add meal log error:", error);
      if (error.name === "ZodError") {
        return res.status(400).json({ message: error.errors });
      }
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/meal-logs/:id", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const logId = parseInt(req.params.id);
      
      if (isNaN(logId)) {
        return res.status(400).json({ message: "Invalid log ID" });
      }
      
      // Get the meal log to check ownership
      const mealLog = await storage.getMealLog(logId);
      
      if (!mealLog) {
        return res.status(404).json({ message: "Meal log not found" });
      }
      
      // Ensure the user owns the meal log
      if (mealLog.userId !== req.user.id) {
        return res.status(403).json({ message: "Forbidden: You don't have permission to delete this meal log" });
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
  app.post("/api/chat", async (req: AuthenticatedRequest, res) => {
    try {
      // Modified to allow unauthenticated access for demo purposes
      // if (!req.user) {
      //   return res.status(401).json({ message: "Unauthorized" });
      // }
      
      // Validate input
      const schema = z.object({
        message: z.string(),
        language: z.string().optional()
      });
      
      const { message, language = 'ar' } = schema.parse(req.body);
      const userId = req.user?.id || 0; // Use 0 for unauthenticated users
      
      console.log(`Processing chat request: "${message}" in language: ${language}`);
      
      // Save user message if authenticated
      if (req.user) {
        await storage.createChatMessage({
          userId,
          message,
          isUser: true
        });
      }
      
      // Try to generate response from Perplexity API first, then fall back to OpenAI if needed
      let answer;
      
      // Try Perplexity API first
      try {
        answer = await chatWithPerplexity(message, language);
        console.log(`Got Perplexity response: "${answer.substring(0, 50)}..."`);
      } catch (perplexityError) {
        console.error("Perplexity API error:", perplexityError);
        
        // Fallback to OpenAI if Perplexity fails
        try {
          console.log("Falling back to OpenAI for chat response");
          const openAIAnswer = await chatWithOpenAI(message, language);
          if (openAIAnswer) {
            answer = openAIAnswer;
            console.log(`Got OpenAI response: "${answer.substring(0, 50)}..."`);
          } else {
            throw new Error("Empty response from OpenAI");
          }
        } catch (openaiError) {
          console.error("OpenAI API error:", openaiError);
          // Default fallback message
          answer = language === 'ar' 
            ? "عذراً، حدث خطأ في معالجة طلبك. يرجى المحاولة مرة أخرى." 
            : "Sorry, there was an error processing your request. Please try again.";
        }
      }
      
      // Save bot response if authenticated
      if (req.user) {
        await storage.createChatMessage({
          userId,
          message: answer,
          isUser: false
        });
      }
      
      return res.status(200).json({ answer });
    } catch (error) {
      console.error("Chat error:", error);
      if ((error as any).name === "ZodError") {
        return res.status(400).json({ message: (error as any).errors });
      }
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
    
    // Create a demo user for testing
    const testUser = await storage.getUserByUsername("testuser");
    if (!testUser) {
      const hashedPassword = await bcrypt.hash("password123", 10);
      await storage.createUser({
        username: "testuser",
        email: "test@example.com",
        password: hashedPassword,
        name: "Test User",
        language: "en",
        age: 35,
        diabetesType: "type2",
        preferences: null,
        createdAt: new Date()
      });
      console.log("Demo user created: testuser / password123");
    }
    
  } catch (error) {
    console.error("Error initializing sample data:", error);
  }
}
