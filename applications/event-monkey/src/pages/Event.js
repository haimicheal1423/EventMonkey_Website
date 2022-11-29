import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from "react-router-dom";
import Container from "react-bootstrap/Container";
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import ListGroup from 'react-bootstrap/ListGroup';
import Card from 'react-bootstrap/Card';
import Axios from 'axios';
import George from '../assets/profileImages/george-avatar.jpeg'

import ModalEM from '../components/Modal'
import BannerEM from '../components/Banner'
import '../assets/css/event.css'

function SingleEvent() {
    const { eventId } = useParams();
    const [event, setEvent] = useState(undefined);

    useEffect(() => {
        Axios.get(`http://localhost:4000/events/${eventId}`)
            .then(response => void setEvent(response.data))
            .catch(e => alert(JSON.stringify(e.response.data)));
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
    // const [url, setUrl] = useState('http://localhost:4000/events/')

    useEffect(() => {
        if (searchParams.has('source') || searchParams.has('limit')
                || searchParams.has('keyword') || searchParams.has('genres')) {
Axios.get(`http://eventmonkey.xyz:4000/events/search?${searchParams}`)
                .then(response => void setEvents(response.data))
                .catch(e => alert(JSON.stringify(e.response.data)));
        } else {
            Axios.get("http://eventmonkey.xyz:4000/events")
                .then(response => void setEvents(response.data))
                .catch(e => alert(JSON.stringify(e.response.data)));
        }
    }, [searchParams]);

    return (
        <div className='m-3'>
            <h5 className="events-title">Events</h5>

            <BannerEM/>
            <hr/>

            <ModalEM/>

            <div className='mt-2 d-flex flex-wrap overflow-auto'>
                {events?.length && events.map(event => {
                    return <Col>{eventCard(event)}</Col>
                })}
            </div>
        </div>
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
                    {event.description.length > 90
                        ? event.description.substring(0, 87) + ' [...]'
                        : event.description}
                </Card.Text>
            </Card.Body>
            <ListGroup className="list-group-flush">
                {priceRange(event)}
                {eventDate(event)}
                <ListGroup.Item>
                    <Card.Text>{event.location}</Card.Text>
                </ListGroup.Item>
            </ListGroup>
            <Card.Body>
                <Card.Link href="#">Card Link</Card.Link>
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
                            range.min === range.max
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
