import React from "react";



const Notification = ({flagNotif,onClose}) =>{
 return(
    <div>
        <p>Тут будем получать с сервера что модер кинул предъяву</p>
        <button onClick={onClose}>закртб</button>
    </div>
 )
}

export default Notification