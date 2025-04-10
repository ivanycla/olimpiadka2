import React from "react";
import Card from "../Card/Card.jsx";
import styles from "./CardList.module.css"; 

const CardList = ({ events,isLog}) => {
  return (
    <div className={styles.listContainer}>
      {events.map((event, index) => (
        <Card
          key={index}
          name={event.name}
          discription={event.discription}
          phormat={event.phormat}
          place={event.place}
          duration={event.duration}
          data={event.data}
          info={event.info}
          tags={event.tags}
          img={event.img}
          isLog={isLog}
          //userId={userId}
        />
      ))}
    </div>
  );
};

export default CardList