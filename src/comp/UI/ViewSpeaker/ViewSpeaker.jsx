import React from "react";
import Portal from "../Portal/Portal";
import styles from "./ViewSpeaker.module.css";


const ViewSpeaker = ({ speaker, onClose }) => {
    if (!speaker) return null;
  
    return (
      <Portal>
        <div className={styles.modalOverlay} onClick={onClose}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeButton} onClick={onClose}>&times;</button>
            
            <div className={styles.headerContainer}>
              {speaker.url && (
                <img 
                  src={speaker.url} 
                  alt={speaker.name} 
                  className={styles.speakerImage}
                />
              )}
              <h2 className={styles.speakerName}>{speaker.name}</h2>
            </div>
            
            {speaker.bio && (
              <div className={styles.speakerBio}>
                {speaker.bio.split('\n').map((line, i) => (
                  <p key={i}>{line}</p>
                ))}
              </div>
            )}
          </div>
        </div>
      </Portal>
    );
  };
  export default ViewSpeaker