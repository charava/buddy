// Author: Charlotte Rosario
// Created: July 2025
// Project: BUDDY
// Description: Teen-to-teen buddy matching app
// Last Updated: August 1, 2025


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
  const [step, setStep] = useState(1); // 1: phone, 2: password

  const handleNext = (e) => {
    e.preventDefault();
    setError('');
    // Phone validation (same as before)
    if (identifier.includes('-')) {
      setError('Please do not use hyphens in your phone number.');
      return;
    }
    if (identifier.includes(' ')) {
      setError('Please do not use spaces in your phone number.');
      return;
    }
    if (identifier.includes('+')) {
      setError('Please do not use "+" in your phone number.');
      return;
    }
    if (identifier.includes('(') || identifier.includes(')')) {
      setError('Please do not use parentheses in your phone number.');
      return;
    }
    // Check if US users are including country code "1"
    if (identifier.startsWith('1') && identifier.length === 11) {
      setError('For US numbers, please do not include the "1" country code.');
      return;
    }
    if (identifier.replace(/\s+/g, '').length < 10) {
      setError('Please enter at least 10 digits for your phone number.');
      return;
    }
    setStep(2);
  };

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
      
      // Check if user has an empty password (treat as non-existent)
      if (!user.password || user.password.trim() === '') {
        setError('User not found.');
        setLoading(false);
        return;
      }
      
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
      // Check if the error might be due to country code
      if (identifier.startsWith('1') && identifier.length === 11) {
        setError('For US numbers, please do not include the "1" country code.');
      } else {
        setError(err.message);
      }
    }
    setLoading(false);
  };

  return (
    <div className="landing-card">
      <img src="/Buddy_Logo.png" alt="Somethings Buddy Logo" className="buddy-logo-top"/>
      <img src="/cloud.png" alt="Clouds" className="cloud-img-top" />
      <form className="signin-form" autoComplete="off" onSubmit={step === 1 ? handleNext : handleSubmit}>
        {step === 1 && (
          <>
              <input className="signin-input" placeholder="what's your phone number?" type="tel" name="identifier" autoComplete="tel" value={identifier} onChange={e => setIdentifier(e.target.value)} />
            <button className="landing-btn" type="submit" disabled={loading}>next</button>
          </>
        )}
        {step === 2 && (
          <>
            <input className="signin-input" placeholder="what's your password?" type="password" name="password" autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} />
            <button className="landing-btn" type="submit" disabled={loading}>sign in</button>
          </>
        )}
        {error && <div style={{ color: 'red', marginTop: 12 }}>{error}</div>}
      </form>
    </div>
  );
}

export default SignIn; 