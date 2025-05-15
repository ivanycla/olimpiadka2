import React from "react";
import Portal from "../Portal/Portal";
import styles from "./ViewSpeaker.module.css";

// Можно добавить пропс onRemoveSpeaker, если кнопка удаления будет здесь
const ViewSpeaker = ({ speaker, onClose /*, onRemoveSpeaker, eventId, isOrganizerView */ }) => {
    if (!speaker) return null;
  
    return (
      <Portal>
        <div className={styles.modalOverlay} onClick={onClose}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeButton} onClick={onClose}>×</button>
            
            <div className={styles.headerContainer}>
              {/* Используем photoUrl, если на бэке и в DTO это поле так называется */}
              {speaker.photoUrl && ( 
                <img 
                  src={speaker.photoUrl} 
                  alt={speaker.name} 
                  className={styles.speakerImage}
                />
              )}
              <h2 className={styles.speakerName}>{speaker.name}</h2>
            </div>
            
            {/* Используем information, если на бэке и в DTO это поле так называется */}
            {speaker.information && ( 
              <div className={styles.speakerBio}>
                {speaker.information.split('\n').map((line, i) => (
                  <p key={i}>{line}</p>
                ))}
              </div>
            )}

            {/* 
            Пример кнопки удаления, если она должна быть здесь:
            {isOrganizerView && onRemoveSpeaker && (
              <button 
                onClick={() => onRemoveSpeaker(speaker.id)} 
                className={styles.removeButton} // Добавь стили для кнопки
              >
                Удалить спикера
              </button>
            )}
            */}
          </div>
        </div>
      </Portal>
    );
  };
  export default ViewSpeaker;