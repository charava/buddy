import React, { useState } from 'react';
import './App.css';
import { useNavigate } from 'react-router-dom';
import { db } from './firebase';
import { collection, query, where, getDocs, setDoc, doc } from 'firebase/firestore';

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

function SignUp() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!phone || !username || !password || !confirmPassword) {
      setError('All fields are required.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      // Check if phone or username already exists
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('phone', '==', phone));
      const q2 = query(usersRef, where('username', '==', username));
      const [snap1, snap2] = await Promise.all([getDocs(q), getDocs(q2)]);
      if (!snap1.empty) {
        setError('Phone number already in use.');
        setLoading(false);
        return;
      }
      if (!snap2.empty) {
        setError('Username already in use.');
        setLoading(false);
        return;
      }
      // Save user with plain text password (for demo only) and sign-ins array
      await setDoc(doc(db, 'users', phone), {
        phone,
        username,
        password, // plain text
        'sign-ins': [
          { datetime: getReadableDatetime() }
        ]
      });
      // Save phone number to localStorage for session
      localStorage.setItem('userPhone', phone);
      navigate('/meet-buddy');
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
          <h2 className="welcome">Create your</h2>
          <h1 className="buddy">Buddy Account</h1>
          <form className="signin-form" autoComplete="off" onSubmit={handleSubmit}>
            <label className="signin-label">Phone number
              <input className="signin-input" type="tel" name="phone" autoComplete="tel" value={phone} onChange={e => setPhone(e.target.value)} />
            </label>
            <label className="signin-label">Username
              <input className="signin-input" type="text" name="username" autoComplete="username" value={username} onChange={e => setUsername(e.target.value)} />
            </label>
            <label className="signin-label">Password
              <input className="signin-input" type="password" name="password" autoComplete="new-password" value={password} onChange={e => setPassword(e.target.value)} />
            </label>
            <label className="signin-label">Confirm Password
              <input className="signin-input" type="password" name="confirmPassword" autoComplete="new-password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
            </label>
            <button className="sign-in-btn" type="submit" disabled={loading}>Create Account</button>
            {error && <div style={{ color: 'red', marginTop: 12 }}>{error}</div>}
          </form>
        </div>
      </div>
    </div>
  );
}

export default SignUp; 