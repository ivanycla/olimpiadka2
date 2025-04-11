import React, { useState } from "react";
import styles from "./Card.module.css"; 
import AlertReg from "../AlertReg/AlertReg";
import { useNavigate } from "react-router-dom";

const Card = ({
  name,
  description, 
  format,       
  place,
  duration,
  date,         
  info,
  tags,
  img,
  isLog
}) => {
  const [flagGuest, setFlagGuest] = useState(false);
  const navigate = useNavigate();

  const handleClick = () => {
    if(isLog) {
      const eventData = {
        name,
        description,
        format,
        place,
        duration,
        date,
        info,
        tags,
        img
      };

      const existingEvents = JSON.parse(localStorage.getItem("events")) || [];
      const updatedEvents = [...existingEvents, eventData];
      localStorage.setItem("events", JSON.stringify(updatedEvents));
    }
  };

  const handleFavorite = () => {
    if(isLog) {
      const eventData = {
        name,
        description,
        format,
        place,
        duration,
        date,
        info,
        tags,
        img
      };

      const favoriteEvents = JSON.parse(localStorage.getItem("FavoriteEvents")) || [];
      
      
      const isExist = favoriteEvents.some(event => event.name === name);
      
      if(!isExist) {
        const updatedFavorites = [...favoriteEvents, eventData];
        localStorage.setItem("FavoriteEvents", JSON.stringify(updatedFavorites));
      }
    }
  };

  const handleCloseAlert = () => {
    setFlagGuest(false);
  };

  return (
    <div className={styles.card}>
      <div className={styles.imageContainer}>
        <img 
          src={img} 
          alt="Обложка мероприятия" 
          className={styles.image}
        />
      </div>
      
      <div className={styles.content}>
        <h3 className={styles.title}>{name}</h3>
        <p className={styles.description}>{description}</p>
        
        <div className={styles.details}>
          <p className={styles.detailItem}>Формат: {format}</p>
          <p className={styles.detailItem}>Место: {place}</p>
          <p className={styles.detailItem}>Длительность: {duration}</p>
          <p className={styles.detailItem}>Дата: {date}</p>
          <p className={styles.detailItem}>Организатор: {info}</p>
        </div>

        <div className={styles.tagsContainer}>
          {tags.map((tag, index) => (
            <div key={index} className={styles.tag}>
              {tag}
            </div>
          ))}
        </div>

        <button 
          onClick={handleClick}
          className={styles.participateButton}
        >
          Участвовать
        </button>
        <button 
          onClick={handleFavorite}
          className={styles.favoriteButton}
        >
          Добавить в избранное
        </button>
      </div>
    </div>
  );
};

export default Card;