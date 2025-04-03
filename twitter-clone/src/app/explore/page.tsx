'use client';

import { useEffect, useState } from 'react';
import { useTweetStore } from '@/store/tweetStore';
import Link from 'next/link';

export default function ExplorePage() {
  const { tweets } = useTweetStore();
  const [mounted, setMounted] = useState(false);

  // Éviter les erreurs d'hydratation
  useEffect(() => {
    setMounted(true);
  }, []);

  // Formatter la date du tweet
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!mounted) return null;

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Explorer</h1>
        
        <div className="space-y-4">
          {tweets.length === 0 ? (
            <div className="text-center py-10 text-gray-500 dark:text-gray-400">
              Aucun tweet pour le moment.
            </div>
          ) : (
            tweets.map((tweet) => (
              <div key={tweet.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex items-start">
                  <div className="flex-shrink-0 mr-3">
                    <Link href={`/profile/${tweet.user.username}`}>
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-500 dark:text-blue-300">
                        {tweet.user.image ? (
                          <img src={tweet.user.image} alt={tweet.user.name} className="w-full h-full object-cover" />
                        ) : (
                          '👤'
                        )}
                      </div>
                    </Link>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center mb-1">
                      <Link href={`/profile/${tweet.user.username}`} className="font-bold text-gray-800 dark:text-white hover:underline mr-2">
                        {tweet.user.name}
                      </Link>
                      <Link href={`/profile/${tweet.user.username}`} className="text-gray-500 dark:text-gray-400 hover:underline">
                        @{tweet.user.username}
                      </Link>
                      <span className="mx-1 text-gray-400 dark:text-gray-500">·</span>
                      <span className="text-gray-500 dark:text-gray-400 text-sm">
                        {formatDate(tweet.createdAt)}
                      </span>
                    </div>
                    
                    <div className="text-gray-800 dark:text-white mb-2">
                      {tweet.content}
                    </div>
                    
                    <div className="flex justify-between text-gray-500 dark:text-gray-400 mt-3">
                      <button className="flex items-center hover:text-blue-500 transition">
                        <span className="mr-1">💬</span>
                        <span>{tweet.comments}</span>
                      </button>
                      <button className={`flex items-center hover:text-green-500 transition ${tweet.retweetedBy?.includes(useTweetStore.getState().currentUser?.id || '') ? 'text-green-500' : ''}`}>
                        <span className="mr-1">🔄</span>
                        <span>{tweet.retweetedBy?.length || 0}</span>
                      </button>
                      <button className={`flex items-center hover:text-red-500 transition ${tweet.likedBy?.includes(useTweetStore.getState().currentUser?.id || '') ? 'text-red-500' : ''}`}>
                        <span className="mr-1">❤️</span>
                        <span>{tweet.likes}</span>
                      </button>
                      <button className="flex items-center hover:text-blue-500 transition">
                        <span>📤</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
} 