import React, { useEffect, useState } from 'react';
import '../App.css';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

function BuddyHeader({ onProfileClick }) {
  const [buddyName, setBuddyName] = useState('');
  const navigate = useNavigate();

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

  return (
    <div className="buddy-header-bar">
      <div className="home-buddy-avatar">
        <img src="/happyface.png" alt="Buddy avatar" className="buddy-header-avatar-img" />
      </div>
      <div className="home-buddy-info">
        <div className="home-buddy-label">My buddy: <b>{buddyName}</b></div>
        <a className="home-buddy-profile" href="#" onClick={onProfileClick}>(View {buddyName}’s Profile)</a>
      </div>
      <button
        className="buddy-header-signout"
        onClick={() => {
          localStorage.clear();
          navigate('/');
        }}
      >
        Sign out
      </button>
    </div>
  );
}

export default BuddyHeader; 