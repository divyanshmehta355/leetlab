import { useState } from 'react';
import api from '../services/api';
import Editor from '@monaco-editor/react';

const SolutionForm = ({ problemId, onSuccess }) => {
  const [title, setTitle] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [content, setContent] = useState('Write an explanation of your approach here...\n\n```javascript\n// Your code here\n```');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!localStorage.getItem('token')) {
      setError('You must be logged in to post a solution.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await api.post(`/problems/${problemId}/solutions`, {
        title,
        content,
        language
      });
      setTitle('');
      setContent('');
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to post solution.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-slate-900/50 p-6 rounded-xl border border-slate-800 space-y-4">
      <h3 className="text-lg font-semibold text-white">Share your Solution</h3>
      
      {error && <div className="text-red-400 text-sm">{error}</div>}

      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2">
          <label className="block text-xs font-medium text-slate-400 mb-1">Title</label>
          <input 
            type="text" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            placeholder="e.g. Clean O(N) JavaScript Solution"
            required 
            className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white text-sm" 
          />
        </div>
        <div className="col-span-1">
          <label className="block text-xs font-medium text-slate-400 mb-1">Language</label>
          <select 
            value={language} 
            onChange={(e) => setLanguage(e.target.value)} 
            className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white text-sm"
          >
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
            <option value="c++">C++</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-400 mb-1">Explanation & Code (Markdown)</label>
        <div className="h-64 border border-slate-700 rounded overflow-hidden">
          <Editor
            height="100%"
            language="markdown"
            theme="vs-dark"
            value={content}
            onChange={(val) => setContent(val)}
            options={{ minimap: { enabled: false }, fontSize: 14, wordWrap: 'on' }}
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button 
          type="submit" 
          disabled={submitting}
          className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-6 rounded-lg transition-colors disabled:opacity-50"
        >
          {submitting ? 'Posting...' : 'Post Solution'}
        </button>
      </div>
    </form>
  );
};

export default SolutionForm;
