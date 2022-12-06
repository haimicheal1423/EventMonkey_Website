import React, { useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';

import './Modal.css'
import Axios from "axios";
import { Col, Row } from "react-bootstrap";
import { isUserOrganizer } from '../utils';

//Modal = Fades bg and central popup.
export default function ModalEM() {
    const [validated, setValidated] = useState(false);
    const [showModal, setShowModal] = useState(false);

    const handleClose = () => {
        setShowModal(false)
        setValidated(false);
    }

    const handleShow = () => {
        setShowModal(true)
        setValidated(false);
    }

    const handleSubmit = (event) => {
        const form = event.currentTarget;

        if (form.checkValidity() === false) {
            event.preventDefault();
            event.stopPropagation();
        }

        // console.log('name', form.elements.name.value);
        // console.log('price', form.elements.price.value);
        // console.log('location', form.elements.location.value);
        // console.log('description', form.elements.description.value);
        // console.log('startDate', Date.parse(form.elements.startDate.value));
        // console.log('endDate', Date.parse(form.elements.endDate.value));
        // console.log('externalUrl', form.elements.externalUrl.value);

        setValidated(true);

        if (localStorage.getItem('user') === null) {
            alert('No user details found. Please login and try again');
            return;
        }

        const user = JSON.parse(localStorage.getItem('user'));

        if (!(form.elements.name?.value.length > 0)) {
            return;
        }

        if (!(form.elements.location?.value.length > 0)) {
            return;
        }

        const dates = {};

        if (form.elements.startDate?.value.length > 0) {
            dates.startDateTime = new Date(Date.now());
        } else {
            return;
        }

        if (form.elements.endDate?.value.length > 0) {
            dates.endDateTime = Date.parse(form.elements.endDate.value);
        }

        const priceRange = { currency: 'USD' };

        if (form.elements.price?.value.length > 0) {
            priceRange.min = parseInt(form.elements.price.value).toFixed(2);
            priceRange.max = priceRange.min;
        } else {
            priceRange.min = 0;
            priceRange.max = priceRange.min;
        }

        Axios.post(`/users/${user.id}/create`, {
                name: form.elements.name.value,
                description: form.elements.description.value,
                url: form.elements.externalUrl.value,
                location: form.elements.location.value,
                dates,
                priceRanges: [priceRange],
                genres: [],
                images: [],
            })
            .then(response => {
                if (!response.data || !response.data['eventId']) {
                    alert('Failed to add event');
                    return;
                }

                alert('Added new event');
                handleClose();
            })
            .catch(error => {
                if (error.response.data && error.response.data.message) {
                    console.error(error.response.data.message);
                    alert(JSON.stringify(error.response.data.message));
                }
            });
    }

  return (
    <>
        {isUserOrganizer() && <div className="event-button-container">
            <Button className="event-button" onClick={handleShow}>
                Add Event Form
            </Button>
        </div>}

      <Modal className='p-0' fullscreen='sm-down' show={showModal} onHide={handleClose}>
        <Modal.Header>
          <Modal.Title>Add Event Form</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form noValidate validated={validated} onSubmit={handleSubmit}>

            <Form.Group className="mb-3" controlId="validateEventName">
              <Form.Label>Event Name</Form.Label>
              <Form.Control
                  type='text'
                  name='name'
                  required
                  autoFocus
                  placeholder='Warriors vs Celtics'
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="validateLocation">
              <Form.Label>Event Location</Form.Label>
              <Form.Control
                  name='location'
                  required
                  rows={2}
                  placeholder='1 Warriors Way, San Francisco, CA 94158'
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="validateDescription">
                <Form.Label>Event Description (Optional)</Form.Label>
                <Form.Control
                    name='description'
                    as='textarea'
                    rows={3}
                    placeholder='No description available'
                />
            </Form.Group>

            <Form.Group className="mb-3" controlId='validatePriceRange'>
                <Form.Label>Price (Optional)</Form.Label>
                <InputGroup hasValidation>
                    <InputGroup.Text id="prependCurrency">$</InputGroup.Text>
                    <Form.Control
                        type='text'
                        name='price'
                        aria-describedby='prependCurrency'
                        placeholder="Free"
                    />
                </InputGroup>
            </Form.Group>

            <Row>
              <Col>
                <Form.Group className="mb-3" controlId="validateStartDate">
                  <Form.Label>Event Date Start</Form.Label>
                  <Form.Control
                    type='date'
                    required
                    name='startDate'
                  />
                </Form.Group>
              </Col>
              <Col>
                <Form.Group className="mb-3" controlId="validateEndDate">
                  <Form.Label>Event Date End (Optional)</Form.Label>
                  <Form.Control
                    type='date'
                    name='endDate'
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3" controlId="validateExternalUrl">
              <Form.Label>Event Link (Optional)</Form.Label>
              <Form.Control
                  type='url'
                  name='externalUrl'
                  rows={1}
                  placeholder='https://www.ticketmaster.com/golden-state-warriors-vs-boston-celtics-san-francisco-california-12-10-2022/event/1C005D0C9F3A27E9'
              />
            </Form.Group>

            <Button className="event-button mr-2" variant="warning" type='submit'>
                Add Event
            </Button>
            <Button variant="secondary" onClick={handleClose}>
              Close
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
  </>
  )
}
