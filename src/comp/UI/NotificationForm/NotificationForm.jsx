import React, { useState, useEffect } from "react";
import styles from '../NotificationForm/NotificationForm.module.css';

const NotificationForm = ({ onClose }) => {
  const [why, setWhy] = useState("");
  const [description, setDescription] = useState("");
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!why.trim() || !description.trim()) {
      alert("Пожалуйста, заполните все поля");
      return;
    }
    
    alert("Уведомление успешно отправлено!");
    
    setWhy("");
    setDescription("");
    handleClose();
  };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300); 
  };

  return (
    <>
      <div className={`${styles.container} ${isVisible ? styles.containerVisible : ''}`}>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>
              За шо бан:
            </label>
            <input
              type="text"
              value={why}
              onChange={(e) => setWhy(e.target.value)}
              className={styles.input}
              placeholder="Введите причину"
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>
              Поясни:
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={styles.input}
              placeholder="Введите описание"
            />
          </div>

          <div className={styles.buttonGroup}>
            <button type="submit" className={styles.button}>
              Отправить
            </button>
            <button 
              type="button" 
              onClick={handleClose}
              className={`${styles.button} ${styles.closeButton}`}
            >
              Закрыть
            </button>
          </div>
        </form>
      </div>
      
      <div 
        className={styles.overlay} 
        onClick={handleClose}
        role="presentation"
      />
    </>
  );
};

export default NotificationForm;