'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';

interface Tweet {
  id: string;
  content: string;
  createdAt: string;
  user: {
    name: string;
    username: string;
    image: string;
  };
  likes: number;
  comments: number;
}

const DUMMY_TWEETS: Tweet[] = [
  {
    id: '1',
    content: 'Bonjour Twitter-Bi! Comment allez-vous aujourd\'hui?',
    createdAt: '2023-04-01T12:00:00Z',
    user: {
      name: 'Jean Dupont',
      username: 'jeandupont',
      image: 'https://i.pravatar.cc/150?img=1',
    },
    likes: 15,
    comments: 3,
  },
  {
    id: '2',
    content: 'Je viens de lancer mon nouveau projet! #coding #typescript #nextjs',
    createdAt: '2023-04-01T10:30:00Z',
    user: {
      name: 'Marie Martin',
      username: 'mariemartin',
      image: 'https://i.pravatar.cc/150?img=5',
    },
    likes: 24,
    comments: 5,
  },
  {
    id: '3',
    content: 'Les meilleures ressources pour apprendre Next.js en 2023:\n1. Documentation officielle\n2. YouTube\n3. Blog Vercel\n#nextjs #react #javascript',
    createdAt: '2023-03-31T16:45:00Z',
    user: {
      name: 'Thomas Dev',
      username: 'thomasdev',
      image: 'https://i.pravatar.cc/150?img=8',
    },
    likes: 42,
    comments: 7,
  },
];

const TweetFeed = () => {
  const { data: session } = useSession();
  const [newTweet, setNewTweet] = useState('');
  const [tweets, setTweets] = useState<Tweet[]>(DUMMY_TWEETS);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newTweet.trim() || !session?.user) return;
    
    const tweet: Tweet = {
      id: Date.now().toString(),
      content: newTweet,
      createdAt: new Date().toISOString(),
      user: {
        name: session.user.name || 'Utilisateur',
        username: session.user.email?.split('@')[0] || 'utilisateur',
        image: session.user.image || 'https://i.pravatar.cc/150?img=3',
      },
      likes: 0,
      comments: 0,
    };
    
    setTweets([tweet, ...tweets]);
    setNewTweet('');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="space-y-6">
      {session?.user && (
        <div className="bg-white p-4 rounded-lg shadow-md">
          <form onSubmit={handleSubmit}>
            <div className="flex gap-3">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                  {session.user.image ? (
                    <Image 
                      src={session.user.image} 
                      alt="Photo de profil" 
                      width={40} 
                      height={40} 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500">
                      👤
                    </div>
                  )}
                </div>
              </div>
              <div className="flex-grow">
                <textarea
                  placeholder="Quoi de neuf?"
                  value={newTweet}
                  onChange={(e) => setNewTweet(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  maxLength={280}
                />
                <div className="flex justify-between items-center mt-2">
                  <div className="text-sm text-gray-500">
                    {newTweet.length}/280
                  </div>
                  <button
                    type="submit"
                    disabled={!newTweet.trim()}
                    className="bg-blue-500 text-white px-4 py-2 rounded-full font-medium disabled:opacity-50"
                  >
                    Tweeter
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      )}
      
      <div className="space-y-4">
        {tweets.map((tweet) => (
          <div key={tweet.id} className="bg-white p-4 rounded-lg shadow-md">
            <div className="flex gap-3">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full overflow-hidden">
                  <Image 
                    src={tweet.user.image} 
                    alt={`Photo de ${tweet.user.name}`} 
                    width={40} 
                    height={40} 
                  />
                </div>
              </div>
              <div className="flex-grow">
                <div className="flex items-center">
                  <span className="font-bold">{tweet.user.name}</span>
                  <span className="text-gray-500 ml-2">@{tweet.user.username}</span>
                  <span className="text-gray-400 mx-1">·</span>
                  <span className="text-gray-500 text-sm">{formatDate(tweet.createdAt)}</span>
                </div>
                <div className="mt-1 whitespace-pre-line">{tweet.content}</div>
                <div className="mt-3 flex gap-6 text-gray-500">
                  <button className="flex items-center gap-1 hover:text-blue-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <span>{tweet.comments}</span>
                  </button>
                  <button className="flex items-center gap-1 hover:text-green-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                    </svg>
                    <span>Retweeter</span>
                  </button>
                  <button className="flex items-center gap-1 hover:text-red-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    <span>{tweet.likes}</span>
                  </button>
                  <button className="flex items-center gap-1 hover:text-blue-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                    <span>Partager</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TweetFeed; 