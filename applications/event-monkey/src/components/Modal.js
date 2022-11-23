import React, { useState } from 'react';
import ReactDOM from 'react-dom'
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';

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
      <Button variant="primary" onClick={handleShow}>
        Add Event Form
      </Button>

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
              centered
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="eventForm.ControlTextarea1">
            <Form.Label>Event Description</Form.Label>
            <Form.Control as="textarea" rows={3} />
          </Form.Group>

          <Form.Group className="mb-3" controlId="eventForm.ControlTextarea1">
            <Form.Label>Event Date Start</Form.Label>
            <Form.Control as="textarea" rows={1} placeholder="'2022-10-23'"/>
          </Form.Group>

          <Form.Group className="mb-3" controlId="eventForm.ControlTextarea1">
            <Form.Label>Event Date End</Form.Label>
            <Form.Control as="textarea" rows={1}/>
          </Form.Group>

          <Form.Group className="mb-3" controlId="eventForm.ControlTextarea1">
            <Form.Label>Event Link</Form.Label>
            <Form.Control as="textarea" rows={1}/>
          </Form.Group>
        </Form>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button variant="primary" onClick={handleClose}>
            Add Event
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  )
}
