import React, { use, useState } from "react";
import styles from "./Card.module.css"; 
import AlertReg from "../AlertReg/AlertReg";

const Card = ({
  name,
  discription,
  phormat,
  place,
  duration,
  data,
  info,
  tags,
  img
}) => {
  const [flagGuest,setFlagGuest]=useState(false);
  const handleClick = () => {
    setFlagGuest(true);
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
        <p className={styles.description}>{discription}</p>
        
        <div className={styles.details}>
          <p className={styles.detailItem}>Форматт: {phormat}</p>
          <p className={styles.detailItem}>Место: {place}</p>
          <p className={styles.detailItem}>Длительность: {duration}</p>
          <p className={styles.detailItem}>Дата: {data}</p>
          <p className={styles.detailItem}>Организатор: {info}</p>
        </div>

        {
          <div className={styles.tagsContainer}>
            {tags.map((tag, index) => (
              <div key={index} className={styles.tag}>
                {tag}
              </div>
            ))}
          </div>
        }
         <button onClick={handleClick}
           className={styles.participateButton} 
         >Участвовать</button>
         {flagGuest && (
        <AlertReg 
          isVisible={flagGuest}
          onClose={handleCloseAlert}
        />
      )}
      </div>
    </div>
  );
};

export default Card;