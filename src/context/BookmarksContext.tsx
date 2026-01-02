import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback } from 'react';
import { apiCall } from '../config/api';
import { useAuth } from './AuthContext';

interface BookmarksContextType {
  bookmarkedIds: string[];
  toggleBookmark: (newsflashId: string) => Promise<void>;
  isBookmarked: (newsflashId: string) => boolean;
  loading: boolean;
  refreshBookmarks: () => Promise<void>;
}

const BookmarksContext = createContext<BookmarksContextType | undefined>(undefined);

interface BookmarksProviderProps {
  children: ReactNode;
  useApi?: boolean;
}

export function BookmarksProvider({ children, useApi = false }: BookmarksProviderProps) {
  const { isAuthenticated } = useAuth();
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const loadBookmarks = useCallback(async () => {
    if (!useApi || !isAuthenticated) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await apiCall<{ newsflashes: any[] }>('/bookmarks');
      const ids = response.newsflashes.map((nf: any) => nf.id);
      setBookmarkedIds(ids);
    } catch (error) {
      console.error('Failed to load bookmarks:', error);
    } finally {
      setLoading(false);
    }
  }, [useApi, isAuthenticated]);

  useEffect(() => {
    loadBookmarks();
  }, [loadBookmarks]);

  const toggleBookmark = async (newsflashId: string) => {
    if (!useApi) {
      // Fallback to local state
      setBookmarkedIds(prev =>
        prev.includes(newsflashId)
          ? prev.filter(id => id !== newsflashId)
          : [...prev, newsflashId]
      );
      return;
    }

    try {
      const isCurrentlyBookmarked = bookmarkedIds.includes(newsflashId);

      if (isCurrentlyBookmarked) {
        // Remove bookmark
        await apiCall(`/bookmarks/${newsflashId}`, {
          method: 'DELETE',
        });
        setBookmarkedIds(prev => prev.filter(id => id !== newsflashId));
      } else {
        // Add bookmark
        await apiCall('/bookmarks', {
          method: 'POST',
          body: JSON.stringify({ newsflashId }),
        });
        setBookmarkedIds(prev => [...prev, newsflashId]);
      }
    } catch (error) {
      console.error('Failed to toggle bookmark:', error);
      throw error;
    }
  };

  const isBookmarked = (newsflashId: string): boolean => {
    return bookmarkedIds.includes(newsflashId);
  };

  const refreshBookmarks = async () => {
    await loadBookmarks();
  };

  if (loading && useApi) {
    return null;
  }

  return (
    <BookmarksContext.Provider
      value={{
        bookmarkedIds,
        toggleBookmark,
        isBookmarked,
        loading,
        refreshBookmarks,
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

