import React, { useMemo, useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { HomePage } from './pages/HomePage';
import { ArticlePage } from './pages/ArticlePage';
import { SearchResultsPage } from './pages/SearchResultsPage';
import { loadVaultPosts, getVaultHierarchy } from './utils/vault';
import { cn } from './utils/cn';

const QueryParamHandler: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const p = searchParams.get('p');
    if (p) {
      // Remove the p parameter from the URL and navigate to the actual path
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete('p');
      const searchString = newSearchParams.toString();
      const newUrl = p + (searchString ? `?${searchString}` : '');
      navigate(newUrl, { replace: true });
    }
  }, [searchParams, navigate]);

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
      <QueryParamHandler />
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
