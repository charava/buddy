// Author: Charlotte Rosario
// Created: July 2025
// Project: BUDDY
// Description: Teen-to-teen buddy matching app
// Last Updated: August 1, 2025

import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './LandingPage';
import SignIn from './SignIn';
import SignUp from './SignUp';
import MeetBuddy from './MeetBuddy';
import Home from './Home';
import DiaryShare from './DiaryShare';
import Messages from './Messages';
import MessageDetail from './MessageDetail';
import About from './About';

function App() {
  
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/about" element={<About />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/meet-buddy" element={<MeetBuddy />} />
        <Route path="/home" element={<Home />} />
        <Route path="/diary-share" element={<DiaryShare />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/messages/:id" element={<MessageDetail />} />
      </Routes>
    </Router>
  );
}

export default App;
