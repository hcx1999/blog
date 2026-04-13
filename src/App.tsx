import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { HomePage } from './pages/HomePage';
import { ArticlePage } from './pages/ArticlePage';
import { SearchResultsPage } from './pages/SearchResultsPage';
import { ErrorBoundary } from './components/ErrorBoundary';
import { loadVaultPosts, getVaultHierarchy } from './utils/vault';
import { cn } from './utils/cn';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import type { KeyboardShortcut } from './hooks/useKeyboardShortcuts';
import { siteConfig } from './config/site';

export const FOCUS_SEARCH_EVENT = 'focusSearch';

const RedirectHandler: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const [isRedirecting, setIsRedirecting] = useState(() => {
    const redirectPath = sessionStorage.getItem('redirectPath');
    return !!redirectPath;
  });

  useEffect(() => {
    const redirectPath = sessionStorage.getItem('redirectPath');
    if (redirectPath) {
      sessionStorage.removeItem('redirectPath');
      const pathWithoutBase = redirectPath.replace(new RegExp(`^${siteConfig.basename}`), '');
      navigate(pathWithoutBase || '/', { replace: true });
      // 使用setTimeout来避免在effect中直接调用setState
      setTimeout(() => setIsRedirecting(false), 0);
    }
  }, [navigate]);

  if (isRedirecting) {
    return null;
  }

  return <>{children}</>;
};

const AppContent: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    const saved = localStorage.getItem('sidebar-open');
    return saved ? JSON.parse(saved) : false;
  });
  const [isMobile, setIsMobile] = useState(() => {
    return typeof window !== 'undefined' && window.innerWidth < 768;
  });

  useEffect(() => {
    localStorage.setItem('sidebar-open', JSON.stringify(sidebarOpen));
  }, [sidebarOpen]);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const newIsMobile = width < 768;
      console.log('Screen width:', width, 'isMobile:', newIsMobile);
      setIsMobile(newIsMobile);
    };

    // 初始计算
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);



  const posts = useMemo(() => loadVaultPosts(), []);
  const hierarchy = useMemo(() => getVaultHierarchy(), []);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen((prev: boolean) => !prev);
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
          setSidebarOpen((prev: boolean) => !prev);
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
    <ErrorBoundary>
      <AppProvider posts={posts}>
        <RedirectHandler>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-800">
            <Navbar toggleSidebar={toggleSidebar} />
            <Sidebar hierarchy={hierarchy} isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
            <main
              className={cn(
                "pt-16 min-h-screen transition-all duration-300",
                !isMobile && sidebarOpen ? "ml-[20%]" : "ml-0"
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
    </ErrorBoundary>
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter basename={siteConfig.basename}>
      <AppContent />
    </BrowserRouter>
  );
};

export default App;
