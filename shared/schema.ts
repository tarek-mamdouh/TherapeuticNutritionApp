import { pgTable, text, serial, integer, boolean, json, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name"),
  age: integer("age"),
  diabetesType: text("diabetes_type"),
  preferences: text("preferences"),
  language: text("language").default("ar"),
  createdAt: timestamp("created_at").defaultNow()
});

export const foods = pgTable("foods", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  nameEn: text("name_en").notNull(),
  calories: integer("calories").notNull(),
  carbs: integer("carbs").notNull(),
  protein: integer("protein").notNull(),
  fat: integer("fat").notNull(),
  sugar: integer("sugar").notNull(),
  glycemicIndex: integer("glycemic_index"),
  diabeticSuitability: text("diabetic_suitability").notNull(), // "safe", "moderate", "avoid"
  imageUrl: text("image_url")
});

export const mealLogs = pgTable("meal_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  foodId: integer("food_id").references(() => foods.id),
  date: timestamp("date").defaultNow(),
  amount: integer("amount").default(100), // in grams
  notes: text("notes")
});

export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  message: text("message").notNull(),
  isUser: boolean("is_user").notNull(),
  createdAt: timestamp("created_at").defaultNow()
});

export const qaDatabase = pgTable("qa_database", {
  id: serial("id").primaryKey(),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  language: text("language").notNull().default("ar")
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true
});

export const insertFoodSchema = createInsertSchema(foods).omit({
  id: true
});

export const insertMealLogSchema = createInsertSchema(mealLogs).omit({
  id: true,
  date: true
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  createdAt: true
});

export const insertQASchema = createInsertSchema(qaDatabase).omit({
  id: true
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertFood = z.infer<typeof insertFoodSchema>;
export type Food = typeof foods.$inferSelect;

export type InsertMealLog = z.infer<typeof insertMealLogSchema>;
export type MealLog = typeof mealLogs.$inferSelect;

export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;

export type InsertQA = z.infer<typeof insertQASchema>;
export type QA = typeof qaDatabase.$inferSelect;

// Additional types for API responses
export type RecognizedFood = {
  name: string;
  confidence: number;
};

export type FoodAnalysisResponse = {
  recognizedFoods: RecognizedFood[];
  nutritionInfo: {
    calories: number;
    carbs: number;
    protein: number;
    fat: number;
    sugar: number;
    glycemicIndex: number;
  };
  diabetesSuitability: {
    overall: string; // "safe", "moderate", "avoid"
    details: {
      [foodName: string]: {
        suitability: string;
        reason: string;
      };
    };
  };
};

export type ChatbotResponse = {
  answer: string;
  sources?: string[];
};
