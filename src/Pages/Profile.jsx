import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";



const Profile = ()=>{
    //Тут запрос на сервер по user id и отрисовка
    const [bio,setBio]=useState((localStorage.getItem("bio") === "undefined" || localStorage.getItem("bio") === null) ? "" : localStorage.getItem("bio"))
    const [photo,setPhoto]=useState(null);

    const navigate = useNavigate();



    function saveInfo(){
        localStorage.setItem("bio", bio)
    }

return(
    <div>
        <form action="">
            <input type="file" name="" id="" />
            <input type="text" value={bio} onChange={(e) => {setBio(e.target.value)}} placeholder="Напиши что то о себе "/> <button onClick={() => saveInfo()}>Сохранить</button>
        </form>
        <p>Почта: {localStorage.getItem("email")}</p>
        <div>
            <p>Предоящие мероприятие</p>
            <p> получаем с бэка</p>        
            </div>
            <div>
                <p>дру</p>
                
            </div>
    </div>
)

}

export default Profile;