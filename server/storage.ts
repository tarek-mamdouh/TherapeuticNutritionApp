import { 
  users, type User, type InsertUser,
  foods, type Food, type InsertFood,
  mealLogs, type MealLog, type InsertMealLog,
  chatMessages, type ChatMessage, type InsertChatMessage,
  qaDatabase, type QA, type InsertQA
} from "@shared/schema";

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<User>): Promise<User>;
  
  // Food operations
  getAllFoods(): Promise<Food[]>;
  getFood(id: number): Promise<Food | undefined>;
  createFood(food: InsertFood): Promise<Food>;
  
  // Meal log operations
  getMealLogsByUser(userId: number): Promise<MealLog[]>;
  getMealLog(id: number): Promise<MealLog | undefined>;
  createMealLog(mealLog: InsertMealLog): Promise<MealLog>;
  deleteMealLog(id: number): Promise<boolean>;
  
  // Chat message operations
  getChatMessagesByUser(userId: number): Promise<ChatMessage[]>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  
  // QA database operations
  getAllQA(): Promise<QA[]>;
  getQAByLanguage(language: string): Promise<QA[]>;
  createQA(qa: InsertQA): Promise<QA>;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private foods: Map<number, Food>;
  private mealLogs: Map<number, MealLog>;
  private chatMessages: Map<number, ChatMessage>;
  private qaDatabase: Map<number, QA>;
  private userIdCounter: number;
  private foodIdCounter: number;
  private mealLogIdCounter: number;
  private chatMessageIdCounter: number;
  private qaIdCounter: number;

  constructor() {
    this.users = new Map();
    this.foods = new Map();
    this.mealLogs = new Map();
    this.chatMessages = new Map();
    this.qaDatabase = new Map();
    this.userIdCounter = 1;
    this.foodIdCounter = 1;
    this.mealLogIdCounter = 1;
    this.chatMessageIdCounter = 1;
    this.qaIdCounter = 1;
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase()
    );
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email && user.email.toLowerCase() === email.toLowerCase()
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const createdAt = new Date();
    const user: User = { ...insertUser, id, createdAt };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User> {
    const user = await this.getUser(id);
    if (!user) {
      throw new Error(`User with id ${id} not found`);
    }
    
    const updatedUser: User = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Food operations
  async getAllFoods(): Promise<Food[]> {
    return Array.from(this.foods.values());
  }

  async getFood(id: number): Promise<Food | undefined> {
    return this.foods.get(id);
  }

  async createFood(insertFood: InsertFood): Promise<Food> {
    const id = this.foodIdCounter++;
    const food: Food = { ...insertFood, id };
    this.foods.set(id, food);
    return food;
  }

  // Meal log operations
  async getMealLogsByUser(userId: number): Promise<MealLog[]> {
    return Array.from(this.mealLogs.values()).filter(
      (log) => log.userId === userId
    );
  }

  async getMealLog(id: number): Promise<MealLog | undefined> {
    return this.mealLogs.get(id);
  }

  async createMealLog(insertMealLog: InsertMealLog): Promise<MealLog> {
    const id = this.mealLogIdCounter++;
    const date = new Date();
    const mealLog: MealLog = { ...insertMealLog, id, date };
    this.mealLogs.set(id, mealLog);
    return mealLog;
  }

  async deleteMealLog(id: number): Promise<boolean> {
    if (!this.mealLogs.has(id)) {
      return false;
    }
    return this.mealLogs.delete(id);
  }

  // Chat message operations
  async getChatMessagesByUser(userId: number): Promise<ChatMessage[]> {
    return Array.from(this.chatMessages.values())
      .filter((message) => message.userId === userId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  async createChatMessage(insertMessage: InsertChatMessage): Promise<ChatMessage> {
    const id = this.chatMessageIdCounter++;
    const createdAt = new Date();
    const message: ChatMessage = { ...insertMessage, id, createdAt };
    this.chatMessages.set(id, message);
    return message;
  }

  // QA database operations
  async getAllQA(): Promise<QA[]> {
    return Array.from(this.qaDatabase.values());
  }

  async getQAByLanguage(language: string): Promise<QA[]> {
    return Array.from(this.qaDatabase.values()).filter(
      (qa) => qa.language === language
    );
  }

  async createQA(insertQA: InsertQA): Promise<QA> {
    const id = this.qaIdCounter++;
    const qa: QA = { ...insertQA, id };
    this.qaDatabase.set(id, qa);
    return qa;
  }
}

// Export a singleton instance of MemStorage
export const storage = new MemStorage();
