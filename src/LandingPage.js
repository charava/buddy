// Author: Charlotte Rosario
// Created: July 2025
// Project: BUDDY
// Description: Teen-to-teen buddy matching app
// Last Updated: August 1, 2025

import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './App.css';

function LandingPage() {
  const navigate = useNavigate();
  const handleSignIn = useCallback(() => navigate('/signin'), [navigate]);
  const handleSignUp = useCallback(() => navigate('/signup'), [navigate]);
  const handleAbout = useCallback(() => navigate('/about'), [navigate]);
  
  return (
    <div className="landing-bg">
      <button className="landing-about-btn" onClick={handleAbout}>
        about
      </button>
      <div className="landing-card">
        <img src="/Buddy_Logo.png" alt="Somethings Buddy Logo" className="buddy-logo"/>
        <img src="/cloud.png" alt="Clouds" className="cloud-img" />

        {/* <div className="landing-desc desc">
          <em>Send deep, intimate notes to a buddy who shares similar experiences with you.</em>
        </div> */}
        <div className="landing-btns">
          <button className="landing-btn signup-btn" onClick={handleSignUp}>sign up</button>
          <button className="landing-btn signin-btn" onClick={handleSignIn}>log in</button>
        </div>
      </div>
    </div>
  );
}




// <div className="App-bg">
// <div className="card">
//   <div className="card-content">
//     <img src="/Buddy_Logo.png" alt="Somethings Buddy Logo"/>
//     {/* <h2 className="welcome">Welcome to</h2>
//     <h1 className="buddy">Buddy</h1> */}
//     <div className="desc">
//       <p><em>Send deep, intimate messages to a buddy who has gone through similar challenges or experiences as you. Exchange diary entries about how you're feeling.</em></p>
//     </div>
//     <div className="landing-btns">
//       <button className="sign-in-btn" onClick={handleSignIn}>Sign in</button>
//       <button className="sign-in-btn" onClick={handleSignUp} style={{marginBottom: '18px'}}>Set up my account</button>

//     </div>

export default LandingPage; 