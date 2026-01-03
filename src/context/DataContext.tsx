import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
  useCallback,
} from 'react';
import { User, Newsflash, Group } from '../types';
import {
  createNewsflash as apiCreateNewsflash,
  fetchFriends,
  addFriend as apiAddFriend,
  removeFriend as apiRemoveFriend,
  fetchGroups,
  createGroup as apiCreateGroup,
  fetchMainFeed,
} from '../services/api';
import { useAuth } from './AuthContext';

interface DataContextType {
  newsflashes: Newsflash[];
  groups: Group[];
  friends: User[];
  currentUser: User;
  loading: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  error: string | null;
  addNewsflash: (newsflash: Omit<Newsflash, 'id' | 'timestamp'>) => Promise<void>;
  addGroup: (group: Omit<Group, 'id'>) => void;
  addFriend: (friendId: string) => void;
  removeFriend: (friendId: string) => void;
  refreshData: () => Promise<void>;
  refreshFriends: () => Promise<void>;
  refreshGroups: () => Promise<void>;
  refreshNewsflashes: () => Promise<void>;
  loadMoreNewsflashes: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

interface DataProviderProps {
  children: ReactNode;
}

export function DataProvider({ children }: DataProviderProps) {
  const auth = useAuth();
  
  const [newsflashes, setNewsflashes] = useState<Newsflash[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [friends, setFriends] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | undefined>();
  const [error, setError] = useState<string | null>(null);
  
  const currentUser = auth.user!;

  useEffect(() => {
    loadDataFromApi();
  }, []);

  const loadDataFromApi = async () => {
    setLoading(true);
    setError(null);
    try {
      const [feedResponse, friendsData, groupsData] = await Promise.all([
        fetchMainFeed(20),
        fetchFriends(),
        fetchGroups(),
      ]);
      setNewsflashes(feedResponse.newsflashes);
      setNextCursor(feedResponse.nextCursor);
      setHasMore(feedResponse.hasMore);
      setFriends(friendsData);
      setGroups(groupsData);
    } catch (err) {
      console.error('Failed to load data from API:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const loadMoreNewsflashes = useCallback(async () => {
    if (loadingMore || !hasMore || !nextCursor) return;
    
    setLoadingMore(true);
    try {
      const feedResponse = await fetchMainFeed(20, nextCursor);
      setNewsflashes((prev) => [...prev, ...feedResponse.newsflashes]);
      setNextCursor(feedResponse.nextCursor);
      setHasMore(feedResponse.hasMore);
    } catch (err) {
      console.error('Failed to load more newsflashes:', err);
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMore, nextCursor]);

  const refreshData = async () => {
    await loadDataFromApi();
  };

  const refreshFriends = async () => {
    try {
      const friendsData = await fetchFriends();
      setFriends(friendsData);
    } catch (err) {
      console.error('Failed to refresh friends:', err);
    }
  };

  const refreshGroups = async () => {
    try {
      const groupsData = await fetchGroups();
      setGroups(groupsData);
    } catch (err) {
      console.error('Failed to refresh groups:', err);
    }
  };

  const refreshNewsflashes = async () => {
    try {
      const feedResponse = await fetchMainFeed(20);
      setNewsflashes(feedResponse.newsflashes);
      setNextCursor(feedResponse.nextCursor);
      setHasMore(feedResponse.hasMore);
    } catch (err) {
      console.error('Failed to refresh newsflashes:', err);
    }
  };

  const addNewsflash = async (
    newsflash: Omit<Newsflash, 'id' | 'timestamp'>
  ) => {
    try {
      const newNewsflash = await apiCreateNewsflash(newsflash);
      // Add current user data to the newsflash for display
      const enrichedNewsflash: Newsflash = {
        ...newNewsflash,
        user: currentUser,
      };
      setNewsflashes((prev) => [enrichedNewsflash, ...prev]);
    } catch (err) {
      console.error('Failed to create newsflash:', err);
      throw err;
    }
  };

  const addGroup = async (group: Omit<Group, 'id'>) => {
    try {
      const newGroup = await apiCreateGroup({
        name: group.name,
        userIds: group.userIds,
      });
      setGroups((prev) => [...prev, newGroup]);
    } catch (err) {
      console.error('Failed to create group:', err);
      throw err;
    }
  };

  const addFriend = async (friendId: string) => {
    try {
      await apiAddFriend(friendId);
      // Refresh friends list to get the new friend's data
      const updatedFriends = await fetchFriends();
      setFriends(updatedFriends);
    } catch (err) {
      console.error('Failed to add friend:', err);
      throw err;
    }
  };

  const removeFriend = async (friendId: string) => {
    try {
      await apiRemoveFriend(friendId);
      setFriends((prev) => prev.filter((f) => f.id !== friendId));
      // Refresh groups to reflect the friend removal from groups
      // Backend updates groups synchronously before returning, so this should get updated data
      const updatedGroups = await fetchGroups();
      setGroups(updatedGroups);
      console.log('Groups refreshed after friend removal');
    } catch (err) {
      console.error('Failed to remove friend:', err);
      throw err;
    }
  };

  return (
    <DataContext.Provider
      value={{
        newsflashes,
        groups,
        friends,
        currentUser,
        loading,
        loadingMore,
        hasMore,
        error,
        addNewsflash,
        addGroup,
        addFriend,
        removeFriend,
        refreshData,
        refreshFriends,
        refreshGroups,
        refreshNewsflashes,
        loadMoreNewsflashes,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
