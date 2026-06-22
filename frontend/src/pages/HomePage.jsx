import { Link } from 'react-router-dom';
import { Code2, Zap, Shield, ChevronRight } from 'lucide-react';

const HomePage = () => {
  return (
    <div className="flex flex-col w-full">
      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center min-h-[70vh] text-center px-6 overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="relative z-10 flex flex-col items-center gap-6 max-w-4xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-sm font-medium mb-4">
            <Code2 size={16} />
            <span>LeetLab v1.0 is Live</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-white via-slate-200 to-slate-500 leading-tight pb-2">
            Master Algorithms.<br />Nail the Interview.
          </h1>
          
          <p className="text-xl text-slate-400 max-w-2xl mt-4">
            A premium, ultra-fast competitive programming environment built for modern developers. Practice coding challenges in a frictionless editor.
          </p>

          <div className="flex items-center gap-4 mt-8">
            <Link 
              to="/problems" 
              className="group flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-8 py-4 rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)]"
            >
              Explore Problems <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              to="/auth" 
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-8 py-4 rounded-xl font-bold transition-all border border-slate-700 hover:border-slate-600"
            >
              Create Account
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-6xl mx-auto w-full px-6 py-24 border-t border-slate-800/50">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col gap-4 p-8 rounded-2xl bg-slate-900/50 border border-slate-800/50 hover:border-slate-700/50 transition-colors">
            <div className="w-12 h-12 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-2">
              <Zap size={24} />
            </div>
            <h3 className="text-xl font-bold text-white">Lightning Fast</h3>
            <p className="text-slate-400 leading-relaxed">
              Powered by advanced execution engines, your code runs and evaluates in milliseconds, keeping you in the flow.
            </p>
          </div>

          <div className="flex flex-col gap-4 p-8 rounded-2xl bg-slate-900/50 border border-slate-800/50 hover:border-slate-700/50 transition-colors">
            <div className="w-12 h-12 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center mb-2">
              <Code2 size={24} />
            </div>
            <h3 className="text-xl font-bold text-white">Monaco Editor</h3>
            <p className="text-slate-400 leading-relaxed">
              Experience the exact same editor engine as VS Code, complete with syntax highlighting and auto-closing brackets.
            </p>
          </div>

          <div className="flex flex-col gap-4 p-8 rounded-2xl bg-slate-900/50 border border-slate-800/50 hover:border-slate-700/50 transition-colors">
            <div className="w-12 h-12 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-2">
              <Shield size={24} />
            </div>
            <h3 className="text-xl font-bold text-white">Secure Execution</h3>
            <p className="text-slate-400 leading-relaxed">
              Your submissions run inside strictly isolated sandboxes, ensuring consistent, secure, and reliable evaluations every time.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
