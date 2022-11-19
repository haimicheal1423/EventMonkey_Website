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
    const [searchText, setSearchText] = useSearchParams();
    const [events, setEvents] = useState([]);

    const getAllEvents = async () => {
        if (searchText) {
            await Axios.get(`http://localhost:4000/events/search?${searchText}`)
                .then(response => setEvents(response.data));
        } else {
            await Axios.get("http://localhost:4000/events")
                .then(response => setEvents(response.data));
        }
    };

    useEffect(() => {
        getAllEvents();
    }, []);

    function eventDate(event) {
        const formatter = Intl.DateTimeFormat('en-us', { weekday:"long", year:"numeric", month:"short", day:"numeric"});
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
    }

    function eventPriceRange(event) {
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
            }
            return `${price} ${currency}`;
        }

        return (
            <ListGroup.Item>{
                event.priceRanges.map(range => {
                    let price;

                    if (range.min === range.max) {
                        price = formatPrice(range.currency, `${range.max}.00`);
                    } else {
                        price = formatPrice(range.currency, `${range.min}.00 - ${range.max}.00`);
                    }

                    return (
                        <Card.Text key={range.currency}>
                            Price: {price}
                        </Card.Text>
                    );
                })
            }</ListGroup.Item>
        );
    }

    return <Container>
        <Row xs={1} md={columnsPerRow}>
            {events?.length > 0 && events.map((event, index) =>
                <Col key={event.id}>
                    <Card style={{ width: '18rem', margin:20, padding:20 }}>
                        <Card.Img variant="top" src={event.images[0] ? event.images[0].url : "holder.js/100px180?text=Image cap"} />
                        <Card.Body>
                            <Card.Title>Name: {event.name}</Card.Title>
                            <Card.Text>
                                Description: {
                                    event.description.length > 90
                                    ? event.description.substring(0, 87) + ' [...]'
                                    : event.description
                                }
                            </Card.Text>
                        </Card.Body>
                        <ListGroup className="list-group-flush">
                            {eventPriceRange(event)}
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
    </Container>;
}

export default Event;
