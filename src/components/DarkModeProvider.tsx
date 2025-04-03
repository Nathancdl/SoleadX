'use client';

import { createContext, useContext, useEffect } from 'react';
import { useTweetStore } from '@/store/tweetStore';

const DarkModeContext = createContext({
  darkMode: false,
  toggleDarkMode: () => {},
});

export const useDarkMode = () => useContext(DarkModeContext);

export default function DarkModeProvider({ children }: { children: React.ReactNode }) {
  const { darkMode, toggleDarkMode } = useTweetStore();

  useEffect(() => {
    // Appliquer la classe 'dark' à l'élément html quand le mode sombre est activé
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <DarkModeContext.Provider value={{ darkMode, toggleDarkMode }}>
      {children}
    </DarkModeContext.Provider>
  );
} 