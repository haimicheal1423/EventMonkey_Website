import { useEffect, useState } from 'react';
import Axios from 'axios';
import { useParams } from "react-router-dom";

function Events() {
    const { genre } = useParams()
    const [events, setEvents] = useState([])
    const getAllEvents = () => {
        if(genre){
            Axios.get(`http://localhost:4000/event/${genre}`).then((response) => {
                setEvents(response.data);
            });
        }else{
            Axios.get("http://localhost:4000/event").then((response) => {
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
                <h2>Events</h2>
                <div>
                    {events?.length > 0 && events.map((event, index) =>
                        <p key={index}>Name: {event.name}</p>
                    )}
                </div>
            </main>
        </div>
    );
}

export default Events;