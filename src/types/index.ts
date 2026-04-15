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

export interface NotebookOutputData {
  'image/png'?: string;
  'image/jpeg'?: string;
  'image/svg+xml'?: string | string[];
  'text/html'?: string | string[];
  'text/plain'?: string;
}

export interface NotebookOutput {
  output_type: 'stream' | 'execute_result' | 'display_data' | 'error';
  text?: string;
  data?: NotebookOutputData;
  ename?: string;
  evalue?: string;
}

export interface NotebookCell {
  cell_type: 'markdown' | 'code' | 'raw';
  source: string | string[];
  outputs?: NotebookOutput[];
}

export interface NotebookMetadata {
  kernelspec?: {
    display_name: string;
    language: string;
    name: string;
  };
  language_info?: {
    name: string;
    version: string;
  };
  [key: string]: unknown;
}

export interface Notebook {
  cells: NotebookCell[];
  metadata: NotebookMetadata;
  nbformat: number;
  nbformat_minor: number;
}
