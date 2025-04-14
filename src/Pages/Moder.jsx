import React from "react";
import { useNavigate } from "react-router-dom";



const Moder = () =>{
    const navigate = useNavigate();
    const handleProfile = () =>{
        navigate("/ModerProfile");
    }
return(
    <div>
        <p>Остальная разметка тут сделаем отдельный компонент MainPage  чтобы меньше страниц блыо </p>
        <button onClick={handleProfile}>Перейти в профиль</button>
    </div>
)

}



export default Moder