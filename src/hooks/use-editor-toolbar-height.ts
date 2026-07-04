'use client';

import { useEffect } from 'react';

/** Keeps --editor-toolbar-height in sync so assistant docks sit flush under the editor toolbar. */
export function useEditorToolbarHeight(toolbarId = 'editor-toolbar') {
  useEffect(() => {
    const toolbar = document.getElementById(toolbarId);
    if (!toolbar) return;

    const sync = () => {
      const height = toolbar.getBoundingClientRect().height;
      document.documentElement.style.setProperty('--editor-toolbar-height', `${height}px`);
    };

    sync();
    const observer = new ResizeObserver(sync);
    observer.observe(toolbar);
    window.addEventListener('resize', sync);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', sync);
      document.documentElement.style.removeProperty('--editor-toolbar-height');
    };
  }, [toolbarId]);
}
