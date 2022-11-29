import Axios from 'axios';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import ListGroup from 'react-bootstrap/ListGroup';
import Container from "react-bootstrap/Container";

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from "react-router-dom";

import { axiosError } from "../utils";
import ModalEM from '../components/Modal'
import BannerEM from '../components/Banner'
import George from '../assets/profileImages/george-avatar.jpeg'
import '../assets/css/event.css'

function SingleEvent() {
    const { eventId } = useParams();
    const [event, setEvent] = useState(undefined);

    useEffect(() => {
        Axios.get(`/events/${eventId}`)
            .then(response => void setEvent(response.data))
            .catch(axiosError(`Failed to load event ${eventId}`, alert));
    }, [eventId]);

    return (
        <Container className="d-flex">
            <Row className="m-auto align-self-center">
                <Col>{eventCard(event)}</Col>
            </Row>
        </Container>
    );
}

function EventSearch() {
    const columnsPerRow = 4;
    const [searchParams] = useSearchParams();
    const [events, setEvents] = useState([]);
    // const [url, setUrl] = useState('/events/')

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

    return (
        <div className='m-3'>
            <h5 className="events-title">Events</h5>

            <BannerEM/>
            <hr/>

            <ModalEM/>

            <div className='mt-2 d-flex flex-wrap justify-content-center overflow-auto'>
                {events?.length && events.map(event => {
                    return simpleEventCard(event);
                })}
            </div>
        </div>
    );
}

export function simpleEventCard(event, showId) {
    return (
        <Card key={event.id} className="m-3 p-3" style={{ minWidth: '18rem', maxWidth: '18rem' }}>
            <Card.Img variant="top" src={eventImage(event)} />
            <Card.Body>
                <Card.Title>{showId ? `[id: ${event.id}] ${event.name}` : event.name}</Card.Title>
                <Card.Link href={`/event/id/${event.id}`}>View Details</Card.Link>
            </Card.Body>
        </Card>
    );
}

function eventCard(event) {
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
            <Card.Body>
                <Card.Link href={`/event/id/${event.id}`}>View Details</Card.Link>
                <Card.Link href="#">Another Link</Card.Link>
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
        if (currency === 'USD') {
            return `$${price}`;
        } else {
            return `${price} ${currency}`;
        }
    }

    return (
        <ListGroup.Item>
            {event.priceRanges.map(range => {
                const min = formatPrice(range.currency, range.min.toFixed(2));
                const max = formatPrice(range.currency, range.max.toFixed(2));

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
