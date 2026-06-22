import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { X, Loader2, AlertCircle } from 'lucide-react';

const EditProfileModal = ({ isOpen, onClose, user, onSaved }) => {
  const navigate = useNavigate();
  // We use localStorage user to get the current email since public profile doesn't expose it
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  
  const [username, setUsername] = useState(user.username || '');
  const [email, setEmail] = useState(currentUser.email || '');
  const [bio, setBio] = useState(user.bio || '');
  const [githubUrl, setGithubUrl] = useState(user.github_url || '');
  const [websiteUrl, setWebsiteUrl] = useState(user.website_url || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Reset local state if modal opens with a new user
  useEffect(() => {
    if (isOpen) {
      setUsername(user.username || '');
      setEmail(currentUser.email || '');
      setBio(user.bio || '');
      setGithubUrl(user.github_url || '');
      setWebsiteUrl(user.website_url || '');
      setError('');
    }
  }, [isOpen, user, currentUser.email]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const res = await api.put('/users/me/profile', {
        username,
        email,
        bio,
        github_url: githubUrl,
        website_url: websiteUrl
      });
      
      // Update local storage with new token and user data
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      
      // If username changed, we need to redirect to the new profile URL
      if (user.username !== username) {
        onClose();
        navigate(`/user/${username}`);
      } else {
        onSaved();
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[#151822] rounded-2xl border border-white/10 w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        <div className="flex justify-between items-center p-6 border-b border-white/10 bg-slate-900/50">
          <h2 className="text-xl font-bold text-white">Edit Profile</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="flex items-center gap-2 text-red-400 text-sm bg-red-400/10 p-3 rounded border border-red-400/20">
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Username</label>
              <input 
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-[#0f111a] border border-white/10 rounded-lg p-3 text-white text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
              <input 
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#0f111a] border border-white/10 rounded-lg p-3 text-white text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Bio</label>
            <textarea 
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself..."
              rows={3}
              className="w-full bg-[#0f111a] border border-white/10 rounded-lg p-3 text-white text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">GitHub URL</label>
            <input 
              type="url"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              placeholder="https://github.com/username"
              className="w-full bg-[#0f111a] border border-white/10 rounded-lg p-3 text-white text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Personal Website</label>
            <input 
              type="url"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              placeholder="https://yourdomain.com"
              className="w-full bg-[#0f111a] border border-white/10 rounded-lg p-3 text-white text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
            />
          </div>

          <div className="pt-4 flex justify-end gap-3 sticky bottom-0 bg-[#151822] mt-4">
            <button 
              type="button" 
              onClick={onClose}
              disabled={saving}
              className="px-5 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-bg-main bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors shadow-[0_0_15px_rgba(34,211,238,0.4)] disabled:opacity-50"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : 'Save Changes'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default EditProfileModal;
