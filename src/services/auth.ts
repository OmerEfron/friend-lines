import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiCall, apiConfig } from '../config/api';

const TOKEN_KEY = '@friendlines_auth_token';
const USER_KEY = '@friendlines_user';

interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  avatar?: string;
}

interface AuthResponse {
  user: User;
  token: string;
}

// Register new user
export async function register(data: {
  name: string;
  username: string;
  email: string;
  password: string;
}): Promise<AuthResponse> {
  const response = await apiCall<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  });

  // Store token and user
  await AsyncStorage.setItem(TOKEN_KEY, response.token);
  await AsyncStorage.setItem(USER_KEY, JSON.stringify(response.user));

  return response;
}

// Login user
export async function login(
  email: string,
  password: string
): Promise<AuthResponse> {
  const response = await apiCall<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

  // Store token and user
  await AsyncStorage.setItem(TOKEN_KEY, response.token);
  await AsyncStorage.setItem(USER_KEY, JSON.stringify(response.user));

  return response;
}

// Logout user
export async function logout(): Promise<void> {
  await AsyncStorage.removeItem(TOKEN_KEY);
  await AsyncStorage.removeItem(USER_KEY);
}

// Get stored token
export async function getToken(): Promise<string | null> {
  return await AsyncStorage.getItem(TOKEN_KEY);
}

// Get stored user
export async function getStoredUser(): Promise<User | null> {
  const userJson = await AsyncStorage.getItem(USER_KEY);
  return userJson ? JSON.parse(userJson) : null;
}

// Get current user from API
export async function getCurrentUser(token: string): Promise<User> {
  const response = await apiCall<{ user: User }>('/auth/me', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.user;
}

// Check if authenticated
export async function isAuthenticated(): Promise<boolean> {
  const token = await getToken();
  return token !== null;
}

// Store user in AsyncStorage
export async function storeUser(user: User): Promise<void> {
  await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
}

