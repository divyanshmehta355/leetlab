import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { CheckCircle, Circle } from 'lucide-react';

const ProblemSetPage = () => {
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
    switch(difficulty?.toLowerCase()) {
      case 'easy': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'hard': return 'text-red-400';
      default: return 'text-slate-400';
    }
  };

  return (
    <div className="max-w-6xl mx-auto w-full p-8 flex flex-col gap-6">
      <div className="mb-4">
        <h1 className="text-3xl font-bold text-white mb-2">Problem Set</h1>
        <p className="text-slate-400">Enhance your skills by solving our curated list of algorithmic challenges.</p>
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
              {problems.map((problem, idx) => (
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
                      {idx + 1}. {problem.title}
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
              
              {problems.length === 0 && (
                <tr>
                  <td colSpan="4" className="py-12 text-center text-slate-500">
                    No problems found. Check the Admin panel.
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
