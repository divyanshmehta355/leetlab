import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import api from '../services/api';
import { Play, CheckCircle2, XCircle, AlertCircle, Loader2 } from 'lucide-react';

const ProblemPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [problem, setProblem] = useState(null);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProblem = async () => {
      try {
        const response = await api.get(`/problems/${slug}`);
        setProblem(response.data);
        setCode(response.data.starter_code || '// Write your code here\n');
      } catch (err) {
        setError('Problem not found.');
      }
    };
    fetchProblem();
  }, [slug]);

  const handleSubmit = async () => {
    if (!localStorage.getItem('token')) {
      navigate('/auth');
      return;
    }

    setSubmitting(true);
    setResult(null);
    try {
      // 1. Submit Code
      const submitRes = await api.post('/submissions', {
        problemId: problem.id,
        language,
        code
      });

      const submissionId = submitRes.data.id;

      // 2. Poll for results
      const pollInterval = setInterval(async () => {
        try {
          const statusRes = await api.get(`/submissions/${submissionId}`);
          if (statusRes.data.status !== 'Pending') {
            clearInterval(pollInterval);
            setResult(statusRes.data);
            setSubmitting(false);
          }
        } catch (pollErr) {
          clearInterval(pollInterval);
          setSubmitting(false);
          setError('Failed to fetch submission status.');
        }
      }, 1000);

    } catch (err) {
      setSubmitting(false);
      setError(err.response?.data?.error || 'Failed to submit code.');
    }
  };

  if (error) return <div className="p-8 text-red-400">{error}</div>;
  if (!problem) return <div className="p-8 text-text-muted flex items-center gap-2"><Loader2 className="animate-spin"/> Loading...</div>;

  return (
    <div className="flex-grow flex overflow-hidden">
      
      {/* Left Panel: Problem Description */}
      <div className="w-1/2 p-6 overflow-y-auto border-r border-white/5 custom-scrollbar">
        <h1 className="text-3xl font-bold mb-2">{problem.title}</h1>
        <div className="mb-6 flex items-center gap-3">
          <span className={`px-3 py-1 text-xs font-semibold rounded-full border 
            ${problem.difficulty === 'Easy' ? 'text-easy bg-easy/10 border-easy/20' : 
              problem.difficulty === 'Medium' ? 'text-medium bg-medium/10 border-medium/20' : 
              'text-hard bg-hard/10 border-hard/20'}`}>
            {problem.difficulty}
          </span>
        </div>
        
        <div className="prose prose-invert max-w-none text-text-main/90" 
             dangerouslySetInnerHTML={{ __html: problem.description }} />
      </div>

      {/* Right Panel: Code Editor & Console */}
      <div className="w-1/2 flex flex-col bg-[#1e1e1e]">
        {/* Editor Header */}
        <div className="h-12 bg-[#252526] flex items-center justify-between px-4 border-b border-black/40">
          <select 
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-[#3c3c3c] text-white text-sm rounded px-2 py-1 outline-none focus:ring-1 focus:ring-brand"
          >
            <option value="javascript">JavaScript (Node.js)</option>
            <option value="python">Python 3</option>
          </select>
          
          <button 
            onClick={handleSubmit}
            disabled={submitting}
            className="flex items-center gap-2 bg-brand/10 hover:bg-brand/20 text-brand px-4 py-1.5 rounded text-sm font-semibold transition-colors disabled:opacity-50"
          >
            {submitting ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
            Run Code
          </button>
        </div>

        {/* Editor */}
        <div className="flex-grow">
          <Editor
            height="100%"
            language={language}
            theme="vs-dark"
            value={code}
            onChange={(val) => setCode(val)}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              fontFamily: "'Fira Code', 'JetBrains Mono', monospace",
              padding: { top: 16 },
              scrollBeyondLastLine: false,
            }}
          />
        </div>

        {/* Terminal/Console Output */}
        <div className="h-64 bg-[#1e1e1e] border-t border-[#3c3c3c] flex flex-col">
          <div className="px-4 py-2 bg-[#252526] text-xs font-semibold text-text-muted flex items-center gap-2 uppercase tracking-wider">
            Execution Console
          </div>
          <div className="p-4 flex-grow overflow-y-auto font-mono text-sm">
            {!result && !submitting && (
              <span className="text-[#808080]">Ready. Click Run Code to evaluate.</span>
            )}
            
            {submitting && (
              <div className="flex items-center gap-2 text-brand">
                <Loader2 size={16} className="animate-spin" /> 
                Evaluating against test cases...
              </div>
            )}

            {result && (
              <div className="flex flex-col gap-2 animate-in fade-in slide-in-from-bottom-2">
                <div className="flex items-center gap-2 text-lg font-bold">
                  {result.status === 'Accepted' && <><CheckCircle2 className="text-easy" /> <span className="text-easy">Accepted</span></>}
                  {result.status === 'Wrong Answer' && <><XCircle className="text-hard" /> <span className="text-hard">Wrong Answer</span></>}
                  {result.status === 'Error' && <><AlertCircle className="text-medium" /> <span className="text-medium">Runtime Error</span></>}
                </div>
                <div className="text-[#808080] text-xs mt-1 flex gap-4">
                  <span>Runtime: {result.execution_time_ms || 0} ms</span>
                  <span>Memory: {result.memory_used_kb || 0} KB</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProblemPage;
