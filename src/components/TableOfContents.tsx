import React, { useState, useEffect } from 'react';
import { List, ChevronDown } from 'lucide-react';
import type { TOCItem } from '../types';
import { cn } from '../utils/cn';

interface TableOfContentsProps {
  items: TOCItem[];
  contentRef: React.RefObject<HTMLDivElement | null>;
}

export const TableOfContents: React.FC<TableOfContentsProps> = ({ items, contentRef }) => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    if (!contentRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries.filter(entry => entry.isIntersecting);
        if (visibleEntries.length > 0) {
          setActiveId(visibleEntries[0].target.id);
        }
      },
      {
        rootMargin: '-20% 0px -70% 0px',
        threshold: 0
      }
    );

    // Function to observe all heading elements
    const observeHeadings = () => {
      items.forEach(item => {
        const element = document.getElementById(item.id);
        if (element) observer.observe(element);
      });
    };

    // Observe immediately
    observeHeadings();

    // Also observe after a short delay to handle async content (like ipynb files)
    const timer = setTimeout(observeHeadings, 500);

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [items, contentRef]);

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const navbarHeight = 64;
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      window.scrollTo({
        top: elementPosition - navbarHeight,
        behavior: 'smooth'
      });
      setIsMobileOpen(false);
    }
  };

  if (items.length === 0) return null;

  const desktopToc = (
    <div className="hidden lg:block sticky top-20 h-[calc(100vh-5rem)] overflow-y-auto">
      <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
        目录
      </h3>
      <nav className="space-y-1">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => scrollToHeading(item.id)}
            className={cn(
              "w-full text-left py-1 text-sm transition-colors",
              activeId === item.id
                ? "text-gray-900 dark:text-gray-200 font-medium"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
            )}
            style={{ paddingLeft: `${(item.level - 1) * 1}rem` }}
          >
            {item.text}
          </button>
        ))}
      </nav>
    </div>
  );

  const mobileToc = (
    <div className="lg:hidden mb-6">
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
      >
        <span className="font-medium flex items-center gap-2">
          <List className="w-4 h-4" />
          目录
        </span>
        <ChevronDown
          className={cn("w-4 h-4 transition-transform", isMobileOpen && "rotate-180")}
        />
      </button>
      {isMobileOpen && (
        <nav className="mt-2 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 space-y-1">
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => scrollToHeading(item.id)}
              className={cn(
              "w-full text-left py-1 text-sm transition-colors",
              activeId === item.id
                ? "text-gray-900 dark:text-gray-200 font-medium"
                : "text-gray-600 dark:text-gray-400"
            )}
              style={{ paddingLeft: `${(item.level - 1) * 1}rem` }}
            >
              {item.text}
            </button>
          ))}
        </nav>
      )}
    </div>
  );

  return (
    <>
      {mobileToc}
      {desktopToc}
    </>
  );
};
