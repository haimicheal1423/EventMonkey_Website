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
    const [errorMessages, setErrorMessages] = useState([]);
    const [recommendedEvents, setRecommendedEvents] = useState(undefined);
    const [favoriteEvents, setFavoriteEvents] = useState(undefined);
    const [createdEventList, setCreatedEventList] = useState(undefined);
    const [friendsList, setFriendsList] = useState(undefined);
    const [interestsList, setInterestsList] = useState(undefined);
    const [trySomethingNew, setTrySomethingNew] = useState(undefined);

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
                 .then(response => void setTrySomethingNew(response.data))
                 .catch(axiosError(`Failed to load try something new events`, addErrorMessage));

        } else if (isUserOrganizer()) {
            Axios.get(`/users/${user.id}/created_events`)
                .then(response => void setCreatedEventList(response.data))
                .catch(axiosError(`Failed to load owned events`, addErrorMessage));
        }
    }, [user]);

    useEffect(() => {
        if (isUserAttendee()) {
            Axios.get(`/events/recommended/${user.id}`)
                 .then(response => void setRecommendedEvents(response.data))
                 .catch(axiosError(`Failed to load recommended events`, addErrorMessage));
        }
    }, [user, interestsList, friendsList]);

    if (!user) {
        return <>
            {errorMessages.map((error, index) =>(
                <ErrorAlert
                    key={`error-${index}`}
                    message={error}
                />
            ))}
            <p>Loading...</p>
        </>
    }

    const addFriend = (username) => {
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

    const removeFriend = (username) => {
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

    const addInterest = (interest) => {
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

    const removeInterest = (interest) => {
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

    const removeCreatedEvent = (event) => {
        const numId = Number(event.id);

        if (isNaN(numId)) {
            addErrorMessage(`Event id ${event.id} is not a number`);
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
            .catch(axiosError(`Failed to delete event [id: ${event.id}] ${event.name}`, addErrorMessage));
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
            </div>
            {isUserAttendee()
               ? <AttendeeDashboard
                   interestsList={interestsList}
                   addInterest={addInterest}
                   removeInterest={removeInterest}

                   friendsList={friendsList}
                   addFriend={addFriend}
                   removeFriend={removeFriend}

                   favoriteEvents={favoriteEvents}
                   addFavorite={addFavorite}
                   removeFavorite={removeFavorite}

                   recommendedEvents={recommendedEvents}
                   trySomethingNew={trySomethingNew}
                 />
               : isUserOrganizer()
                 ? <OrganizerDashboard
                     createdEventList={createdEventList}
                     removeCreatedEvent={removeCreatedEvent}
                   />
                 : <p>Unknown user type: {user.type}</p>
            }
        </Container>
    );
}

function AttendeeDashboard(props) {
    const [interest, setInterest] = useState(null);
    const [username, setUsername] = useState(null);

    const {
        interestsList, addInterest, removeInterest,
        friendsList, addFriend, removeFriend,
        favoriteEvents, addFavorite, removeFavorite,
        recommendedEvents, trySomethingNew
    } = props;

    return <>
        <SectionList
            sectionName='Interests'
            placeHolderText='Enter genre name'
            setText={setInterest}
            handleAdd={() => addInterest(interest)}
            handleRemove={() => removeInterest(interest)}
        >
            {!interestsList
                ? <p>Loading...</p>
                : interestsList.length < 1
                    ? <p>You have no genres added to your interests list</p>
                    : interestsList.map(genre =>(
                        <div key={`${genre.name}-${genre.id}`}
                             className="mr-2 my-1 px-2 py-1 bg-secondary text-light rounded-pill">
                            {genre.name}
                        </div>
                    ))
            }
        </SectionList>

        <SectionList
            sectionName='Friends'
            placeHolderText='Enter username'
            setText={setUsername}
            handleAdd={() => addFriend(username)}
            handleRemove={() => removeFriend(username)}
        >
            {!friendsList
                ? <p>Loading...</p>
                : friendsList.length < 1
                    ? <p>You have no friends added to your friends list</p>
                    : friendsList.map(friend =>(
                        <Card key={`${friend.username}-${friend.id}`} className='mr-3 my-3' style={{ maxWidth: '12rem' }}>
                            <Card.Img variant='top' src={friend.profileImage ? friend.profileImage.url : George} />
                            <Card.Footer>{friend.username}</Card.Footer>
                        </Card>
                    ))
            }
        </SectionList>

        <SectionList sectionName='Favorites' >
            {!favoriteEvents
                ? <p>Loading...</p>
                : favoriteEvents.length < 1
                    ? <p>You have no events in your favorites list</p>
                    : favoriteEvents.map(event => (
                        <EventCard
                            key={event.id}
                            event={event}
                            canRemove={true}
                            onRemove={() => removeFavorite(event)}
                        />
                    ))
            }
        </SectionList>

        <SectionList sectionName='Recommended Just For You!' >
            {(!recommendedEvents || !favoriteEvents)
                ? <p>Loading...</p>
                : recommendedEvents.length < 1
                    ? <p>Empty</p>
                    : recommendedEvents.map(event => {
                        const isFavorite = favoriteEvents.some(ev => ev.id === event.id);

                        return <EventCard
                            key={event.id}
                            event={event}

                            canFavorite={!isFavorite}
                            onFavorite={() => addFavorite(event)}

                            canRemove={isFavorite}
                            onRemove={() => removeFavorite(event)}
                        />;
                    })
            }
        </SectionList>

        <SectionList sectionName='Try Something New!' >
            {(!trySomethingNew || !favoriteEvents)
                ? <p>Loading...</p>
                : trySomethingNew.length < 1
                    ? <p>Empty</p>
                    : trySomethingNew.map(event => {
                        const isFavorite = favoriteEvents.some(ev => ev.id === event.id);

                        return <EventCard
                            key={event.id}
                            event={event}

                            canFavorite={!isFavorite}
                            onFavorite={() => addFavorite(event)}

                            canRemove={isFavorite}
                            onRemove={() => removeFavorite(event)}
                        />;
                    })
            }
        </SectionList>
    </>;
}

function OrganizerDashboard(props) {
    const { createdEventList, removeCreatedEvent } = props;

    return <>
        <h5 className='text-left' style={{ color: 'chocolate' }}>Your Events</h5>
        <div className='mt-2 d-flex overflow-auto'>
            {createdEventList?.length && createdEventList.map(event => {
                return (
                    <EventCard
                        key={event.id}
                        event={event}
                        canDelete={true}
                        onDelete={() => removeCreatedEvent(event)}
                    />
                );
            })}
        </div>
    </>;
}

function SectionList(props) {
    if (props.handleAdd || props.handleRemove) {
        return <>
            <Container style={{ color: 'chocolate' }}>
                <Row>
                    <h5 className='m-0 my-2'>{props.sectionName}</h5>
                </Row>
                <Row>
                    <form className='d-flex' onSubmit={e => e.preventDefault()}>
                        <input type='text' className='form-control border-warning' placeholder={props.placeHolderText} onChange={e => props.setText(e.target.value)} />
                        {props.handleAdd && <Button variant='primary' className='ml-2' onClick={props.handleAdd}>Add</Button>}
                        {props.handleRemove && <Button variant='danger' className='ml-2' onClick={props.handleRemove}>Remove</Button>}
                    </form>
                </Row>
                <Row className='mt-2 d-flex flex-wrap overflow-auto' style={{ maxHeight: '25rem' }}>
                    {props.children}
                </Row>
            </Container>
            <hr />
        </>
    }

    return <>
        <h5 className='mt-2 text-left' style={{ color: 'chocolate' }}>{props.sectionName}</h5>
        <div className='d-flex overflow-auto' style={{ color: 'chocolate' }} >
            {props.children}
        </div>
        <hr />
    </>;
}

export default Dashboard;
