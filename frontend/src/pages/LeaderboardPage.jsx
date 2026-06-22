import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Trophy, Medal, Award, Flame, User, Loader2 } from 'lucide-react';

const LeaderboardPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await api.get('/leaderboard');
        setUsers(res.data);
      } catch (err) {
        setError('Failed to load leaderboard data.');
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  if (loading) {
    return (
      <div className="flex-grow flex items-center justify-center">
        <div className="animate-spin text-cyan-400"><Loader2 size={48} /></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-grow flex items-center justify-center text-red-400">
        {error}
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-12 px-6 w-full">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-white mb-4 flex items-center justify-center gap-3">
          <Trophy className="text-yellow-400" size={36} />
          Global Leaderboard
        </h1>
        <p className="text-slate-400 max-w-xl mx-auto">
          Compete with developers around the world. Solve problems to earn points and climb the ranks.
          Harder problems yield higher points!
        </p>
      </div>

      <div className="bg-slate-900/60 rounded-2xl border border-slate-700/50 shadow-xl overflow-hidden backdrop-blur-md">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-800/80 border-b border-slate-700 text-slate-400 uppercase text-xs tracking-wider">
              <th className="py-4 px-6 text-center w-24">Rank</th>
              <th className="py-4 px-6">Hacker</th>
              <th className="py-4 px-6 text-center">Problems Solved</th>
              <th className="py-4 px-6 text-right">Total Score</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {users.map((user, index) => {
              const rank = index + 1;
              let RankIcon = null;
              let rowStyle = "hover:bg-slate-800/30 transition-colors";
              let rankStyle = "text-slate-500 font-mono text-lg";
              
              if (rank === 1) {
                RankIcon = <Medal className="text-yellow-400 mx-auto" size={24} />;
                rowStyle = "bg-yellow-500/10 hover:bg-yellow-500/20 border-l-4 border-yellow-400 transition-colors";
                rankStyle = "text-yellow-400 font-bold text-xl";
              } else if (rank === 2) {
                RankIcon = <Medal className="text-slate-300 mx-auto" size={24} />;
                rowStyle = "bg-slate-300/5 hover:bg-slate-300/10 border-l-4 border-slate-300 transition-colors";
                rankStyle = "text-slate-300 font-bold text-xl";
              } else if (rank === 3) {
                RankIcon = <Medal className="text-amber-600 mx-auto" size={24} />;
                rowStyle = "bg-amber-600/5 hover:bg-amber-600/10 border-l-4 border-amber-600 transition-colors";
                rankStyle = "text-amber-600 font-bold text-xl";
              } else {
                RankIcon = <span className={rankStyle}>#{rank}</span>;
              }

              return (
                <tr key={user.id} className={rowStyle}>
                  <td className="py-4 px-6 text-center">
                    {RankIcon}
                  </td>
                  <td className="py-4 px-6">
                    <Link to={`/user/${user.username}`} className="flex items-center gap-3 group">
                      <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center border border-slate-600 shadow-inner group-hover:border-cyan-400 transition-colors">
                        <User className="text-slate-400 group-hover:text-cyan-400 transition-colors" size={20} />
                      </div>
                      <span className="text-white font-semibold text-lg group-hover:text-cyan-400 transition-colors">{user.username}</span>
                    </Link>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <span className="bg-slate-800 text-slate-300 px-3 py-1 rounded-full text-sm font-medium border border-slate-700">
                      {user.total_solved}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Flame className="text-orange-500" size={18} />
                      <span className="text-cyan-400 font-mono font-bold text-xl">{user.total_points}</span>
                    </div>
                  </td>
                </tr>
              );
            })}
            
            {users.length === 0 && !loading && (
              <tr>
                <td colSpan="4" className="py-12 text-center text-slate-500">
                  No hackers on the board yet. Be the first!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LeaderboardPage;
