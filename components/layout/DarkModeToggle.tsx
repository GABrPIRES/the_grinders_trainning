'use client';

import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

export default function DarkModeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
  }, []);

  const toggle = () => {
    const next = !isDark;
    setIsDark(next);
    if (next) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('tg-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('tg-theme', 'light');
    }
  };

  return (
    <button
      onClick={toggle}
      className="p-2 text-content-tertiary hover:bg-surface-subtle rounded-full transition-colors"
      aria-label="Alternar tema"
    >
      {isDark ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
}
