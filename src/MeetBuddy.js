import React, { useEffect, useState } from 'react';
import './App.css';
import { useNavigate } from 'react-router-dom';
import { db } from './firebase';
import { doc, getDoc } from 'firebase/firestore';
// import BuddyHeader from './components/BuddyHeader';


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
    <div className="meet-buddy-bg">
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
        

      </div>
      </div>



      <div className="card meet-buddy-card">
        <div className="card-content">
          <div className="buddy-info-box">
            <div className="buddy-header">
              <div className="buddy-name-label">my buddy: </div>
              <span className="buddy-name">{buddy.username}</span>
            </div>
            <div className="buddy-age-gender">{buddy.age} years old • {buddy.gender}</div>
            <div className="buddy-situation-box">
              {buddy.story}
            </div>

            <div className="buddy-challenges">
              {(buddy.challenges || []).map((c, i) => (
                <span key={i} className="buddy-challenge filled">{c}</span>
              ))}
            </div>
            
            <div className="buddy-section-label" style={{marginTop: '18px', fontWeight: 500}}><strong>communication frequency:</strong> {buddy['comm-freq']}</div>
            <div className="buddy-socials">
              {buddy['social-insta'] && buddy['social-insta'].trim() !== '' && <><strong>instagram:</strong> {buddy['social-insta']}<br/></>}
              {buddy['social-snap'] && buddy['social-snap'].trim() !== '' && <><strong>snapchat:</strong> {buddy['social-snap']}<br/></>}
              {buddy['social-twitter'] && buddy['social-twitter'].trim() !== '' && <><strong>twitter:</strong> {buddy['social-twitter']}<br/></>}
              {buddy['social-link'] && buddy['social-link'].trim() !== '' && <><strong>linkedin:</strong> {buddy['social-link']}<br/></>}
            </div>
          </div>
          <button className="landing-btn" onClick={handleNext}>→</button>

        </div>
      </div>
    </div>
  );
}

export default MeetBuddy; 