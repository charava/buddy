// Author: Charlotte Rosario
// Created: July 2025
// Project: BUDDY
// Description: Teen-to-teen buddy matching app
// Last Updated: August 1, 2025


import React, { useState } from 'react';
import './App.css';
import { useNavigate } from 'react-router-dom';
import { db } from './firebase';
import { collection, query, where, getDocs, setDoc, doc, updateDoc } from 'firebase/firestore';

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
  // const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!phone || !password || !confirmPassword) {
      setError('All fields are required.');
      return;
    }
    // Disallow hyphens in phone number
    if (phone.includes('-')) {
      setError('Please do not use hyphens in your phone number.');
      return;
    }
    if (phone.includes(' ')) {
      setError('Please do not use spaces in your phone number.');
      return;
    }
    if (phone.includes('+')) {
      setError('Please do not use "+" in your phone number.');
      return;
    }
    if (phone.includes('(') || phone.includes(')')) {
      setError('Please do not use parentheses in your phone number.');
      return;
    }
    // Check if US users are including country code "1"
    if (phone.startsWith('1') && phone.length === 11) {
      setError('For US numbers, please do not include the "1" country code.');
      return;
    }
    // Require at least 10 characters
    if (phone.replace(/\s+/g, '').length < 10) {
      setError('Please enter at least 10 digits for your phone number.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      // Check if phone exists in Firebase
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('phone', '==', phone));
      const snap = await getDocs(q);
      
      if (snap.empty) {
        setError('Phone number not found. Please sign up using the same number that was used on the Typeform.');
        setLoading(false);
        return;
      }
      
      const userDoc = snap.docs[0];
      const user = userDoc.data();
      
      // Check if user already has a password set
      if (user.password && user.password.trim() !== '') {
        setError('Account already exists. Please sign in instead.');
        setLoading(false);
        return;
      }
      
      // Update existing document with password
      await updateDoc(doc(db, 'users', phone), {
        password: password,
        'sign-ins': [
          { datetime: getReadableDatetime() }
        ]
      });
      
      // Save phone number to localStorage for session
      localStorage.setItem('userPhone', phone);
      navigate('/meet-buddy');
    } catch (err) {
      // Check if the error might be due to country code
      if (phone.startsWith('1') && phone.length === 11) {
        setError('For US numbers, please do not include the "1" country code.');
      } else {
        setError('An error occurred. Please try again or contact support.');
      }
    }
    setLoading(false);
  };

  return (
      <div className="landing-card">
         <img src="/Buddy_Logo.png" alt="Somethings Buddy Logo" className="buddy-logo-top"/>
         <img src="/cloud.png" alt="Clouds" className="cloud-img-top" />

          <form className="signin-form" autoComplete="off" onSubmit={handleSubmit}>
            {/* <label className="signin-label">Phone number */}
              <input className="signin-input" placeholder="phone number" type="tel" name="phone" autoComplete="tel" value={phone} onChange={e => setPhone(e.target.value)} />
            {/* </label> */}
            {/* <label className="signin-label">Username
              <input className="signin-input" type="text" name="username" autoComplete="username" value={username} onChange={e => setUsername(e.target.value)} />
            </label> */}
            {/* <label className="signin-label">Password */}
              <input className="signin-input" placeholder="password" type="password" name="password" autoComplete="new-password" value={password} onChange={e => setPassword(e.target.value)} />
            {/* </label> */}
            {/* <label className="signin-label">Confirm Password */}
              <input className="signin-input" placeholder="confirm password" style={{ marginBottom: 25 }} type="password" name="confirmPassword" autoComplete="new-password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
            {/* </label> */}
            <button className="landing-btn" type="submit" disabled={loading}>Set Up Account</button>
            {error && <div style={{ color: 'red', marginTop: 12 }}>{error}</div>}
          </form>
      </div>
  );
}

export default SignUp; 