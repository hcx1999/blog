import React, { useState, useEffect, useRef } from 'react';
import { List, ChevronDown } from 'lucide-react';
import type { TOCItem } from '../types';
import { cn } from '../utils/cn';

interface TableOfContentsProps {
  items: TOCItem[];
  contentRef: React.RefObject<HTMLDivElement | null>;
  isMobile?: boolean;
  onlyFloating?: boolean;
}

export const TableOfContents: React.FC<TableOfContentsProps> = ({ items, contentRef, isMobile = false, onlyFloating = false }) => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isMobileOpen, setIsMobileOpen] = useState(() => {
    const saved = localStorage.getItem('toc-mobile-open');
    return saved ? JSON.parse(saved) : false;
  });
  const [isFloatingTocOpen, setIsFloatingTocOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('toc-mobile-open', JSON.stringify(isMobileOpen));
  }, [isMobileOpen]);

  useEffect(() => {
    if (!isMobile) {
      setIsFloatingTocOpen(false);
    }
  }, [isMobile]);
  const [tocItems, setTocItems] = useState<TOCItem[]>([]);
  const tocNavRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!contentRef.current) return;

    const extractHeadings = () => {
      const headingSelector = 'h1, h2, h3, h4, h5, h6';
      const headings = contentRef.current!.querySelectorAll(headingSelector);
      const extractedItems: TOCItem[] = [];
      
      headings.forEach((heading) => {
        const h = heading as HTMLElement;
        if (h.id) {
          const level = parseInt(h.tagName.charAt(1), 10);
          extractedItems.push({
            id: h.id,
            text: h.textContent || '',
            level: level
          });
        }
      });

      setTocItems(extractedItems);
      return extractedItems;
    };

    const extractedItems = extractHeadings();
    const timer = setTimeout(extractHeadings, 800);

    const handleScroll = () => {
      let visibleItems: { id: string; top: number }[] = [];
      
      for (let i = 0; i < extractedItems.length; i++) {
        const element = document.getElementById(extractedItems[i].id);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= window.innerHeight && rect.bottom >= 0) {
            visibleItems.push({
              id: extractedItems[i].id,
              top: rect.top
            });
          }
        }
      }
      
      if (visibleItems.length > 0) {
        visibleItems.sort((a, b) => a.top - b.top);
        setActiveId(visibleItems[0].id);
      }
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [contentRef, items]);



  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (!element) return;
    
    const navbarHeight = 64;
    const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
    
    window.scrollTo({
      top: elementPosition - navbarHeight,
      behavior: 'smooth'
    });
    
    setIsMobileOpen(false);
  };

  const displayItems = tocItems.length > 0 ? tocItems : items;
  console.log('TableOfContents displayItems.length:', displayItems.length);

  useEffect(() => {
    if (!activeId || !tocNavRef.current) return;

    const container = tocNavRef.current;
    const activeButton = container.querySelector(`[data-toc-id="${activeId}"]`) as HTMLElement;
    if (!activeButton) return;

    const containerHeight = container.clientHeight;
    const scrollHeight = container.scrollHeight;
    const maxScroll = scrollHeight - containerHeight;

    const containerRect = container.getBoundingClientRect();
    const buttonRect = activeButton.getBoundingClientRect();

    const buttonTopInContainer = buttonRect.top - containerRect.top + container.scrollTop;
    const buttonHeight = buttonRect.height;
    const buttonCenter = buttonTopInContainer + buttonHeight / 2;

    const targetScroll = buttonCenter - containerHeight / 2;
    const clampedScroll = Math.max(0, Math.min(maxScroll, targetScroll));

    container.scrollTo({
      top: clampedScroll,
      behavior: 'smooth'
    });
  }, [activeId]);

  const [position, setPosition] = useState<{ left: string; width: string }>({ left: '0px', width: '0px' });

  useEffect(() => {
    const updatePosition = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setPosition({
          left: `${rect.left}px`,
          width: `${rect.width}px`
        });
      }
    };
    
    updatePosition();
    const timer = setTimeout(updatePosition, 100);
    window.addEventListener('resize', updatePosition);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isMobile]);

  const desktopToc = (
    <div 
      ref={containerRef} 
      className={cn(
        "h-full",
        isMobile && "hidden"
      )}
    >
      <div
        ref={tocNavRef}
        data-toc-scroll
        className="fixed top-20 h-[calc(100vh-80px)] overflow-y-auto z-10"
        style={{ 
          left: position.left,
          width: position.width,
          scrollbarWidth: 'none', 
          msOverflowStyle: 'none' 
        }}
      >
        <style>{`
          [data-toc-scroll]::-webkit-scrollbar {
            display: none;
          }
        `}</style>
        <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
          目录
        </h3>
        <nav className="space-y-1">
          {displayItems.map((item) => (
            <button
              key={item.id}
              data-toc-id={item.id}
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
    </div>
  );

  const floatingToc = (
    <>
      {/* 悬浮球 - 只在移动设备模式显示（目录消失时） */}
      {isMobile && !isFloatingTocOpen && (
        <button
          onClick={() => setIsFloatingTocOpen(true)}
          className="fixed bottom-6 right-6 w-9 h-9 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200 rounded-full shadow-lg flex items-center justify-center z-50 border border-gray-200 dark:border-gray-700"
          style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 1000 }}
        >
          <List className="w-5 h-5" />
        </button>
      )}
      
      {/* 全屏目录 */}
      {isMobile && isFloatingTocOpen && (
        <div className="fixed inset-0 bg-white dark:bg-gray-900 z-50 p-6 overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold">目录</h3>
            <button
              onClick={() => setIsFloatingTocOpen(false)}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <ChevronDown className="w-6 h-6 rotate-90" />
            </button>
          </div>
          <nav className="space-y-2">
            {displayItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  scrollToHeading(item.id);
                  setIsFloatingTocOpen(false);
                }}
                className={cn(
                  "w-full text-left py-2 text-sm transition-colors",
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
        </div>
      )}
    </>
  );

  return (
    <>
      {!onlyFloating && displayItems.length > 0 && desktopToc}
      {onlyFloating && isMobile && displayItems.length > 0 && floatingToc}
    </>
  );
};
