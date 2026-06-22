import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function AdminPage() {
  const navigate = useNavigate();
  const [secret, setSecret] = useState(localStorage.getItem('adminSecret') || '');
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [difficulty, setDifficulty] = useState('Easy');
  const [description, setDescription] = useState('');
  const [starterCode, setStarterCode] = useState('');
  const [runnerBoilerplate, setRunnerBoilerplate] = useState('');
  const [testcases, setTestcases] = useState([{ input: '', expected_output: '' }]);
  const [message, setMessage] = useState('');

  const handleSecretChange = (e) => {
    setSecret(e.target.value);
    localStorage.setItem('adminSecret', e.target.value);
  };

  const addTestcase = () => {
    setTestcases([...testcases, { input: '', expected_output: '' }]);
  };

  const handleTestcaseChange = (index, field, value) => {
    const updated = [...testcases];
    updated[index][field] = value;
    setTestcases(updated);
  };

  const removeTestcase = (index) => {
    const updated = testcases.filter((_, i) => i !== index);
    setTestcases(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    
    try {
      // 1. Create Problem
      const res = await axios.post(
        'http://localhost:3000/api/admin/problems',
        { title, slug, difficulty, description, starter_code: starterCode, runner_boilerplate_js: runnerBoilerplate },
        { headers: { 'x-admin-secret': secret } }
      );
      
      const problemId = res.data.id;

      // 2. Add Testcases
      for (const tc of testcases) {
        if (tc.input && tc.expected_output) {
          await axios.post(
            `http://localhost:3000/api/admin/problems/${problemId}/testcases`,
            tc,
            { headers: { 'x-admin-secret': secret } }
          );
        }
      }

      setMessage('Problem and testcases created successfully!');
      setTimeout(() => navigate('/'), 2000);
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.error || 'Failed to create problem.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <h1 className="text-3xl font-bold mb-8 text-cyan-400">Admin Panel - Add Problem</h1>
      
      {message && (
        <div className="mb-6 p-4 rounded bg-slate-800 text-green-400 font-mono">
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
          <h2 className="text-xl font-semibold mb-4 text-white">Authentication</h2>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Admin Secret</label>
            <input
              type="password"
              value={secret}
              onChange={handleSecretChange}
              className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white"
              placeholder="Enter Admin Secret..."
              required
            />
          </div>
        </div>

        <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 space-y-4">
          <h2 className="text-xl font-semibold mb-4 text-white">Problem Details</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Title</label>
              <input type="text" value={title} onChange={e => setTitle(e.target.value)} required className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white" placeholder="e.g. Reverse String" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Slug</label>
              <input type="text" value={slug} onChange={e => setSlug(e.target.value)} required className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white" placeholder="e.g. reverse-string" />
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
            <textarea value={description} onChange={e => setDescription(e.target.value)} required rows={4} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white font-mono" placeholder="Problem description..."></textarea>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Starter Code (User sees this)</label>
            <textarea value={starterCode} onChange={e => setStarterCode(e.target.value)} required rows={4} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white font-mono" placeholder="function reverseString(s) {&#10;  // Write code here&#10;}"></textarea>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Runner Boilerplate (JS) (Hidden)</label>
            <textarea value={runnerBoilerplate} onChange={e => setRunnerBoilerplate(e.target.value)} required rows={6} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white font-mono" placeholder="const fs = require('fs');&#10;const input = fs.readFileSync(0, 'utf-8');&#10;console.log(reverseString(input));"></textarea>
          </div>
        </div>

        <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-white">Test Cases</h2>
            <button type="button" onClick={addTestcase} className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded text-sm transition-colors">
              + Add Test Case
            </button>
          </div>

          {testcases.map((tc, index) => (
            <div key={index} className="flex gap-4 items-start p-4 bg-slate-900/50 rounded border border-slate-700/50">
              <div className="flex-1">
                <label className="block text-xs font-medium text-slate-500 mb-1">Input (Raw text)</label>
                <textarea value={tc.input} onChange={e => handleTestcaseChange(index, 'input', e.target.value)} rows={2} className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white font-mono text-sm" placeholder="Input..."></textarea>
              </div>
              <div className="flex-1">
                <label className="block text-xs font-medium text-slate-500 mb-1">Expected Output (Exact string match)</label>
                <textarea value={tc.expected_output} onChange={e => handleTestcaseChange(index, 'expected_output', e.target.value)} rows={2} className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white font-mono text-sm" placeholder="Output..."></textarea>
              </div>
              <button type="button" onClick={() => removeTestcase(index)} className="mt-6 text-red-400 hover:text-red-300 p-2">
                ✕
              </button>
            </div>
          ))}
        </div>

        <button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-cyan-500/20 transition-all">
          Create Problem
        </button>
      </form>
    </div>
  );
}

export default AdminPage;
