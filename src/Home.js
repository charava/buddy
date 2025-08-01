// Author: Charlotte Rosario
// Created: July 2025
// Project: BUDDY
// Description: Teen-to-teen buddy matching app
// Last Updated: August 1, 2025

import React, { useState, useEffect } from 'react';
import './App.css';
import { useNavigate } from 'react-router-dom';
import { db } from './firebase';
import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import BuddyHeader from './components/BuddyHeader';
import NavBar from './components/NavBar';
import bannedWords from './words.json';

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

function containsInappropriateContent(text) {
  if (!text) return false;
  const lower = text.toLowerCase();
  // Only match banned words as standalone words (word boundaries)
  return bannedWords.some(word => {
    const pattern = new RegExp(`\\b${word.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`, 'i');
    return pattern.test(lower);
  });
}

function generateDiaryEntryId() {
  if (window.crypto && window.crypto.randomUUID) {
    return window.crypto.randomUUID();
  }
  return 'de_' + Date.now() + '_' + Math.floor(Math.random() * 100000);
}

function Home() {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [moderationError, setModerationError] = useState('');
  const [messageSent, setMessageSent] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (containsInappropriateContent(message)) {
      setModerationError('Your diary entry contains inappropriate language. Please edit it to continue.');
    } else {
      setModerationError('');
    }
  }, [message]);

  // Helper to update the diary entry in Firestore and push to buddy's diary entries
  const handleSend = async () => {
    if (!message.trim()) return;
    if (containsInappropriateContent(message)) {
      setModerationError('Your diary entry contains inappropriate language. Please edit it to continue.');
      return;
    }
    setLoading(true);
    const userPhone = localStorage.getItem('userPhone');
    if (!userPhone) {
      alert('User not logged in.');
      setLoading(false);
      return;
    }
    // Get buddy's phone
    let buddyPhone = null;
    let entryId = generateDiaryEntryId();
    let userData = null;
    try {
      const userRef = doc(db, 'users', userPhone);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) throw new Error('User not found');
      userData = userSnap.data();
      buddyPhone = userData['buddy-phone'];
      entryId = generateDiaryEntryId();
      const entry = {
        'diary-entry-id': entryId,
        datetime: getReadableDatetime(),
        datetimeISO: new Date().toISOString(),
        'diary-entry-content': message,
        'clicked-first-button': true,
        'sent-to-buddy': true,
        "buddys-reply": {
          "buddys-reply-content": '',
          "clicked-on-buddys-reply-datetime": ''
        }
      };
      // Add to user's diary-entries
      const entries = userData['diary-entries'] || [];
      const updatedEntries = [...entries, entry];
      await updateDoc(userRef, { 'diary-entries': updatedEntries });
      // Push to buddy's buddy-diary-entries
      if (buddyPhone) {
        const buddyRef = doc(db, 'users', buddyPhone);
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
      setSent(true);
      setMessage('');
      setMessageSent(true);
      setTimeout(() => setSent(false), 1500);
      setTimeout(() => setMessageSent(false), 3000);
    } catch (err) {
      alert('Failed to send diary entry: ' + err.message);
    }
    setLoading(false);
  };

  const handleProfileClick = (e) => {
    e.preventDefault();
    navigate('/meet-buddy');
  };

  return (
    <div className="landing-bg">
      {/* <div className="card-two home-card"> */}
        <BuddyHeader onProfileClick={handleProfileClick} />
        <div className="home-card">

        {/* <div className="home-prompt">
          <div className="home-prompt-text">type your feelings here...</div>
        </div> */}
        <textarea
          className="signin-input home-message-input"
          placeholder="type your feelings here..."
          value={message}
          onChange={e => setMessage(e.target.value)}
          rows={1}
          disabled={loading}
        />
        <button
          className="landing-btn"
          onClick={handleSend}
          disabled={loading || !!moderationError || !message.trim()}
        >
          send to my buddy
        </button>
        {moderationError && <div className="diary-share-error">{moderationError}</div>}

        {sent && <div className="diary-share-confirm">great! just sent to your buddy!</div>}
      {/* </div> */}
      <NavBar active="home" messageSent={messageSent} />
    </div>
    </div>

  );
}

export default Home; 