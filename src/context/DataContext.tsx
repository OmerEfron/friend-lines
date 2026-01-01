import React, { createContext, useState, useContext, ReactNode } from 'react';
import { 
  users as initialUsers, 
  newsflashes as initialNewsflashes, 
  groups as initialGroups,
  friendships as initialFriendships,
  currentUser as initialCurrentUser
} from '../data/mock';
import { User, Newsflash, Group, Friendship } from '../types';

interface DataContextType {
  users: User[];
  newsflashes: Newsflash[];
  groups: Group[];
  friendships: Friendship[];
  currentUser: User;
  addNewsflash: (newsflash: Omit<Newsflash, 'id' | 'timestamp'>) => void;
  addGroup: (group: Omit<Group, 'id'>) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

interface DataProviderProps {
  children: ReactNode;
}

export function DataProvider({ children }: DataProviderProps) {
  const [users] = useState<User[]>(initialUsers);
  const [newsflashes, setNewsflashes] = useState<Newsflash[]>(initialNewsflashes);
  const [groups, setGroups] = useState<Group[]>(initialGroups);
  const [friendships] = useState<Friendship[]>(initialFriendships);
  const [currentUser] = useState<User>(initialCurrentUser);

  const addNewsflash = (newsflash: Omit<Newsflash, 'id' | 'timestamp'>) => {
    const newNewsflash: Newsflash = {
      ...newsflash,
      id: String(Date.now()),
      timestamp: new Date(),
    };
    setNewsflashes(prev => [newNewsflash, ...prev]);
  };

  const addGroup = (group: Omit<Group, 'id'>) => {
    const newGroup: Group = {
      ...group,
      id: String(Date.now()),
    };
    setGroups(prev => [...prev, newGroup]);
  };

  return (
    <DataContext.Provider
      value={{
        users,
        newsflashes,
        groups,
        friendships,
        currentUser,
        addNewsflash,
        addGroup,
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

