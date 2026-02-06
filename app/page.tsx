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
      setMessage('请连接钱包并输入推特账号 / Please connect wallet and enter Twitter handle');
      return;
    }

    const handle = twitterHandle.trim().replace('@', '');

    try {
      setStatus('verifying');
      setMessage('正在验证推特... / Verifying Twitter...');

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
      setMessage(`🧧 验证成功！您的红包号码: #${data.claimIndex}`);
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
        <p className="text-lg text-white/90 mb-1">
          500 USDT 红包大放送！
        </p>
        <p className="text-sm text-white/60">
          Red Packet Giveaway · Sorteo de Sobre Rojo
        </p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="max-w-md mx-auto bg-white/10 backdrop-blur rounded-xl p-4 mb-6">
          <div className="flex justify-between text-center text-white">
            <div>
              <div className="text-3xl font-bold">{stats.remaining}</div>
              <div className="text-sm opacity-75">剩余</div>
              <div className="text-xs opacity-50">Remaining</div>
            </div>
            <div>
              <div className="text-3xl font-bold">{stats.claimed}</div>
              <div className="text-sm opacity-75">已领取</div>
              <div className="text-xs opacity-50">Claimed</div>
            </div>
            <div>
              <div className="text-3xl font-bold">500</div>
              <div className="text-sm opacity-75">USDT 奖池</div>
              <div className="text-xs opacity-50">Prize Pool</div>
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
          <h2 className="text-lg font-semibold mb-1 flex items-center gap-2">
            <span className="bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">1</span>
            关注推特账号
          </h2>
          <p className="text-xs text-gray-500 mb-3 ml-8">Follow on Twitter · Seguir en Twitter</p>
          <div className="space-y-2 text-sm">
            <a
              href={`https://twitter.com/${twitterAccountToFollow}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition"
            >
              <span>👤</span>
              <span>关注 @{twitterAccountToFollow}</span>
              <span className="ml-auto">→</span>
            </a>
          </div>
        </div>

        {/* Step 2: Connect Wallet */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-1 flex items-center gap-2">
            <span className="bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">2</span>
            连接钱包
          </h2>
          <p className="text-xs text-gray-500 mb-3 ml-8">Connect Wallet · Conectar Billetera</p>
          <WalletMultiButton className="!w-full !justify-center !rounded-lg" />
          {connected && publicKey && (
            <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
              ✓ 已连接: {publicKey.toBase58().slice(0, 8)}...{publicKey.toBase58().slice(-4)}
            </p>
          )}
        </div>

        {/* Step 3: Enter Twitter Handle */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-1 flex items-center gap-2">
            <span className="bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">3</span>
            输入推特账号
          </h2>
          <p className="text-xs text-gray-500 mb-3 ml-8">Enter Twitter Handle · Ingresa tu Twitter</p>
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
          {status === 'verifying' && '🔍 验证中...'}
          {status === 'success' && '🎉 验证成功！'}
          {status === 'error' && '❌ 重试'}
          {status === 'idle' && '🧧 领取红包'}
        </button>
        <p className="text-xs text-center text-gray-400 mt-2">
          Claim Red Packet · Reclamar Sobre Rojo
        </p>

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
            <p><strong>红包号码 / Claim Index:</strong> #{claimData.claimIndex}</p>
            <p className="mt-1"><strong>签名 / Signature:</strong> {claimData.signature.slice(0, 20)}...</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="text-center py-8 text-white/60 text-sm">
        <p className="text-white/80 text-base mb-2">🐍 恭喜发财，蛇年大吉！</p>
        <p className="text-xs mb-1">Happy Year of the Snake · Feliz Año de la Serpiente</p>
        <p className="mt-4 text-xs">Powered by StairAI × Solana</p>
      </div>
    </main>
  );
}
