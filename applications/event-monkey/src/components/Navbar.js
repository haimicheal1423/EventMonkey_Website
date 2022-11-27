import React from 'react'

import './Navbar.css'

import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';

import HomeIcon from '@mui/icons-material/Home';

export default function NavbarEM() {

  const path = window.location.pathname;

  return (
    <>
      <Navbar expand="lg" className="shadow border-bottom border-warning">
        <Container>
          <Navbar.Brand href="/home">
            <img
            src="./eventmonkey500.png"
            alt=""
            width="55"
            height="55"
            className="logo d-inline-block align-middle"
            />{' '}
            <h5 href="/home">
              EventMonkey
            </h5>
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link href="/">Home</Nav.Link>
              <Nav.Link href="/aboutus">About Us</Nav.Link>
              <Nav.Link href="/login">Login</Nav.Link>
              <Nav.Link href="/signup">Signup</Nav.Link>
              <Nav.Link href="/event">Event</Nav.Link>

              <NavDropdown title="User" id="basic-nav-dropdown">
                <NavDropdown.Item href="/dashboard">Dashboard</NavDropdown.Item>
                <NavDropdown.Item href="/profile">Profile</NavDropdown.Item>
                <NavDropdown.Item href="/interests">Interests</NavDropdown.Item>
                <NavDropdown.Divider/>
                <NavDropdown.Item href="/trysomethingnew">Try Something New</NavDropdown.Item>
              </NavDropdown>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </>
  );
}

function CustomLink ({href, children, ...props}) {
  return (
    <Nav.Link href={href}>{children}</Nav.Link>

  )
}
