import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import CardList from "../comp/UI/CardList/CardList.jsx";
import Map from "../comp/UI/Map/Map.jsx";
import FindFriend from "../comp/UI/FindFriend/FindFriend.jsx";
import FilterButton from "../comp/UI/FilterButton/FilterButton.jsx";
import Notification from "../comp/UI/Notification/Notifcication.jsx";
const Org = () => {
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
    
    const [flagNotif,setFlagNotif]=useState(false);
    const navigate = useNavigate();
    const [flagFindFriend,setFlagFindFriend]=useState(false);
    const [isLog,setIsLog]=useState(true);

    const [filter, setFilter] = useState('all')
    function handleFilter(e, type){
        setFilter(type)
        e.target.className = 'active'
    }

    const mapMarkers = mock.map(event => ({
        lat: event.coordinates.lat,
        lng: event.coordinates.lng,
        title: event.name,
        info: event.info
    }));
    const handleProfileClick=()=>{
        navigate("/ProfileOrg")//navigate("/Profile/{userId},{{state:userId}}");
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
)} <button
onClick={()=>setFlagNotif(true)}
>уведомления</button>
{
    flagNotif &&(
        <Notification
        flagNotif={flagNotif}
        onClose={()=>setFlagNotif(false)}
        />
    )
}
            </header>
            
            <div style={{ padding: "20px" }}>
                
                <div style={{ marginBottom: "40px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
                    <Map markers={mapMarkers} />
                </div>
                
                <div style={{ marginTop: "30px", padding: "20px", background: "#f8f9fa" }}>
                    <FilterButton onClick={() => {setFilter('all')}} isActive={filter === 'all'}>Все</FilterButton>
                    <FilterButton onClick={() => {setFilter('offline')}} isActive={filter === 'offline'}>Оффлайн</FilterButton>
                    <FilterButton onClick={() => {setFilter('online')}} isActive={filter === 'online'}>Онлайн</FilterButton>
                    <FilterButton onClick={() => {setFilter('music')}} isActive={filter === 'music'}>Музыка</FilterButton>
                </div>
                
                <CardList events={mock}
                isLog={true} filter={filter}
                //userId={userdId}
                />
            </div>
        </div>
    );
};

export default Org;
