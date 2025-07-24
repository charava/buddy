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

function MessageDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const buddyPhone = location.state?.buddyPhone;
  const entryId = location.state?.entryId || id;
  const showReply = location.state?.showReply;
  const [entry, setEntry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [buddyName, setBuddyName] = useState('Buddy');
  const [reply, setReply] = useState('');
  const [sent, setSent] = useState(false);

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
        // Update clicked-on-buddys-reply-datetime when viewing the reply
        if (found) {
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
        // Update clicked-on-buddys-diary-entry-datetime in user's buddy-diary-entries
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
                    'clicked-on-buddys-diary-entry-datetime': getReadableDatetime()
                  }
                : e
            );
            await updateDoc(userRef, { 'buddy-diary-entries': updatedBuddyEntries });
          }
        }
      }
      setLoading(false);
    };
    fetchEntry();
  }, [buddyPhone, entryId, showReply]);

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
  };

  return (
    <div className="App-bg">
      <div className="card message-detail-card">
        <BuddyHeader onProfileClick={handleProfileClick} />
        {loading && <div>Loading...</div>}
        {!loading && entry && showReply && (
          <>
            <div className="message-detail-bubble" style={{ background: '#e0f2ff', border: '4px solid #32a8ff', borderRadius: '36px', marginBottom: 24 }}>
              <div className="message-detail-title" style={{ fontSize: '2.2rem', fontWeight: 700, textAlign: 'center', marginBottom: 24 }}>Sent my diary entry
                <span className="messages-bubble-timestamp" style={{ float: 'right', fontSize: '1.2rem', fontWeight: 400 }}>{entry.datetime}</span>
              </div>
              <div style={{ background: '#fff', border: '4px solid #32a8ff', borderRadius: '18px', padding: 18, fontSize: '1.18rem', color: '#222', marginBottom: 24 }}>{entry['diary-entry-content']}</div>
              {entry['buddys-reply'] && entry['buddys-reply']['buddys-reply-content'] && (
                <>
                  <div style={{ color: '#a78bfa', fontWeight: 700, fontSize: '1.3rem', marginBottom: 8 }}>{buddyName} replied...</div>
                  <div style={{ background: '#ede6ff', border: '4px solid #a78bfa', borderRadius: '18px', padding: 18, fontSize: '1.18rem', color: '#222', marginBottom: 8 }}>{entry['buddys-reply']['buddys-reply-content']}</div>
                  <div style={{ color: '#888', fontSize: '1rem', textAlign: 'right' }}>{entry['buddys-reply']['clicked-on-buddys-reply-datetime']}</div>
                </>
              )}
            </div>
            <button className="message-detail-back-btn" onClick={() => navigate(-1)}>&larr; Back</button>
          </>
        )}
        {!loading && entry && !showReply && (
          <>
            <div className="message-detail-bubble">
              <div className="message-detail-title">New diary entry from {buddyName} <span className="messages-bubble-timestamp">{entry.datetime}</span></div>
              <div className="message-detail-body">{entry['diary-entry-content']}</div>
            </div>
            <div className="message-detail-reply-label">Write a thoughtful reply</div>
            <textarea
              className="message-detail-reply-input"
              placeholder="Type your reply here..."
              value={reply}
              onChange={e => setReply(e.target.value)}
              rows={4}
              disabled={sent}
            />
            <button className="message-detail-send-btn" onClick={handleReply} disabled={loading || sent}>Send</button>
            <button className="message-detail-back-btn" onClick={() => navigate(-1)}>&larr; Back</button>
            {sent && <div className="message-detail-confirm">Reply sent!</div>}
          </>
        )}
        {!loading && !entry && <div>Diary entry not found.</div>}
      </div>
      <NavBar active="messages" />
    </div>
  );
}

export default MessageDetail; 