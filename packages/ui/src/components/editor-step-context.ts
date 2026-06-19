import type { Dispatch, SetStateAction } from 'react';

import type { EditorPageState, PortfolioContent } from '@foliomint/core';

export type EditorStepContext = {
  state: EditorPageState;
  setState: Dispatch<SetStateAction<EditorPageState | null>>;
  updateContent: (updater: (current: PortfolioContent) => PortfolioContent) => void;
  handleSave: (updates?: Partial<EditorPageState>) => void | Promise<void>;
  saving: boolean;
  tier: 'free' | 'pro';
  monoInput: (extra?: string) => string;
  monoTextarea: (extra?: string) => string;
  editorRepeatItemClass: string;
};
