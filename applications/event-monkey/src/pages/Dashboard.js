import Card from 'react-bootstrap/Card';
import Container from 'react-bootstrap/esm/Container';
import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import React, { useEffect, useState } from 'react';
import Axios from 'axios';

import '../assets/css/dashboard.css'

import George from '../assets/profileImages/george-avatar.jpeg'
import { ErrorAlert } from "../components/ErrorAlert.js"
import { simpleEventCard } from "./Event.js";
import { axiosError } from "../utils.js";

function Dashboard() {
    const [user, setUser] = useState(undefined);
    const [recommendedEvents, setRecommendedEvents] = useState([]);
    const [createdEventList, setCreatedEventList] = useState([]);
    const [errorMessages, setErrorMessages] = useState([]);
    const [friendsList, setFriendsList] = useState([]);
    const [interestsList, setInterestsList] = useState([]);
    const [username, setUsername] = useState(null);
    const [interest, setInterest] = useState(null);
    const [eventId, setEventId] = useState(undefined);

    const addErrorMessage = message => {
        setErrorMessages(prev => prev.concat(message));
    };

    useEffect(() => {
        setUser(JSON.parse(localStorage.getItem('user')));
    }, []);

    useEffect(() => {
        if (!user) {
            return;
        }

        if (user.type.toUpperCase() === 'ATTENDEE') {
            Axios.get(`/users/${user.id}/friends`)
                .then(response => void setFriendsList(response.data))
                .catch(axiosError(`Failed to load friends list`, addErrorMessage));

            Axios.get(`/users/${user.id}/interests`)
                .then(response => void setInterestsList(response.data))
                .catch(axiosError(`Failed to load interests list`, addErrorMessage));
        } else if (user.type.toUpperCase() === 'ORGANIZER') {
            Axios.get(`/users/${user.id}/created_events`)
                .then(response => void setCreatedEventList(response.data))
                .catch(axiosError(`Failed to load owned events`, addErrorMessage));
        }
    }, [user]);

    useEffect(() => {
        if (!user) {
            return;
        }

        if (user.type.toUpperCase() === 'ATTENDEE') {
            Axios.get(`/events/recommended/${user.id}`)
                .then(response => void setRecommendedEvents(response.data))
                .catch(axiosError(`Failed to load recommended events`, addErrorMessage));
        }
    }, [interestsList, friendsList]);

    if (!user) {
        return <>Loading...</>;
    }

    const addFriend = e => {
        if (!username) {
            // no input
            return;
        }

        if (friendsList.some(friend => friend.username.toLowerCase() === username.toLowerCase())) {
            // already in the friend list
            return;
        }

        Axios.put(`/users/${user.id}/add_friend/${username}`)
            .then(response => void setFriendsList(friendsList.concat(response.data)))
            .catch(axiosError(`Failed to add friend ${username}`, addErrorMessage));
    };

    const removeFriend = e => {
        if (!username) {
            // no input
            return;
        }

        const lowerUsername = username.toLowerCase();

        if (!friendsList.some(friend => friend.username.toLowerCase() === lowerUsername)) {
            // not in the friend list
            return;
        }

        Axios.delete(`/users/${user.id}/remove_friend/${username}`)
            .then(response => {
                if (response.data.message === 'success') {
                    setFriendsList(friendsList.filter(friend => {
                        return friend.username.toLowerCase() !== lowerUsername;
                    }));
                }
                return Promise.resolve();
            })
            .catch(axiosError(`Failed to remove friend ${username}`, addErrorMessage));
    };

    const addInterest = e => {
        if (!interest) {
            // no input
            return;
        }

        if (interestsList.some(genre => genre.name.toLowerCase() === interest.toLowerCase())) {
            // already in the interests list
            return;
        }

        Axios.put(`/users/${user.id}/add_interest/${interest}`)
            .then(response => void setInterestsList(interestsList.concat(response.data)))
            .catch(axiosError(`Failed to add interest ${interest}`, addErrorMessage));
    };

    const removeInterest = e => {
        if (!interest) {
            // no input
            return;
        }

        const lowerInterest = interest.toLowerCase();

        if (!interestsList.some(genre => genre.name.toLowerCase() === lowerInterest)) {
            // not in the interests list
            return;
        }

        Axios.delete(`/users/${user.id}/remove_interest/${interest}`)
            .then(response => {
                if (response.data.message === 'success') {
                    setInterestsList(interestsList.filter(genre => {
                        return genre.name.toLowerCase() !== lowerInterest;
                    }));
                }
            })
            .catch(axiosError(`Failed to remove interest ${interest}`, addErrorMessage));
    };

    const removeCreatedEvent = e => {
        if (eventId === undefined) {
            // no input
            return;
        }

        const numId = Number(eventId);

        if (isNaN(numId)) {
            addErrorMessage(`Event id ${eventId} is not a number`);
            return;
        }

        console.log(numId, typeof numId);

        if (!createdEventList.some(event => event.id === numId)) {
            // not in the list
            return;
        }

        Axios.delete(`/users/${user.id}/delete/${numId}`)
            .then(response => {
                if (response.data.message === 'success') {
                    setCreatedEventList(createdEventList.filter(event => {
                        return event.id !== numId;
                    }));
                }
            })
            .catch(axiosError(`Failed to remove interest ${interest}`, addErrorMessage));
    };

    return (
        <Container>
            {errorMessages.map((error, index) => {
                return (
                    <ErrorAlert
                        key={`error-${index}`}
                        // header='Server Error'
                        message={error}
                    />
                )
            })}
            <div className="welcome-container">
                <img className="welcome-img shadow" src={user.profileImage ? user.profileImage.url : George} alt=""/>
                <h2 className="dashboard-title">Welcome {user.username}!</h2>
                <h6 className="dashboard-subtitle">This is your personalized dashboard...</h6>
                <Button className="logout-btn" onClick={() => {
                    localStorage.removeItem('user');
                    localStorage.setItem('token',"");
                    window.location.href = '/';
                }}>logout</Button>
                <hr/>
            </div>

            {renderForType(user.type,
                interestsList, addInterest, removeInterest, setInterest,
                setUsername, friendsList, addFriend, removeFriend,
                recommendedEvents,
                createdEventList, removeCreatedEvent, setEventId
            )}
        </Container>
    );
}

function renderForType(userType,
                       interestsList, addInterest, removeInterest, setInterest,
                       setUsername, friendsList, addFriend, removeFriend,
                       recommendedEvents,
                       createdEventList, removeCreatedEvent, setEventId) {
    if (userType.toUpperCase() === 'ATTENDEE') {
        return <>
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
            <hr/>

            <SectionList
                sectionName='Friends'
                placeHolderText='Enter username'
                setText={setUsername}
                handleAdd={addFriend}
                handleRemove={removeFriend}
                components={friendsList.map(friend =>
                    <Card key={`${friend.username}-${friend.id}`} className='mr-3 my-3' style={{ maxWidth: '12rem' }}>
                        <Card.Img variant='top' src={friend.profileImage ? friend.profileImage.url : George}/>
                        <Card.Footer>{friend.username}</Card.Footer>
                    </Card>
                )}
            />

            <SectionList
                sectionName='Recommended Just For You!'
                components={recommendedEvents?.length && recommendedEvents.map(event => {
                    return simpleEventCard(event);
                })}
            />

            <div className="tsn-container">
                <h6>Try Something New</h6>
                {/* carousel here? */}
                <hr/>
            </div>

            <div className="category-container">
                <h6>Browse by Category</h6>
                {/* carousel here? */}
                <hr/>
            </div>

            <div className="recent-container">
                <h6>Recent Events</h6>
                {/* carousel here? */}
                <hr/>
            </div>
        </>;
    }

    if (userType.toUpperCase() === 'ORGANIZER') {
        return <>
            <SectionList
                sectionName='Your Events'
                placeHolderText='Enter event id'
                setText={setEventId}
                handleRemove={removeCreatedEvent}
                components={createdEventList.map(event => {
                    return simpleEventCard(event, true);
                })}
            />
            <hr/>
        </>;
    }

    return <p>Unknown user type: {userType}</p>
}

function SectionList(props) {
    return (
        <Container style={{color: 'chocolate'}}>
            <Row>
                <h5 className='my-3'>{props.sectionName}</h5>
            </Row>
            {(props.handleAdd || props.handleRemove) &&
                <Row>
                    <form className='d-flex'>
                        <input type='text' className='form-control border-warning' placeholder={props.placeHolderText} onChange={e => props.setText(e.target.value)}/>
                        {props.handleAdd && <Button variant='primary' className='ml-2' onClick={props.handleAdd}>Add</Button>}
                        {props.handleRemove && <Button variant='danger' className='ml-2' onClick={props.handleRemove}>Remove</Button>}
                    </form>
                </Row>
            }
            <Row className='mt-2 d-flex flex-wrap overflow-auto' style={{ maxHeight: '24rem' }}>
                {props.components}
            </Row>
        </Container>
    );
}

export default Dashboard;
