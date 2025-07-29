import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './App.css';
import BuddyHeader from './components/BuddyHeader';
import NavBar from './components/NavBar';
import { db } from './firebase';
import { doc, getDoc } from 'firebase/firestore';

function parseCustomDatetime(dt) {
  if (!dt) return 0;
  // Match: July 22, 2025 at 03:11 PM
  const match = dt.match(/^([A-Za-z]+) (\d{1,2}), (\d{4}) at (\d{1,2}):(\d{2}) (AM|PM)$/);
  if (match) {
    let [_, monthName, day, year, hour, minute, ampm] = match;
    const months = [
      'January','February','March','April','May','June','July','August','September','October','November','December'
    ];
    const month = months.indexOf(monthName);
    if (month === -1) return 0;
    hour = parseInt(hour, 10);
    if (ampm === 'PM' && hour !== 12) hour += 12;
    if (ampm === 'AM' && hour === 12) hour = 0;
    return new Date(year, month, day, hour, minute).getTime();
  }
  return 0;
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

function Messages() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [buddyName, setBuddyName] = useState('Buddy');
  const [buddyPhone, setBuddyPhone] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const fetchEntries = async () => {
      setLoading(true);
      const userPhone = localStorage.getItem('userPhone');
      if (!userPhone) return;
      const userRef = doc(db, 'users', userPhone);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) return;
      const userData = userSnap.data();
      const sent = (userData['diary-entries'] || []).filter(entry => entry['sent-to-buddy'] === true).map(entry => ({
        ...entry,
        _type: 'sent'
      }));
      const buddy = (userData['buddy-diary-entries'] || []).map(entry => ({
        ...entry,
        _type: 'received'
      }));
      const all = [...sent, ...buddy];
      all.sort((a, b) => parseCustomDatetime(a.datetime) - parseCustomDatetime(b.datetime));
      setMessages(all);
      const buddyPhone = userData['buddy-phone'];
      setBuddyPhone(buddyPhone || '');
      if (buddyPhone) {
        const buddyRef = doc(db, 'users', buddyPhone);
        const buddySnap = await getDoc(buddyRef);
        if (buddySnap.exists()) {
          const buddyData = buddySnap.data();
          setBuddyName(buddyData.username || 'Buddy');
        }
      }
      setLoading(false);
    };
    fetchEntries();
  }, []);

  // Auto-scroll to bottom when entries change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading]);

  const handleProfileClick = (e) => {
    e.preventDefault();
    navigate('/meet-buddy');
  };

  return (
    <div className="landing-bg">
      <div className="card-two messages-card">
        <BuddyHeader onProfileClick={handleProfileClick} />
        <div className="messages-list">
          {loading && <div>Loading...</div>}
          {messages.map((entry, idx) => {
            // Received from buddy: show both bubbles if replied (align left)
            if (entry._type === 'received' && entry['replied-to-buddys-diary-entry-datetime']) {
              return (
                <div className="messages-bubble-reply-pair align-left" key={entry['diary-entry-id'] + '-received-replied'}>
                  <div 
                    className="messages-bubble messages-bubble-received messages-bubble-received-transparent messages-bubble-large"
                    style={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/messages/${entry['diary-entry-id']}`, { state: { buddyPhone, entryId: entry['diary-entry-id'], showMyReply: true } })}
                  >
                    <img src="/play-arrow-grey.png" alt="Play" className="play-icon" />
                    <span className="messages-bubble-label messages-bubble-label-received messages-bubble-label-large">
                      Received {buddyName}'s note
                    </span>
                    <span className="messages-bubble-timestamp">{formatCondensedTimestamp(entry.datetime)}</span>
                  </div>
                  <div 
                    className="messages-bubble messages-bubble-sent messages-bubble-large"
                    style={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/messages/${entry['diary-entry-id']}`, { state: { buddyPhone, entryId: entry['diary-entry-id'], showMyReply: true } })}
                  >
                    <span className="messages-bubble-label messages-bubble-label-sent messages-bubble-label-large">
                      Supported {buddyName} &lt;3
                    </span>
                    <span className="messages-bubble-timestamp">{formatCondensedTimestamp(entry['replied-to-buddys-diary-entry-datetime'])}</span>
                  </div>
                </div>
              );
            }
            // Sent by user: show both bubbles if reply exists (align right)
            if (entry._type === 'sent' && entry['buddys-reply'] && entry['buddys-reply']['buddys-reply-content']) {
              const hasViewedReply = entry['buddys-reply']['clicked-on-buddys-reply-datetime'] && entry['buddys-reply']['clicked-on-buddys-reply-datetime'].trim() !== '';
              return (
                <div className="messages-bubble-reply-pair align-right" key={entry['diary-entry-id'] + '-sent-replied'}>
                  <div 
                    className="messages-bubble messages-bubble-sent messages-bubble-large"
                    style={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/messages/${entry['diary-entry-id']}`, { state: { buddyPhone, entryId: entry['diary-entry-id'], showReply: true } })}
                  >
                    <span className="messages-bubble-label messages-bubble-label-sent messages-bubble-label-large">
                      Sent note
                    </span>
                    <span className="messages-bubble-timestamp">{formatCondensedTimestamp(entry.datetime)}</span>
                    <img src="/play-arrow-grey.png" alt="Play" className="play-icon play-icon-right" />
                  </div>
                  <div
                    className={`messages-bubble messages-bubble-received messages-bubble-large${!hasViewedReply ? ' messages-bubble-received-new' : ' messages-bubble-received-transparent'}`}
                    style={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/messages/${entry['diary-entry-id']}`, { state: { buddyPhone, entryId: entry['diary-entry-id'], showReply: true } })}
                  >
                    <span className="messages-bubble-label messages-bubble-label-received messages-bubble-label-large">
                      {!hasViewedReply ? `${buddyName} sent support <3` : `Received ${buddyName}'s reply`}
                    </span>
                    <span className="messages-bubble-timestamp">{formatCondensedTimestamp(entry['buddys-reply'] && entry['buddys-reply']['buddys-reply-datetime'] ? entry['buddys-reply']['buddys-reply-datetime'] : (entry['buddys-reply']['clicked-on-buddys-reply-datetime'] || entry.datetime || '—'))}</span>
                  </div>
                </div>
              );
            }
            // Received from buddy: not yet replied (align left)
            if (entry._type === 'received') {
              return (
                <div
                  key={entry['diary-entry-id']}
                  className="messages-bubble messages-bubble-received messages-bubble-received-new align-left"
                  style={{ cursor: 'pointer', position: 'relative' }}
                  onClick={() => navigate(`/messages/${entry['diary-entry-id']}`, { state: { buddyPhone, entryId: entry['diary-entry-id'] } })}
                >
                  <img src="/play-arrow-color.png" alt="Play" className="play-icon" />
                  <span className="messages-bubble-label messages-bubble-label-received">{buddyName} sent a note</span>
                  <span className="messages-bubble-timestamp">{formatCondensedTimestamp(entry.datetime)}</span>
                </div>
              );
            }
            // Sent by user: no reply yet (align right)
            return (
              <div
                key={entry['diary-entry-id']}
                className="messages-bubble messages-bubble-sent align-right"
                style={{ cursor: 'pointer', position: 'relative' }}
                onClick={() => navigate(`/messages/${entry['diary-entry-id']}`, { state: { buddyPhone, entryId: entry['diary-entry-id'], showReply: true } })}
              >
                <span className="messages-bubble-label messages-bubble-label-sent">Sent note</span>
                <span className="messages-bubble-timestamp">{formatCondensedTimestamp(entry.datetime)}</span>
                <img src="/play-arrow-grey.png" alt="Play" className="play-icon play-icon-right" />
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </div>
      <NavBar active="messages" />
    </div>
  );
}

export default Messages; 