'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTweetStore } from '@/store/tweetStore';
import Link from 'next/link';
import { useDarkMode } from '@/components/DarkModeProvider';

export default function HomePage() {
  const router = useRouter();
  const { currentUser, tweets, fetchTweets, addTweet, likeTweet, retweetTweet, deleteTweet } = useTweetStore();
  const { darkMode, toggleDarkMode } = useDarkMode();
  const [mounted, setMounted] = useState(false);
  const [showOnlyFollowing, setShowOnlyFollowing] = useState(false);
  const [tweetContent, setTweetContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Éviter les erreurs d'hydratation
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Charger les tweets au montage
  useEffect(() => {
    if (mounted) {
      fetchTweets();
    }
  }, [mounted, fetchTweets]);

  const handleTweet = async () => {
    if (!tweetContent.trim() || isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      await addTweet(tweetContent);
      setTweetContent('');
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.ctrlKey && e.key === 'Enter') {
      handleTweet();
    }
  };

  // Formater la date du tweet
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

  // Filtrer les tweets en fonction du mode d'affichage
  const filteredTweets = showOnlyFollowing && currentUser 
    ? tweets.filter(tweet => 
        // Inclure les tweets des utilisateurs suivis
        currentUser.following?.includes(tweet.userId) ||
        // Inclure les tweets de l'utilisateur actuel
        tweet.userId === currentUser.id ||
        // Inclure les retweets des utilisateurs suivis
        (tweet.isRetweet && currentUser.following?.includes(tweet.user.username))
      )
    : tweets;

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-blue-500">Bienvenue sur Solead X</h1>
        <button 
          onClick={toggleDarkMode}
          className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
          title={darkMode ? "Activer le mode clair" : "Activer le mode sombre"}
        >
          {darkMode ? '☀️' : '🌙'}
        </button>
      </div>
      
      {!currentUser ? (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4 dark:text-white">Découvrez ce qui se passe dans le monde</h2>
          <p className="mb-4 text-gray-700 dark:text-gray-300">Rejoignez Solead X aujourd'hui et partagez vos pensées avec le monde.</p>
          <div className="flex flex-col sm:flex-row gap-3 sm:space-x-4">
            <Link
              href="/signup"
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-full text-center"
            >
              S'inscrire
            </Link>
            <Link
              href="/login"
              className="bg-white hover:bg-gray-100 text-blue-500 border border-blue-500 px-4 py-2 rounded-full text-center dark:bg-gray-700 dark:hover:bg-gray-600 dark:border-blue-400"
            >
              Se connecter
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4 mb-6">
          <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-lg shadow-md">
            <div className="flex">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-500 dark:text-blue-300 flex-shrink-0">
                {currentUser.image ? (
                  <img src={currentUser.image} alt={currentUser.name} className="w-full h-full object-cover" />
                ) : (
                  '👤'
                )}
              </div>
              <div className="ml-3 flex-grow">
                <textarea
                  placeholder={`Quoi de neuf, ${currentUser.name.split(' ')[0]} ?`}
                  value={tweetContent}
                  onChange={(e) => setTweetContent(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                  rows={3}
                />
                <div className="flex justify-between items-center mt-2">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {tweetContent.length > 0 ? `${tweetContent.length} caractères` : 'Ctrl+Enter pour publier'}
                  </div>
                  <button
                    onClick={handleTweet}
                    disabled={!tweetContent.trim() || isSubmitting}
                    className="bg-blue-500 text-white px-4 py-2 rounded-full font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Tweeter
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {currentUser.following && currentUser.following.length > 0 && (
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
              <div className="flex justify-center space-x-2">
                <button
                  onClick={() => setShowOnlyFollowing(false)}
                  className={`px-4 py-2 rounded-full transition-colors ${
                    !showOnlyFollowing 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  Pour vous
                </button>
                <button
                  onClick={() => setShowOnlyFollowing(true)}
                  className={`px-4 py-2 rounded-full transition-colors ${
                    showOnlyFollowing 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  Abonnements
                </button>
              </div>
            </div>
          )}
        </div>
      )}
      
      <div className="space-y-4">
        {filteredTweets.length > 0 ? (
          filteredTweets.map((tweet) => {
            const isLiked = tweet.likedBy?.includes(currentUser?.id || '');
            const isRetweeted = tweet.retweetedBy?.includes(currentUser?.id || '');
            const canDelete = currentUser?.id === tweet.userId;
            
            return (
              <div key={tweet.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
                {tweet.isRetweet && (
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-2 flex items-center">
                    <span className="mr-2">🔄</span>
                    <span>{currentUser?.id === tweet.userId ? 'Vous avez retweeté' : `${tweet.user.name} a retweeté`}</span>
                  </div>
                )}
                <div className="flex gap-3">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-500 dark:text-blue-300">
                      {tweet.user.image ? (
                        <img src={tweet.user.image} alt={`Photo de ${tweet.user.name}`} className="w-full h-full object-cover" />
                      ) : (
                        '👤'
                      )}
                    </div>
                  </div>
                  <div className="flex-grow">
                    <div className="flex items-center justify-between">
                      <div>
                        <Link href={`/profile/${tweet.user.username}`} className="font-bold hover:underline text-gray-800 dark:text-white">{tweet.user.name}</Link>
                        <span className="text-gray-500 dark:text-gray-400 ml-2">@{tweet.user.username}</span>
                        <span className="text-gray-400 dark:text-gray-500 mx-1">·</span>
                        <span className="text-gray-500 dark:text-gray-400 text-sm">{formatDate(tweet.createdAt)}</span>
                      </div>
                      {canDelete && (
                        <button 
                          onClick={() => deleteTweet(tweet.id)}
                          className="text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400"
                          title="Supprimer ce tweet"
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                    <div className="mt-1 whitespace-pre-line text-gray-800 dark:text-white">{tweet.content}</div>
                    <div className="mt-3 flex justify-between text-gray-500 dark:text-gray-400">
                      <button className="tweet-action hover:text-blue-500 dark:hover:text-blue-400">
                        <span>💬</span>
                        <span>{tweet.comments}</span>
                      </button>
                      <button 
                        className={`tweet-action ${isRetweeted ? 'retweeted text-green-500 dark:text-green-400' : ''} hover:text-green-500 dark:hover:text-green-400`}
                        onClick={() => retweetTweet(tweet.id)}
                      >
                        <span>🔄</span>
                        <span>{tweet.retweetedBy?.length || 0}</span>
                      </button>
                      <button 
                        className={`tweet-action ${isLiked ? 'liked text-red-500 dark:text-red-400' : ''} hover:text-red-500 dark:hover:text-red-400`}
                        onClick={() => likeTweet(tweet.id)}
                      >
                        <span>{isLiked ? '❤️' : '🤍'}</span>
                        <span>{tweet.likes}</span>
                      </button>
                      <button className="tweet-action hover:text-blue-500 dark:hover:text-blue-400">
                        <span>📤</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md text-center">
            <p className="text-gray-500 dark:text-gray-400 mb-3">
              {showOnlyFollowing 
                ? "Aucun tweet des personnes que vous suivez. Suivez plus de personnes pour voir leurs tweets!"
                : "Aucun tweet pour le moment. Soyez le premier à tweeter!"}
            </p>
            {currentUser && (
              <>
                {showOnlyFollowing ? (
                  <Link
                    href="/explore"
                    className="inline-block bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-full mr-3"
                  >
                    Découvrir des personnes à suivre
                  </Link>
                ) : null}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
