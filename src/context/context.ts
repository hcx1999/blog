import { createContext } from 'react';
import type { BlogPost } from '../types';

export interface AppContextType {
  posts: BlogPost[];
  currentPost: BlogPost | null;
  setCurrentPost: (post: BlogPost | null) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filteredPosts: BlogPost[];
}

export const AppContext = createContext<AppContextType | undefined>(undefined);
