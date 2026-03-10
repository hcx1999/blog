import { useState, useMemo, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { BlogPost } from '../types';
import { AppContext } from './context';

const getInitialDarkMode = (): boolean => {
  if (typeof window === 'undefined') return false;
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') return true;
  if (savedTheme === 'light') return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
};

export const AppProvider: React.FC<{ children: ReactNode; posts: BlogPost[] }> = ({ children, posts }) => {
  const [darkMode, setDarkMode] = useState(getInitialDarkMode);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(prev => {
      const newMode = !prev;
      localStorage.setItem('theme', newMode ? 'dark' : 'light');
      return newMode;
    });
  };

  const filteredPosts = useMemo(() => 
    posts.filter(post =>
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    ),
    [posts, searchQuery]
  );

  return (
    <AppContext.Provider value={{
      posts,
      darkMode,
      toggleDarkMode,
      searchQuery,
      setSearchQuery,
      filteredPosts,
    }}>
      {children}
    </AppContext.Provider>
  );
};
