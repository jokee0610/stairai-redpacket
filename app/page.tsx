'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

interface Stats {
  totalSlots: number;
  claimed: number;
  remaining: number;
}

type Status = 'idle' | 'verifying' | 'claiming' | 'success' | 'error';

export default function Home() {
  const { publicKey, connected } = useWallet();
  const [twitterHandle, setTwitterHandle] = useState('');
  const [stats, setStats] = useState<Stats | null>(null);
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState('');
  const [claimData, setClaimData] = useState<{ claimIndex: number; signature: string } | null>(null);

  // Fetch stats
  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, []);

  async function fetchStats() {
    try {
      const res = await fetch('/api/stats');
      const data = await res.json();
      setStats(data);
    } catch (e) {
      console.error('Failed to fetch stats:', e);
    }
  }

  async function handleVerify() {
    if (!publicKey || !twitterHandle.trim()) {
      setMessage('Please connect wallet and enter Twitter handle');
      return;
    }

    const handle = twitterHandle.trim().replace('@', '');

    try {
      setStatus('verifying');
      setMessage('Verifying Twitter tasks...');

      const res = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wallet: publicKey.toBase58(),
          twitterHandle: handle,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Verification failed');
      }

      setClaimData({
        claimIndex: data.claimIndex,
        signature: data.signature,
      });
      setStatus('success');
      setMessage(`🧧 Verified! Claim index: #${data.claimIndex}`);
      fetchStats();
    } catch (error: any) {
      setStatus('error');
      setMessage(error.message || 'Something went wrong');
    }
  }

  const twitterAccountToFollow = process.env.NEXT_PUBLIC_TWITTER_ACCOUNT || 'Stair_AI';

  return (
    <main className="min-h-screen py-8 px-4">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 animate-float">
          🧧 StairAI 新年红包
        </h1>
        <p className="text-xl text-white/80">
          Chinese New Year Red Packet Campaign
        </p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="max-w-md mx-auto bg-white/10 backdrop-blur rounded-xl p-4 mb-6">
          <div className="flex justify-between text-center text-white">
            <div>
              <div className="text-3xl font-bold">{stats.remaining}</div>
              <div className="text-sm opacity-75">Remaining</div>
            </div>
            <div>
              <div className="text-3xl font-bold">{stats.claimed}</div>
              <div className="text-sm opacity-75">Claimed</div>
            </div>
            <div>
              <div className="text-3xl font-bold">500</div>
              <div className="text-sm opacity-75">USDT Pool</div>
            </div>
          </div>
          <div className="mt-4 bg-white/20 rounded-full h-3 overflow-hidden">
            <div
              className="bg-yellow-400 h-3 rounded-full transition-all duration-500"
              style={{ width: `${(stats.claimed / stats.totalSlots) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Main Card */}
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-2xl p-6 text-gray-800">
        {/* Step 1: Twitter Tasks */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <span className="bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">1</span>
            Complete Twitter Tasks
          </h2>
          <div className="space-y-2 text-sm">
            <a
              href={`https://twitter.com/${twitterAccountToFollow}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition"
            >
              <span>👤</span>
              <span>Follow @{twitterAccountToFollow}</span>
              <span className="ml-auto">→</span>
            </a>
            <a
              href={`https://twitter.com/${twitterAccountToFollow}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition"
            >
              <span>🔄</span>
              <span>Retweet campaign post</span>
              <span className="ml-auto">→</span>
            </a>
          </div>
        </div>

        {/* Step 2: Connect Wallet */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <span className="bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">2</span>
            Connect Wallet
          </h2>
          <WalletMultiButton className="!w-full !justify-center !rounded-lg" />
          {connected && publicKey && (
            <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
              ✓ Connected: {publicKey.toBase58().slice(0, 8)}...{publicKey.toBase58().slice(-4)}
            </p>
          )}
        </div>

        {/* Step 3: Enter Twitter Handle */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <span className="bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">3</span>
            Enter Twitter Handle
          </h2>
          <input
            type="text"
            placeholder="@your_handle"
            value={twitterHandle}
            onChange={(e) => setTwitterHandle(e.target.value)}
            className="w-full p-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition"
            disabled={status === 'verifying'}
          />
        </div>

        {/* Verify Button */}
        <button
          onClick={handleVerify}
          disabled={!connected || !twitterHandle || status === 'verifying'}
          className={`
            w-full py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-[1.02]
            ${status === 'success'
              ? 'bg-green-500 text-white'
              : status === 'error'
                ? 'bg-red-500 text-white'
                : 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700'
            }
            disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
          `}
        >
          {status === 'verifying' && '🔍 Verifying...'}
          {status === 'success' && '🎉 Verified!'}
          {status === 'error' && '❌ Try Again'}
          {status === 'idle' && '🧧 领取红包 Claim Red Packet'}
        </button>

        {/* Status Message */}
        {message && (
          <div
            className={`mt-4 p-3 rounded-lg text-sm ${
              status === 'success'
                ? 'bg-green-100 text-green-800'
                : status === 'error'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-blue-100 text-blue-800'
            }`}
          >
            {message}
          </div>
        )}

        {/* Claim Data (for debugging/display) */}
        {claimData && status === 'success' && (
          <div className="mt-4 p-3 bg-gray-100 rounded-lg text-xs font-mono break-all">
            <p><strong>Claim Index:</strong> {claimData.claimIndex}</p>
            <p className="mt-1"><strong>Signature:</strong> {claimData.signature.slice(0, 20)}...</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="text-center py-8 text-white/60 text-sm">
        <p>Powered by StairAI × Solana</p>
        <p className="mt-1">🐍 恭喜发财 Happy Year of the Snake 2025!</p>
      </div>
    </main>
  );
}
