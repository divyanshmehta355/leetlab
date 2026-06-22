import { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { Circle, ChevronLeft, ChevronRight, Search, Filter } from 'lucide-react';

const ProblemSetPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [problems, setProblems] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, totalCount: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);

  // Read state from URL search params so pagination is shareable/bookmarkable
  const currentPage = parseInt(searchParams.get('page')) || 1;
  const searchQuery = searchParams.get('search') || '';
  const difficultyFilter = searchParams.get('difficulty') || '';

  const fetchProblems = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', currentPage);
      params.set('limit', 20);
      if (searchQuery) params.set('search', searchQuery);
      if (difficultyFilter) params.set('difficulty', difficultyFilter);

      const response = await api.get(`/problems?${params.toString()}`);
      setProblems(response.data.problems);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Failed to fetch problems', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchQuery, difficultyFilter]);

  useEffect(() => {
    fetchProblems();
  }, [fetchProblems]);

  // Helper to update URL params without losing existing ones
  const updateParams = (updates) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        newParams.set(key, value);
      } else {
        newParams.delete(key);
      }
    });
    setSearchParams(newParams);
  };

  const handleSearch = (e) => {
    updateParams({ search: e.target.value, page: '1' }); // Reset to page 1 on new search
  };

  const handleDifficultyFilter = (difficulty) => {
    updateParams({ 
      difficulty: difficultyFilter === difficulty ? '' : difficulty, // Toggle
      page: '1' 
    });
  };

  const goToPage = (page) => {
    updateParams({ page: String(page) });
  };

  const getDifficultyColor = (difficulty) => {
    switch(difficulty?.toLowerCase()) {
      case 'easy': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'hard': return 'text-red-400';
      default: return 'text-slate-400';
    }
  };

  const getDifficultyBg = (difficulty) => {
    switch(difficulty?.toLowerCase()) {
      case 'easy': return 'bg-green-400/10 border-green-400/30 text-green-400';
      case 'medium': return 'bg-yellow-400/10 border-yellow-400/30 text-yellow-400';
      case 'hard': return 'bg-red-400/10 border-red-400/30 text-red-400';
      default: return '';
    }
  };

  // Calculate the problem's global number (not just index within current page)
  const getGlobalIndex = (idx) => (currentPage - 1) * pagination.limit + idx + 1;

  // Generate page numbers to display (e.g., 1 ... 4 5 [6] 7 8 ... 20)
  const getPageNumbers = () => {
    const total = pagination.totalPages;
    const current = currentPage;
    const pages = [];
    
    if (total <= 7) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else {
      pages.push(1);
      if (current > 3) pages.push('...');
      for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
        pages.push(i);
      }
      if (current < total - 2) pages.push('...');
      pages.push(total);
    }
    return pages;
  };

  return (
    <div className="max-w-6xl mx-auto w-full p-8 flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Problem Set</h1>
        <p className="text-slate-400">Enhance your skills by solving our curated list of algorithmic challenges.</p>
      </div>

      {/* Search & Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input 
            type="text" 
            placeholder="Search problems by title..." 
            value={searchQuery}
            onChange={handleSearch}
            className="w-full bg-[#0f111a] border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all placeholder-slate-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-slate-500" />
          {['Easy', 'Medium', 'Hard'].map(d => (
            <button 
              key={d}
              onClick={() => handleDifficultyFilter(d)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                difficultyFilter === d 
                  ? getDifficultyBg(d) 
                  : 'border-white/10 text-slate-400 hover:border-white/20 hover:text-slate-300'
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Problem Table */}
      {loading ? (
        <div className="flex justify-center p-12">
          <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
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
                      <Circle className="inline-block text-slate-600 w-5 h-5" />
                    </td>
                    <td className="py-4 px-6">
                      <Link 
                        to={`/problems/${problem.slug}`} 
                        className="text-white hover:text-cyan-400 font-medium transition-colors"
                      >
                        {getGlobalIndex(idx)}. {problem.title}
                      </Link>
                    </td>
                    <td className="py-4 px-6 text-slate-300">
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
                      {searchQuery || difficultyFilter ? 'No problems match your filters.' : 'No problems found. Check the Admin panel.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500">
                Showing <span className="text-slate-300 font-medium">{(currentPage - 1) * pagination.limit + 1}</span>–<span className="text-slate-300 font-medium">{Math.min(currentPage * pagination.limit, pagination.totalCount)}</span> of <span className="text-slate-300 font-medium">{pagination.totalCount}</span> problems
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={18} />
                </button>
                {getPageNumbers().map((pageNum, idx) => (
                  pageNum === '...' ? (
                    <span key={`ellipsis-${idx}`} className="px-2 text-slate-600">…</span>
                  ) : (
                    <button
                      key={pageNum}
                      onClick={() => goToPage(pageNum)}
                      className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${
                        pageNum === currentPage 
                          ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-[0_0_10px_rgba(34,211,238,0.2)]' 
                          : 'text-slate-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      {pageNum}
                    </button>
                  )
                ))}
                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === pagination.totalPages}
                  className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ProblemSetPage;
