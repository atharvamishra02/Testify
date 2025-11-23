'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    checkAuthAndRedirect();
  }, []);

  const checkAuthAndRedirect = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        // User is authenticated, redirect to dashboard
        router.push('/dashboard');
      } else {
        // User is not authenticated, redirect to landing
        router.push('/landing');
      }
    } catch (error) {
      // Error checking auth, redirect to landing
      router.push('/landing');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-gray-400 text-lg">Loading...</div>
    </div>
  );
}
