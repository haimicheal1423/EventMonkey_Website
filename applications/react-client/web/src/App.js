import './App.css';
import { Routes, Route } from "react-router-dom";
import Home from './components/Home';
import Login from './components/Login';
import Event from './components/Event';
import Dashboard from './components/Dashboard';
import 'bootstrap/dist/css/bootstrap.min.css';
import Nav from 'react-bootstrap/Nav';

function App() {
    return (
        <div className="App">
            <header>
                <div className="eventmonkey">
                    <a href="/"><img src="profileImages/eventmonkey.jpg" id="logo" /></a>
                </div>

                <h1>EventMonkey</h1>
                    <Nav>
                        <Nav.Item>
                            <Nav.Link href="/">Home</Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link href="/event">Event</Nav.Link>
                        </Nav.Item>
                        <Nav.Item >
                            <Nav.Link href="/login">login</Nav.Link>
                        </Nav.Item>
                    </Nav>
            </header>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/user/dashboard" element={<Dashboard />} />
                <Route path="/event" element={<Event />} />
                <Route path="/event/:genre" element={<Event />} />
            </Routes>
        </div>
    );
}

export default App;
