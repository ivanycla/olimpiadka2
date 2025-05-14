import React, { useEffect, useState } from "react";
import CardList from "../comp/UI/CardList/CardList";
import { getEvents } from "../api/api";

const ModerCards = () =>{
    const [events,setEvents]=useState([])
    const fetchEvent = async () => {
        try {
          const data = await getEvents({ page: 0, size: 100 });
          console.log((data.content));
          setEvents(data.content);
        } catch (err) {
          console.error('Failed to fetch events:', err);
        }
      };
      
    useEffect(()=>{
        fetchEvent()
    },[])
    return(
        <div>
            <CardList
            moderView={true}
            events={events}
            />
        </div>
    )
}

export default ModerCards