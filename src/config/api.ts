// API Configuration
const API_URL = process.env.API_URL || 'http://localhost:3000';

export const apiConfig = {
  baseUrl: API_URL,
  endpoints: {
    users: '/users',
    newsflashes: '/newsflashes',
    groups: '/groups',
    friendships: '/friendships',
  },
};

// Helper function to make API calls
export async function apiCall<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${apiConfig.baseUrl}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      error: 'Request failed',
    }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

