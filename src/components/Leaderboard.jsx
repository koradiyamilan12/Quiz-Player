import React, { useState, useEffect } from "react";
import { getTopScores } from "../firebase";
import { Medal, Loader2, Calendar } from "lucide-react";

// Human-readable date formatting helper
const formatRelativeTime = (isoString) => {
  if (!isoString) return "";
  try {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now - date;
    
    // Safety check for futuristic dates from time sync skew
    if (diffMs < 0) return "Just now";
    
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    return date.toLocaleDateString(undefined, { 
      month: "short", 
      day: "numeric",
      year: "2-digit"
    });
  } catch {
    return "";
  }
};

// Rank badge rendering component
const RankBadge = ({ rank }) => {
  if (rank === 1) return <Medal className="w-5 h-5 text-amber-500 fill-amber-500/20" />;
  if (rank === 2) return <Medal className="w-5 h-5 text-slate-400 fill-slate-400/20" />;
  if (rank === 3) return <Medal className="w-5 h-5 text-amber-700 fill-amber-700/20" />;
  return <span className="font-bold text-xs text-slate-400 dark:text-slate-500 pl-1">{rank}</span>;
};

const Leaderboard = ({ quizId, refreshTrigger }) => {
  const [scores, setScores] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);

  useEffect(() => {
    let active = true;

    const fetchLeaderboard = async () => {
      setIsLoading(true);
      setFetchError(false);
      try {
        const data = await getTopScores(quizId);
        if (active) {
          setScores(data);
        }
      } catch (err) {
        console.error("Leaderboard fetch failed:", err);
        if (active) {
          setFetchError(true);
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    fetchLeaderboard();

    return () => {
      active = false;
    };
  }, [quizId, refreshTrigger]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-2" />
        <span className="text-sm text-slate-500 font-semibold">Loading scores...</span>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="text-center py-8">
        <span className="text-sm font-bold text-rose-500">Failed to load leaderboard data.</span>
      </div>
    );
  }

  if (scores.length === 0) {
    return (
      <div className="text-center py-12 px-4 bg-slate-500/5 rounded-2xl border border-dashed border-slate-200/10">
        <span className="text-sm font-bold text-slate-400">No leaderboard scores yet!</span>
        <p className="text-xs text-slate-500 mt-1">Be the first to complete the quiz and lock in your rank.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-slate-200/10 text-slate-400 text-xs font-bold uppercase tracking-wider">
            <th className="pb-3 pl-3 w-16">Rank</th>
            <th className="pb-3">Player</th>
            <th className="pb-3 text-right">Accuracy</th>
            <th className="pb-3 text-right pr-3">Score</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200/10">
          {scores.map((record, index) => {
            const rank = index + 1;

            return (
              <tr 
                key={record.id || index} 
                className={`text-sm hover:bg-slate-500/5 transition-colors duration-150 ${
                  rank <= 3 ? "font-bold text-slate-800 dark:text-slate-100" : "text-slate-600 dark:text-slate-400"
                }`}
              >
                {/* Rank */}
                <td className="py-3.5 pl-3">
                  <div className="flex items-center">
                    <RankBadge rank={rank} />
                  </div>
                </td>

                {/* Player details */}
                <td className="py-3.5 max-w-[160px] truncate">
                  <div>
                    <span className="truncate block">{record.name}</span>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1 font-semibold mt-0.5">
                      <Calendar className="w-3 h-3 text-slate-500" />
                      {formatRelativeTime(record.completedAt)}
                    </span>
                  </div>
                </td>

                {/* Percentage */}
                <td className="py-3.5 text-right font-mono font-bold text-slate-500 dark:text-slate-400">
                  {record.percentage}%
                </td>

                {/* Score */}
                <td className="py-3.5 text-right font-mono font-black text-indigo-500 dark:text-indigo-400 pr-3">
                  {record.score}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default Leaderboard;
