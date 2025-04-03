'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTweetStore } from '@/store/tweetStore';

export default function ComposePage() {
  const router = useRouter();
  const { currentUser, addTweet } = useTweetStore();
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Éviter les erreurs d'hydratation
  useEffect(() => {
    setMounted(true);
  }, []);

  // Rediriger si l'utilisateur n'est pas connecté
  useEffect(() => {
    if (mounted && !currentUser) {
      router.push('/login');
    }
  }, [currentUser, mounted, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim() || isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      addTweet(content);
      router.push('/');
    } catch (error) {
      console.error('Error posting tweet:', error);
      alert('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!mounted || !currentUser) return null;

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="mb-4 flex items-center">
          <Link href="/" className="mr-4 text-blue-500 hover:text-blue-600">
            ← Retour
          </Link>
          <h1 className="text-xl font-bold text-gray-800 dark:text-white">Créer un tweet</h1>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="flex items-start mb-4">
            <div className="flex-shrink-0 mr-3">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-500 dark:text-blue-300 font-bold">
                {currentUser.image ? (
                  <img src={currentUser.image} alt={currentUser.name} className="w-full h-full object-cover" />
                ) : (
                  '👤'
                )}
              </div>
            </div>
            
            <div className="flex-grow">
              <textarea
                placeholder="Quoi de neuf ?"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={6}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-gray-800 resize-none"
                required
              />
            </div>
          </div>
          
          <div className="flex justify-between items-center border-t border-gray-200 dark:border-gray-700 pt-4">
            <div className="text-gray-500 dark:text-gray-400">
              {content.length} caractères
            </div>
            <button
              type="submit"
              disabled={!content.trim() || isSubmitting}
              className="bg-blue-500 text-white px-6 py-2 rounded-full font-medium hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Publication...' : 'Tweeter'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 