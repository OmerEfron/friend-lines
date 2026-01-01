import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BOOKMARKS_STORAGE_KEY = '@friendlines_bookmarks';

interface BookmarksContextType {
  bookmarkedIds: string[];
  toggleBookmark: (newsflashId: string) => void;
  isBookmarked: (newsflashId: string) => boolean;
}

const BookmarksContext = createContext<BookmarksContextType | undefined>(undefined);

interface BookmarksProviderProps {
  children: ReactNode;
}

export function BookmarksProvider({ children }: BookmarksProviderProps) {
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadBookmarks();
  }, []);

  const loadBookmarks = async () => {
    try {
      const saved = await AsyncStorage.getItem(BOOKMARKS_STORAGE_KEY);
      if (saved !== null) {
        setBookmarkedIds(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Failed to load bookmarks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleBookmark = async (newsflashId: string) => {
    try {
      const newBookmarks = bookmarkedIds.includes(newsflashId)
        ? bookmarkedIds.filter(id => id !== newsflashId)
        : [...bookmarkedIds, newsflashId];
      
      setBookmarkedIds(newBookmarks);
      await AsyncStorage.setItem(BOOKMARKS_STORAGE_KEY, JSON.stringify(newBookmarks));
    } catch (error) {
      console.error('Failed to save bookmark:', error);
    }
  };

  const isBookmarked = (newsflashId: string): boolean => {
    return bookmarkedIds.includes(newsflashId);
  };

  if (isLoading) {
    return null;
  }

  return (
    <BookmarksContext.Provider
      value={{
        bookmarkedIds,
        toggleBookmark,
        isBookmarked,
      }}
    >
      {children}
    </BookmarksContext.Provider>
  );
}

export function useBookmarks() {
  const context = useContext(BookmarksContext);
  if (context === undefined) {
    throw new Error('useBookmarks must be used within a BookmarksProvider');
  }
  return context;
}

