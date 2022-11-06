import './App.css';
import { Routes, Route } from "react-router-dom";
import Home from './Home';
import Event from './Event';
import { Link } from "react-router-dom";

function App() {
    return (
        <div className="App">
            <header>
                <div className="eventmonkey">
                    <a href="/"><img src="profileImages/eventmonkey.jpg" id="logo" /></a>
                </div>

                <h1>EventMonkey
                    <nav className="navbar">
                        <div className="navbar-nav">
                            <ul>
                                <li><Link to="/">Home</Link></li>
                                <li><Link to="/event">Event</Link></li>
                            </ul>
                        </div>
                    </nav>
                </h1>
            </header>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/event" element={<Event />} />
                <Route path="/event/:genre" element={<Event />} />
            </Routes>
        </div>
    );
}

export default App;
