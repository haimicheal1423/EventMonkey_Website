import { useEffect, useState } from 'react';
import Axios from 'axios';
import { useSearchParams } from "react-router-dom";
import Card from 'react-bootstrap/Card';
import ListGroup from 'react-bootstrap/ListGroup';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/esm/Container';
import Row from 'react-bootstrap/Row';

function Event() {
    const columnsPerRow = 4;
    const [searchParams] = useSearchParams();
    const [events, setEvents] = useState([]);

    useEffect(() => {
        searchParams.forEach((val, key) => console.log(key, val));

        if (searchParams.has('source') || searchParams.has('limit')
                || searchParams.has('keyword') || searchParams.has('genres')) {
            Axios.get(`http://localhost:4000/events/search?${searchParams}`)
                .then(response => setEvents(response.data));
        } else {
            Axios.get("http://localhost:4000/events")
                .then(response => setEvents(response.data));
        }
    }, []);

    const eventImage = event => {
        if (event.images[0]) {
            return event.images[0].url;
        } else {
            return 'holder.js/100px180?text=Image cap';
        }
    };

    const priceRange = event => {
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
            <ListGroup.Item>{
                event.priceRanges.map(range => {
                    const min = formatPrice(range.currency, range.min.toFixed(2));
                    const max = formatPrice(range.currency, range.max.toFixed(2));

                    return (
                        <Card.Text key={range.currency}>{
                            range.min === range.max
                            ? max
                            : `${min} - ${max}`
                        }
                        </Card.Text>
                    );
                })
            }</ListGroup.Item>
        );
    };

    const eventDate = event => {
        const formatter = Intl.DateTimeFormat('en-us', {
            weekday: "long",
            year: "numeric",
            month: "short",
            day: "numeric"
        });

        const startDate = new Date(event.dates.startDateTime);

        let endDate;
        if (event.dates.endDateTime) {
            endDate = new Date(event.dates.endDateTime);
        }

        return (
            <ListGroup.Item>
                <Card.Text>
                    {formatter.format(startDate)}
                    {endDate && ' until ' + formatter.format(endDate)}
                </Card.Text>
            </ListGroup.Item>
        );
    };

    return (
        <Container>
            <Row xs={1} md={columnsPerRow}>
                {events?.length > 0 && events.map(event =>
                    <Col>
                        <Card style={{ width: '18rem', margin:20, padding:20 }}>
                            <Card.Img variant="top" src={eventImage(event)} />
                            <Card.Body>
                                <Card.Title>
                                    {event.name}
                                </Card.Title>
                                <Card.Text>{
                                    event.description.length > 90
                                        ? event.description.substring(0, 87) + ' [...]'
                                        : event.description
                                }</Card.Text>
                            </Card.Body>
                            <ListGroup className="list-group-flush">
                                {priceRange(event)}
                                {eventDate(event)}
                                <ListGroup.Item>
                                    <Card.Text>
                                        {event.location}
                                    </Card.Text>
                                </ListGroup.Item>
                            </ListGroup>
                            <Card.Body>
                                <Card.Link href="#">Card Link</Card.Link>
                                <Card.Link href="#">Another Link</Card.Link>
                            </Card.Body>
                        </Card>
                    </Col>
                )}
            </Row>
        </Container>
    );
}

export default Event;
