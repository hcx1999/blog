import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, FileText, ArrowRight } from 'lucide-react';
import { useAppContext } from '../context/useAppContext';
import { escapeRegExp, filterPosts } from '../utils/search';

const HighlightText: React.FC<{ text: string; query: string }> = ({ text, query }) => {
  if (!query.trim()) return <>{text}</>;

  const escapedQuery = escapeRegExp(query);
  const parts = text.split(new RegExp(`(${escapedQuery})`, 'gi'));
  
  return (
    <>
      {parts.map((part, i) => 
        part.toLowerCase() === query.toLowerCase() ? (
          <span key={i} className="bg-yellow-200 dark:bg-yellow-500/30 text-yellow-800 dark:text-yellow-200 px-0.5 rounded">
            {part}
          </span>
        ) : (
          part
        )
      )}
    </>
  );
};

const getExcerpt = (content: string, query: string): string => {
  const lowerContent = content.toLowerCase();
  const lowerQuery = query.toLowerCase();
  const index = lowerContent.indexOf(lowerQuery);
  
  if (index === -1) {
    return content.substring(0, 120) + '...';
  }
  
  const start = Math.max(0, index - 40);
  const end = Math.min(content.length, index + query.length + 80);
  let excerpt = content.substring(start, end);
  
  if (start > 0) excerpt = '...' + excerpt;
  if (end < content.length) excerpt = excerpt + '...';
  
  return excerpt;
};

export const SearchResultsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const { posts } = useAppContext();

  const filteredPosts = filterPosts(posts, query);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
            <Search className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">搜索结果</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              找到 <span className="font-semibold text-primary-600 dark:text-primary-400">{filteredPosts.length}</span> 篇与 "<span className="font-semibold">{query}</span>" 相关的文章
            </p>
          </div>
        </div>
      </div>

      {filteredPosts.length > 0 ? (
        <div className="space-y-4">
          {filteredPosts.map((post) => (
            <Link
              key={post.id}
              to={`/article/${encodeURIComponent(post.id)}`}
              className="block p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-primary-500 hover:shadow-lg transition-all group"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-4 h-4 text-primary-500" />
                    <span className="text-xs font-medium text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30 px-2 py-0.5 rounded-full">
                      {post.category}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-semibold mb-2 group-hover:text-primary-500 transition-colors">
                    <HighlightText text={post.title} query={query} />
                  </h3>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                    <HighlightText text={getExcerpt(post.content, query)} query={query} />
                  </p>
                </div>
                
                <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-primary-500 group-hover:translate-x-1 transition-all flex-shrink-0 ml-4" />
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-10 h-10 text-gray-300 dark:text-gray-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400 mb-2">
            没有找到相关文章
          </h3>
          <p className="text-sm text-gray-400 dark:text-gray-500">
            尝试使用不同的关键词搜索
          </p>
        </div>
      )}
    </div>
  );
};
