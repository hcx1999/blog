import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Search, Sun, Moon, Menu } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { cn } from '../utils/cn';

const FOCUS_SEARCH_EVENT = 'focusSearch';

interface NavbarProps {
  toggleSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ toggleSidebar }) => {
  const { darkMode, toggleDarkMode } = useAppContext();
  const [searchParams] = useSearchParams();
  const [searchInput, setSearchInput] = useState(() => searchParams.get('q') || '');
  const navigate = useNavigate();
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleFocusSearch = () => {
      searchInputRef.current?.focus();
    };

    window.addEventListener(FOCUS_SEARCH_EVENT, handleFocusSearch);
    return () => window.removeEventListener(FOCUS_SEARCH_EVENT, handleFocusSearch);
  }, []);

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const handleSearchInputChange = useCallback((value: string) => {
    setSearchInput(value);
    
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    debounceTimerRef.current = setTimeout(() => {
      if (value.trim()) {
        navigate(`/search?q=${encodeURIComponent(value.trim())}`, { replace: true });
      }
    }, 300);
  }, [navigate]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    if (searchInput.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchInput.trim())}`);
    } else {
      navigate('/');
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 z-50 flex items-center px-4 transition-colors duration-200">
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        <button
          onClick={() => navigate('/')}
          className="hover:opacity-80 transition-opacity flex items-center gap-2"
        >
          <img 
              src={`${import.meta.env.BASE_URL}avatar.svg`} 
              alt="Blog Logo" 
              className="w-8 h-8"
            />
          <span className="font-semibold">&omega;</span>
        </button>
      </div>

      <div className="flex-1 flex justify-end items-center">
        <form onSubmit={handleSearch} className="max-w-sm mx-4">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="搜索..."
              value={searchInput}
              onChange={(e) => handleSearchInputChange(e.target.value)}
              className={cn(
                "w-full pl-8 pr-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700",
                "bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2",
                "focus:ring-gray-500 dark:focus:ring-gray-400 transition-all text-sm"
              )}
            />
          </div>
        </form>

        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
      </div>
    </nav>
  );
};
