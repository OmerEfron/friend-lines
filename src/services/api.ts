import { apiCall, apiConfig } from '../config/api';
import { User, Newsflash, Group } from '../types';

// User API calls
export async function fetchUsers(): Promise<User[]> {
  const response = await apiCall<{ users: User[] }>(
    apiConfig.endpoints.users
  );
  return response.users;
}

export async function createUser(
  user: Omit<User, 'id'>
): Promise<User> {
  const response = await apiCall<{ user: User }>(
    apiConfig.endpoints.users,
    {
      method: 'POST',
      body: JSON.stringify(user),
    }
  );
  return response.user;
}

export async function fetchUser(id: string): Promise<User> {
  const response = await apiCall<{ user: User }>(
    `${apiConfig.endpoints.users}/${id}`
  );
  return response.user;
}

// Newsflash API calls
export async function fetchNewsflashes(
  userId?: string
): Promise<Newsflash[]> {
  const endpoint = userId
    ? `${apiConfig.endpoints.newsflashes}?userId=${userId}`
    : apiConfig.endpoints.newsflashes;
  
  const response = await apiCall<{ newsflashes: any[] }>(endpoint);
  
  // Convert timestamp strings to Date objects
  return response.newsflashes.map(newsflash => ({
    ...newsflash,
    timestamp: new Date(newsflash.timestamp),
  }));
}

export async function createNewsflash(
  newsflash: Omit<Newsflash, 'id' | 'timestamp'>
): Promise<Newsflash> {
  const response = await apiCall<{ newsflash: any }>(
    apiConfig.endpoints.newsflashes,
    {
      method: 'POST',
      body: JSON.stringify(newsflash),
    }
  );
  
  // Convert timestamp string to Date object
  return {
    ...response.newsflash,
    timestamp: new Date(response.newsflash.timestamp),
  };
}

// Friendships API calls
export async function fetchFriends(): Promise<User[]> {
  const response = await apiCall<{ friends: User[] }>('/friends');
  return response.friends;
}

export async function addFriend(friendId: string): Promise<void> {
  await apiCall('/friendships', {
    method: 'POST',
    body: JSON.stringify({ friendId }),
  });
}

export async function removeFriend(friendId: string): Promise<void> {
  await apiCall(`/friendships/${friendId}`, {
    method: 'DELETE',
  });
}

// Groups API calls
export async function fetchGroups(): Promise<Group[]> {
  const response = await apiCall<{ groups: Group[] }>('/groups');
  return response.groups;
}

export async function createGroup(data: {
  name: string;
  userIds: string[];
}): Promise<Group> {
  const response = await apiCall<{ group: Group }>('/groups', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return response.group;
}

export async function deleteGroup(groupId: string): Promise<void> {
  await apiCall(`/groups/${groupId}`, {
    method: 'DELETE',
  });
}

