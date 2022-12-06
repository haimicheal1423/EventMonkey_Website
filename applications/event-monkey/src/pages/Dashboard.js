import Card from 'react-bootstrap/Card';
import Container from 'react-bootstrap/esm/Container';
import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import React, { useEffect, useState } from 'react';
import Axios from 'axios';

import '../assets/css/dashboard.css'

import George from '../assets/profileImages/george-avatar.jpeg'
import { ErrorAlert } from "../components/ErrorAlert.js"
import { EventCard } from './Event.js';
import {
    axiosError,
    getUser,
    isUserAttendee,
    isUserOrganizer,
} from '../utils.js';

function Dashboard() {
    const [user, setUser] = useState(getUser());
    const [recommendedEvents, setRecommendedEvents] = useState([]);
    const [favoriteEvents, setFavoriteEvents] = useState([]);
    const [createdEventList, setCreatedEventList] = useState([]);
    const [errorMessages, setErrorMessages] = useState([]);
    const [friendsList, setFriendsList] = useState([]);
    const [interestsList, setInterestsList] = useState([]);
    const [username, setUsername] = useState(null);
    const [interest, setInterest] = useState(null);
    const [eventId, setEventId] = useState(undefined);
    const [trySomethingNew, setTrySomthingNew] = useState([]);

    const addErrorMessage = message => {
        setErrorMessages(prev => prev.concat(message));
    };

    useEffect(() => {
        setUser(getUser());
    }, []);

    useEffect(() => {
        if (isUserAttendee()) {
            Axios.get(`/users/${user.id}/friends`)
                 .then(response => void setFriendsList(response.data))
                 .catch(axiosError(`Failed to load friends list`, addErrorMessage));

            Axios.get(`/users/${user.id}/interests`)
                 .then(response => void setInterestsList(response.data))
                 .catch(axiosError(`Failed to load interests list`, addErrorMessage));

            Axios.get(`/users/${user.id}/favorites`)
                 .then(response => void setFavoriteEvents(response.data))
                 .catch(axiosError(`Failed to load favorite events`, addErrorMessage));

            Axios.get(`/users/${user.id}/try_something_new`)
                 .then(response => void setTrySomthingNew(response.data))
                 .catch(axiosError(`Failed to load try something new events`, addErrorMessage));

        } else if (isUserOrganizer()) {
            Axios.get(`/users/${user.id}/created_events`)
                .then(response => void setCreatedEventList(response.data))
                .catch(axiosError(`Failed to load owned events`, addErrorMessage));
        }
    }, [user]);

    useEffect(() => {
        if (!isUserAttendee()) {
            return;
        }

        Axios.get(`/events/recommended/${user.id}`)
            .then(response => void setRecommendedEvents(response.data))
            .catch(axiosError(`Failed to load recommended events`, addErrorMessage));
    }, [user.id, interestsList, friendsList]);

    if (!user) {
        return <>Loading...</>;
    }

    const addFriend = () => {
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

    const removeFriend = () => {
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

    const addInterest = () => {
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

    const removeInterest = () => {
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

    const removeCreatedEvent = () => {
        if (eventId === undefined) {
            // no input
            return;
        }

        const numId = Number(eventId);

        if (isNaN(numId)) {
            addErrorMessage(`Event id ${eventId} is not a number`);
            return;
        }

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
                    user.eventList = createdEventList;
                }
            })
            .catch(axiosError(`Failed to delete event ${interest}`, addErrorMessage));
    };

    const addFavorite = (event) => {
        if (favoriteEvents.some(other => event.id === other.id)) {
            // already in the list
            return;
        }

        Axios.put(`/users/${user.id}/add_favorite/${event.id}`)
             .then(response => {
                 if (response.data.message === 'success') {
                     setFavoriteEvents(prev => prev.concat(event));
                     user.eventList = favoriteEvents;
                 }
                 return Promise.resolve();
             })
             .catch(axiosError(`Failed to add event favorite`, addErrorMessage));
    };

    const removeFavorite = (event) => {
        if (!favoriteEvents.some(other => event.id === other.id)) {
            // not in the list
            return;
        }

        Axios.delete(`/users/${user.id}/remove_favorite/${event.id}`)
             .then(response => {
                 if (response.data.message === 'success') {
                     setFavoriteEvents(prev => prev.filter(ev => ev.id !== event.id));
                     user.eventList = favoriteEvents;
                 }
                 return Promise.resolve();
             })
             .catch(axiosError(`Failed to remove event favorite`, addErrorMessage));
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
                    localStorage.removeItem('token');
                    window.location.href = '/';
                }}>logout</Button>
                <hr />
            </div>

            {renderForType(user.type,
                interestsList, addInterest, removeInterest, setInterest,
                setUsername, friendsList, addFriend, removeFriend,
                favoriteEvents, addFavorite, removeFavorite,
                recommendedEvents, trySomethingNew,
                createdEventList, removeCreatedEvent, setEventId,
            )}
        </Container>
    );
}

function renderForType(userType,
                       interestsList, addInterest, removeInterest, setInterest,
                       setUsername, friendsList, addFriend, removeFriend,
                       favoriteEvents, addFavorite, removeFavorite,
                       recommendedEvents, trySomethingNew,
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
            <hr />

            <SectionList
                sectionName='Friends'
                placeHolderText='Enter username'
                setText={setUsername}
                handleAdd={addFriend}
                handleRemove={removeFriend}
                components={friendsList.map(friend =>
                    <Card key={`${friend.username}-${friend.id}`} className='mr-3 my-3' style={{ maxWidth: '12rem' }}>
                        <Card.Img variant='top' src={friend.profileImage ? friend.profileImage.url : George} />
                        <Card.Footer>{friend.username}</Card.Footer>
                    </Card>
                )}
            />
            <hr />

            <h5 className='text-left' style={{ color: 'chocolate' }}>Favorites</h5>
            <div className='mt-2 d-flex overflow-auto'>
                {favoriteEvents?.length > 0 && favoriteEvents.map(event => {
                    return (
                        <EventCard
                            key={event.id}
                            event={event}
                            canRemove={true}
                            onRemove={() => {
                                removeFavorite(event);
                            }}
                        />
                    );
                })}
            </div>
            <hr />

            <h5 className='text-left' style={{ color: 'chocolate' }}>Recommended Just For You!</h5>
            <div className='mt-2 d-flex overflow-auto'>
                {recommendedEvents?.length > 0 && recommendedEvents.map(event => {
                    const isFavorite = favoriteEvents.some(ev => ev.id === event.id);
                    return (
                        <EventCard
                            key={event.id}
                            event={event}
                            canFavorite={!isFavorite}
                            onFavorite={() => {
                                addFavorite(event);
                            }}
                            canRemove={isFavorite}
                            onRemove={() => {
                                removeFavorite(event);
                            }}
                        />
                    );
                })}
            </div>
            <hr />

            <h5 className='text-left' style={{ color: 'chocolate' }}> Try Something New!</h5>
            <div className='mt-2 d-flex overflow-auto'>
                {trySomethingNew?.length > 0 && trySomethingNew.map(event => {
                    const isFavorite = favoriteEvents.some(ev => ev.id === event.id);
                    return (
                        <EventCard
                            key={event.id}
                            event={event}
                            canFavorite={!isFavorite}
                            onFavorite={() => {
                                addFavorite(event);
                            }}
                            canRemove={isFavorite}
                            onRemove={() => {
                                removeFavorite(event);
                            }}
                        />
                    );
                })}
            </div>
            <hr />

        </>;
    }

    if (userType.toUpperCase() === 'ORGANIZER') {
        return <>
            <h5 className='text-left' style={{ color: 'chocolate' }}>Your Events</h5>
            <div className='mt-2 d-flex overflow-auto'>
                {createdEventList?.length && createdEventList.map(event => {
                    return (
                        <EventCard
                            key={event.id}
                            event={event}
                            canDelete={true}
                            onDelete={() => {
                                setEventId(event.id);
                                removeCreatedEvent();
                            }}
                        />
                    );
                })}
            </div>
        </>;
    }

    return <p>Unknown user type: {userType}</p>
}

function SectionList(props) {
    return (
        <Container style={{ color: 'chocolate' }}>
            <Row>
                <h5 className='my-3'>{props.sectionName}</h5>
            </Row>
            {(props.handleAdd || props.handleRemove) &&
                <Row>
                    <form className='d-flex'>
                        <input type='text' className='form-control border-warning' placeholder={props.placeHolderText} onChange={e => props.setText(e.target.value)} />
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
