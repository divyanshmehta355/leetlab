import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { Trophy, Code2, Medal, Clock, CheckCircle2, Loader2, ArrowLeft } from 'lucide-react';

const ProfilePage = () => {
  const { username } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get(`/profiles/${username}`);
        setProfile(res.data);
      } catch (err) {
        setError('User not found.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [username]);

  if (loading) {
    return (
      <div className="flex-grow flex items-center justify-center">
        <Loader2 className="animate-spin text-cyan-400" size={48} />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center text-slate-400">
        <div className="text-2xl font-bold mb-4">{error}</div>
        <Link to="/" className="text-cyan-400 hover:text-cyan-300 flex items-center gap-2">
          <ArrowLeft size={16} /> Go Home
        </Link>
      </div>
    );
  }

  const { user, stats, totals, recentActivity } = profile;

  // Calculate percentages for progress bars
  const easyPct = totals.total_easy > 0 ? (stats.easy_solved / totals.total_easy) * 100 : 0;
  const medPct = totals.total_medium > 0 ? (stats.medium_solved / totals.total_medium) * 100 : 0;
  const hardPct = totals.total_hard > 0 ? (stats.hard_solved / totals.total_hard) * 100 : 0;

  // Generate an avatar color based on username
  const colors = ['bg-rose-500', 'bg-blue-500', 'bg-emerald-500', 'bg-amber-500', 'bg-indigo-500', 'bg-cyan-500'];
  const colorIndex = user.username.length % colors.length;
  const avatarColor = colors[colorIndex];
  const initial = user.username.charAt(0).toUpperCase();

  return (
    <div className="max-w-6xl mx-auto py-12 px-6 w-full">
      
      {/* Top Banner & Profile Info */}
      <div className="bg-slate-900/60 rounded-2xl border border-slate-700/50 p-8 shadow-xl backdrop-blur-md mb-8 flex items-center gap-8">
        <div className={`w-32 h-32 rounded-full flex items-center justify-center text-5xl font-bold text-white shadow-lg ${avatarColor}`}>
          {initial}
        </div>
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">{user.username}</h1>
          <div className="text-slate-400 flex items-center gap-2">
            <Clock size={16} /> Joined {new Date(user.joined_at).toLocaleDateString()}
          </div>
        </div>
        
        <div className="ml-auto flex gap-6">
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 text-center min-w-[140px]">
            <div className="text-slate-400 text-sm font-medium mb-1">Global Rank</div>
            <div className="text-3xl font-bold text-white flex items-center justify-center gap-2">
              <Medal className="text-yellow-400" size={28} /> {stats.global_rank || '-'}
            </div>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 text-center min-w-[140px]">
            <div className="text-slate-400 text-sm font-medium mb-1">Total Points</div>
            <div className="text-3xl font-bold text-cyan-400 font-mono">
              {stats.total_points}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-8">
        
        {/* Left Col: Stats */}
        <div className="col-span-1 space-y-8">
          <div className="bg-slate-900/60 rounded-2xl border border-slate-700/50 p-6 shadow-xl backdrop-blur-md">
            <h2 className="text-xl font-bold text-white mb-6">Problems Solved</h2>
            
            <div className="text-center mb-8">
              <div className="text-5xl font-bold text-white mb-1">{stats.total_solved}</div>
              <div className="text-slate-400 text-sm">Solved / {totals.total_problems} Total</div>
            </div>

            <div className="space-y-5">
              {/* Easy */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-easy font-medium">Easy</span>
                  <span className="text-slate-300">{stats.easy_solved} <span className="text-slate-500">/ {totals.total_easy}</span></span>
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-easy" style={{ width: `${easyPct}%` }}></div>
                </div>
              </div>

              {/* Medium */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-medium font-medium">Medium</span>
                  <span className="text-slate-300">{stats.medium_solved} <span className="text-slate-500">/ {totals.total_medium}</span></span>
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-medium" style={{ width: `${medPct}%` }}></div>
                </div>
              </div>

              {/* Hard */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-hard font-medium">Hard</span>
                  <span className="text-slate-300">{stats.hard_solved} <span className="text-slate-500">/ {totals.total_hard}</span></span>
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-hard" style={{ width: `${hardPct}%` }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Recent Activity */}
        <div className="col-span-2">
          <div className="bg-slate-900/60 rounded-2xl border border-slate-700/50 p-6 shadow-xl backdrop-blur-md h-full">
            <h2 className="text-xl font-bold text-white mb-6">Recent Accepted Submissions</h2>
            
            {recentActivity.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <Code2 className="mx-auto mb-4 opacity-50" size={48} />
                No recent activity.
              </div>
            ) : (
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <Link 
                    key={activity.id} 
                    to={`/problems/${activity.slug}`}
                    className="flex items-center justify-between p-4 bg-slate-800/40 hover:bg-slate-800 rounded-xl border border-slate-700/50 transition-colors group"
                  >
                    <div className="flex items-center gap-4">
                      <CheckCircle2 className="text-easy" size={24} />
                      <div>
                        <div className="font-semibold text-slate-200 group-hover:text-cyan-400 transition-colors">
                          {activity.title}
                        </div>
                        <div className="text-xs text-slate-500 mt-1 flex gap-3">
                          <span className="capitalize">{activity.language}</span>
                          <span>{new Date(activity.created_at).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full border 
                      ${activity.difficulty === 'Easy' ? 'text-easy bg-easy/10 border-easy/20' : 
                        activity.difficulty === 'Medium' ? 'text-medium bg-medium/10 border-medium/20' : 
                        'text-hard bg-hard/10 border-hard/20'}`}>
                      {activity.difficulty}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default ProfilePage;
