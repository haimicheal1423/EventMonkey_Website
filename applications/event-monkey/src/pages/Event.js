import { useEffect, useState } from 'react';
import Axios from 'axios';
import { Routes, Route, useParams } from "react-router-dom";

function Event() {
    const { genre } = useParams()
    const [events, setEvents] = useState([])
    const getAllEvents = () => {
        if(genre){
            Axios.get(`http://localhost:4000/events/${genre}`).then((response) => {
                setEvents(response.data);
            });
        }else{
            Axios.get("http://localhost:4000/events").then((response) => {
                setEvents(response.data);
            });
        }
    }

    useEffect(() => {
        getAllEvents();
    }, []);

    return (
        <div>
            <main>
                <div>
                    {events?.length > 0 && events.map((event, index) =>
                        <p key={index}>Name: {event.name}</p>
                    )}
                </div>
            </main>
        </div>
    );
}

export default Event;
