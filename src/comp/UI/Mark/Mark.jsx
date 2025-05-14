import React from "react";
import styles from "./Mark.module.css";

const Mark = ({ cardId }) => {
    return(
        <div className={styles.ratingArea}>
            <input type="radio" id={`star-5-${cardId}`} name={`rating-${cardId}`} value="5"/>
            <label htmlFor={`star-5-${cardId}`} title="Оценка «5»"></label>    
            <input type="radio" id={`star-4-${cardId}`} name={`rating-${cardId}`} value="4"/>
            <label htmlFor={`star-4-${cardId}`} title="Оценка «4»"></label>    
            <input type="radio" id={`star-3-${cardId}`} name={`rating-${cardId}`} value="3"/>
            <label htmlFor={`star-3-${cardId}`} title="Оценка «3»"></label>  
            <input type="radio" id={`star-2-${cardId}`} name={`rating-${cardId}`} value="2"/>
            <label htmlFor={`star-2-${cardId}`} title="Оценка «2»"></label>    
            <input type="radio" id={`star-1-${cardId}`} name={`rating-${cardId}`} value="1"/>
            <label htmlFor={`star-1-${cardId}`} title="Оценка «1»"></label>
        </div>
    )
}

export default Mark;