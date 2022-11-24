import React, { useState } from 'react';
import ReactDOM from 'react-dom'
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';

import './Modal.css'

//Modal = Fades bg and central popup.
export default function ModalEM() {
  const [showModal, setShowModal] = useState(false)

  const handleClose = () => {
      setShowModal(false)
  }

  const handleShow = () => {
      setShowModal(true)
  }

  return (
    
    <>
      <div className="event-button-container">
        <Button className="event-button" onClick={handleShow}>
          Add Event Form
        </Button>
      </div>

      <Modal show={showModal} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Add Event Form</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form>
          <Form.Group className="mb-3" controlId="eventForm.ControlInput1">
            <Form.Label>Event Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="'Warriors vs Celtics'"
              autoFocus
            />
          </Form.Group>

          <Form.Label>Price</Form.Label>
          <InputGroup className="mb-3">
            <InputGroup.Text>$</InputGroup.Text>
            <Form.Control aria-label="Amount (to the nearest dollar)" placeholder="'420.00'"/>
          </InputGroup>

          <Form.Group className="mb-3" controlId="eventForm.ControlTextarea1">
            <Form.Label>Event Location</Form.Label>
            <Form.Control as="textarea" rows={2} placeholder="'1 Warriors Way, San Francisco, CA 94158'"/>
          </Form.Group>


          <Form.Group className="mb-3" controlId="eventForm.ControlTextarea1">
            <Form.Label>Event Description</Form.Label>
            <Form.Control as="textarea" rows={3} placeholder="'Sint minim ad velit consequat sint ipsum minim et irure esse Lorem laboris pariatur dolor.'"/>
          </Form.Group>

          <Form.Group className="mb-3" controlId="eventForm.ControlTextarea1">
            <Form.Label>Event Date Start</Form.Label>
            <Form.Control as="textarea" rows={1} placeholder="'Monday, October 01, 2022'"/>
          </Form.Group>

          <Form.Group className="mb-3" controlId="eventForm.ControlTextarea1">
            <Form.Label>Event Date End</Form.Label>
            <Form.Control as="textarea" rows={1} placeholder="'Tuesday, October 02, 2022'"/>
          </Form.Group>

          <Form.Group className="mb-3" controlId="eventForm.ControlTextarea1">
            <Form.Label>Event Link</Form.Label>
            <Form.Control as="textarea" rows={1} placeholder="'https://www.ticketmaster.com/golden-state-warriors-vs-boston-celtics-san-francisco-california-12-10-2022/event/1C005D0C9F3A27E9'"/>
          </Form.Group>
        </Form>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button className="event-button"variant="warning" onClick={handleClose}>
            Add Event
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  )
}
