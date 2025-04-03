import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  password?: string; // Non stocké côté client après login
  image?: string;
  following?: string[];
  followers?: string[];
  createdAt?: string;
}

export interface Tweet {
  id: string;
  content: string;
  createdAt: string;
  userId: string;
  user: {
    name: string;
    username: string;
    image?: string;
  };
  likes: number;
  comments: number;
  likedBy?: string[];
  retweetedBy?: string[];
  isRetweet?: boolean;
  originalTweetId?: string;
}

interface TweetState {
  tweets: Tweet[];
  users: User[]; // Pour les suggestions d'utilisateurs à suivre
  currentUser: User | null;
  darkMode: boolean;
  
  // Actions
  fetchTweets: (username?: string) => Promise<void>;
  addTweet: (content: string) => Promise<Tweet | null>;
  deleteTweet: (tweetId: string) => Promise<void>;
  likeTweet: (tweetId: string) => Promise<void>;
  retweetTweet: (tweetId: string) => Promise<void>;
  fetchUsers: () => Promise<void>;
  followUser: (userId: string) => Promise<void>;
  unfollowUser: (userId: string) => Promise<void>;
  toggleDarkMode: () => void;
  register: (user: Omit<User, 'id'>) => Promise<{ success: boolean; message: string }>;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string; user?: User }>;
  logout: () => void;
  getUserById: (userId: string) => User | undefined;
  getUserByUsername: (username: string) => User | undefined;
  isFollowing: (userId: string) => boolean;
}

export const useTweetStore = create<TweetState>()(
  persist(
    (set, get) => ({
      tweets: [],
      users: [],
      currentUser: null,
      darkMode: false,
      
      // Récupérer les tweets depuis l'API
      fetchTweets: async (username?: string) => {
        try {
          const url = username 
            ? `/api/tweets?username=${username}` 
            : '/api/tweets';
          
          const response = await fetch(url);
          
          if (!response.ok) {
            throw new Error('Erreur lors de la récupération des tweets');
          }
          
          const data = await response.json();
          set({ tweets: data.tweets });
        } catch (error) {
          console.error('Erreur fetchTweets:', error);
        }
      },
      
      // Ajouter un tweet
      addTweet: async (content) => {
        try {
          const { currentUser } = get();
          
          if (!currentUser) return null;
          
          const response = await fetch('/api/tweets', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              content,
              userId: currentUser.id,
            }),
          });
          
          if (!response.ok) {
            throw new Error('Erreur lors de la création du tweet');
          }
          
          const newTweet = await response.json();
          
          set((state) => ({
            tweets: [newTweet, ...state.tweets],
          }));
          
          return newTweet;
        } catch (error) {
          console.error('Erreur addTweet:', error);
          return null;
        }
      },
      
      // Supprimer un tweet
      deleteTweet: async (tweetId) => {
        try {
          const { currentUser } = get();
          
          if (!currentUser) return;
          
          const response = await fetch(`/api/tweets/${tweetId}`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userId: currentUser.id,
            }),
          });
          
          if (!response.ok) {
            throw new Error('Erreur lors de la suppression du tweet');
          }
          
          set((state) => ({
            tweets: state.tweets.filter((t) => t.id !== tweetId),
          }));
        } catch (error) {
          console.error('Erreur deleteTweet:', error);
        }
      },
      
      // Liker ou unliker un tweet
      likeTweet: async (tweetId) => {
        try {
          const { currentUser } = get();
          
          if (!currentUser) return;
          
          const response = await fetch(`/api/tweets/${tweetId}/like`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userId: currentUser.id,
            }),
          });
          
          if (!response.ok) {
            throw new Error('Erreur lors du like/unlike du tweet');
          }
          
          const updatedTweet = await response.json();
          
          set((state) => ({
            tweets: state.tweets.map((t) =>
              t.id === tweetId ? updatedTweet : t
            ),
          }));
        } catch (error) {
          console.error('Erreur likeTweet:', error);
        }
      },
      
      // Retweeter ou annuler un retweet
      retweetTweet: async (tweetId) => {
        try {
          const { currentUser } = get();
          
          if (!currentUser) return;
          
          const response = await fetch(`/api/tweets/${tweetId}/retweet`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userId: currentUser.id,
            }),
          });
          
          if (!response.ok) {
            throw new Error('Erreur lors du retweet/annulation');
          }
          
          const result = await response.json();
          
          if (result.action === 'retweet') {
            set((state) => ({
              tweets: [result.retweet, ...state.tweets.map((t) =>
                t.id === tweetId ? result.tweet : t
              )],
            }));
          } else {
            set((state) => ({
              tweets: state.tweets
                .filter((t) => !(t.isRetweet && t.originalTweetId === tweetId && t.userId === currentUser.id))
                .map((t) => (t.id === tweetId ? result.tweet : t)),
            }));
          }
        } catch (error) {
          console.error('Erreur retweetTweet:', error);
        }
      },
      
      // Récupérer les utilisateurs
      fetchUsers: async () => {
        try {
          const response = await fetch('/api/users');
          
          if (!response.ok) {
            throw new Error('Erreur lors de la récupération des utilisateurs');
          }
          
          const data = await response.json();
          set({ users: data.users });
        } catch (error) {
          console.error('Erreur fetchUsers:', error);
        }
      },
      
      // Suivre un utilisateur
      followUser: async (userId) => {
        try {
          const { currentUser } = get();
          
          if (!currentUser) return;
          
          const response = await fetch(`/api/users/${userId}/follow`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              followerId: currentUser.id,
            }),
          });
          
          if (!response.ok) {
            throw new Error('Erreur lors du suivi de l\'utilisateur');
          }
          
          const result = await response.json();
          
          set((state) => ({
            currentUser: result.follower,
            users: state.users.map((u) =>
              u.id === userId ? result.followed : u
            ),
          }));
        } catch (error) {
          console.error('Erreur followUser:', error);
        }
      },
      
      // Ne plus suivre un utilisateur
      unfollowUser: async (userId) => {
        try {
          const { currentUser } = get();
          
          if (!currentUser) return;
          
          const response = await fetch(`/api/users/${userId}/unfollow`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              followerId: currentUser.id,
            }),
          });
          
          if (!response.ok) {
            throw new Error('Erreur lors du désabonnement');
          }
          
          const result = await response.json();
          
          set((state) => ({
            currentUser: result.follower,
            users: state.users.map((u) =>
              u.id === userId ? result.followed : u
            ),
          }));
        } catch (error) {
          console.error('Erreur unfollowUser:', error);
        }
      },
      
      // Basculer le mode sombre
      toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
      
      // Inscription
      register: async (userData) => {
        try {
          console.log('🔄 Tentative d\'inscription avec:', {...userData, password: '***HIDDEN***'});
          
          const response = await fetch('/api/users', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
          });
          
          const data = await response.json();
          console.log('📦 Réponse de l\'API:', data);
          
          if (!response.ok) {
            console.error('⛔ Erreur d\'inscription:', data.error);
            return {
              success: false,
              message: data.error || 'Erreur lors de l\'inscription',
            };
          }
          
          console.log('✅ Inscription réussie!');
          return {
            success: true,
            message: 'Inscription réussie!',
          };
        } catch (error) {
          console.error('❌ Exception lors de l\'inscription:', error);
          return {
            success: false,
            message: 'Erreur serveur lors de l\'inscription',
          };
        }
      },
      
      // Connexion
      login: async (email, password) => {
        try {
          const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
          });
          
          const data = await response.json();
          
          if (!response.ok) {
            return {
              success: false,
              message: data.error || 'Identifiants incorrects',
            };
          }
          
          const user = {
            id: data.user._id,
            name: data.user.name,
            username: data.user.username,
            email: data.user.email,
            image: data.user.image,
            following: data.user.following,
            followers: data.user.followers,
          };
          
          set({ currentUser: user });
          
          return {
            success: true,
            message: 'Connexion réussie!',
            user,
          };
        } catch (error) {
          console.error('Erreur login:', error);
          return {
            success: false,
            message: 'Erreur serveur lors de la connexion',
          };
        }
      },
      
      // Déconnexion
      logout: () => set({ currentUser: null }),
      
      // Obtenir un utilisateur par ID
      getUserById: (userId) => {
        const { users, currentUser } = get();
        
        if (currentUser?.id === userId) return currentUser;
        
        return users.find((u) => u.id === userId);
      },
      
      // Obtenir un utilisateur par nom d'utilisateur
      getUserByUsername: (username) => {
        const { users, currentUser } = get();
        
        if (currentUser?.username === username) return currentUser;
        
        return users.find((u) => u.username === username);
      },
      
      // Vérifier si l'utilisateur actuel suit un autre utilisateur
      isFollowing: (userId) => {
        const { currentUser } = get();
        
        if (!currentUser || !currentUser.following) return false;
        
        return currentUser.following.includes(userId);
      },
    }),
    {
      name: 'twitter-clone-storage',
      partialize: (state) => ({
        currentUser: state.currentUser,
        darkMode: state.darkMode,
      }),
    }
  )
); 