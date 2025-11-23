'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CreateLinkForm from '@/components/CreateLinkForm';
import LinkList from '@/components/LinkList';

export default function Dashboard() {
  const router = useRouter();
  const [refreshKey, setRefreshKey] = useState(0);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        router.push('/login');
      }
    } catch (error) {
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleSuccess = () => {
    setRefreshKey((prev) => prev + 1);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-400 text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <main className="container mx-auto px-4 py-12 max-w-5xl">
    
      <div className="flex justify-between items-center mb-8">
        <div className="text-center flex-1">
          <h1 className="text-5xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-violet-400 to-purple-400">
            TinyLink
          </h1>
          <p className="text-gray-400 text-lg">
            Shorten your links, track your success.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm text-gray-400">Welcome back,</p>
            <p className="text-white font-medium">{user.name || user.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white px-4 py-2 rounded-lg transition-colors"
          >
            Logout
          </button>
        </div>
      </div>

      <CreateLinkForm onSuccess={handleSuccess} />
      <LinkList keyProp={refreshKey} />
    </main>
  );
}
