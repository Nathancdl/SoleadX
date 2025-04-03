'use client';

import { useDarkMode } from './DarkModeProvider';

export default function ThemeToggler() {
  const { darkMode, toggleDarkMode } = useDarkMode();

  return (
    <button
      onClick={toggleDarkMode}
      className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
      title={darkMode ? "Activer le mode clair" : "Activer le mode sombre"}
      aria-label={darkMode ? "Activer le mode clair" : "Activer le mode sombre"}
    >
      {darkMode ? '☀️' : '🌙'}
    </button>
  );
} 