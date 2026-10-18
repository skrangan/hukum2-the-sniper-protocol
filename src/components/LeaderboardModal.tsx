import React, { useEffect, useState } from 'react';
import { Trophy, X, Award, RefreshCw } from 'lucide-react';
import { ApiClient } from '../api/client';

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({ isOpen, onClose }) => {
  const [leaders, setLeaders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const data = await ApiClient.getLeaderboard();
      setLeaders(data.leaderboard || []);
    } catch (e) {
      console.warn('Failed to load leaderboard:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchLeaderboard();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border border-yellow-500/40 rounded-3xl p-6 shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <Trophy className="w-5 h-5 text-yellow-400" />
            <h3 className="text-lg font-black text-white uppercase tracking-wider font-display">
              AURA LEADERBOARD <span className="text-yellow-400">(POSTGRES)</span>
            </h3>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={fetchLeaderboard}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-yellow-400' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Leaderboard Table */}
        <div className="flex-1 overflow-y-auto my-4 space-y-2 pr-1">
          {loading ? (
            <div className="text-center py-12 text-slate-400 text-sm">
              Loading rankings from Render PostgreSQL...
            </div>
          ) : leaders.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-sm">
              No entries found yet. Complete Chapter 1 to be the #1 Tiger Recruit!
            </div>
          ) : (
            leaders.map((entry, idx) => (
              <div
                key={entry.id}
                className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                  idx === 0
                    ? 'bg-yellow-500/10 border-yellow-500/40'
                    : 'bg-slate-950/60 border-slate-800'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className={`w-6 text-center font-black text-sm font-mono ${
                    idx === 0 ? 'text-yellow-400' : idx === 1 ? 'text-slate-300' : idx === 2 ? 'text-amber-600' : 'text-slate-500'
                  }`}>
                    #{idx + 1}
                  </span>
                  <img
                    src={entry.avatar_url || 'https://api.dicebear.com/7.x/bottts/svg?seed=' + entry.id}
                    alt="avatar"
                    className="w-8 h-8 rounded-full border border-slate-700"
                  />
                  <div>
                    <div className="text-sm font-bold text-white flex items-center space-x-1">
                      <span>{entry.display_name}</span>
                      {idx === 0 && <Award className="w-3.5 h-3.5 text-yellow-400 inline" />}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Level {entry.highest_level_unlocked || 1} Unlocked
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm font-black text-yellow-400 font-mono">
                    {Number(entry.total_aura_score || 0).toLocaleString()}
                  </div>
                  <div className="text-[10px] text-slate-500 uppercase font-mono">
                    Aura Pts
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="pt-3 border-t border-slate-800 text-center text-xs text-slate-400">
          Rankings are synced in real-time with Render PostgreSQL Database
        </div>
      </div>
    </div>
  );
};
