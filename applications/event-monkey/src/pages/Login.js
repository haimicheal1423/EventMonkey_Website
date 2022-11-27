import { useEffect, useState } from 'react'
import { useNavigate } from "react-router-dom";
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Card from 'react-bootstrap/Card';
import Container from 'react-bootstrap/Container';
import Axios from 'axios';

import '../assets/css/login.css'

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        if (email && password) {
            Axios.post(`http://localhost:4000/users/login`, { email, password })
                .then(response => {
                    localStorage.setItem('token', 'true');
                    localStorage.setItem('user', JSON.stringify(response.data));
                    navigate('/dashboard');
                }).catch(e => {
                alert(JSON.stringify(e.response.data));
            });
        } else {
            alert('Email/Password is required');
        }
    }

    useEffect(() => {
        if (localStorage.getItem('token') === 'true') {
            navigate('/dashboard');
        }
    }, [localStorage.getItem('token')])

    return (
        <>
            <Container className="login-container">
                <Card className="login-card shadow">
                    <Form onSubmit={handleSubmit}>
                        <h4>Login</h4>
                        <hr/>
                        <Form.Group className="mb-3" controlId="formBasicEmail">
                            <Form.Label>Email</Form.Label>
                            <Form.Control type="email" placeholder="" value={email} onChange={(e)=>setEmail(e.target.value)} />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="formBasicPassword">
                            <Form.Label>Password</Form.Label>
                            <Form.Control type="password" placeholder="" value={password} onChange={(e)=>setPassword(e.target.value)} />
                        </Form.Group>
                        <Button variant="warning" type="submit">
                            Submit
                        </Button>
                    </Form>
                </Card>
            </Container>
        </>
    );
}

export default Login;
