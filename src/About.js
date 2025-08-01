// Author: Charlotte Rosario
// Created: July 2025
// Project: BUDDY
// Description: Teen-to-teen buddy matching app
// Last Updated: August 1, 2025

import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './App.css';

function About() {
  const navigate = useNavigate();
  const handleBack = useCallback(() => navigate('/'), [navigate]);
  
  return (
    <div className="landing-bg">
      <div className="landing-card">
        <button className="landing-back-btn" onClick={handleBack}>
          ← back
        </button>
        <img src="/Buddy_Logo.png" alt="Somethings Buddy Logo" className="buddy-logo-top"/>
        <img src="/cloud.png" alt="Clouds" className="cloud-img-top" />
        
        <div className="about-content">          
          <div className="about-description">
            <p>Send deep, intimate notes to a buddy who shares similar experiences with you.</p>
          </div>
          
          <div className="about-beta">
            <p><em>This app is currently in beta.</em></p>
          </div>
          
          <div className="about-crisis">
            <p><strong>If you are in crisis, please call the 988 Suicide & Crisis Lifeline.</strong></p>
            <p>988 is available 24/7 for free, confidential support.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default About; 