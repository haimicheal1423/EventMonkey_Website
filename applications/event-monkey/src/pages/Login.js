import { useEffect, useState } from 'react'
import { useNavigate, Link } from "react-router-dom";
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Container from 'react-bootstrap/Container';
import Axios from 'axios';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const  handleSubmit = (e) => {
        e.preventDefault();
        if(email && password){
            Axios.post(`http://eventmonkey.xyz:4000/users/login`,{email,password}).then((response) => {
                navigate('/user/dashboard');
                localStorage.setItem('token',true);
            }).catch(e => {
                alert(JSON.stringify(e.response.data));
            });
        }else{
            alert('Email/Password is required');
        }
    }

    useEffect(() => {
        if(localStorage.getItem('token') === true ){
            navigate('/user/dashboard');
        }
    },[localStorage.getItem('token')])

    return (
        <Container>
        <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="formBasicEmail">
                <Form.Label>Email address</Form.Label>
                <Form.Control type="email" placeholder="Enter email" value={email} onChange={(e)=>setEmail(e.target.value)} />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formBasicPassword">
                <Form.Label>Password</Form.Label>
                <Form.Control type="password" placeholder="Password" value={password} onChange={(e)=>setPassword(e.target.value)} />
            </Form.Group>
            <Button variant="primary" type="submit">
                Submit
            </Button>
        </Form>
        </Container>
    );
}

export default Login;