import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './App.css';

function LandingPage() {
  const navigate = useNavigate();
  const handleSignIn = useCallback(() => navigate('/signin'), [navigate]);
  const handleSignUp = useCallback(() => navigate('/signup'), [navigate]);
  return (
    <div className="App-bg">
      <div className="card">
        <div className="card-content">
          <div style={{ height: '80px' }}></div>
          <h2 className="welcome">Welcome to</h2>
          <h1 className="buddy">Buddy</h1>
          <div className="desc">
            <p><em>Send deep, intimate messages to a buddy who has gone through similar challenges or experiences as you. Exchange diary entries about how you're feeling.</em></p>
          </div>
          <div className="landing-btns">
            <button className="sign-in-btn" onClick={handleSignIn}>Sign in</button>
            <button className="sign-in-btn" onClick={handleSignUp} style={{marginBottom: '18px'}}>Set up my account</button>

          </div>
        </div>
      </div>
    </div>
  );
}

export default LandingPage; 