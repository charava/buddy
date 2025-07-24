import React, { useState } from 'react';
import './App.css';
import { useNavigate } from 'react-router-dom';
import { db } from './firebase';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import BuddyHeader from './components/BuddyHeader';
import NavBar from './components/NavBar';

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


function generateDiaryEntryId() {
  if (window.crypto && window.crypto.randomUUID) {
    return window.crypto.randomUUID();
  }
  return 'de_' + Date.now() + '_' + Math.floor(Math.random() * 100000);
}

function Home() {
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const handleProfileClick = (e) => {
    e.preventDefault();
    navigate('/meet-buddy');
  };
  const handleNext = async () => {
    if (message.trim()) {
      // Get current user's phone from localStorage
      const userPhone = localStorage.getItem('userPhone');
      if (!userPhone) {
        alert('User not logged in.');
        return;
      }
      const entryId = generateDiaryEntryId();
      const entry = {
        'diary-entry-id': entryId,
        datetime: getReadableDatetime(),
        datetimeISO: new Date().toISOString(),
        'diary-entry-content': message,
        'clicked-first-button': true,
        'sent-to-buddy': false,
        'chose-to-just-save-to-journal': false,
        "buddys-reply": {
          "buddys-reply-content": '',
          "clicked-on-buddys-reply-datetime": ''
        }
      };
      try {
        await updateDoc(doc(db, 'users', userPhone), {
          'diary-entries': arrayUnion(entry)
        });
        // Pass the entry id and message to the next page
        navigate('/diary-share', { state: { message, entryId } });
      } catch (err) {
        alert('Failed to save diary entry: ' + err.message);
      }
    }
  };
  return (
    <div className="App-bg">
      <div className="card-two home-card">
        <BuddyHeader onProfileClick={handleProfileClick} />
        <div className="home-prompt">
          <div className="home-prompt-text">How are you feeling? What’s weighing on you right now?</div>
        </div>
        <textarea
          className="home-message-input"
          placeholder="Type your feelings here..."
          value={message}
          onChange={e => setMessage(e.target.value)}
          rows={5}
        />
        <button className="home-next-btn" onClick={handleNext}>→</button>
      </div>
      <NavBar active="home" />
    </div>
  );
}

export default Home; 