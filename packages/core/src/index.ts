export * from './types';
export * from './errors';
export * from './utils';
export * from './resume-parser';
export * from './groq';
export * from './portfolio-accent';
export * from './license';
export * from './export';

export interface DesktopProject {
  id: string;
  title: string;
  theme: 'classic' | 'neubrutalism';
  accentColor: string | null;
  content: import('./types').PortfolioContent;
  createdAt: string;
  updatedAt: string;
}

export interface EditorPageState {
  id: string;
  title: string;
  theme: string;
  accentColor: string | null;
  content: import('./types').PortfolioContent | null;
}
