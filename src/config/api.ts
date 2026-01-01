import { Platform } from 'react-native';

// API Configuration
// Android emulator uses 10.0.2.2 to access host machine's localhost
// iOS simulator can use localhost directly
const getApiUrl = () => {
  if (process.env.API_URL) {
    return process.env.API_URL;
  }
  
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:3000';
  }
  
  return 'http://localhost:3000';
};

export const apiConfig = {
  baseUrl: getApiUrl(),
  endpoints: {
    users: '/users',
    newsflashes: '/newsflashes',
    groups: '/groups',
    friendships: '/friendships',
  },
};

import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = '@friendlines_auth_token';

// Helper function to make API calls
export async function apiCall<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${apiConfig.baseUrl}${endpoint}`;
  
  console.log(`[API] ${options?.method || 'GET'} ${url}`);
  
  try {
    // Get token from storage
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options?.headers,
    };

    // Add Authorization header if token exists
    if (token && !headers.Authorization) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        error: 'Request failed',
      }));
      console.error(`[API] Error: ${error.error || response.status}`);
      
      // Handle 401 Unauthorized
      if (response.status === 401) {
        // Clear invalid token
        await AsyncStorage.removeItem(TOKEN_KEY);
        await AsyncStorage.removeItem('@friendlines_user');
        throw new Error('Session expired. Please login again.');
      }
      
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    const data = await response.json();
    console.log(`[API] Success:`, data);
    return data;
  } catch (error) {
    console.error(`[API] Network error for ${url}:`, error);
    throw error;
  }
}

