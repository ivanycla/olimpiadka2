import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../comp/UI/Card/Card";

const Profile = () => {
    const [bio, setBio] = useState(localStorage.getItem("bio") || "");
    const [events, setEvents] = useState([]);
    const [favoriteEvent, setFavoriteEvent] = useState([]);
    const [favoriteEventFlag, setFavoriteEventFlag] = useState(false);
    const [friends, setFriends] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
       
        const storedEvents = JSON.parse(localStorage.getItem("events")) || [];
        const storedFavorites = JSON.parse(localStorage.getItem("FavoriteEvents")) || [];
        const storedFriends = JSON.parse(localStorage.getItem("friends")) || [];
        
        setEvents(storedEvents);
        setFavoriteEvent(storedFavorites);
        setFriends(storedFriends);
    }, []);

    const saveInfo = () => {
        localStorage.setItem("bio", bio);
    };

    return (
        <div className="profile-container">
            <form className="bio-section">
                <input
                    type="text"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Расскажите о себе"
                />
                <button type="button" onClick={saveInfo}>
                    Сохранить
                </button>
            </form>

            <p className="email">Почта: {localStorage.getItem("email")}</p>

           
            <div className="friends-section">
                <h3>Мои друзья ({friends.length})</h3>
                <div className="friends-list">
                    {friends.map((friend, index) => (
                        <div key={index} className="friend-item">
                            {friend}
                        </div>
                    ))}
                </div>
            </div>

        <div className="events-list">
          {favoriteEventFlag ? (
            favoriteEvent.length > 0 ? (
              favoriteEvent.map((event, index) => (
                <Card
                  key={`favorite-${index}`}
                  name={event.name}
                  format={event.format}
                  description={event.description}
                  place={event.place}
                  duration={event.duration}
                  date={event.date}
                  info={event.info}
                  tags={event.tags}
                  img={event.img}
                />
              ))
            ) : (
              <p className="empty-message">Нет избранных мероприятий</p>
            )
          ) : (
            events.length > 0 ? (
              events.map((event, index) => (
                <Card
                  key={`event-${index}`}
                  name={event.name}
                  format={event.format}
                  description={event.description}
                  place={event.place}
                  duration={event.duration}
                  date={event.date}
                  info={event.info}
                  tags={event.tags}
                  img={event.img}
                />
              ))
            ) : (
              <p className="empty-message">Нет запланированных мероприятий</p>
            )
          )}
        </div>
      </div>
    
  );
};

export default Profile;