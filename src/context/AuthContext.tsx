import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
} from 'react';
import * as authService from '../services/auth';
import {
  registerForPushNotificationsAsync,
  registerPushTokenWithBackend,
  removePushTokenFromBackend,
} from '../services/notifications';

interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    name: string;
    username: string;
    email: string;
    password: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const registerPushNotifications = async () => {
    try {
      const pushToken = await registerForPushNotificationsAsync();
      if (pushToken) {
        await registerPushTokenWithBackend(pushToken);
      }
    } catch (error) {
      console.error('Failed to register push notifications:', error);
    }
  };

  // Auto-login from stored token
  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const storedToken = await authService.getToken();
      const storedUser = await authService.getStoredUser();

      if (storedToken && storedUser) {
        // Verify token is still valid
        try {
          const currentUser = await authService.getCurrentUser(storedToken);
          setToken(storedToken);
          setUser(currentUser);
          // Re-register push notifications on app restart
          registerPushNotifications();
        } catch (error) {
          // Token invalid, clear storage
          await authService.logout();
        }
      }
    } catch (error) {
      console.error('Failed to load stored auth:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const response = await authService.login(email, password);
    setToken(response.token);
    setUser(response.user);
    // Register for push notifications after login
    registerPushNotifications();
  };

  const register = async (data: {
    name: string;
    username: string;
    email: string;
    password: string;
  }) => {
    const response = await authService.register(data);
    setToken(response.token);
    setUser(response.user);
    // Register for push notifications after registration
    registerPushNotifications();
  };

  const logout = async () => {
    // Remove push token before logout
    try {
      await removePushTokenFromBackend();
    } catch (error) {
      console.error('Failed to remove push token:', error);
    }
    await authService.logout();
    setToken(null);
    setUser(null);
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    authService.storeUser(updatedUser);
  };

  const refreshUser = async () => {
    if (token) {
      try {
        const currentUser = await authService.getCurrentUser(token);
        setUser(currentUser);
        await authService.storeUser(currentUser);
      } catch (error) {
        console.error('Failed to refresh user:', error);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user && !!token,
        login,
        register,
        logout,
        updateUser,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
