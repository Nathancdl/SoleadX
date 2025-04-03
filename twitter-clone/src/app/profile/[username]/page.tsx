'use client';

import { useEffect, useState } from 'react';
import { useTweetStore } from '@/store/tweetStore';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

export default function ProfilePage() {
  const router = useRouter();
  const { username } = useParams();
  const { tweets, currentUser, likeTweet, retweetTweet, deleteTweet } = useTweetStore();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('tweets'); // 'tweets' ou 'likes'

  // Éviter les erreurs d'hydratation
  useEffect(() => {
    setMounted(true);
  }, []);

  // Rediriger si l'utilisateur accède à un profil sans être connecté
  useEffect(() => {
    if (mounted && !currentUser) {
      router.push('/login');
    }
  }, [mounted, currentUser, router]);

  if (!mounted || !currentUser) return null;

  // Trouver l'utilisateur et ses tweets
  const profileUser = currentUser?.username === username 
    ? currentUser 
    : tweets.find(tweet => tweet.user.username === username)?.user;

  // Si nous n'avons pas trouvé l'utilisateur dans les tweets, chercher dans le store
  const allUserTweets = tweets.filter(tweet => tweet.user.username === username);

  // Filtrer les tweets selon l'onglet sélectionné
  const displayedTweets = activeTab === 'tweets'
    ? allUserTweets // Tous les tweets de l'utilisateur (incluant les retweets)
    : tweets.filter(tweet => 
        tweet.likedBy?.includes(currentUser?.id || '') && 
        currentUser?.username === username
      );

  // Compteurs pour les statistiques
  const tweetCount = allUserTweets.length;
  const likeCount = currentUser?.username === username 
    ? tweets.filter(tweet => tweet.likedBy?.includes(currentUser?.id || '')).length
    : 0;

  const isCurrentUserProfile = currentUser?.username === username;

  // Formater la date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const renderTweet = (tweet: any) => {
    const isLiked = tweet.likedBy?.includes(currentUser?.id || '');
    const isRetweeted = tweet.retweetedBy?.includes(currentUser?.id || '');
    const canDelete = currentUser?.id === tweet.userId;
    
    return (
      <div key={tweet.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md mb-4">
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
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      {profileUser ? (
        <>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-500 dark:text-blue-300 text-4xl">
                {profileUser.image ? (
                  <img src={profileUser.image} alt={`Photo de ${profileUser.name}`} className="w-full h-full object-cover" />
                ) : (
                  '👤'
                )}
              </div>
              <div className="ml-6">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">{profileUser.name}</h1>
                <p className="text-gray-500 dark:text-gray-400">@{profileUser.username}</p>
                <p className="mt-2 text-gray-700 dark:text-gray-300">
                  {isCurrentUserProfile ? 'Votre profil' : `Profil de ${profileUser.name}`}
                </p>
              </div>
            </div>

            <div className="flex mt-4 space-x-4">
              <div>
                <span className="font-bold text-gray-800 dark:text-white">{tweetCount}</span>{' '}
                <span className="text-gray-500 dark:text-gray-400">Tweets</span>
              </div>
              {isCurrentUserProfile && (
                <div>
                  <span className="font-bold text-gray-800 dark:text-white">{likeCount}</span>{' '}
                  <span className="text-gray-500 dark:text-gray-400">J'aime</span>
                </div>
              )}
            </div>

            {isCurrentUserProfile && (
              <div className="mt-4">
                <Link
                  href="/compose"
                  className="block w-full bg-blue-500 hover:bg-blue-600 text-white text-center py-2 rounded-full"
                >
                  Tweeter
                </Link>
              </div>
            )}
          </div>

          {isCurrentUserProfile && (
            <div className="mb-6">
              <div className="flex border-b border-gray-200 dark:border-gray-700">
                <button 
                  className={`flex-1 font-medium py-2 text-center ${activeTab === 'tweets' ? 'border-b-2 border-blue-500 text-blue-500 dark:text-blue-400' : 'text-gray-500 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800'}`}
                  onClick={() => setActiveTab('tweets')}
                >
                  Tweets
                </button>
                <button 
                  className={`flex-1 font-medium py-2 text-center ${activeTab === 'likes' ? 'border-b-2 border-blue-500 text-blue-500 dark:text-blue-400' : 'text-gray-500 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800'}`}
                  onClick={() => setActiveTab('likes')}
                >
                  J'aime
                </button>
              </div>
            </div>
          )}

          <div>
            {displayedTweets.length > 0 ? (
              displayedTweets.map(tweet => renderTweet(tweet))
            ) : (
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md text-center">
                <p className="text-gray-500 dark:text-gray-400 mb-3">
                  {activeTab === 'tweets' ? 'Aucun tweet pour le moment' : 'Aucun tweet aimé pour le moment'}
                </p>
                {isCurrentUserProfile && activeTab === 'tweets' && (
                  <Link
                    href="/compose"
                    className="inline-block bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-full"
                  >
                    Créer votre premier tweet
                  </Link>
                )}
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md text-center">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Utilisateur non trouvé</h2>
          <p className="mb-4 text-gray-700 dark:text-gray-300">L'utilisateur @{username} n'existe pas ou n'a pas encore tweeté.</p>
          <Link href="/" className="text-blue-500 hover:underline">
            Retour à l'accueil
          </Link>
        </div>
      )}
    </div>
  );
} 