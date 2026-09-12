import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

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
      // KEEP YOUR RENDER URL HERE
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

  // --- MODERN LOGIN SCREEN ---
  if (!session) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f3f4f6', fontFamily: 'system-ui, sans-serif' }}>
        <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px' }}>
          <h2 style={{ textAlign: 'center', color: '#111827', marginBottom: '24px' }}>AI Resume Analyzer</h2>
          <input type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} style={inputStyle} />
          <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} style={inputStyle} />
          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button onClick={() => handleAuth(false)} style={btnStylePrimary}>Login</button>
            <button onClick={() => handleAuth(true)} style={btnStyleSecondary}>Sign Up</button>
          </div>
        </div>
      </div>
    );
  }

  // --- MODERN DASHBOARD ---
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', fontFamily: 'system-ui, sans-serif', padding: '40px 20px' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
          <h1 style={{ color: '#111827', margin: 0 }}>Analyzer Dashboard</h1>
          <button onClick={() => supabase.auth.signOut()} style={btnStyleSecondary}>Sign Out</button>
        </header>

        <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '30px' }}>
          <form onSubmit={handleUpload} style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
            <input type="file" accept=".pdf" onChange={(e) => setFile(e.target.files[0])} style={{ flex: 1, padding: '10px', border: '2px dashed #d1d5db', borderRadius: '8px' }}/>
            <button type="submit" disabled={loading} style={btnStylePrimary}>
              {loading ? 'Analyzing AI...' : 'Upload & Analyze'}
            </button>
          </form>
        </div>

        {result && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
            
            {/* Score Card */}
            <div style={cardStyle}>
              <h3 style={cardTitle}>ATS Match Score</h3>
              <div style={{ fontSize: '48px', fontWeight: 'bold', color: result.ats_score > 70 ? '#10b981' : '#ef4444' }}>
                {result.ats_score}%
              </div>
              <p style={{ color: '#4b5563', marginTop: '10px' }}>{result.feedback}</p>
            </div>

            {/* Jobs Card */}
            <div style={cardStyle}>
              <h3 style={cardTitle}>Best Job Matches</h3>
              <ul style={listStyle}>
                {result.job_matches?.map((job, i) => <li key={i} style={listItem}>{job}</li>)}
              </ul>
            </div>

            {/* Tips Card */}
            <div style={cardStyle}>
              <h3 style={cardTitle}>Actionable Tips</h3>
              <ul style={listStyle}>
                {result.actionable_tips?.map((tip, i) => <li key={i} style={listItem}>{tip}</li>)}
              </ul>
            </div>

            {/* Skills Card */}
            <div style={cardStyle}>
              <h3 style={cardTitle}>Missing Keywords</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {result.missing_skills?.map((skill, i) => (
                  <span key={i} style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '4px 12px', borderRadius: '999px', fontSize: '14px', fontWeight: '500' }}>
                    {skill}
                  </span>
                ))}
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}

// --- REUSABLE STYLES ---
const inputStyle = { width: '100%', padding: '12px', marginBottom: '12px', border: '1px solid #d1d5db', borderRadius: '8px', boxSizing: 'border-box' };
const btnStylePrimary = { flex: 1, padding: '12px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' };
const btnStyleSecondary = { flex: 1, padding: '12px', backgroundColor: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' };
const cardStyle = { backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' };
const cardTitle = { margin: '0 0 16px 0', color: '#111827', fontSize: '18px' };
const listStyle = { margin: 0, paddingLeft: '20px', color: '#4b5563' };
const listItem = { marginBottom: '8px', lineHeight: '1.5' };

export default App;