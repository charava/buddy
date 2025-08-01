// Author: Charlotte Rosario
// Created: July 2025
// Project: BUDDY
// Description: Teen-to-teen buddy matching app
// Last Updated: August 1, 2025


import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './App.css';
import { db } from './firebase';
import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';

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

// Simple content moderation: list of banned words (demo)
const BANNED_WORDS = [
  'badword1', 'badword2', 'inappropriate', 'offensive', 'hate', 'violence', 'kill', 'suicide', 'sex', 'drugs', 'abuse', 'racist', 'homophobic', 'transphobic', 'slur'
];

function containsInappropriateContent(text) {
  if (!text) return false;
  const lower = text.toLowerCase();
  return BANNED_WORDS.some(word => lower.includes(word));
}

function DiaryShare() {
  const location = useLocation();
  const navigate = useNavigate();
  const message = location.state?.message || '';
  const entryId = location.state?.entryId;
  const [sent, setSent] = useState(null); 
  const [loading, setLoading] = useState(false);
  const [buddyName, setBuddyName] = useState('Buddy');
  const [diaryText, setDiaryText] = useState(message);
  const [moderationError, setModerationError] = useState('');

  useEffect(() => {
    const fetchBuddyName = async () => {
      const userPhone = localStorage.getItem('userPhone');
      if (!userPhone) return;
      const userRef = doc(db, 'users', userPhone);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) return;
      const userData = userSnap.data();
      const buddyPhone = userData['buddy-phone'];
      if (!buddyPhone) return;
      const buddyRef = doc(db, 'users', buddyPhone);
      const buddySnap = await getDoc(buddyRef);
      if (!buddySnap.exists()) return;
      const buddyData = buddySnap.data();
      setBuddyName(buddyData.username || 'Buddy');
    };
    fetchBuddyName();
  }, []);

  useEffect(() => {
    if (containsInappropriateContent(diaryText)) {
      setModerationError('Your diary entry contains inappropriate language. Please edit it to continue.');
    } else {
      setModerationError('');
    }
  }, [diaryText]);

  // Helper to update the diary entry in Firestore and optionally push to buddy's diary entries
  const updateDiaryEntry = async (updateFields, pushToBuddy = false) => {
    setLoading(true);
    const userPhone = localStorage.getItem('userPhone');
    if (!userPhone || !entryId) return;
    const userRef = doc(db, 'users', userPhone);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) return;
    const userData = userSnap.data();
    const entries = userData['diary-entries'] || [];
    const updatedEntries = entries.map(entry =>
      entry['diary-entry-id'] === entryId
        ? { ...entry, ...updateFields, datetimeISO: new Date().toISOString() }
        : entry
    );
    await updateDoc(userRef, { 'diary-entries': updatedEntries });

    // Only push to buddy's diary entries if pushToBuddy is true
    if (pushToBuddy) {
      const buddysPhone = userData['buddy-phone'];
      if (buddysPhone) {
        const buddyRef = doc(db, 'users', buddysPhone);
        await updateDoc(buddyRef, {
          'buddy-diary-entries': arrayUnion({
            'diary-entry-id': entryId,
            'datetime': getReadableDatetime(),
            'datetimeISO': new Date().toISOString(),
            'clicked-on-buddys-diary-entry-datetime': '',
            'replied-to-buddys-diary-entry-datetime': ''
          })
        });
      }
    }
    setLoading(false);
  };

  const handleSend = async () => {
    if (containsInappropriateContent(diaryText)) {
      setModerationError('Your diary entry contains inappropriate language. Please edit it to continue.');
      return;
    }
    await updateDiaryEntry({ 'sent-to-buddy': true, message: diaryText }, true);
    setSent('ella');
  };
  // const handleSave = async () => {
  //   await updateDiaryEntry({ 'sent-to-buddy': false}, false);
  //   setSent('journal');
  // };
  const handleBack = () => navigate(-1);
  const handleProfile = (e) => { e.preventDefault(); navigate('/meet-buddy'); };

  useEffect(() => {
    if (sent) {
      const timeout = setTimeout(() => {
        navigate('/home');
      }, 1000);
      return () => clearTimeout(timeout);
    }
  }, [sent, navigate]);

  return (
    <div className="App-bg diary-share-bg">
      <div className="card diary-share-card">
        <div className="diary-share-header">
          <div className="home-buddy-avatar">
            <svg width="48" height="48" viewBox="0 0 64 64">
              <circle cx="32" cy="32" r="30" fill="none" stroke="#222" strokeWidth="3" />
              <circle cx="24" cy="28" r="2" fill="#222" />
              <circle cx="40" cy="28" r="2" fill="#222" />
              <path d="M24 44 Q32 50 40 44" stroke="#222" strokeWidth="3" fill="none" strokeLinecap="round" />
            </svg>
          </div>
          <div className="home-buddy-info">
            <div className="home-buddy-label">My buddy: <b>{buddyName}</b></div>
            <a className="home-buddy-profile" href="#" onClick={handleProfile}>(View {buddyName}’s Profile)</a>
          </div>
        </div>
        <div className="diary-share-box">
          <button className="diary-share-back" onClick={handleBack}>&larr; Back</button>
          <div className="diary-share-title">Share your diary<br/>entry with {buddyName}</div>
          <div className="diary-share-bubble">
            <textarea
              className="diary-share-bubble-textarea"
              value={diaryText}
              onChange={e => setDiaryText(e.target.value)}
              rows={3}
              style={{ width: '100%', resize: 'vertical', borderRadius: '12px', padding: '8px', fontSize: '1rem' }}
              disabled={loading}
            />
          </div>
          {moderationError && <div className="diary-share-error" style={{ color: 'red', margin: '8px 0' }}>{moderationError}</div>}
          <button
            className="diary-share-send-btn"
            onClick={handleSend}
            disabled={loading || !!moderationError || !diaryText.trim()}
          >
            Send to {buddyName} &rarr;
          </button>
          {/* <button className="diary-share-save-btn" onClick={handleSave} disabled={loading}>Nope just save it to my journal</button> */}
          {sent === 'ella' && <div className="diary-share-confirm">Great! Just sent to {buddyName}!</div>}
          {/* {sent === 'journal' && <div className="diary-share-confirm">Saved to your journal.</div>} */}
        </div>
      </div>
    </div>
  );
}

export default DiaryShare; 