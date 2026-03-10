import React, { useMemo, useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { HomePage } from './pages/HomePage';
import { ArticlePage } from './pages/ArticlePage';
import { SearchResultsPage } from './pages/SearchResultsPage';
import { loadVaultPosts, getVaultHierarchy } from './utils/vault';
import { cn } from './utils/cn';

const RedirectHandler: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const redirectPath = sessionStorage.getItem('redirectPath');
    if (redirectPath) {
      sessionStorage.removeItem('redirectPath');
      const pathWithoutBase = redirectPath.replace(/^\/blog/, '');
      navigate(pathWithoutBase || '/', { replace: true });
    }
  }, [navigate]);

  return null;
};

const AppContent: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const posts = useMemo(() => loadVaultPosts(), []);
  const hierarchy = useMemo(() => getVaultHierarchy(), []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <AppProvider posts={posts}>
      <RedirectHandler />
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
