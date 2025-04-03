'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTweetStore } from '@/store/tweetStore';
import ThemeToggler from './ThemeToggler';

const SideNav = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, logout, darkMode } = useTweetStore();
  const [mounted, setMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // Éviter les erreurs d'hydratation
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fermer le menu quand on change de page
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  if (!mounted) return null;

  // Navigation items disponibles pour tous
  const publicNavItems = [
    { path: '/', icon: '🏠', label: 'Accueil' },
    { path: '/explore', icon: '🔍', label: 'Explorer' },
  ];

  // Navigation items disponibles uniquement pour les utilisateurs connectés
  const authNavItems = [
    ...(currentUser ? [{ path: `/profile/${currentUser.username}`, icon: '👤', label: 'Profil' }] : []),
  ];

  // Navigation items pour les utilisateurs non connectés
  const guestNavItems = [
    { path: '/signup', icon: '📝', label: 'S\'inscrire' },
    { path: '/login', icon: '🔑', label: 'Se connecter' },
  ];

  const navItems = [...publicNavItems, ...authNavItems, ...(!currentUser ? guestNavItems : [])];

  return (
    <>
      {/* Bouton menu burger pour mobile */}
      <button 
        className="hamburger-menu"
        onClick={toggleMenu}
        aria-label="Menu principal"
      >
        {menuOpen ? '✕' : '☰'}
      </button>
      
      {/* Sidebar */}
      <div className={`sidebar w-64 h-screen sticky top-0 p-4 border-r border-gray-200 bg-white dark:bg-gray-800 dark:border-gray-700 ${menuOpen ? 'open' : ''}`}>
        <div className="flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-blue-500 flex items-center">
            <span className="mr-2">🐦</span>
            Solead X
          </Link>
          <ThemeToggler />
        </div>
        
        <nav className="mt-8">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.path}>
                <Link 
                  href={item.path} 
                  className={`flex items-center p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-700 ${
                    pathname === item.path || (item.path.includes('/profile/') && pathname?.includes('/profile/')) 
                      ? 'bg-blue-50 text-blue-500 dark:bg-gray-700 dark:text-blue-400' 
                      : 'text-gray-700 dark:text-white'
                  }`}
                >
                  <span className="mr-3">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        
        {currentUser && (
          <div className="mt-8">
            <Link 
              href="/compose" 
              className="w-full bg-blue-500 text-white rounded-full py-2 font-medium hover:bg-blue-600 transition flex items-center justify-center"
            >
              Tweeter
            </Link>
          </div>
        )}

        {currentUser && (
          <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700 mt-6">
            <div className="flex items-center p-2">
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-500 dark:text-blue-300 font-bold overflow-hidden">
                {currentUser.image ? (
                  <img src={currentUser.image} alt={currentUser.name} className="w-full h-full object-cover" />
                ) : (
                  '👤'
                )}
              </div>
              <div className="ml-3 flex-grow">
                <div className="font-medium text-gray-800 dark:text-white">{currentUser.name}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">@{currentUser.username}</div>
              </div>
              <button 
                onClick={handleLogout}
                className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                title="Déconnexion"
              >
                🚪
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default SideNav; 