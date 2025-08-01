// Author: Charlotte Rosario
// Created: July 2025
// Project: BUDDY
// Description: Teen-to-teen buddy matching app
// Last Updated: August 1, 2025

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import './App.css';
import BuddyHeader from './components/BuddyHeader';
import NavBar from './components/NavBar';
import { db } from './firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

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

function formatCondensedTimestamp(datetime) {
  if (!datetime) return '';
  
  // Parse the datetime string
  const match = datetime.match(/^([A-Za-z]+) (\d{1,2}), (\d{4}) at (\d{1,2}):(\d{2}) (AM|PM)$/);
  if (!match) return datetime;
  
  let [_, monthName, day, year, hour, minute, ampm] = match;
  const months = [
    'January','February','March','April','May','June','July','August','September','October','November','December'
  ];
  const month = months.indexOf(monthName);
  if (month === -1) return datetime;
  
  // Convert hour based on AM/PM
  hour = parseInt(hour, 10);
  if (ampm === 'PM' && hour !== 12) hour += 12;
  if (ampm === 'AM' && hour === 12) hour = 0;
  
  const date = new Date(year, month, day, hour, minute);
  const now = new Date();
  
  // Check if it's today
  const isToday = date.toDateString() === now.toDateString();
  
  if (isToday) {
    // Format as "today 5:30pm"
    const timeStr = date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).toLowerCase();
    return `today ${timeStr}`;
  } else {
    // Format as "6/7/14"
    const monthStr = (month + 1).toString();
    const dayStr = day.toString();
    const yearStr = year.toString().slice(-2);
    return `${monthStr}/${dayStr}/${yearStr}`;
  }
}

function MessageDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const buddyPhone = location.state?.buddyPhone;
  const entryId = location.state?.entryId || id;
  const showReply = location.state?.showReply;
  const showMyReply = location.state?.showMyReply;
  const [entry, setEntry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [buddyName, setBuddyName] = useState('Buddy');
  const [reply, setReply] = useState('');
  const [sent, setSent] = useState(false);
  const [showReplyInput, setShowReplyInput] = useState(false);

  useEffect(() => {
    const fetchEntry = async () => {
      setLoading(true);
      if (showReply) {
        // Fetch user's own diary entry
        const userPhone = localStorage.getItem('userPhone');
        if (!userPhone || !entryId) return;
        const userRef = doc(db, 'users', userPhone);
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) return;
        const userData = userSnap.data();
        const buddyPhone = userData['buddy-phone'];
        setBuddyName(buddyPhone ? (await getDoc(doc(db, 'users', buddyPhone))).data()?.username || 'Buddy' : 'Buddy');
        const entries = userData['diary-entries'] || [];
        const found = entries.find(e => e['diary-entry-id'] === entryId);
        setEntry(found || null);
        // Update clicked-on-buddys-reply-datetime when viewing the reply (only if not already set)
        if (found && (!found['buddys-reply'] || !found['buddys-reply']['clicked-on-buddys-reply-datetime'] || found['buddys-reply']['clicked-on-buddys-reply-datetime'].trim() === '')) {
          const updatedDiaryEntries = entries.map(e => {
            if (e['diary-entry-id'] === entryId) {
              return {
                ...e,
                ['buddys-reply']: {
                  ...e['buddys-reply'],
                  'clicked-on-buddys-reply-datetime': getReadableDatetime()
                }
              };
            }
            return e;
          });
          await updateDoc(userRef, { 'diary-entries': updatedDiaryEntries });
        }
      } else if (showMyReply) {
        // Fetch user's reply from buddy's diary entry
        if (!buddyPhone || !entryId) return;
        const buddyRef = doc(db, 'users', buddyPhone);
        const buddySnap = await getDoc(buddyRef);
        if (!buddySnap.exists()) return;
        const buddyData = buddySnap.data();
        setBuddyName(buddyData.username || 'Buddy');
        const entries = buddyData['diary-entries'] || [];
        const found = entries.find(e => e['diary-entry-id'] === entryId);
        if (found && found['buddys-reply'] && found['buddys-reply']['buddys-reply-content']) {
          setEntry({
            ...found,
            'diary-entry-id': entryId,
            'buddys-reply': found['buddys-reply'],
            'replied-to-buddys-diary-entry-datetime': found['buddys-reply']['buddys-reply-datetime'] || getReadableDatetime()
          });
        } else {
          setEntry(null);
        }
      } else {
        // Fetch buddy's diary entry
        if (!buddyPhone || !entryId) return;
        const buddyRef = doc(db, 'users', buddyPhone);
        const buddySnap = await getDoc(buddyRef);
        if (!buddySnap.exists()) return;
        const buddyData = buddySnap.data();
        setBuddyName(buddyData.username || 'Buddy');
        const entries = buddyData['diary-entries'] || [];
        const found = entries.find(e => e['diary-entry-id'] === entryId);
        setEntry(found || null);
        // Update clicked-on-buddys-diary-entry-datetime in user's buddy-diary-entries (only if not already set)
        const userPhone = localStorage.getItem('userPhone');
        if (userPhone) {
          const userRef = doc(db, 'users', userPhone);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            const userData = userSnap.data();
            const buddyEntries = userData['buddy-diary-entries'] || [];
            const existingEntry = buddyEntries.find(e => e['diary-entry-id'] === entryId);
            // Only update if the clicked-on timestamp doesn't exist or is empty
            if (!existingEntry || !existingEntry['clicked-on-buddys-diary-entry-datetime'] || existingEntry['clicked-on-buddys-diary-entry-datetime'].trim() === '') {
              const updatedBuddyEntries = buddyEntries.map(e =>
                e['diary-entry-id'] === entryId
                  ? {
                      ...e,
                      'clicked-on-buddys-diary-entry-datetime': getReadableDatetime()
                    }
                  : e
              );
              await updateDoc(userRef, { 'buddy-diary-entries': updatedBuddyEntries });
            }
          }
        }
      }
      setLoading(false);
    };
    fetchEntry();
  }, [buddyPhone, entryId, showReply, showMyReply]);

  useEffect(() => {
    if (sent) {
      const timeout = setTimeout(() => {
        navigate('/messages');
      }, 1000);
      return () => clearTimeout(timeout);
    }
  }, [sent, navigate]);

  const handleProfileClick = (e) => {
    e.preventDefault();
    navigate('/meet-buddy');
  };

  const handleReply = async () => {
    if (!showReplyInput) {
      setShowReplyInput(true);
      return;
    }
    
    if (!reply.trim()) return;
    setLoading(true);
    // Update buddy's diary entry with reply
    const buddyRef = doc(db, 'users', buddyPhone);
    const buddySnap = await getDoc(buddyRef);
    if (buddySnap.exists()) {
      const buddyData = buddySnap.data();
      const entries = buddyData['diary-entries'] || [];
      const updatedEntries = entries.map(e =>
        e['diary-entry-id'] === entryId
          ? {
              ...e,
              "buddys-reply": {
                "buddys-reply-content": reply,
                "buddys-reply-datetime": getReadableDatetime(),
                "clicked-on-buddys-reply-datetime": ''
              }
            }
          : e
      );
      await updateDoc(buddyRef, { 'diary-entries': updatedEntries });
    }
    // Update user's buddy-diary-entries with reply datetime
    const userPhone = localStorage.getItem('userPhone');
    if (userPhone) {
      const userRef = doc(db, 'users', userPhone);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const userData = userSnap.data();
        const buddyEntries = userData['buddy-diary-entries'] || [];
        const updatedBuddyEntries = buddyEntries.map(e =>
          e['diary-entry-id'] === entryId
            ? {
                ...e,
                'replied-to-buddys-diary-entry-datetime': getReadableDatetime()
              }
            : e
        );
        await updateDoc(userRef, { 'buddy-diary-entries': updatedBuddyEntries });
        // Also update user's own diary-entries with the reply datetime
        const diaryEntries = userData['diary-entries'] || [];
        const updatedDiaryEntries = diaryEntries.map(e => {
          if (e['diary-entry-id'] === entryId) {
            return {
              ...e,
              ['buddys-reply']: {
                ...e['buddys-reply'],
                'clicked-on-buddys-reply-datetime': getReadableDatetime()
              }
            };
          }
          return e;
        });
        await updateDoc(userRef, { 'diary-entries': updatedDiaryEntries });
      }
    }
    setSent(true);
    setLoading(false);
    setTimeout(() => {
      navigate('/messages');
    }, 1000);
  };

  return (
    <div className="landing-bg">
      <div className="card-two messages-card">
        <BuddyHeader onProfileClick={handleProfileClick} />
        {loading && <div>Loading...</div>}
        {!loading && entry && showReply && (
          <>
            <div className="message-detail-bubble">
              <div className="message-detail-title-container">
              <div className="message-detail-timestamp">{formatCondensedTimestamp(entry.datetime)}</div>

                <div className="message-detail-title">
                  my note
                </div>
              </div>
              <div className="message-detail-content">{entry['diary-entry-content']}</div>
              {entry['buddys-reply'] && entry['buddys-reply']['buddys-reply-content'] && (
                <>
                  {/* <div className="message-detail-timestamp">{formatCondensedTimestamp(entry['buddys-reply']['clicked-on-buddys-reply-datetime'])}</div> */}

                  <div className="message-detail-reply-section">{buddyName} replied</div>
                  <div className="message-detail-reply-content">{entry['buddys-reply']['buddys-reply-content']}</div>
                </>
              )}
            </div>
            <button className="message-detail-back-btn" onClick={() => navigate(-1)}>&larr; back</button>
          </>
        )}
        {!loading && entry && showMyReply && (
          <>
            <div className="message-detail-bubble">
              <div className="message-detail-title-container">
              <div className="message-detail-timestamp">{formatCondensedTimestamp(entry.datetime)}</div>

                <div className="message-detail-title">
                  new note from {buddyName}
                </div>
              </div>
              <div className="message-detail-content">{entry['diary-entry-content']}</div>
              {entry['buddys-reply'] && entry['buddys-reply']['buddys-reply-content'] && (
                <>
                  {/* <div className="message-detail-timestamp">{formatCondensedTimestamp(entry['buddys-reply']['buddys-reply-datetime'] || entry['replied-to-buddys-diary-entry-datetime'])}</div> */}

                  <div className="message-detail-reply-section">my reply</div>
                  <div className="message-detail-reply-content">{entry['buddys-reply']['buddys-reply-content']}</div>
                </>
              )}
            </div>
            <button className="message-detail-back-btn" onClick={() => navigate(-1)}>&larr; back</button>
          </>
        )}
        {!loading && entry && !showReply && !showMyReply && (
          <>
            <div className="message-detail-bubble"> 
              <div className="message-detail-title-container">
              <div className="message-detail-timestamp">{formatCondensedTimestamp(entry.datetime)}</div>

                <div className="message-detail-title">
                  {buddyName} sent
                </div>
              </div>
              <div className="message-detail-content">{entry['diary-entry-content']}</div>
            </div>
            {!showReplyInput ? (
              <div className="message-detail-reply-button-container">
                <button className="message-detail-reply-button" onClick={handleReply} disabled={loading || sent}>
                  <img src="/play-arrow-color.png" alt="Play" />
                  reply
                </button>
              </div>
            ) : (
              <div className="message-detail-reply-input-container">
                <textarea
                  className="signin-input"
                  placeholder="type your reply here..."
                  value={reply}
                  onChange={e => setReply(e.target.value)}
                  rows={4}
                  disabled={sent}
                />
                <button className="landing-btn" onClick={handleReply} disabled={loading || sent || !reply.trim()}>
                  <img src="/play-arrow-color.png" alt="Play" style={{ rotate: '180deg', width: '50px', height: 'auto', marginRight: '8px', verticalAlign: 'middle' }} />
                  Send
                </button>
              
              </div>
            )}
            <button className="message-detail-back-btn" onClick={() => navigate(-1)}>&larr; back</button>
            {sent && <div className="message-detail-confirm">Reply sent!</div>}
          </>
        )}
        {!loading && !entry && <div>note not found.</div>}
      </div>
      <NavBar active="messages" />
    </div>
  );
}

export default MessageDetail; 