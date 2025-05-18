import React, { createContext, useState, useContext, useEffect } from 'react';
import { apiRequest } from '@/lib/queryClient';
import { User } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';
import { t } from '@/lib/i18n';

interface UserContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  hasSpecialNeeds: boolean;
  login: (username: string, password: string, specialNeeds?: boolean) => Promise<boolean>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => Promise<boolean>;
  setHasSpecialNeeds: (value: boolean) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [hasSpecialNeeds, setHasSpecialNeeds] = useState<boolean>(
    localStorage.getItem('specialNeeds') === 'true'
  );
  const { toast } = useToast();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        // Check if we have a token
        const token = localStorage.getItem('authToken');
        
        if (!token) {
          // No token, so no user is logged in
          setIsLoading(false);
          return;
        }
        
        // Set the token in headers through apiRequest
        const response = await apiRequest('GET', '/api/user', undefined);
        
        if (!response.ok) {
          // Token might be invalid or expired
          localStorage.removeItem('authToken');
          setIsLoading(false);
          return;
        }
        
        const userData = await response.json();
        setUser(userData);
      } catch (err) {
        console.error('Failed to fetch user profile:', err);
        // Not setting an error here as the user might not be logged in
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, []);

  // Save special needs preference to localStorage
  useEffect(() => {
    localStorage.setItem('specialNeeds', hasSpecialNeeds.toString());
  }, [hasSpecialNeeds]);

  const login = async (username: string, password: string, specialNeeds?: boolean): Promise<boolean> => {
    // Update special needs if provided during login
    if (specialNeeds !== undefined) {
      setHasSpecialNeeds(specialNeeds);
    }
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiRequest('POST', '/api/login', { username, password });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }
      
      const data = await response.json();
      
      // Check if we have user data in the response
      const userData = data.user || data;
      
      // Set user data and store token if present
      setUser(userData);
      
      if (data.token) {
        localStorage.setItem('authToken', data.token);
      }
      
      toast({
        title: t('user.loginSuccess'),
        description: t('user.loginSuccessDesc', { name: userData.name || username }),
      });
      
      return true;
    } catch (err) {
      console.error('Login failed:', err);
      setError(err instanceof Error ? err.message : String(err));
      toast({
        title: t('user.loginError'),
        description: t('user.loginErrorDesc'),
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    
    try {
      await apiRequest('POST', '/api/logout', undefined);
      
      // Clear user data
      setUser(null);
      
      // Remove token from local storage
      localStorage.removeItem('authToken');
      
      toast({
        title: t('user.logoutSuccess'),
      });
    } catch (err) {
      console.error('Logout failed:', err);
      
      // Still remove user data and token on error
      setUser(null);
      localStorage.removeItem('authToken');
      
      toast({
        title: t('user.logoutError'),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = async (userData: Partial<User>): Promise<boolean> => {
    if (!user) {
      toast({
        title: t('user.notLoggedIn'),
        description: t('user.loginRequired'),
        variant: 'destructive',
      });
      return false;
    }
    
    setIsLoading(true);
    
    try {
      const response = await apiRequest('PATCH', '/api/user', userData);
      const updatedUser = await response.json();
      setUser(updatedUser);
      toast({
        title: t('user.updateSuccess'),
        description: t('user.updateSuccessDesc'),
      });
      return true;
    } catch (err) {
      console.error('Update user failed:', err);
      setError(err instanceof Error ? err.message : String(err));
      toast({
        title: t('user.updateError'),
        description: t('user.updateErrorDesc'),
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <UserContext.Provider value={{ 
      user, 
      isLoading, 
      error, 
      hasSpecialNeeds,
      login, 
      logout, 
      updateUser,
      setHasSpecialNeeds
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
