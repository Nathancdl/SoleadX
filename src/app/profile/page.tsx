'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTweetStore } from '@/store/tweetStore';

export default function ProfileRedirectPage() {
  const router = useRouter();
  const { currentUser } = useTweetStore();

  useEffect(() => {
    // Si l'utilisateur est connecté, rediriger vers son profil
    if (currentUser) {
      router.push(`/profile/${currentUser.username}`);
    } else {
      // Si non connecté, rediriger vers la page de connexion
      router.push('/login');
    }
  }, [currentUser, router]);

  // Pendant le chargement/redirection
  return (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );
} 