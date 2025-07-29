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
    <div className="buddy-header-container">
      <img src="/Buddy_Logo.png" alt="Somethings Buddy Logo" className="buddy-logo-top"/>
      <img src="/cloud.png" alt="Clouds" className="cloud-img-top" />
      
        <div className="buddy-header-bar">
          <button
            className="buddy-header-signout"
            onClick={() => {
              localStorage.clear();
              navigate('/');
            }}
          >
            sign out
          </button>
      

      <div className="home-buddy-info">
        <div className="home-buddy-label">my buddy: <a className="home-buddy-profile" href="#" onClick={onProfileClick}><b>{buddyName}</b></a></div>
      </div>
      
    </div>
    </div>
  );
}

export default BuddyHeader; 