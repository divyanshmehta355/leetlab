import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Code2, ChevronRight, Activity } from 'lucide-react';

const HomePage = () => {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const response = await api.get('/problems');
        setProblems(response.data);
      } catch (error) {
        console.error('Failed to fetch problems', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProblems();
  }, []);

  const getDifficultyColor = (difficulty) => {
    switch(difficulty.toLowerCase()) {
      case 'easy': return 'text-easy bg-easy/10 border-easy/20';
      case 'medium': return 'text-medium bg-medium/10 border-medium/20';
      case 'hard': return 'text-hard bg-hard/10 border-hard/20';
      default: return 'text-text-muted bg-white/5 border-white/10';
    }
  };

  return (
    <div className="max-w-6xl mx-auto w-full p-8 flex flex-col gap-8">
      
      <header className="flex flex-col gap-4 items-center text-center py-12">
        <div className="p-4 rounded-full bg-brand/10 text-brand mb-4 ring-1 ring-brand/30 shadow-[0_0_30px_rgba(0,240,255,0.2)]">
          <Code2 size={40} />
        </div>
        <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-brand to-accent pb-2">
          Master Your Craft.
        </h1>
        <p className="text-lg text-text-muted max-w-2xl">
          Level up your coding skills with our curated collection of algorithmic challenges. Built for the modern developer.
        </p>
      </header>

      <section className="flex flex-col gap-4">
        <div className="flex items-center gap-2 mb-2">
          <Activity className="text-brand" />
          <h2 className="text-2xl font-bold">Trending Challenges</h2>
        </div>

        {loading ? (
          <div className="flex justify-center p-12">
            <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {problems.map((problem) => (
              <Link 
                key={problem.id} 
                to={`/problems/${problem.slug}`}
                className="glass glass-hover p-6 rounded-2xl flex flex-col gap-4 group cursor-pointer relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand/5 rounded-full blur-3xl -mr-10 -mt-10 transition-all group-hover:bg-brand/10"></div>
                
                <div className="flex justify-between items-start z-10">
                  <h3 className="text-xl font-bold text-text-main group-hover:text-brand transition-colors">
                    {problem.title}
                  </h3>
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getDifficultyColor(problem.difficulty)}`}>
                    {problem.difficulty}
                  </span>
                </div>
                
                <div className="flex-grow z-10">
                  {/* Truncated description preview could go here */}
                </div>

                <div className="flex items-center text-sm font-medium text-brand mt-4 z-10 opacity-0 transform translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                  Solve Problem <ChevronRight size={16} className="ml-1" />
                </div>
              </Link>
            ))}
            
            {problems.length === 0 && !loading && (
              <div className="col-span-full text-center p-12 glass rounded-2xl text-text-muted">
                No problems found. Did you run the database migrations?
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
};

export default HomePage;
