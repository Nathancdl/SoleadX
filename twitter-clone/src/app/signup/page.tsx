'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTweetStore } from '@/store/tweetStore';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  const router = useRouter();
  const { register, currentUser } = useTweetStore();

  // Éviter les erreurs d'hydratation
  useEffect(() => {
    setMounted(true);
  }, []);

  // Rediriger si déjà connecté
  useEffect(() => {
    if (mounted && currentUser) {
      router.push('/');
    }
  }, [currentUser, mounted, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('🔄 Soumission du formulaire d\'inscription...');
      
      if (!name || !username || !email || !password) {
        console.error('⛔ Formulaire incomplet');
        setError('Tous les champs sont obligatoires');
        setLoading(false);
        return;
      }
      
      const result = await register({
        name,
        username,
        email,
        password,
      });
      
      console.log('📦 Résultat de l\'inscription:', result);
      
      if (result.success) {
        // Afficher message de succès avant redirection
        alert('Inscription réussie! Vous pouvez maintenant vous connecter.');
        router.push('/login');
      } else {
        console.error('⛔ Échec de l\'inscription:', result.message);
        setError(result.message);
      }
    } catch (err) {
      console.error('❌ Exception dans le formulaire:', err);
      setError('Une erreur est survenue lors de l\'inscription');
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Inscription</h1>
          
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-md text-red-600 dark:text-red-400 text-sm mb-4">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="name" className="block text-gray-700 dark:text-gray-300 mb-2">
                Nom complet
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                required
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="username" className="block text-gray-700 dark:text-gray-300 mb-2">
                Nom d'utilisateur
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                required
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="email" className="block text-gray-700 dark:text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                required
              />
            </div>
            
            <div className="mb-6">
              <label htmlFor="password" className="block text-gray-700 dark:text-gray-300 mb-2">
                Mot de passe
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                required
              />
            </div>
            
            <div className="flex flex-col sm:flex-row justify-between items-center">
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto bg-blue-500 text-white px-6 py-2 rounded-full font-medium hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed mb-4 sm:mb-0"
              >
                {loading ? 'Inscription...' : 'S\'inscrire'}
              </button>
              
              <Link href="/login" className="text-blue-500 hover:text-blue-600 transition">
                Déjà un compte ? Se connecter
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 