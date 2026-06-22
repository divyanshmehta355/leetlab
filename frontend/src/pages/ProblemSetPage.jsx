import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { CheckCircle, Circle } from 'lucide-react';

const ProblemSetPage = () => {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

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
    switch(difficulty?.toLowerCase()) {
      case 'easy': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'hard': return 'text-red-400';
      default: return 'text-slate-400';
    }
  };

  const filteredProblems = problems.filter(problem => 
    problem.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    problem.difficulty.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto w-full p-8 flex flex-col gap-6">
      <div className="mb-4 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Problem Set</h1>
          <p className="text-slate-400">Enhance your skills by solving our curated list of algorithmic challenges.</p>
        </div>
        <div className="w-64">
          <input 
            type="text" 
            placeholder="Search problems..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0f111a] border border-white/10 rounded-lg p-2.5 text-white text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all placeholder-slate-500"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="bg-slate-900/50 rounded-xl border border-slate-700/50 overflow-hidden shadow-xl shadow-black/50">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-700/50 text-slate-400 text-sm font-semibold uppercase tracking-wider bg-slate-800/30">
                <th className="py-4 px-6 w-16 text-center">Status</th>
                <th className="py-4 px-6">Title</th>
                <th className="py-4 px-6 w-32">Acceptance</th>
                <th className="py-4 px-6 w-32">Difficulty</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {filteredProblems.map((problem, idx) => (
                <tr key={problem.id} className="hover:bg-slate-800/40 transition-colors group">
                  <td className="py-4 px-6 text-center">
                    {/* Mocked Status: Using empty circle for unsolved */}
                    <Circle className="inline-block text-slate-600 w-5 h-5" />
                  </td>
                  <td className="py-4 px-6">
                    <Link 
                      to={`/problems/${problem.slug}`} 
                      className="text-white hover:text-cyan-400 font-medium transition-colors"
                    >
                      {problems.findIndex(p => p.id === problem.id) + 1}. {problem.title}
                    </Link>
                  </td>
                  <td className="py-4 px-6 text-slate-300">
                    {/* Mocked Acceptance Rate based on difficulty */}
                    {problem.difficulty === 'Easy' ? '65.2%' : problem.difficulty === 'Medium' ? '42.8%' : '21.5%'}
                  </td>
                  <td className={`py-4 px-6 font-medium ${getDifficultyColor(problem.difficulty)}`}>
                    {problem.difficulty}
                  </td>
                </tr>
              ))}
              
              {filteredProblems.length === 0 && (
                <tr>
                  <td colSpan="4" className="py-12 text-center text-slate-500">
                    {problems.length === 0 ? 'No problems found. Check the Admin panel.' : 'No problems match your search.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ProblemSetPage;
