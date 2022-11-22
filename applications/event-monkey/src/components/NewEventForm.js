import React from 'react'
import './NewEventForm.css'

export default function NewEventForm() {
  return (
    <form className="new-event-form">
        {/* <label htmlFor="title">Event Title: </label>
        <input type="text" id="title"> </input> */}

        {/* //this format replaces above 'id' labeling */}
        <label>
            <span>Event Title:</span>
            <input type="text"/>
        </label>

        <label>
            <span>Event Date:</span>
            <input type="date"/>
        </label>

        <label>
            <span>Event Description:</span>
            <input type="date"/>
        </label>

        <label>
            <span>Event Date Time Start:</span>
            <input type="date"/>
        </label>

        <label>
            <span>Event Date Time End:</span>
            <input type="date"/>
        </label>

    </form>
  )
}
