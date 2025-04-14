import React from "react";
import { useNavigate } from "react-router-dom";


const ProfileModer = ()=>{
    const navigate = useNavigate();
    const handleProfile = () =>{
        navigate("/moderaitProfile")//navigate("/moderaitProfile/ {state : userId}")
    }
    
return(
    <div>
        <p>Тут будет поиск и какая нибудь инфа хз</p>
        <button onClick={handleProfile}>Чмо</button>
    </div>
)
}

export default ProfileModer