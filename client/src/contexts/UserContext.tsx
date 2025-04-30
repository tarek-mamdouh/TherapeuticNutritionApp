import React, { createContext, useState, useContext, useEffect } from 'react';
import { apiRequest } from '@/lib/queryClient';
import { User } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';
import { t } from '@/lib/i18n';

interface UserContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => Promise<boolean>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await apiRequest('GET', '/api/user/profile', undefined);
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

  const login = async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiRequest('POST', '/api/auth/login', { username, password });
      const userData = await response.json();
      setUser(userData);
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
      await apiRequest('POST', '/api/auth/logout', undefined);
      setUser(null);
      toast({
        title: t('user.logoutSuccess'),
      });
    } catch (err) {
      console.error('Logout failed:', err);
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
      const response = await apiRequest('PATCH', '/api/user/profile', userData);
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
    <UserContext.Provider value={{ user, isLoading, error, login, logout, updateUser }}>
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
