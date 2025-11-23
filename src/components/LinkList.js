'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function LinkList({ keyProp }) {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [copied, setCopied] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchLinks = async (showRefreshing = false) => {
    if (showRefreshing) setRefreshing(true);
    try {
      const res = await fetch('/api/links');
      if (res.ok) {
        const data = await res.json();
        setLinks(data);
      }
    } catch (error) {
      console.error('Failed to fetch links', error);
    } finally {
      setLoading(false);
      if (showRefreshing) {
        setTimeout(() => setRefreshing(false), 500);
      }
    }
  };

  useEffect(() => {
    fetchLinks();
    
    // Auto-refresh every 5 seconds to show updated click counts
    const interval = setInterval(() => {
      fetchLinks();
    }, 5000);

    return () => clearInterval(interval);
  }, [keyProp]);

  const handleLinkClick = async (e, code) => {
    e.preventDefault();
    
    // Increment clicks via API
    try {
      const res = await fetch(`/api/links/${code}/click`, { 
        method: 'POST'
      });
      
      if (res.ok) {
        const updatedLink = await res.json();
        // Update the link in state with the new data
        setLinks(prevLinks => 
          prevLinks.map(link => 
            link.code === code ? updatedLink : link
          )
        );
      }
    } catch (error) {
      console.error('Failed to increment click', error);
    }
    
    // Navigate to stats page
    window.location.href = `/code/${code}`;
  };

  const handleDelete = async (code) => {
    const confirmed = window.confirm('Are you sure you want to delete this link?');
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/links/${code}`, { method: 'DELETE' });
      if (res.ok || res.status === 204) {
        // Remove from local state immediately
        setLinks(prevLinks => prevLinks.filter((l) => l.code !== code));
        // Also refresh from server to be sure
        fetchLinks();
      } else {
        alert('Failed to delete link. Please try again.');
      }
    } catch (error) {
      console.error('Failed to delete link', error);
      alert('An error occurred while deleting the link.');
    }
  };

  const copyToClipboard = (code) => {
    const url = `${window.location.origin}/${code}`;
    navigator.clipboard.writeText(url);
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
  };

  const filteredLinks = links.filter(
    (link) =>
      link.code.toLowerCase().includes(search.toLowerCase()) ||
      link.originalUrl.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="text-center py-8 text-gray-400">Loading links...</div>;

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
      <div className="p-4 border-b border-white/10 flex justify-between items-center gap-4">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-white">Your Links</h3>
          <span className="text-xs text-gray-500">(auto-refreshes every 5s)</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchLinks(true)}
            disabled={refreshing}
            className="p-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors disabled:opacity-50"
            title="Refresh now"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              className={refreshing ? 'animate-spin' : ''}
            >
              <polyline points="23 4 23 10 17 10"></polyline>
              <polyline points="1 20 1 14 7 14"></polyline>
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
            </svg>
          </button>
          <input
            type="text"
            placeholder="Search links..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-black/20 border border-white/10 rounded-lg px-3 py-1 text-sm text-white focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-300">
          <thead className="bg-white/5 text-xs uppercase font-medium text-gray-400">
            <tr>
              <th className="px-6 py-3">Short Code</th>
              <th className="px-6 py-3">Original URL</th>
              <th className="px-6 py-3 text-center">Clicks</th>
              <th className="px-6 py-3">Last Clicked</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredLinks.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                  No links found. Create one above!
                </td>
              </tr>
            ) : (
              filteredLinks.map((link) => (
                <tr key={link.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 font-medium text-blue-400">
                    <a 
                      href={`/code/${link.code}`} 
                      onClick={(e) => handleLinkClick(e, link.code)}
                      className="hover:underline cursor-pointer"
                    >
                      {link.code}
                    </a>
                  </td>
                  <td className="px-6 py-4 max-w-xs truncate" title={link.originalUrl}>
                    {link.originalUrl}
                  </td>
                  <td className="px-6 py-4 text-center">{link.clicks}</td>
                  <td className="px-6 py-4 text-gray-500">
                    {link.lastClickedAt
                      ? new Date(link.lastClickedAt).toLocaleDateString()
                      : '-'}
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button
                      onClick={() => copyToClipboard(link.code)}
                      className="text-gray-400 hover:text-white transition-colors"
                      title="Copy Link"
                    >
                      {copied === link.code ? (
                        <span className="text-green-400">Copied!</span>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                      )}
                    </button>
                    <button
                      onClick={() => handleDelete(link.code)}
                      className="text-red-400 hover:text-red-300 transition-colors"
                      title="Delete"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
