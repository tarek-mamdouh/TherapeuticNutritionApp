import { apiRequest } from './queryClient';
import { Food, FoodAnalysisResponse, RecognizedFood, ChatbotResponse } from '@shared/schema';

export const foodApi = {
  // Get all foods from the database
  getFoods: async (): Promise<Food[]> => {
    const response = await apiRequest('GET', '/api/foods', undefined);
    return response.json();
  },
  
  // Get a single food by ID
  getFood: async (id: number): Promise<Food> => {
    const response = await apiRequest('GET', `/api/foods/${id}`, undefined);
    return response.json();
  },
  
  // Analyze image to recognize foods
  analyzeImage: async (imageFile: File): Promise<FoodAnalysisResponse> => {
    const formData = new FormData();
    formData.append('image', imageFile);
    
    const response = await fetch('/api/analyze/image', {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error(`Server responded with ${response.status}`);
    }
    
    return response.json();
  },
  
  // Analyze manually selected foods
  analyzeManual: async (foodIds: number[]): Promise<FoodAnalysisResponse> => {
    const response = await apiRequest('POST', '/api/analyze/manual', { foodIds });
    return response.json();
  }
};

export const mealLogApi = {
  // Get all meal logs for the current user
  getMealLogs: async (): Promise<any[]> => {
    const response = await apiRequest('GET', '/api/meal-logs', undefined);
    return response.json();
  },
  
  // Add a new meal log
  addMealLog: async (foods: { foodId: number, amount: number }[]): Promise<any> => {
    const response = await apiRequest('POST', '/api/meal-logs', { foods });
    return response.json();
  },
  
  // Delete a meal log
  deleteMealLog: async (id: number): Promise<void> => {
    await apiRequest('DELETE', `/api/meal-logs/${id}`, undefined);
  }
};

export const chatbotApi = {
  // Send a message to the chatbot
  sendMessage: async (message: string): Promise<ChatbotResponse> => {
    const response = await apiRequest('POST', '/api/chat', { message });
    return response.json();
  }
};

export const userApi = {
  // Get current user profile
  getProfile: async (): Promise<any> => {
    const response = await apiRequest('GET', '/api/user/profile', undefined);
    return response.json();
  },
  
  // Update user profile
  updateProfile: async (userData: any): Promise<any> => {
    const response = await apiRequest('PATCH', '/api/user/profile', userData);
    return response.json();
  },
  
  // Login
  login: async (username: string, password: string): Promise<any> => {
    const response = await apiRequest('POST', '/api/auth/login', { username, password });
    return response.json();
  },
  
  // Logout
  logout: async (): Promise<void> => {
    await apiRequest('POST', '/api/auth/logout', undefined);
  }
};
