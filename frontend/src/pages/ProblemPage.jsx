import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import api from '../services/api';
import { Play, CheckCircle2, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import SolutionList from '../components/SolutionList';
import SolutionForm from '../components/SolutionForm';

const ProblemPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [problem, setProblem] = useState(null);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const [activeTab, setActiveTab] = useState('description');
  const [showSolutionForm, setShowSolutionForm] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const fetchProblem = async () => {
      try {
        const response = await api.get(`/problems/${slug}`);
        setProblem(response.data);
        const starter = response.data.starter_codes?.javascript || '// Write your code here\n';
        setCode(starter);
      } catch (err) {
        setError('Problem not found.');
      }
    };
    fetchProblem();
  }, [slug]);

  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    setLanguage(newLang);
    if (problem && problem.starter_codes && problem.starter_codes[newLang]) {
      setCode(problem.starter_codes[newLang]);
    } else {
      setCode('// Write your code here\n');
    }
  };

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
      
      {/* Left Panel: Tabs */}
      <div className="w-1/2 overflow-y-auto border-r border-white/5 custom-scrollbar flex flex-col bg-[#0f111a]">
        
        {/* Tab Navigation */}
        <div className="flex border-b border-white/10 bg-[#151822]">
          <button 
            onClick={() => setActiveTab('description')}
            className={`flex items-center gap-2 px-6 py-4 font-medium text-sm transition-colors ${activeTab === 'description' ? 'border-b-2 border-brand text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>
            Description
          </button>
          <button 
            onClick={() => setActiveTab('solutions')}
            className={`flex items-center gap-2 px-6 py-4 font-medium text-sm transition-colors ${activeTab === 'solutions' ? 'border-b-2 border-brand text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            Solutions
          </button>
        </div>

        <div className="p-6 flex-grow">
          <h1 className="text-3xl font-bold mb-2 text-white">{problem.title}</h1>
          <div className="mb-6 flex items-center gap-3">
            <span className={`px-3 py-1 text-xs font-semibold rounded-full border 
              ${problem.difficulty === 'Easy' ? 'text-easy bg-easy/10 border-easy/20' : 
                problem.difficulty === 'Medium' ? 'text-medium bg-medium/10 border-medium/20' : 
                'text-hard bg-hard/10 border-hard/20'}`}>
              {problem.difficulty}
            </span>
          </div>

          {activeTab === 'description' ? (
            <div className="prose prose-invert max-w-none text-text-main/90" 
                 dangerouslySetInnerHTML={{ __html: problem.description }} />
          ) : (
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-white">Community Solutions</h2>
                <button 
                  onClick={() => setShowSolutionForm(!showSolutionForm)}
                  className="text-sm bg-brand/10 hover:bg-brand/20 text-brand px-4 py-2 rounded font-medium transition-colors"
                >
                  {showSolutionForm ? 'Cancel' : 'Post a Solution'}
                </button>
              </div>
              
              {showSolutionForm && (
                <div className="mb-8">
                  <SolutionForm 
                    problemId={problem.id} 
                    onSuccess={() => {
                      setShowSolutionForm(false);
                      setRefreshTrigger(prev => prev + 1);
                    }} 
                  />
                </div>
              )}

              <SolutionList problemId={problem.id} refreshTrigger={refreshTrigger} />
            </div>
          )}
        </div>
      </div>

      {/* Right Panel: Code Editor & Console */}
      <div className="w-1/2 flex flex-col bg-[#1e1e1e]">
        {/* Editor Header */}
        <div className="h-12 bg-[#252526] flex items-center justify-between px-4 border-b border-black/40">
          <select 
            value={language}
            onChange={handleLanguageChange}
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
