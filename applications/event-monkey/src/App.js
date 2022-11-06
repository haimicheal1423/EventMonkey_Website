import './App.css';

import { Route, Routes } from 'react-router-dom'

import NavbarEM from './components/Navbar.js';
import FooterEM from './components/Footer.js';

import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Profile from './pages/Profile'
import Interests from './pages/Interests'
import AboutUs from './pages/AboutUs'


function App() {
  return (
    <>
        <NavbarEM/>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/aboutus" element={<AboutUs />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/interests" element={<Interests />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Routes>
        <hr></hr>
        <FooterEM/>
      </div>
    </>
  );
}

export default App;
