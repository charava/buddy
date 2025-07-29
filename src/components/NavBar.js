import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

function NavBar({ active }) {
  const navigate = useNavigate();
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false);

  useEffect(() => {
    const checkUnreadMessages = async () => {
      const userPhone = localStorage.getItem('userPhone');
      if (!userPhone) return;
      
      try {
        const userRef = doc(db, 'users', userPhone);
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) return;
        
        const userData = userSnap.data();
        const buddyEntries = userData['buddy-diary-entries'] || [];
        const diaryEntries = userData['diary-entries'] || [];
        
        // Check if there are any received messages that haven't been replied to
        const hasUnrepliedMessages = buddyEntries.some(entry => 
          !entry['replied-to-buddys-diary-entry-datetime'] || 
          entry['replied-to-buddys-diary-entry-datetime'].trim() === ''
        );
        
        // Check if there are any new replies from buddy that haven't been clicked on
        const hasUnreadReplies = diaryEntries.some(entry => 
          entry['buddys-reply'] && 
          entry['buddys-reply']['buddys-reply-content'] && 
          entry['buddys-reply']['buddys-reply-content'].trim() !== '' &&
          (!entry['buddys-reply']['clicked-on-buddys-reply-datetime'] || 
           entry['buddys-reply']['clicked-on-buddys-reply-datetime'].trim() === '')
        );
        
        setHasUnreadMessages(hasUnrepliedMessages || hasUnreadReplies);
      } catch (error) {
        console.error('Error checking unread messages:', error);
      }
    };

    checkUnreadMessages();
  }, []);

  return (
    <div className="home-bottom-nav">
      <div
        className={`home-bottom-nav-btn${active === 'home' ? ' home-bottom-nav-btn-active' : ''}`}
        onClick={() => navigate('/home')}
      >
        {/* Smiley face icon */}
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 64 64" fill="none" stroke="#222" strokeWidth="2.2">
          <circle cx="32" cy="32" r="28" fill="none" stroke="#222" strokeWidth="3" />
          <circle cx="24" cy="28" r="3" fill="#222" />
          <circle cx="40" cy="28" r="3" fill="#222" />
          <path d="M24 42 Q32 50 40 42" stroke="#222" strokeWidth="3" fill="none" strokeLinecap="round" />
        </svg>
      </div>
      <div
        className={`home-bottom-nav-btn${active === 'messages' ? ' home-bottom-nav-btn-active' : ''}${hasUnreadMessages ? ' home-bottom-nav-btn-notification' : ''}`}
        onClick={() => navigate('/messages')}
      >
        {/* Envelope/mail icon */}
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 64 64" fill="none" stroke="#222" strokeWidth="2.2">
          <rect x="10" y="18" width="44" height="28" rx="6" fill="none" stroke="#222" strokeWidth="3" />
          <polyline points="10,18 32,38 54,18" fill="none" stroke="#222" strokeWidth="3" />
        </svg>
        {/* Notification dot */}
        {hasUnreadMessages && (
          <div className="home-bottom-nav-notification-dot" />
        )}
      </div>
    </div>
  );
}

export default NavBar; 