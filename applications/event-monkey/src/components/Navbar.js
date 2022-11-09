import React from 'react'

import './Navbar.css'

import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';



export default function NavbarEM() {

  const path = window.location.pathname;

  return (
    <>
      <Navbar expand="lg" className="shadow border-bottom border-warning">
        <Container>
          <Navbar.Brand href="home.html">
            <img 
            src="./eventmonkey500.png"
            alt=""
            width="55"
            height="55"
            className="logo d-inline-block align-middle"
            />{' '}
            <h5 href="/">
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
      
              <NavDropdown title="User" id="basic-nav-dropdown">
                <NavDropdown.Item href=".pages/Profile.js">Profile</NavDropdown.Item>
                <NavDropdown.Item href=".pages/Interests.js">
                  Interests
                </NavDropdown.Item>
                <NavDropdown.Item href="#action/3.3">Something</NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item href="#action/3.4">
                  Separated link
                </NavDropdown.Item>
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