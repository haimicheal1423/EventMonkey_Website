import Axios from 'axios';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import ListGroup from 'react-bootstrap/ListGroup';
import Container from "react-bootstrap/Container";

import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';

import {
    axiosError,
    getUser,
    isUserAttendee,
    isUserOrganizer,
} from '../utils';
import ModalEM from '../components/Modal'
import BannerEM from '../components/Banner'
import George from '../assets/profileImages/george-avatar.jpeg'
import '../assets/css/event.css'
import Button from 'react-bootstrap/Button';

function SingleEvent() {
    const navigate = useNavigate();
    const { eventId } = useParams();
    const [user, setUser] = useState(undefined);
    const [event, setEvent] = useState(undefined);
    const [userEventList, setUserEventList] = useState(undefined);

    useEffect(() => {
        Axios.get(`/events/${eventId}`)
            .then(response => void setEvent(response.data))
            .catch(axiosError(`Failed to load event ${eventId}`, alert));
    }, [eventId]);

    useEffect(() => {
        setUser(getUser());
    }, []);

    useEffect(() => {
        if (!user) {
            return;
        }

        if (isUserAttendee()) {
            Axios.get(`/users/${user.id}/favorites`)
                 .then(response => void setUserEventList(response.data.map(ev => ev.id)))
                 .catch(axiosError(`Failed to load favorite events`, alert));
        } else if (isUserOrganizer()) {
            Axios.get(`/users/${user.id}/created_events`)
                 .then(response => void setUserEventList(response.data.map(ev => ev.id)))
                 .catch(axiosError(`Failed to load created events`, alert));
        }
    }, [user]);

    const addFavorite = (event) => {
        if (!user || !userEventList) {
            return;
        }

        if (userEventList.some(evId => evId === event.id)) {
            // already in the list
            return;
        }

        Axios.put(`/users/${user.id}/add_favorite/${event.id}`)
             .then(response => {
                 if (response.data.message === 'success') {
                     setUserEventList(prev => prev.concat(event.id));
                 }
                 return Promise.resolve();
             })
             .catch(axiosError('Failed to add event favorite', alert));
    };

    const removeFavorite = (event) => {
        if (!user || !userEventList) {
            return;
        }

        if (!userEventList.some(evId => evId === event.id)) {
            // not in the list
            return;
        }

        Axios.delete(`/users/${user.id}/remove_favorite/${event.id}`)
             .then(response => {
                 if (response.data.message === 'success') {
                     setUserEventList(prev => prev.filter(evId => evId !== event.id));
                 }
                 return Promise.resolve();
             })
             .catch(axiosError('Failed to remove event favorite', alert));
    };

    const deleteEvent = (event) => {
        if (!user || !userEventList) {
            return;
        }

        if (!userEventList.some(evId => evId.toString() !== event.id.toString())) {
            // not in the list
            return;
        }

        Axios.delete(`/users/${user.id}/delete/${event.id}`)
             .then(response => {
                 if (response.data.message === 'success') {
                     setUserEventList(prev => prev.filter(evId => evId.toString() !== event.id.toString()));
                     navigate('/event');
                 }
                 return Promise.resolve();
             })
             .catch(axiosError('Failed to delete event', alert));
    };

    if (!user || !event || !userEventList) {
        return <>Loading...</>;
    }

    const inEventList = eventId => {
        return userEventList.some(evId => evId.toString() === eventId.toString());
    };

    return (
        <Container className="d-flex">
            <Row className="m-auto align-self-center">
                <Col>
                    <DetailedEventCard
                        event={event}

                        canFavorite={isUserAttendee() && !inEventList(event.id)}
                        onFavorite={() => addFavorite(event)}

                        canRemove={isUserAttendee() && inEventList(event.id)}
                        onRemove={() => removeFavorite(event)}

                        canDelete={isUserOrganizer() && inEventList(event.id)}
                        onDelete={() => deleteEvent(event)}
                    />
                </Col>
            </Row>
        </Container>
    );
}

function EventSearch() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [user, setUser] = useState(undefined);
    const [events, setEvents] = useState(undefined);
    const [userEventList, setUserEventList] = useState(undefined);

    useEffect(() => {
        if (searchParams.get('source') || searchParams.get('limit')
                || searchParams.get('keyword') || searchParams.get('genres')) {
            Axios.get(`/events/search?${searchParams}`)
                .then(response => void setEvents(response.data))
                .catch(axiosError(`Failed to search events using ${searchParams}`, alert));
        } else {
            Axios.get("/events")
                .then(response => void setEvents(response.data))
                .catch(axiosError('Failed to load all events', alert));
        }
    }, [searchParams]);

    useEffect(() => {
        setUser(getUser());
    }, []);

    useEffect(() => {
        if (!user) {
            return;
        }

        if (isUserAttendee()) {
            Axios.get(`/users/${user.id}/favorites`)
                 .then(response => void setUserEventList(response.data.map(ev => ev.id)))
                 .catch(axiosError(`Failed to load favorite events`, alert));
        } else if (isUserOrganizer()) {
            Axios.get(`/users/${user.id}/created_events`)
                 .then(response => void setUserEventList(response.data.map(ev => ev.id)))
                 .catch(axiosError(`Failed to load created events`, alert));
        }
    }, [user]);

    const addFavorite = (event) => {
        if (!user || !userEventList) {
            return;
        }

        if (userEventList.some(evId => evId === event.id)) {
            // already in the list
            return;
        }

        Axios.put(`/users/${user.id}/add_favorite/${event.id}`)
             .then(response => {
                 if (response.data.message === 'success') {
                     setUserEventList(prev => prev.concat(event.id));
                 }
                 return Promise.resolve();
             })
             .catch(axiosError('Failed to add event favorite', alert));
    };

    const removeFavorite = (event) => {
        if (!user || !userEventList) {
            return;
        }

        if (!userEventList.some(evId => evId === event.id)) {
            // not in the list
            return;
        }

        Axios.delete(`/users/${user.id}/remove_favorite/${event.id}`)
             .then(response => {
                 if (response.data.message === 'success') {
                     setUserEventList(prev => prev.filter(evId => evId !== event.id));
                 }
                 return Promise.resolve();
             })
             .catch(axiosError('Failed to remove event favorite', alert));
    };

    const deleteEvent = (event) => {
        if (!user || !userEventList) {
            return;
        }

        if (!userEventList.some(evId => evId.toString() !== event.id.toString())) {
            // not in the list
            return;
        }

        Axios.delete(`/users/${user.id}/delete/${event.id}`)
             .then(response => {
                 if (response.data.message === 'success') {
                     setUserEventList(prev => prev.filter(evId => evId.toString() !== event.id.toString()));
                     navigate('/event');
                 }
                 return Promise.resolve();
             })
             .catch(axiosError('Failed to delete event', alert));
    };

    if (!events || !userEventList) {
        return <>Loading...</>;
    }

    const inEventList = eventId => {
        return userEventList.some(evId => evId.toString() === eventId.toString());
    };

    return (
        <div className='m-3'>
            <h5 className="events-title">Events</h5>

            <BannerEM/>
            <hr/>

            <ModalEM/>

            <div className='mt-2 d-flex flex-wrap justify-content-center overflow-auto'>
                {events?.length > 0 && events.map(event => (
                    <EventCard
                        key={event.id}
                        event={event}

                        canFavorite={isUserAttendee() && !inEventList(event.id)}
                        onFavorite={() => addFavorite(event)}

                        canRemove={isUserAttendee() && inEventList(event.id)}
                        onRemove={() => removeFavorite(event)}

                        canDelete={isUserOrganizer() && inEventList(event.id)}
                        onDelete={() => deleteEvent(event)}
                    />
                ))}
            </div>
        </div>
    );
}

export function EventCard(props) {
    return (
        <Card key={props.event.id} className="m-3 p-3" style={{ minWidth: '18rem', maxWidth: '18rem' }}>
            <Card.Img variant="top" src={eventImage(props.event)} />
            <Card.Body>
                <Card.Title>{props.event.name}</Card.Title>
                <Button className='m-2' href={`/event/id/${props.event.id}`}>Details</Button>
                {props.canFavorite && <Button onClick={props.onFavorite}>Favorite</Button>}
                {props.canRemove && <Button variant='danger' onClick={props.onRemove}>Unfavorite</Button>}
                {props.canDelete && <Button variant='danger' onClick={props.onDelete}>Delete</Button>}
                {!props.hideLink && props.event.url && <Card.Link href={props.event.url}>External Link</Card.Link>}
            </Card.Body>
        </Card>
    );
}

function DetailedEventCard(props) {
    const event = props.event;

    if (!event) {
        return <Card.Text>Unknown event</Card.Text>;
    }

    return (
        <Card className="m-3 p-3" style={{ width: '18rem' }}>
            <Card.Img variant="top" src={eventImage(event)} />
            <Card.Body>
                <Card.Title>{event.name}</Card.Title>
                <Card.Text>
                    {!event.description || event.description.length === 0
                        ? 'No description available'
                        : event.description.length > 90
                            ? event.description.substring(0, 87) + ' [...]'
                            : event.description}
                </Card.Text>
            </Card.Body>
            <ListGroup className="list-group-flush">
                {priceRange(event)}
                {eventDate(event)}
                <ListGroup.Item>
                    <Card.Text>{
                        !event.location || event.location.length === 0
                            ? 'Unknown location'
                            : event.location}
                    </Card.Text>
                </ListGroup.Item>
            </ListGroup>
            <Card.Body className='d-flex flex-column'>
                {props.canFavorite && <Button className='m-2' onClick={props.onFavorite}>Favorite</Button>}
                {props.canRemove && <Button className='m-2' variant='danger' onClick={props.onRemove}>Unfavorite</Button>}
                {props.canDelete && <Button className='m-2' variant='danger' onClick={props.onDelete}>Delete</Button>}
                {event.url && <Card.Link className='text-nowrap' href={event.url}>External Link</Card.Link>}
            </Card.Body>
        </Card>
    );
}

function eventImage(event) {
    if (event.images[0]) {
        return event.images[0].url;
    } else {
        return George;
    }
}

function priceRange(event) {
    if (!event.priceRanges || event.priceRanges.length === 0) {
        return (
            <ListGroup.Item>
                <Card.Text>
                    Price: Free
                </Card.Text>
            </ListGroup.Item>
        )
    }

    const formatPrice = (currency, price) => {
        price = price.toFixed(2);

        if (currency === 'USD') {
            return `$${price}`;
        } else {
            return `${price} ${currency}`;
        }
    }

    return (
        <ListGroup.Item>
            {event.priceRanges.map(range => {
                const min = formatPrice(range.currency, Number(range.min));
                const max = formatPrice(range.currency, Number(range.max));

                return (
                    <Card.Text key={range.currency}>
                        Price: {
                            range.min === 0
                            ? 'Free'
                            : range.min === range.max
                                ? max
                                : `${min} - ${max}`
                        }
                    </Card.Text>
                );
            })}
        </ListGroup.Item>
    );
}

function eventDate(event) {
    const formatter = Intl.DateTimeFormat('en-us', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric'
    });

    let startDate;
    if (event.dates.startDateTime) {
        startDate = new Date(event.dates.startDateTime);
    }

    let endDate;
    if (event.dates.endDateTime) {
        endDate = new Date(event.dates.endDateTime);
    }

    if (!startDate && !endDate) {
        return (
            <ListGroup.Item>
                <Card.Text>{'Date TBA'}</Card.Text>
            </ListGroup.Item>
        );
    }

    return (
        <ListGroup.Item>
            {startDate && <Card.Text>{formatter.format(startDate)}</Card.Text>}
            {endDate && <Card.Text>until</Card.Text>}
            {endDate && <Card.Text>{formatter.format(endDate)}</Card.Text>}
        </ListGroup.Item>
    );
}

export { SingleEvent, EventSearch };
