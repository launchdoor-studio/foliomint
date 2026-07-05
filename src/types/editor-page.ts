import type { PortfolioContent } from '@/types';
import type { PortfolioThemeColors } from '@/lib/portfolio-theme-colors';

/** Client editor page state (portfolio row + parsed content). */
export interface EditorPageState {
  id: string;
  slug: string;
  /** Optional clean URL segment; live site is `/u/{publicHandle}` when set. */
  publicHandle: string | null;
  title: string;
  theme: string;
  accentColor: string | null;
  themeColors: PortfolioThemeColors;
  isPublished: boolean;
  content: PortfolioContent | null;
}
