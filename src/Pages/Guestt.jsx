import React, { useState } from "react";
import {  Link } from "react-router-dom";
import CardList from "../comp/UI/CardList/CardList.jsx";
const Guestt=()=>{
    const [mock,setMock]= useState([{
        name:"Клнцерт маканчика",
        discription:`Подо мной M5, Asphalt 8 (Воу)
                    У неё Birkin цвета осень (Воу)
                    Она закурит, но я бросил (Воу)
                    Ice занижает градус в роксе (А)
                    Да, подо мной M5, Asphalt 8 (Воу)
                    У неё Birkin цвета осень (Воу)
                    Она закурит, но я бросил (Воу)
                    Ice занижает градус в роксе (У), а-я`,
        phormat:"Оффлайн",
        place:"Минск",
        duration:"Жалко что не всю жизни",
        data:"03.05.2025",
        info:"Подо мной M5, Asphalt 8 (Воу) типо инфа",
        tags:["offline","macan","music"],
        img:"https://cdn.promodj.com/afs/4f675099712b583994da2c9fe5782c7c12%3Aresize%3A2000x2000%3Asame%3Ab3b350"
    },
    {
        name:"Клнцерт иваназоло",
        discription:`Лаванда, меня уносит правда
                    Девочка цвета манго (Манго)
                    Мангровая лаванда (Лаванда)
                    Меня уносит Prada
                    Меня уносит правда
                    Девочка цвета манго (Манго)
                    Мангровая лаванда (Лаванда)`,
        phormat:"Оффлайн",
        place:"Минск",
        duration:"Жалко что не всю жизни",
        data:"10.05.2025",
        info:"Лаванда, меня уносит правда",
        tags:["offline","ivanzolo","music"],
        img:"https://uznayvse.ru/images/content/2022/3/blogger-ivan-zolo_100.jpg"
    }, {
        name:"Пиздим лазовского",
        discription:`Та просо отпизидим его `,
        phormat:"Оффлайн",
        place:"БГАС",
        duration:"Жалко что не всю жизни",
        data:"08.04.2025",
        info:"заебал",
        tags:["offline","fight"],
        img:"https://sun9-73.userapi.com/impf/mk2xRlNqECIqmVBF9q1xbxY0a6xS5ArgBq5DtA/MxTv32K_9sg.jpg?size=1818x606&quality=95&crop=0,191,1500,500&sign=74cfa2b24e8d68f431fafc9f34b1144c&type=cover_group"
    }
    ])
    return(
        <div>
            <header>
                <Link to='/login'>Войти</Link>
            </header>
            <div>
            <div>
        <CardList events={mock} /> 
        </div>
            </div>
        </div>
    )
}

export default Guestt;