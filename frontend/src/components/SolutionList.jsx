import { useState, useEffect } from 'react';
import api from '../services/api';
import { ThumbsUp, MessageSquare, Loader2, Code2, User } from 'lucide-react';

const SolutionList = ({ problemId, refreshTrigger }) => {
  const [solutions, setSolutions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSolutions = async () => {
    try {
      const res = await api.get(`/problems/${problemId}/solutions`);
      setSolutions(res.data);
    } catch (err) {
      console.error('Failed to load solutions', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSolutions();
  }, [problemId, refreshTrigger]);

  const toggleUpvote = async (solutionId, index) => {
    if (!localStorage.getItem('token')) {
      alert('You must be logged in to upvote!');
      return;
    }

    try {
      const res = await api.post(`/solutions/${solutionId}/upvote`);
      const { upvoted } = res.data;
      
      const newSolutions = [...solutions];
      newSolutions[index].has_upvoted = upvoted ? 1 : 0;
      newSolutions[index].upvotes += upvoted ? 1 : -1;
      setSolutions(newSolutions);
    } catch (err) {
      console.error('Failed to upvote', err);
    }
  };

  if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-cyan-400" /></div>;

  if (solutions.length === 0) {
    return (
      <div className="text-center p-12 bg-slate-900/50 rounded-xl border border-slate-800">
        <MessageSquare className="mx-auto text-slate-500 mb-4" size={32} />
        <h3 className="text-lg font-medium text-slate-300">No solutions yet</h3>
        <p className="text-slate-500 text-sm mt-2">Be the first to share your approach!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {solutions.map((sol, idx) => (
        <div key={sol.id} className="bg-slate-900/80 rounded-xl border border-slate-700/50 p-5 shadow-lg">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-bold text-white mb-2">{sol.title}</h3>
              <div className="flex items-center gap-3 text-sm text-slate-400">
                <span className="flex items-center gap-1 bg-slate-800 px-2 py-1 rounded">
                  <User size={14} /> {sol.username}
                </span>
                <span className="flex items-center gap-1 bg-cyan-900/30 text-cyan-400 px-2 py-1 rounded border border-cyan-800/50">
                  <Code2 size={14} /> {sol.language}
                </span>
                <span>{new Date(sol.created_at).toLocaleDateString()}</span>
              </div>
            </div>
            
            <button 
              onClick={() => toggleUpvote(sol.id, idx)}
              className={`flex flex-col items-center justify-center p-2 rounded-lg border transition-all ${
                sol.has_upvoted 
                  ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400' 
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-300'
              }`}
            >
              <ThumbsUp size={18} className={sol.has_upvoted ? 'fill-current' : ''} />
              <span className="text-xs font-bold mt-1">{sol.upvotes}</span>
            </button>
          </div>
          
          <div className="prose prose-invert max-w-none prose-pre:bg-[#1e1e1e] prose-pre:border prose-pre:border-slate-700 text-slate-300"
               dangerouslySetInnerHTML={{ __html: sol.content }} />
        </div>
      ))}
    </div>
  );
};

export default SolutionList;
