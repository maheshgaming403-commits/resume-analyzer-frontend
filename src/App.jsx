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
      const res = await fetch('http://localhost:5000/api/analyze', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      
      if (data.analysis) {
        setResult(data.analysis);
        // Save to Supabase
        await supabase.from('resumes').insert([{
          user_id: session.user.id,
          resume_text: data.text,
          ats_score: data.analysis.ats_score,
          feedback: data.analysis.feedback
        }]);
      }
    } catch (error) {
      alert("Error processing resume");
    }
    setLoading(false);
  };

  if (!session) {
    return (
      <div style={{ padding: '20px', maxWidth: '400px', margin: 'auto' }}>
        <h2>Login to AI Resume Analyzer</h2>
        <input type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} style={{ display:'block', margin:'10px 0', width:'100%', padding:'8px' }}/>
        <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} style={{ display:'block', margin:'10px 0', width:'100%', padding:'8px' }}/>
        <button onClick={() => handleAuth(false)} style={{ marginRight: '10px' }}>Login</button>
        <button onClick={() => handleAuth(true)}>Sign Up</button>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: 'auto' }}>
      <button onClick={() => supabase.auth.signOut()} style={{ float: 'right' }}>Sign Out</button>
      <h2>Welcome to the Analyzer</h2>
      
      <form onSubmit={handleUpload}>
        <input type="file" accept=".pdf" onChange={(e) => setFile(e.target.files[0])} style={{ marginBottom: '10px' }}/>
        <br />
        <button type="submit" disabled={loading}>
          {loading ? 'Analyzing...' : 'Upload & Analyze Resume'}
        </button>
      </form>

      {result && (
        <div style={{ marginTop: '20px', padding: '15px', border: '1px solid #ccc', borderRadius: '5px' }}>
          <h3>ATS Match Score: {result.ats_score}%</h3>
          <p><strong>Feedback:</strong> {result.feedback}</p>
          <p><strong>Missing Skills to add:</strong></p>
          <ul>
            {result.missing_skills.map((skill, i) => <li key={i}>{skill}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;