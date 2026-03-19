import { useState, useRef, useEffect } from 'react';
import { SunIcon, MoonIcon, ComputerDesktopIcon } from '@heroicons/react/24/outline';
import { useThemeStore } from '../features/theme/stores/themeStore';

const THEME_OPTIONS = [
  { value: 'light',  icon: SunIcon,             label: 'Sáng' },
  { value: 'dark',   icon: MoonIcon,            label: 'Tối' },
  { value: 'system', icon: ComputerDesktopIcon, label: 'Hệ thống' },
] as const;

export function ThemeToggle() {
  const theme = useThemeStore((s) => s.theme);
  const setTheme = useThemeStore((s) => s.setTheme);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    function updateResolvedTheme() {
      if (theme === 'system') {
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setResolvedTheme(isDark ? 'dark' : 'light');
      } else {
        setResolvedTheme(theme);
      }
    }
    updateResolvedTheme();
    
    if (theme === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      const listener = () => updateResolvedTheme();
      mq.addEventListener('change', listener);
      return () => mq.removeEventListener('change', listener);
    }
  }, [theme]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const CurrentIcon = resolvedTheme === 'dark' ? MoonIcon : SunIcon;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center rounded-lg p-2 text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-surface-alt)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] cursor-pointer"
        title="Chọn giao diện"
      >
        <CurrentIcon className="size-5" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-36 origin-top-right rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-1 shadow-[var(--shadow-dropdown-theme)] z-50">
          {THEME_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const isActive = theme === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => {
                  setTheme(opt.value);
                  setIsOpen(false);
                }}
                className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                  isActive
                    ? 'bg-[var(--color-primary-light)] text-[var(--color-primary-hover)] font-medium cursor-pointer'
                    : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-alt)] cursor-pointer'
                }`}
              >
                <Icon className="size-4" />
                {opt.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
