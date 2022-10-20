import "./App.css"

import React from React;
import { useState } from "react";
import Axios from "axios";

const App = ()=>{

    const [eventList, setEventList] = useState([]);

    const getAllEvents = () =>{
        Axios.get("http://localhost:4000/events").then((response) =>{
            console.log(response);
        });
    }
    return (
        <div className="App">
            <h1>Event Monkey</h1>
            <div className="container">
                <label>Search Your Next Event</label>
                <input type="text"></input>
            
                <div class="viewAllEvents">
                    <button onClick={getAllEvents()}>Show All Events</button>
                </div>
            </div>
        </div>
    )
}

export default App;