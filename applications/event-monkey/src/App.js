import './App.css';

import React, { useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom'

import NavbarEM from './components/Navbar.js';
import FooterEM from './components/Footer.js';

import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import Interests from './pages/Interests'
import AboutUs from './pages/AboutUs'
import { SingleEvent, EventSearch } from './pages/Event'
import TrySomethingNew from './pages/TrySomethingNew';
import Profile from './pages/Profile';
import { isLoggedIn } from './utils';

function App() {

    const ProtectRoute = ({ children }) => {
        if (!isLoggedIn()) {
            return <Navigate to="/" replace/>
        }
        return children;
    }

  return (
    <>
      <NavbarEM/>
      <div className="App">
        <Routes>
          <Route exact path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/aboutus" element={<AboutUs />} />
          <Route path="/interests" element={<Interests />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/trysomethingnew" element={<TrySomethingNew />} />
          <Route path="/event" element={<ProtectRoute><EventSearch /></ProtectRoute>} />
          <Route path="/event/search" element={<ProtectRoute><EventSearch /></ProtectRoute>} />
          <Route path="/event/id/:eventId" element={<ProtectRoute><SingleEvent /></ProtectRoute>} />
          <Route path="/dashboard" element={<ProtectRoute><Dashboard /></ProtectRoute>} />
          <Route path="/profile" element={<ProtectRoute><Profile /></ProtectRoute>} />
        </Routes>

        <hr/>

      <FooterEM/>
      </div>
    </>
  );
}

export default App;
