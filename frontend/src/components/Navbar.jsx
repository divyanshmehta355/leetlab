import { Link, useNavigate } from 'react-router-dom';
import { Code2, LogOut, User, Trophy } from 'lucide-react';

const Navbar = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/auth');
  };

  return (
    <nav className="flex items-center justify-between p-4 border-b border-white/5 bg-background-main/50 backdrop-blur-md sticky top-0 z-50">
      <div className="flex items-center gap-8">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="p-1.5 rounded-lg bg-brand/10 text-brand group-hover:bg-brand/20 transition-colors">
            <Code2 size={24} />
          </div>
          <span className="font-bold text-xl tracking-tight text-white">Leet<span className="text-brand">Lab</span></span>
        </Link>
        
        <div className="hidden md:flex items-center gap-6">
            <Link to="/problems" className="text-text-muted hover:text-white transition-colors text-sm font-medium">
              Problems
            </Link>
            <Link to="/leaderboard" className="flex items-center gap-1.5 text-text-muted hover:text-yellow-400 transition-colors text-sm font-medium">
              <Trophy size={16} /> Leaderboard
            </Link>
          <Link to="/explore" className="text-slate-400 hover:text-white font-medium transition-colors">
            Explore
          </Link>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        {user?.role === 'admin' && (
          <Link to="/admin" className="text-slate-400 hover:text-cyan-400 font-medium transition-colors">
            Admin Panel
          </Link>
        )}
        {token && user ? (
          <>
            <div className="flex items-center gap-2 text-text-muted">
              <User size={18} />
              <span className="text-sm font-medium capitalize">{user.role}</span>
            </div>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-text-main bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-all"
            >
              <LogOut size={16} />
              Logout
            </button>
          </>
        ) : (
          <Link 
            to="/auth"
            className="px-5 py-2 text-sm font-medium text-bg-main bg-brand hover:bg-brand-hover rounded-lg transition-all shadow-[0_0_15px_rgba(0,240,255,0.4)] hover:shadow-[0_0_25px_rgba(0,240,255,0.6)]"
          >
            Sign In
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
