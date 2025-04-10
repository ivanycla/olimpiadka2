import React, { useState } from "react";



const Profile = ()=>{
    //Тут запрос на сервер по user id и отрисовка
    const [bio,setBio]=useState("");
    const [photo,setPhoto]=useState(null);

return(
    <div>
        <form action="">
            <input type="file" name="" id="" />
            <input type="text" placeholder="Напиши что то о себе "/>
        </form>
        <p>Почта:asdsada</p>
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

export default Profile