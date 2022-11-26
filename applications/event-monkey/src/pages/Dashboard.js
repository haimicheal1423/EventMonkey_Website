import Card from 'react-bootstrap/Card';
import Container from 'react-bootstrap/esm/Container';
import ListGroup from 'react-bootstrap/ListGroup';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { useNavigate } from 'react-router';
import Button from 'react-bootstrap/Button';
import React, { useEffect, useState } from 'react';
import Axios from 'axios';

function Dashboard() {
    const navigate = useNavigate();
    const [user, setUser] = useState(undefined);
    const [friendsList, setFriendsList] = useState([]);
    const [interestsList, setInterestsList] = useState([]);

    useEffect(() => {
        setUser(JSON.parse(localStorage.getItem('user')));
    }, []);

    useEffect(() => {
        if (!user) {
            return;
        }

        Axios.get(`http://localhost:4000/users/${user.id}/friends`)
            .then(response => void setFriendsList(response.data))
            .catch(e => alert(e.data));

        Axios.get(`http://localhost:4000/users/${user.id}/interests`)
            .then(response => void setInterestsList(response.data))
            .catch(e => alert(e.data));
    }, [user]);

    if (!user) {
        return <>Loading...</>;
    }

    return (
        <>
            <Container className='d-inline-flex'>
                <Row className='mr-2 my-2'>
                    <Col>
                        <Card className='p-3' style={{ width: '18rem' }}>
                            <Card.Img variant='top' src={user.profileImage ? user.profileImage.url : 'holder.js/100px180?text=Image cap'} />
                            <Card.Body>
                                <Card.Title>Welcome {user.username}!</Card.Title>
                                <Card.Text>
                                    Some quick example text to build on the card title and make up the
                                    bulk of the card's content.
                                </Card.Text>
                            </Card.Body>
                            <ListGroup className='list-group-flush'>
                                <ListGroup.Item>{user.username}</ListGroup.Item>
                                <ListGroup.Item>Dapibus ac facilisis in</ListGroup.Item>
                                <ListGroup.Item>
                                    <Button variant='danger' onClick={() => {
                                        localStorage.setItem('token', 'false');
                                        localStorage.removeItem('user');
                                        navigate('/');
                                    }}>Logout</Button>
                                </ListGroup.Item>
                            </ListGroup>
                        </Card>
                    </Col>
                </Row>
                <Row className='mr-2 my-2'>
                    <Col className='pt-3 d-flex flex-column align-items-baseline'>
                        <h5 className='my-0'>Interests</h5>
                        <hr className='my-2 w-100' />
                        <form className='d-flex'>
                            <input
                                type='text'
                                className='form-control border-warning'
                                placeholder='Enter genre name'/>
                            <Button variant='primary' className='ml-2'>Add</Button>
                            <Button variant='danger' className='ml-2'>Remove</Button>
                        </form>
                        <div className='mt-2 d-flex flex-wrap overflow-auto' style={{maxHeight: '10rem'}}>
                            {interestsList.map(genre => {
                                return (
                                    <div key={genre.id} className='mr-2 my-1 px-2 py-1 bg-secondary text-light rounded-pill'>
                                        {genre.name}
                                    </div>
                                );
                            })}
                        </div>
                    </Col>
                    <Col className='pt-3 d-flex flex-column align-items-baseline'>
                        <h5 className='my-0'>Friends</h5>
                        <hr className='my-2 w-100' />
                        <form className='d-flex'>
                            <input
                                type='text'
                                className='form-control border-warning'
                                placeholder='Enter friend name'/>
                            <Button variant='primary' className='ml-2'>Add</Button>
                            <Button variant='danger' className='ml-2'>Remove</Button>
                        </form>
                        <div className='d-flex overflow-auto' style={{width: '52rem', minHeight: '10rem'}}>
                            {friendsList.map(friend => {
                                return (
                                    <Card key={friend.id} className='mr-3 my-3' style={{width: '12rem', minWidth: '12rem'}}>
                                        <Card.Img variant='top' src={friend.profileImage ? friend.profileImage.url : 'holder.js/100px180?text=Image cap'} />
                                        <Card.Footer>{friend.username}</Card.Footer>
                                    </Card>
                                );
                            })}
                        </div>
                    </Col>
                </Row>
            </Container>
        </>
    );
}

export default Dashboard;
