import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
} from 'react';
import {
  users as initialUsers,
  newsflashes as initialNewsflashes,
  groups as initialGroups,
  friendships as initialFriendships,
  currentUser as initialCurrentUser,
} from '../data/mock';
import { User, Newsflash, Group, Friendship } from '../types';
import {
  fetchUsers,
  fetchNewsflashes,
  createNewsflash as apiCreateNewsflash,
  fetchFriends,
  addFriend as apiAddFriend,
  removeFriend as apiRemoveFriend,
} from '../services/api';
import { useAuth } from './AuthContext';

interface DataContextType {
  users: User[];
  newsflashes: Newsflash[];
  groups: Group[];
  friendships: Friendship[];
  currentUser: User;
  loading: boolean;
  error: string | null;
  addNewsflash: (newsflash: Omit<Newsflash, 'id' | 'timestamp'>) => Promise<void>;
  addGroup: (group: Omit<Group, 'id'>) => void;
  addFriend: (friendId: string) => void;
  removeFriend: (friendId: string) => void;
  refreshData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

interface DataProviderProps {
  children: ReactNode;
  useApi?: boolean; // Flag to enable/disable API integration
}

export function DataProvider({
  children,
  useApi = false,
}: DataProviderProps) {
  const auth = useApi ? useAuth() : null;
  
  // Use empty arrays when API mode, mock data otherwise
  const [users, setUsers] = useState<User[]>(useApi ? [] : initialUsers);
  const [newsflashes, setNewsflashes] = useState<Newsflash[]>(
    useApi ? [] : initialNewsflashes
  );
  const [groups, setGroups] = useState<Group[]>(useApi ? [] : initialGroups);
  const [friendships, setFriendships] = useState<Friendship[]>(
    useApi ? [] : initialFriendships
  );
  
  // Get current user from auth context when using API, otherwise use mock
  const currentUser = useApi && auth?.user ? auth.user : initialCurrentUser;
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load data from API on mount if enabled
  useEffect(() => {
    if (useApi) {
      loadDataFromApi();
    }
  }, [useApi]);

  const loadDataFromApi = async () => {
    setLoading(true);
    setError(null);
    try {
      const [usersData, newsflashesData, friendsData] = await Promise.all([
        fetchUsers(),
        fetchNewsflashes(),
        fetchFriends(),
      ]);
      setUsers(usersData);
      setNewsflashes(newsflashesData);
      
      // Convert friends to friendships format
      const friendshipsData = friendsData.map((friend) => ({
        userId: currentUser.id,
        friendId: friend.id,
      }));
      setFriendships(friendshipsData);
      
      // Clear groups until we implement that endpoint
      setGroups([]);
    } catch (err) {
      console.error('Failed to load data from API:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    if (useApi) {
      await loadDataFromApi();
    }
  };

  const addNewsflash = async (
    newsflash: Omit<Newsflash, 'id' | 'timestamp'>
  ) => {
    if (useApi) {
      try {
        const newNewsflash = await apiCreateNewsflash(newsflash);
        setNewsflashes((prev) => [newNewsflash, ...prev]);
      } catch (err) {
        console.error('Failed to create newsflash:', err);
        throw err;
      }
    } else {
      // Fallback to local state
      const newNewsflash: Newsflash = {
        ...newsflash,
        id: String(Date.now()),
        timestamp: new Date(),
      };
      setNewsflashes((prev) => [newNewsflash, ...prev]);
    }
  };

  const addGroup = (group: Omit<Group, 'id'>) => {
    const newGroup: Group = {
      ...group,
      id: String(Date.now()),
    };
    setGroups((prev) => [...prev, newGroup]);
  };

  const addFriend = async (friendId: string) => {
    if (useApi) {
      try {
        await apiAddFriend(friendId);
        const newFriendship: Friendship = {
          userId: currentUser.id,
          friendId: friendId,
        };
        setFriendships((prev) => [...prev, newFriendship]);
      } catch (err) {
        console.error('Failed to add friend:', err);
        throw err;
      }
    } else {
      const newFriendship: Friendship = {
        userId: currentUser.id,
        friendId: friendId,
      };
      setFriendships((prev) => [...prev, newFriendship]);
    }
  };

  const removeFriend = async (friendId: string) => {
    if (useApi) {
      try {
        await apiRemoveFriend(friendId);
        setFriendships((prev) =>
          prev.filter(
            (f) => !(f.userId === currentUser.id && f.friendId === friendId)
          )
        );
      } catch (err) {
        console.error('Failed to remove friend:', err);
        throw err;
      }
    } else {
      setFriendships((prev) =>
        prev.filter(
          (f) => !(f.userId === currentUser.id && f.friendId === friendId)
        )
      );
    }
  };

  return (
    <DataContext.Provider
      value={{
        users,
        newsflashes,
        groups,
        friendships,
        currentUser,
        loading,
        error,
        addNewsflash,
        addGroup,
        addFriend,
        removeFriend,
        refreshData,
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
