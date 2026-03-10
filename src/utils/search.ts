export const escapeRegExp = (str: string): string => {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

export const filterPosts = (
  posts: import('../types').BlogPost[],
  query: string
): import('../types').BlogPost[] => {
  if (!query.trim()) return posts;
  
  const lowerQuery = query.toLowerCase();
  
  return posts.filter(post =>
    post.title.toLowerCase().includes(lowerQuery) ||
    post.content.toLowerCase().includes(lowerQuery) ||
    post.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
};
