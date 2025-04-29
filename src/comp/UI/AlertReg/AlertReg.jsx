// AlertReg.jsx (Исправленная версия)
import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import styles from "./AlertReg.module.css";

// Убираем агрессивные дефолты с перезагрузкой страницы, если они не нужны
const AlertReg = ({
  isVisible,
  message, // <-- Добавляем message в принимаемые props
  type = "info", // Добавим тип по умолчанию
  onClose = () => {}, // Пустая функция по умолчанию
  children, // Для текста кнопки, если нужен
  // Уберем onClickButton, если кнопка всегда ведет на /login
}) => {
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

  if (!isVisible || !message) { // Добавим проверку на message, чтобы не показывать без текста
      return null;
  }


  // Определим стиль в зависимости от типа (если нужно)
  const boxStyle = type === 'error'
                   ? styles.alertBoxError // Добавьте этот класс в CSS
                   : type === 'success'
                   ? styles.alertBoxSuccess // Добавьте этот класс в CSS
                   : styles.alertBox; // Стиль по умолчанию


  return (
    <div className={styles.overlay} onClick={onClose}>
      {/* Используем вычисленный стиль */}
      <div className={boxStyle} onClick={(e) => e.stopPropagation()}>
        <button
          className={styles.closeButton}
          onClick={onClose}
          aria-label="Закрыть"
        >
          ×
        </button>
        {/* Используем проп message для текста */}
        <p className={styles.text}>{message}</p>

        {/* Оставим кнопку и ссылку, если они нужны для ВСЕХ алертов */}
        {/* Если кнопка нужна не всегда, нужно добавить условие */}
        {children && ( // Показываем кнопку, только если есть children
           <Link to="/login" className={styles.link}>
               {/* Используем onClose для кнопки по умолчанию, если не передан onClickButton */}
               <button className={styles.button} onClick={onClose}>
                   {children || "OK"} {/* Используем children или "OK" как текст */}
               </button>
           </Link>
        )}
      </div>
    </div>
  );
};

export default AlertReg;