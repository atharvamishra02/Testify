'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function StatsPage() {
  const params = useParams();
  const router = useRouter();
  const { code } = params;
  const [link, setLink] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!code) return;

    const fetchLink = async () => {
      try {
        const res = await fetch(`/api/links/${code}`);
        if (!res.ok) {
          if (res.status === 404) {
            setError('Link not found');
          } else {
            setError('Failed to fetch stats');
          }
          return;
        }
        const data = await res.json();
        setLink(data);
      } catch (err) {
        setError('An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchLink();
  }, [code]);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this link?')) return;

    try {
      const res = await fetch(`/api/links/${code}`, { method: 'DELETE' });
      if (res.ok) {
        router.push('/');
      }
    } catch (err) {
      alert('Failed to delete link');
    }
  };

  if (loading) return <div className="text-center py-20 text-gray-400">Loading stats...</div>;

  if (error) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-3xl font-bold text-red-400 mb-4">{error}</h1>
        <Link href="/" className="text-blue-400 hover:underline">
          Go back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <Link href="/" className="text-gray-400 hover:text-white mb-8 inline-block transition-colors">
        &larr; Back to Dashboard
      </Link>

      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Link Stats</h1>
            <p className="text-blue-400 text-xl font-mono">/{link.code}</p>
          </div>
          <button
            onClick={handleDelete}
            className="bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 hover:text-red-300 px-4 py-2 rounded-lg transition-colors"
          >
            Delete Link
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/5 rounded-lg p-6 text-center">
            <div className="text-gray-400 text-sm uppercase mb-2">Total Clicks</div>
            <div className="text-4xl font-bold text-white">{link.clicks}</div>
          </div>
          <div className="bg-white/5 rounded-lg p-6 text-center">
            <div className="text-gray-400 text-sm uppercase mb-2">Created At</div>
            <div className="text-lg text-white">
              {new Date(link.createdAt).toLocaleDateString()}
            </div>
          </div>
          <div className="bg-white/5 rounded-lg p-6 text-center">
            <div className="text-gray-400 text-sm uppercase mb-2">Last Clicked</div>
            <div className="text-lg text-white">
              {link.lastClickedAt
                ? new Date(link.lastClickedAt).toLocaleDateString()
                : 'Never'}
            </div>
          </div>
        </div>

        <div className="bg-black/20 rounded-lg p-6">
          <div className="text-gray-400 text-sm uppercase mb-2">Target URL</div>
          <div className="text-white break-all font-mono">{link.originalUrl}</div>
        </div>
      </div>
    </div>
  );
}
