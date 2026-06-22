import { useState, useEffect } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { Edit2, Trash2, Plus, ArrowLeft } from 'lucide-react';

function AdminPage() {
  const navigate = useNavigate();
  const [view, setView] = useState('list'); // 'list' | 'form'
  const [problems, setProblems] = useState([]);
  const [editingId, setEditingId] = useState(null);
  
  // Form State
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [difficulty, setDifficulty] = useState('Easy');
  const [description, setDescription] = useState('');
  const [starterCodes, setStarterCodes] = useState({ javascript: '', python: '' });
  const [runnerBoilerplates, setRunnerBoilerplates] = useState({ javascript: '', python: '' });
  const [testcases, setTestcases] = useState([{ input: '', expected_output: '' }]);
  const [message, setMessage] = useState('');

  // Language Tab State
  const [activeTab, setActiveTab] = useState('javascript');

  useEffect(() => {
    if (view === 'list') {
      fetchProblems();
    }
  }, [view]);

  const fetchProblems = async () => {
    try {
      const res = await api.get('/admin/problems');
      setProblems(res.data);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        setMessage('Unauthorized. You must be an admin to view this page.');
      }
    }
  };

  const resetForm = () => {
    setTitle('');
    setSlug('');
    setDifficulty('Easy');
    setDescription('');
    setStarterCodes({ javascript: '', python: '' });
    setRunnerBoilerplates({ javascript: '', python: '' });
    setTestcases([{ input: '', expected_output: '' }]);
    setEditingId(null);
    setMessage('');
    setActiveTab('javascript');
  };

  const openCreateForm = () => {
    resetForm();
    setView('form');
  };

  const openEditForm = async (id) => {
    setMessage('');
    try {
      const res = await api.get(`/admin/problems/${id}`);
      const p = res.data;
      setTitle(p.title);
      setSlug(p.slug);
      setDifficulty(p.difficulty);
      setDescription(p.description);
      setStarterCodes(p.starter_codes || { javascript: '', python: '' });
      setRunnerBoilerplates(p.runner_boilerplates || { javascript: '', python: '' });
      setTestcases(p.testcases?.length ? p.testcases : [{ input: '', expected_output: '' }]);
      setEditingId(p.id);
      setActiveTab('javascript');
      setView('form');
    } catch (err) {
      console.error(err);
      setMessage('Failed to fetch problem details.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this problem?')) return;
    try {
      await api.delete(`/admin/problems/${id}`);
      fetchProblems();
    } catch (err) {
      console.error(err);
      setMessage('Failed to delete problem.');
    }
  };

  const addTestcase = () => setTestcases([...testcases, { input: '', expected_output: '' }]);
  
  const handleTestcaseChange = (index, field, value) => {
    const updated = [...testcases];
    updated[index][field] = value;
    setTestcases(updated);
  };

  const removeTestcase = (index) => setTestcases(testcases.filter((_, i) => i !== index));

  const handleStarterCodeChange = (lang, value) => {
    setStarterCodes(prev => ({ ...prev, [lang]: value }));
  };

  const handleRunnerBoilerplateChange = (lang, value) => {
    setRunnerBoilerplates(prev => ({ ...prev, [lang]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    
    try {
      const payload = { title, slug, difficulty, description, starter_codes: starterCodes, runner_boilerplates: runnerBoilerplates };
      let problemId = editingId;

      if (editingId) {
        await api.put(`/admin/problems/${editingId}`, payload);
      } else {
        const res = await api.post('/admin/problems', payload);
        problemId = res.data.id;
      }

      for (const tc of testcases) {
        if (tc.input && tc.expected_output) {
          await api.post(`/admin/problems/${problemId}/testcases`, tc);
        }
      }

      setMessage(editingId ? 'Problem updated successfully!' : 'Problem created successfully!');
      setTimeout(() => setView('list'), 1500);
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.error || 'Failed to save problem.');
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-12 px-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-cyan-400">Admin Dashboard</h1>
        {view === 'form' && (
          <button onClick={() => setView('list')} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
            <ArrowLeft size={20} /> Back to List
          </button>
        )}
      </div>

      {message && (
        <div className="mb-6 p-4 rounded bg-slate-800 text-cyan-400 border border-cyan-500/30 font-mono">
          {message}
        </div>
      )}

      {view === 'list' ? (
        <div className="space-y-6">
          <div className="flex justify-end">
            <button onClick={openCreateForm} className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded-lg shadow-lg shadow-cyan-500/20 transition-all">
              <Plus size={20} /> Create New Problem
            </button>
          </div>
          
          <div className="bg-slate-900/50 rounded-xl border border-slate-700 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-800/50 border-b border-slate-700 text-slate-400">
                  <th className="py-3 px-6">ID</th>
                  <th className="py-3 px-6">Title</th>
                  <th className="py-3 px-6">Difficulty</th>
                  <th className="py-3 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {problems.map(p => (
                  <tr key={p.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-6 text-slate-500">{p.id}</td>
                    <td className="py-3 px-6 text-white font-medium">{p.title}</td>
                    <td className="py-3 px-6 text-slate-400">{p.difficulty}</td>
                    <td className="py-3 px-6 flex justify-end gap-3">
                      <button onClick={() => openEditForm(p.id)} className="p-2 text-slate-400 hover:text-cyan-400 bg-slate-800 hover:bg-slate-700 rounded transition-colors">
                        <Edit2 size={18} />
                      </button>
                      <button onClick={() => handleDelete(p.id)} className="p-2 text-slate-400 hover:text-red-400 bg-slate-800 hover:bg-slate-700 rounded transition-colors">
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
                {problems.length === 0 && (
                  <tr>
                    <td colSpan="4" className="py-8 text-center text-slate-500">No problems found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 space-y-4">
            <h2 className="text-xl font-semibold mb-4 text-white">Problem Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Title</label>
                <input type="text" value={title} onChange={e => setTitle(e.target.value)} required className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Slug</label>
                <input type="text" value={slug} onChange={e => setSlug(e.target.value)} required className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Difficulty</label>
              <select value={difficulty} onChange={e => setDifficulty(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white">
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Description (Markdown / HTML)</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} required rows={4} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white font-mono"></textarea>
            </div>
          </div>

          <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 space-y-4">
            <h2 className="text-xl font-semibold mb-4 text-white">Language Specific Configuration</h2>
            
            <div className="flex gap-2 border-b border-slate-700 mb-4 pb-2">
              <button 
                type="button"
                onClick={() => setActiveTab('javascript')}
                className={`px-4 py-2 rounded font-medium transition-colors ${activeTab === 'javascript' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                JavaScript
              </button>
              <button 
                type="button"
                onClick={() => setActiveTab('python')}
                className={`px-4 py-2 rounded font-medium transition-colors ${activeTab === 'python' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                Python
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Starter Code (User sees this)</label>
              <textarea 
                value={starterCodes[activeTab] || ''} 
                onChange={e => handleStarterCodeChange(activeTab, e.target.value)} 
                rows={4} 
                className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white font-mono"
              ></textarea>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Runner Boilerplate (Hidden)</label>
              <textarea 
                value={runnerBoilerplates[activeTab] || ''} 
                onChange={e => handleRunnerBoilerplateChange(activeTab, e.target.value)} 
                rows={6} 
                className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white font-mono"
              ></textarea>
            </div>
          </div>

          <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-white">Test Cases</h2>
              <button type="button" onClick={addTestcase} className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded text-sm transition-colors">+ Add Test Case</button>
            </div>
            {testcases.map((tc, index) => (
              <div key={index} className="flex gap-4 items-start p-4 bg-slate-900/50 rounded border border-slate-700/50">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-slate-500 mb-1">Input (Raw text)</label>
                  <textarea value={tc.input} onChange={e => handleTestcaseChange(index, 'input', e.target.value)} rows={2} className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white font-mono text-sm"></textarea>
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-medium text-slate-500 mb-1">Expected Output</label>
                  <textarea value={tc.expected_output} onChange={e => handleTestcaseChange(index, 'expected_output', e.target.value)} rows={2} className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white font-mono text-sm"></textarea>
                </div>
                <button type="button" onClick={() => removeTestcase(index)} className="mt-6 text-red-400 hover:text-red-300 p-2">✕</button>
              </div>
            ))}
          </div>

          <button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-cyan-500/20 transition-all">
            {editingId ? 'Save Changes' : 'Create Problem'}
          </button>
        </form>
      )}
    </div>
  );
}

export default AdminPage;
