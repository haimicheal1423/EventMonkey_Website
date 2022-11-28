import { useState } from 'react'
import { useNavigate } from "react-router-dom";

import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Card from 'react-bootstrap/Card';
import Container from 'react-bootstrap/Container';
import Axios from 'axios';

import '../assets/css/signup.css'
import { Dropdown, DropdownButton } from "react-bootstrap";

export default function Signup() {
    const [type, setType] = useState('Attendee or Organizer');
    const [username, setUserName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const handleSubmit = (e) => {
        e.preventDefault();
        if (email && password) {
            Axios.post(`http://eventmonkey.xyz:4000/users/register`, {type, username, email, password }).then((response) => {
                navigate('/login');
            }).catch(e => {
                alert(JSON.stringify(e.response.data));
            });
        } else {
            alert('Email/Password is required');
        }
    }

    return (
        <>
            <Container className="login-container">
                <Card className="signup-card shadow">
                    <Form onSubmit={handleSubmit}>
                        <h4>Signup</h4>
                        <hr/>
                        <Form.Group className="mb-3" controlId="formBasicEmail">
                            <Form.Label>Type</Form.Label>
                            <DropdownButton title={type} onSelect={setType}>
                                <Dropdown.Item eventKey='Attendee'>Attendee</Dropdown.Item>
                                <Dropdown.Item eventKey='Organizer'>Organizer</Dropdown.Item>
                            </DropdownButton>
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="formBasicEmail">
                            <Form.Label>Username</Form.Label>
                            <Form.Control type="text" placeholder="" value={username} onChange={(e) => setUserName(e.target.value)} />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="formBasicEmail">
                            <Form.Label>Email address</Form.Label>
                            <Form.Control type="email" placeholder="" value={email} onChange={(e) => setEmail(e.target.value)} />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="formBasicPassword">
                            <Form.Label>Password</Form.Label>
                            <Form.Control type="password" placeholder="" value={password} onChange={(e) => setPassword(e.target.value)} />
                        </Form.Group>
                        <Button variant="warning" type="submit">
                            Submit
                        </Button>
                    </Form>
                </Card>
            </Container>
        </>

    )
}
