import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Folder, FolderOpen, FileText, ChevronRight, ChevronDown } from 'lucide-react';
import { cn } from '../utils/cn';
import { motion, AnimatePresence } from 'framer-motion';
import type { VaultCategory } from '../utils/vault';

interface SidebarProps {
  hierarchy: VaultCategory[];
  isOpen: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ hierarchy, isOpen }) => {
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(() => {
    return typeof window !== 'undefined' && window.innerWidth < 768;
  });

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);


  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(() => {
    const saved = localStorage.getItem('sidebar-expanded-categories');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });

  useEffect(() => {
    localStorage.setItem('sidebar-expanded-categories', JSON.stringify(Array.from(expandedCategories)));
  }, [expandedCategories]);

  const toggleCategory = (categoryName: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(categoryName)) {
        next.delete(categoryName);
      } else {
        next.add(categoryName);
      }
      return next;
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.aside
          initial={{ x: -300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -300, opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className={cn(
            "fixed left-0 top-16 bottom-0 bg-white dark:bg-gray-900",
            "overflow-y-auto z-40",
            isMobile ? "w-full border-r border-gray-200 dark:border-gray-800" : "w-[20%] max-w-80"
          )}
        >
      <div className="p-4">
        <div className="space-y-1">
          {hierarchy.map((category) => (
            <div key={category.name}>
              <button
                onClick={() => toggleCategory(category.name)}
                className={cn(
                  "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium",
                  "hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors",
                  "text-gray-700 dark:text-gray-200"
                )}
              >
                {expandedCategories.has(category.name) ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
                {expandedCategories.has(category.name) ? (
                  <FolderOpen className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                ) : (
                  <Folder className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                )}
                <span>{category.name}</span>
                <span className="ml-auto text-xs text-gray-400 dark:text-gray-500">
                  {category.files.length}
                </span>
              </button>
              
              <AnimatePresence>
                {expandedCategories.has(category.name) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden ml-4"
                  >
                    {category.files.map((file) => {
                      const articlePath = `/article/${encodeURIComponent(file.path)}`;
                      const isActive = decodeURIComponent(location.pathname) === `/article/${file.path}`;
                      return (
                        <Link
                          key={file.path}
                          to={articlePath}
                          className={cn(
                            "flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all",
                            "hover:bg-gray-100 dark:hover:bg-gray-800",
                            isActive
                              ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-200 border-l-2 border-gray-500"
                              : "text-gray-600 dark:text-gray-400"
                          )}
                        >
                          <FileText className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate">{file.name}</span>
                        </Link>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
};
