import React, { useState } from 'react';
import './App.css';
import { useNavigate } from 'react-router-dom';
import { db } from './firebase';
import { collection, query, where, getDocs, updateDoc, doc, arrayUnion } from 'firebase/firestore';

function getReadableDatetime() {
  const now = new Date();
  return now.toLocaleString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
}

function SignIn() {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState(''); // phone or username
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const usersRef = collection(db, 'users');
      // Only check phone
      const q = query(usersRef, where('phone', '==', identifier));
      const snap = await getDocs(q);
      if (snap.empty) {
        setError('User not found.');
        setLoading(false);
        return;
      }
      const userDoc = snap.docs[0];
      const user = userDoc.data();
      if (user.password !== password) {
        setError('Incorrect password.');
        setLoading(false);
        return;
      }
      // Save phone number to localStorage for session
      localStorage.setItem('userPhone', user.phone);
      // Push new sign-in datetime
      await updateDoc(doc(db, 'users', user.phone), {
        'sign-ins': arrayUnion({ datetime: getReadableDatetime() })
      });
      navigate('/home');
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div className="App-bg">
      <div className="card">
        <div className="card-content">
          <div style={{ height: '40px' }}></div>
          <h2 className="welcome">Sign in to</h2>
          <h1 className="buddy">Buddy</h1>
          <form className="signin-form" autoComplete="off" onSubmit={handleSubmit}>
            <label className="signin-label">Phone number
              <input className="signin-input" type="text" name="identifier" autoComplete="username" value={identifier} onChange={e => setIdentifier(e.target.value)} />
            </label>
            <label className="signin-label">Password
              <input className="signin-input" type="password" name="password" autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} />
            </label>
            <button className="sign-in-btn" type="submit" disabled={loading}>Sign in</button>
            {error && <div style={{ color: 'red', marginTop: 12 }}>{error}</div>}
          </form>
        </div>
      </div>
    </div>
  );
}

export default SignIn; 