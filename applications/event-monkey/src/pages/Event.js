import Axios from 'axios';
import { Routes, Route, useParams } from "react-router-dom";
import { useEffect, useState } from 'react';

import Card from 'react-bootstrap/Card';
import ListGroup from 'react-bootstrap/ListGroup';
import Col from 'react-bootstrap/Col';
// import Container from 'react-bootstrap/esm/Container';
import Row from 'react-bootstrap/Row';

import Modal from '../components/Modal'

import '../assets/css/event.css'


function Event() {
    const columnsPerRow = 4;
    const { genre } = useParams()
    const [events, setEvents] = useState([])
    // const [showEvents, setShowEvents] = useState([true])
    const [showModal, setShowModal] = useState(false)

    console.log(showModal)

    const handleClose = () => {
        setShowModal(false)
    }

    const getAllEvents = () => {
        if (genre) {
            Axios.get(`http://localhost:4000/events/${genre}`).then((response) => {
                setEvents(response.data);
            });
        } else {
            Axios.get("http://localhost:4000/events").then((response) => {
                setEvents(response.data);
            });
        }
    }

    useEffect(() => {
        getAllEvents();
    }, []);

    return (
        // was in Container tag instead of fragment
        <>
            <Row xs={1} md={columnsPerRow}>
                {events?.length > 0 && events.map((event, index) =>
                    <Col>
                        <Card style={{ width: '18rem', margin:20, padding:20 }}>
                            <Card.Img variant="top" src="holder.js/100px180?text=Image cap" />
                            <Card.Body>
                                <Card.Title>Name: {event.name}</Card.Title>
                                <Card.Text>
                                    Description: {event.description}
                                </Card.Text>
                            </Card.Body>
                            <ListGroup className="list-group-flush">
                                <ListGroup.Item>{event.price}</ListGroup.Item>
                                <ListGroup.Item>{event.dates}</ListGroup.Item>
                            </ListGroup>
                            <Card.Body>
                                <Card.Link href="#">Card Link</Card.Link>
                                <Card.Link href="#">Another Link</Card.Link>
                            </Card.Body>
                        </Card>
                    </Col>

                )}
            </Row>
            
            {showModal &&
                <Modal handleClose={handleClose}>
                    <h2>Terms and Conditions</h2>
                    <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Error odit nam et reprehenderit quibusdam temporibus officia dolorum quo sint nemo quis, laborum, quasi nisi fugit praesentium debitis repudiandae! Sapiente, omnis.</p>
                </Modal>
            }

            <div>
                <button onClick={() => setShowModal(true)}>Show Modal</button>
            </div>

        </>
        
    );
}

export default Event;
