import { useEffect } from 'react';

import { useThemeStore } from '../features/theme/stores/themeStore';

export function useThemeEffect(): void {
  const theme = useThemeStore((s) => s.theme);

  useEffect(() => {
    const root = document.documentElement;

    if (theme === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');

      const apply = (e: MediaQueryListEvent | MediaQueryList) => {
        root.classList.toggle('dark', e.matches);
      };

      apply(mq);
      mq.addEventListener('change', apply);
      return () => mq.removeEventListener('change', apply);
    }

    root.classList.toggle('dark', theme === 'dark');
  }, [theme]);
}
