export type FileType = 'markdown' | 'notebook';

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  type: FileType;
  category: string;
  tags: string[];
  createdAt: string;
  excerpt: string;
}

export interface TOCItem {
  id: string;
  text: string;
  level: number;
}

export interface Theme {
  mode: 'light' | 'dark';
}
