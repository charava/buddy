import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';

function NavBar({ active }) {
  const navigate = useNavigate();
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
        className={`home-bottom-nav-btn${active === 'messages' ? ' home-bottom-nav-btn-active' : ''}`}
        onClick={() => navigate('/messages')}
      >
        {/* Envelope/mail icon */}
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 64 64" fill="none" stroke="#222" strokeWidth="2.2">
          <rect x="10" y="18" width="44" height="28" rx="6" fill="none" stroke="#222" strokeWidth="3" />
          <polyline points="10,18 32,38 54,18" fill="none" stroke="#222" strokeWidth="3" />
        </svg>
      </div>
    </div>
  );
}

export default NavBar; 