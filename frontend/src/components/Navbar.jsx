import { Link, useNavigate } from 'react-router-dom';
import { Terminal, LogOut, User } from 'lucide-react';

const Navbar = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/auth');
  };

  return (
    <nav className="glass sticky top-0 z-50 py-4 px-6 flex justify-between items-center shadow-lg shadow-black/20">
      <Link to="/" className="flex items-center gap-2 text-brand hover:text-brand-hover transition-colors">
        <Terminal size={28} />
        <span className="text-xl font-bold tracking-wider">LeetLab</span>
      </Link>
      
      <div className="flex items-center gap-4">
        <Link to="/admin" className="text-slate-400 hover:text-cyan-400 font-medium transition-colors">
          Admin Panel
        </Link>
        {token ? (
          <>
            <div className="flex items-center gap-2 text-text-muted">
              <User size={18} />
              <span className="text-sm font-medium">Developer</span>
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
