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
    const [username, setUsername] = useState(null);
    const [interest, setInterest] = useState(null);

    useEffect(() => {
        setUser(JSON.parse(localStorage.getItem('user')));
    }, []);

    useEffect(() => {
        if (!user) {
            return;
        }

        Axios.get(`http://localhost:4000/users/${user.id}/friends`)
            // .then(response => {
            //     const data = [];
            //     for (let i = 0; i < 10; i++) {
            //         data.push(...response.data);
            //     }
            //     data.forEach((u, idx) => u.id = idx)
            //     return void setFriendsList(data);
            // })
            .then(response => void setFriendsList(response.data))
            .catch(e => alert(e.data));

        Axios.get(`http://localhost:4000/users/${user.id}/interests`)
            // .then(response => {
            //     const data = [];
            //     for (let i = 0; i < 10; i++) {
            //         data.push(...response.data);
            //     }
            //     data.forEach((g, idx) => g.id = idx)
            //     return void setInterestsList(data);
            // })
            .then(response => void setInterestsList(response.data))
            .catch(e => alert(e.data));
    }, [user]);

    if (!user) {
        return <>Loading...</>;
    }

    const addFriend = e => {
        if (friendsList.some(friend => friend.username.toLowerCase() === username.toLowerCase())) {
            // already in the friend list
            return;
        }

        Axios.put(`http://localhost:4000/users/${user.id}/add_friend/${username}`)
            .then(response => void setFriendsList(friendsList.concat(response.data)))
            .catch(error => alert(error.data));
    };

    const removeFriend = e => {
        const lowerUsername = username.toLowerCase();

        if (!friendsList.some(friend => friend.username.toLowerCase() === lowerUsername)) {
            // not in the friend list
            return;
        }

        Axios.delete(`http://localhost:4000/users/${user.id}/remove_friend/${username}`)
            .then(response => {
                if (response.data.message === 'success') {
                    setFriendsList(friendsList.filter(friend => {
                        return friend.username.toLowerCase() !== lowerUsername;
                    }));
                }
                return Promise.resolve();
            })
            .catch(error => alert(error.data));
    };

    const addInterest = e => {
        if (interestsList.some(genre => genre.name.toLowerCase() === interest.toLowerCase())) {
            // already in the interests list
            return;
        }

        Axios.put(`http://localhost:4000/users/${user.id}/add_interest/${interest}`)
            .then(response => void setInterestsList(interestsList.concat(response.data)))
            .catch(error => alert(error.data));
    };

    const removeInterest = e => {
        const lowerInterest = interest.toLowerCase();

        if (!interestsList.some(genre => genre.name.toLowerCase() === lowerInterest)) {
            // not in the interests list
            return;
        }

        Axios.delete(`http://localhost:4000/users/${user.id}/remove_interest/${interest}`)
            .then(response => {
                if (response.data.message === 'success') {
                    setInterestsList(interestsList.filter(genre => {
                        return genre.name.toLowerCase() !== lowerInterest;
                    }));
                }
            })
            .catch(error => alert(error.data));
    };

    return (
        <Container fluid className='d-inline-flex justify-content-center'>
            <Row xs={1} md={2}>
                <Col md='auto' className='p-3'>
                    {userCard(user, navigate)}
                </Col>
                <Col>
                    <Container>
                        <Row className='my-3'>
                            <SectionList
                                sectionName='Interests'
                                placeHolderText='Enter genre name'
                                setText={setInterest}
                                handleAdd={addInterest}
                                handleRemove={removeInterest}
                                components={interestsList.map(genre =>
                                    <div key={`${genre.name}-${genre.id}`} className='mr-2 my-1 px-2 py-1 bg-secondary text-light rounded-pill'>
                                        {genre.name}
                                    </div>
                                )}
                            />
                        </Row>
                        <Row className='mt-5'>
                            <SectionList
                                sectionName='Friends'
                                placeHolderText='Enter username'
                                setText={setUsername}
                                handleAdd={addFriend}
                                handleRemove={removeFriend}
                                components={friendsList.map(friend =>
                                    <Card key={`${friend.username}-${friend.id}`} className='mr-3 my-3' style={{ maxWidth: '12rem' }}>
                                        <Card.Img variant='top' src={friend.profileImage ? friend.profileImage.url : 'holder.js/100px180?text=Image cap'}/>
                                        <Card.Footer>{friend.username}</Card.Footer>
                                    </Card>
                                )}
                            />
                        </Row>
                    </Container>
                </Col>
            </Row>
        </Container>
    );
}

function userCard(user, navigate) {
    return (
        <Card className='p-2' style={{ width: '18rem' }}>
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
    );
}

function SectionList(props) {
    return (
        <Container>
            <Row>
                <h5 className='my-0'>{props.sectionName}</h5>
                <hr className='my-2 w-100'/>
            </Row>
            <Row>
                <form className='d-flex'>
                    <input type='text' className='form-control border-warning' placeholder={props.placeHolderText} onChange={e => props.setText(e.target.value)}/>
                    <Button variant='primary' className='ml-2' onClick={props.handleAdd}>Add</Button>
                    <Button variant='danger' className='ml-2' onClick={props.handleRemove}>Remove</Button>
                </form>
            </Row>
            <Row className='mt-2 d-flex flex-wrap overflow-auto' style={{ maxHeight: '24rem' }}>
                {props.components}
            </Row>
        </Container>
    );
}

export default Dashboard;
