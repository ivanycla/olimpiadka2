import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../comp/UI/Card/Card";
import OrgForm from "../comp/UI/OrgForm/OrgFrom";

const ProfileOrg = () => {
    const [mockOrg]=useState({
        email:"dolbaeb228@chmo.com",
        bio:"В рот всех ебал",
        organization:"zalupaEbanay"
    })
    const [searchFlag,setSearchFlag]=useState(false);
    const [search,setSearch]=useState("");
    const [filteredEvents, setFilteredEvents] = useState([]);
    const [mock] = useState([
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
            }])
            const handleCreate= () =>{
                alert("Отправляем на сервер ")
            }
            useEffect(() => {
                
                const searchTerm = search.toLowerCase().trim();
                
                if (searchTerm === "") {
                    setFilteredEvents(mock);
                } else {
                    const filtered = mock.filter(event => {
                        return (
                            event.name.toLowerCase().includes(searchTerm) ||
                            event.description.toLowerCase().includes(searchTerm) ||
                            event.tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
                            event.place.toLowerCase().includes(searchTerm)
                        );
                    });
                    setFilteredEvents(filtered);
                }
            }, [search]); 
    return (
        <div className="profile-container">
        
            <div>
                <div>
                    <p>Почта:{mockOrg.email}</p>
                    <p>Организация:{mockOrg.organization}</p>
                    <p>Информация:{mockOrg.bio}</p>
                </div>
                <div>
                <p>Поиск</p>
               
                    <input 
                        type="text" 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Введите название, тег или место"
                    />
                    
                <p>ваши мероприятия</p>
                <div>
                    {filteredEvents.map((event,index)=>(
                    <div>
                    <Card
                    name={event.name}
                    description={event.description}
                    format={event.format}
                    place={event.place}
                    duration={event.duration}
                    date={event.date}
                    info={event.info}
                    img={event.img}
                    tags={event.tags}
                    />
                    </div>
                    ))}
                </div>
            </div>
      </div>
      <div>
        <OrgForm
        onSubmit={handleCreate}
        />
      </div>
    </div>
  );
};

export default ProfileOrg;
