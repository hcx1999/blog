import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { HomePage } from './pages/HomePage';
import { ArticlePage } from './pages/ArticlePage';
import { SearchResultsPage } from './pages/SearchResultsPage';
import { loadVaultPosts, getVaultHierarchy } from './utils/vault';
import { cn } from './utils/cn';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import type { KeyboardShortcut } from './hooks/useKeyboardShortcuts';

export const FOCUS_SEARCH_EVENT = 'focusSearch';

const RedirectHandler: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const [isRedirecting, setIsRedirecting] = useState(true);

  useEffect(() => {
    const redirectPath = sessionStorage.getItem('redirectPath');
    if (redirectPath) {
      sessionStorage.removeItem('redirectPath');
      const pathWithoutBase = redirectPath.replace(/^\/blog/, '');
      navigate(pathWithoutBase || '/', { replace: true });
    }
    setIsRedirecting(false);
  }, [navigate]);

  if (isRedirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-800">
        <div className="text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  return <>{children}</>;
};

const AppContent: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const posts = useMemo(() => loadVaultPosts(), []);
  const hierarchy = useMemo(() => getVaultHierarchy(), []);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen(prev => !prev);
  }, []);

  const handleFocusSearch = useCallback(() => {
    window.dispatchEvent(new CustomEvent(FOCUS_SEARCH_EVENT));
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        const activeElement = document.activeElement;
        if (activeElement instanceof HTMLInputElement || activeElement instanceof HTMLTextAreaElement) {
          (activeElement as HTMLElement).blur();
        }
      }
      
      if (e.key === 'Tab') {
        const activeElement = document.activeElement;
        const isInputFocused = activeElement instanceof HTMLInputElement || 
                              activeElement instanceof HTMLTextAreaElement ||
                              activeElement?.getAttribute('contenteditable') === 'true';
        if (!isInputFocused) {
          e.preventDefault();
          setSidebarOpen(prev => !prev);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const shortcuts: KeyboardShortcut[] = useMemo(() => [
    { key: '/', action: handleFocusSearch, description: '聚焦搜索框' },
  ], [handleFocusSearch]);

  useKeyboardShortcuts(shortcuts);

  return (
    <AppProvider posts={posts}>
      <RedirectHandler>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-800">
          <Navbar toggleSidebar={toggleSidebar} />
          <Sidebar hierarchy={hierarchy} isOpen={sidebarOpen} />
          <main
            className={cn(
              "pt-16 min-h-screen transition-all duration-300",
              sidebarOpen ? "ml-64" : "ml-0"
            )}
          >
            <div className="p-6 lg:p-8">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/article/:path" element={<ArticlePage />} />
                <Route path="/search" element={<SearchResultsPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
          </main>
        </div>
      </RedirectHandler>
    </AppProvider>
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter basename="/blog">
      <AppContent />
    </BrowserRouter>
  );
};

export default App;
