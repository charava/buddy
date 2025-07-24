import React, { useEffect, useState } from 'react';
import './App.css';
import { useNavigate } from 'react-router-dom';
import { db } from './firebase';
import { doc, getDoc } from 'firebase/firestore';

function MeetBuddy() {
  const navigate = useNavigate();
  const [buddy, setBuddy] = useState(null);

  useEffect(() => {
    const fetchBuddy = async () => {
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
      setBuddy(buddySnap.data());
    };
    fetchBuddy();
  }, []);


  const handleNext = () => navigate('/home');

  if (!buddy) {
    return <div className="App-bg"><div className="card meet-buddy-card"><div className="card-content">Loading buddy info...</div></div></div>;
  }

  return (
    <div className="App-bg">
      <div className="card meet-buddy-card">
        <div className="card-content">
          <h2 className="meet-buddy-title">Meet your buddy!</h2>
          <div className="buddy-info-box">
            <div className="buddy-header">
              <span className="buddy-name">{buddy.username}</span>
            </div>
            <div className="buddy-age-gender">{buddy.age} years old • {buddy.gender}</div>
            <div className="buddy-section-label">Challenges</div>
            <div className="buddy-challenges">
              {(buddy.challenges || []).map((c, i) => (
                <span key={i} className={buddy['must-have-challenges'] && buddy['must-have-challenges'].includes(c) ? 'buddy-challenge filled' : 'buddy-challenge'}>{c}</span>
              ))}
            </div>
            <div className="buddy-section-label" style={{marginTop: '18px'}}>My situation</div>
            <div className="buddy-situation-box">
              {buddy.story}
            </div>
            <div className="buddy-section-label" style={{marginTop: '18px', fontWeight: 500}}>Communication Frequency: {buddy['comm-freq']}</div>
            <div className="buddy-socials">
              {buddy['social-insta'] && buddy['social-insta'].trim() !== '' && <>Instagram: {buddy['social-insta']}<br/></>}
              {buddy['social-snap'] && buddy['social-snap'].trim() !== '' && <>Snapchat: {buddy['social-snap']}<br/></>}
              {buddy['social-twitter'] && buddy['social-twitter'].trim() !== '' && <>Twitter: {buddy['social-twitter']}<br/></>}
              {buddy['social-link'] && buddy['social-link'].trim() !== '' && <>LinkedIn: {buddy['social-link']}<br/></>}
            </div>
          </div>
        </div>
        <button className="meet-buddy-next-btn" onClick={handleNext}>→</button>
      </div>
    </div>
  );
}

export default MeetBuddy; 