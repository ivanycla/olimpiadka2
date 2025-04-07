// AlertReg.jsx
import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import styles from "./AlertReg.module.css";

const AlertReg = ({ isVisible, onClose }) => {
  useEffect(() => {
    if (isVisible) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.alertBox} onClick={(e) => e.stopPropagation()}>
        <button 
          className={styles.closeButton} 
          onClick={onClose}
          aria-label="Закрыть"
        >
          &times;
        </button>
        <p className={styles.text}>Зарегайся заебал</p>
        <Link to="/login" className={styles.link}>
          <button className={styles.button}>Зарегаться</button>
        </Link>
      </div>
    </div>
  );
};

export default AlertReg;