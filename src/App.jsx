import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import './App.css'; // Importing our new modern styles!

function App() {
  const [session, setSession] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    supabase.auth.onAuthStateChange((_event, session) => setSession(session));
  }, []);

  const handleAuth = async (isSignUp) => {
    const { error } = isSignUp 
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password });
    if (error) alert(error.message);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return alert("Please select a file");
    setLoading(true);
    
    const formData = new FormData();
    formData.append('resume', file);

    try {
      // REPLACE WITH YOUR ACTUAL RENDER URL BEFORE PUSHING TO VERCEL
      const res = await fetch('https://resume-backend-aam6.onrender.com/api/analyze', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.analysis) setResult(data.analysis);
    } catch (error) {
      alert("Error processing resume");
    }
    setLoading(false);
  };

  if (!session) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <h2 className="auth-title">AI Resume Analyzer</h2>
          <input type="email" placeholder="Email" className="input-field" onChange={(e) => setEmail(e.target.value)} />
          <input type="password" placeholder="Password" className="input-field" onChange={(e) => setPassword(e.target.value)} />
          <div className="button-group">
            <button onClick={() => handleAuth(false)} className="btn-primary" style={{flex: 1}}>Login</button>
            <button onClick={() => handleAuth(true)} className="btn-secondary" style={{flex: 1}}>Sign Up</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <header className="header">
        <h1>Analyzer Dashboard</h1>
        <button onClick={() => supabase.auth.signOut()} className="btn-secondary">Sign Out</button>
      </header>

      <div className="upload-section">
        <form onSubmit={handleUpload} className="upload-form">
          <input type="file" accept=".pdf" className="file-input" onChange={(e) => setFile(e.target.files[0])} />
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Analyzing Profile...' : 'Upload & Analyze'}
          </button>
        </form>
      </div>

      {result && (
        <div className="results-grid">
          
          <div className="card score-container">
            <h3 className="card-title">ATS Match Score</h3>
            <div className={`score-circle ${result.ats_score > 70 ? 'score-high' : 'score-low'}`}>
              {result.ats_score}%
            </div>
            <p style={{ color: '#475569', lineHeight: '1.5' }}>{result.feedback}</p>
          </div>

          <div className="card">
            <h3 className="card-title">Missing Core Skills</h3>
            <div className="tags-container">
              {result.missing_skills?.map((skill, i) => (
                <span key={i} className="tag">{skill}</span>
              ))}
            </div>
          </div>

          <div className="card">
            <h3 className="card-title">Actionable Tips</h3>
            <ul className="list">
              {result.actionable_tips?.map((tip, i) => <li key={i}>{tip}</li>)}
            </ul>
          </div>

          <div className="card">
            <h3 className="card-title">Best Job Matches</h3>
            <ul className="list">
              {result.job_matches?.map((job, i) => <li key={i}>{job}</li>)}
            </ul>
          </div>

        </div>
      )}
    </div>
  );
}

export default App;