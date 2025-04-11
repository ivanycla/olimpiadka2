import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import CardList from "../comp/UI/CardList/CardList.jsx";
import Map from "../comp/UI/Map/Map.jsx";
import FindFriend from "../comp/UI/FindFriend/FindFriend.jsx";

const UserPage = () => {
    const [mock, setMock] = useState([
        {
            name: "Концерт маканчика",
            description: `Подо мной M5, Asphalt 8...`,
            format: "Оффлайн",
            place: "Минск, пр. Независимости, 58",
            coordinates: { lat: 53.902257, lng: 27.561824 },
            duration: "Жалко что не всю жизни",
            date: "03.05.2025",
            info: "Подо мной M5, Asphalt 8...",
            tags: ["offline", "macan", "music"],
            img: "https://cdn.promodj.com/afs/4f675099712b583994da2c9fe5782c7c12%3Aresize%3A2000x2000%3Asame%3Ab3b350"
        },
        {
            name: "Концерт иваназоло",
            description: `Лаванда, меня уносит правда...`,
            format: "Оффлайн",
            place: "Минск, ул. Немига, 5",
            coordinates: { lat: 53.904539, lng: 27.561523 }, 
            duration: "Жалко что не всю жизни",
            date: "10.05.2025",
            info: "Лаванда, меня уносит правда",
            tags: ["offline", "ivanzolo", "music"],
            img: "https://uznayvse.ru/images/content/2022/3/blogger-ivan-zolo_100.jpg"
        },
        {
            name: "Пиздим лазовского",
            description: `Та просто отпизидим его`,
            format: "Оффлайн",
            place: "БГАС, Минск",
            coordinates: { lat: 53.930887, lng: 27.651634 },
            duration: "Жалко что не всю жизни",
            date: "08.04.2025",
            info: "заебал",
            tags: ["offline", "fight"],
            img: "https://sun9-73.userapi.com/impf/mk2xRlNqECIqmVBF9q1xbxY0a6xS5ArgBq5DtA/MxTv32K_9sg.jpg?size=1818x606&quality=95&crop=0,191,1500,500&sign=74cfa2b24e8d68f431fafc9f34b1144c&type=cover_group"
        }
    ]);
    

    const navigate = useNavigate();
    const [flagFindFriend,setFlagFindFriend]=useState(false);
    const [isLog,setIsLog]=useState(true);

    const mapMarkers = mock.map(event => ({
        lat: event.coordinates.lat,
        lng: event.coordinates.lng,
        title: event.name,
        info: event.info
    }));
    const handleProfileClick=()=>{
        navigate("/Profile")//navigate("/Profile/{userId},{{state:userId}}");
    }
    const handleFindFriend= () =>{
        setFlagFindFriend(true);
    }
    return (
        <div className="guest-page">
            <header style={{ padding: "20px", display: "flex", justifyContent: "space-between" }}>
                <button onClick={handleProfileClick}>
                    Профиль
                    </button>
                    <button onClick={handleFindFriend}>
                        найти друга
                    </button>
                    {flagFindFriend && (
  <div className="find-friend-container">
    <FindFriend />
    <button onClick={() => setFlagFindFriend(false)}>Закрыть</button>
  </div>
)}
            </header>
            
            <div style={{ padding: "20px" }}>
                {/* Карта */}
                <div style={{ marginBottom: "40px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
                    <Map markers={mapMarkers} />
                </div>
                
                
                <CardList events={mock}
                isLog={true}
                //userId={userdId}
                />
                
                {/* Фильтры (можно добавить позже) */}
                <div style={{ marginTop: "30px", padding: "20px", background: "#f8f9fa" }}>
                    <p>Тут можно добавить фильтры:</p>
                    <button style={{ marginRight: "10px" }}>Оффлайн</button>
                    <button style={{ marginRight: "10px" }}>Музыка</button>
                    <button>Все</button>
                </div>
            </div>
        </div>
    );
};

export default UserPage;
