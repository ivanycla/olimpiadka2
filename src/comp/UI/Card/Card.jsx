// src/comp/UI/Card/Card.jsx
import React, { useState, useEffect } from 'react';
import styles from './Card.module.css';
// Импорты API больше не нужны здесь

const Card = ({
    event,
    isLog, // Залогинен ли текущий пользователь
    isOrganizerView = false, // Отображается ли на странице организатора/модератора
    // Функции обратного вызова для действий (передаются из Profile.jsx)
    onParticipateToggle = async () => false, // Функция для Участвовать/Отменить
    onFavoriteToggle = async () => false,   // Функция для Избранное/Убрать
    // Начальные состояния кнопок (передаются из Profile.jsx)
    initialIsParticipating = false,
    initialIsFavorite = false,
 }) => {

    const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
    const [isParticipating, setIsParticipating] = useState(initialIsParticipating);
    const [actionError, setActionError] = useState(null);
    const [actionLoading, setActionLoading] = useState(null); // 'participate' или 'favorite'

    // Пересчитываем состояние кнопок, если изменились initial props (например, после перезагрузки в Profile)
    useEffect(() => {
        setIsParticipating(initialIsParticipating);
    }, [initialIsParticipating]);

    useEffect(() => {
        setIsFavorite(initialIsFavorite);
    }, [initialIsFavorite]);

    // Показываем кнопки только для залогиненного пользователя не на странице организатора
    const showActionButtons = isLog && !isOrganizerView;

    // --- ОБРАБОТЧИКИ, ВЫЗЫВАЮЩИЕ ПРОПСЫ ---
    const handleParticipateClick = async () => {
        console.log("!!! УЧАСТВОВАТЬ КЛИКНУТО !!! Event ID:", event?.id); // <--- ДОБАВИТЬ
        if (!event?.id || actionLoading) {
             console.log("Участие: действие прервано (нет ID или загрузка)"); // <--- ДОБАВИТЬ
             return;
        }
        setActionLoading('participate');
        setActionError(null);
        console.log("Участие: Вызов onParticipateToggle..."); // <--- ДОБАВИТЬ
        const success = await onParticipateToggle(event.id, isParticipating);
         console.log("Участие: onParticipateToggle вернул:", success); // <--- ДОБАВИТЬ
        if (!success) {
             setActionError("Ошибка изменения статуса участия");
        }
        setActionLoading(null);
    };

    const handleFavoriteClick = async () => {
         console.log("!!! ИЗБРАННОЕ КЛИКНУТО !!! Event ID:", event?.id); // <--- ДОБАВИТЬ
         if (!event?.id || actionLoading) {
              console.log("Избранное: действие прервано (нет ID или загрузка)"); // <--- ДОБАВИТЬ
              return;
         }
         setActionLoading('favorite');
         setActionError(null);
         console.log("Избранное: Вызов onFavoriteToggle..."); // <--- ДОБАВИТЬ
         const success = await onFavoriteToggle(event.id, isFavorite);
          console.log("Избранное: onFavoriteToggle вернул:", success); // <--- ДОБАВИТЬ
         if (!success) {
             setActionError("Ошибка изменения статуса избранного");
         }
         setActionLoading(null);
     };

    // --- Функции Форматирования ---
    const formatDate = (dateString) => {
        if (!dateString) return '?';
        try { return new Date(dateString).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' }); }
        catch (e) { return 'Неверная дата'; }
    };
    const formatTime = (dateString) => {
        if (!dateString) return '?';
        try { return new Date(dateString).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }); }
        catch (e) { return '?'; }
    };
    const formatDuration = (minutes) => {
        if (minutes == null || isNaN(minutes) || minutes <= 0) return null;
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        let result = '';
        if (hours > 0) result += `${hours} ч `;
        if (mins > 0) result += `${mins} мин`;
        return result.trim();
    };

    if (!event) return <div className={styles.card}>Ошибка: нет данных.</div>;

    const placeString = event.location ? [event.location.city, event.location.address].filter(Boolean).join(', ') || 'Не указано' : 'Не указано';
    const dateTimeString = event.startTime ? `${formatDate(event.startTime)} в ${formatTime(event.startTime)}` : 'Не указано';
    const durationString = formatDuration(event.durationMinutes);

    return (
        <div className={styles.card}>
            {event.mediaContentUrl ? (
                 <div className={styles.imageContainer}>
                     <img src={event.mediaContentUrl} alt={event.title || 'Медиа'} className={styles.image} />
                 </div>
             ): ( <div className={styles.imagePlaceholder}>Нет изображения</div> )}

            <div className={styles.content}>
                <h3 className={styles.title}>{event.title || 'Без названия'}</h3>
                {event.organizerUsername && <p className={styles.organizer}>Орг: {event.organizerUsername}</p>}
                {event.description && <p className={styles.description}>{event.description}</p>}

                <div className={styles.details}>
                    <p className={styles.detailItem}><strong>Формат:</strong> {event.format || '?'}</p>
                    <p className={styles.detailItem}><strong>Место:</strong> {placeString}</p>
                    <p className={styles.detailItem}><strong>Когда:</strong> {dateTimeString}</p>
                    {durationString && <p className={styles.detailItem}><strong>Длит.:</strong> {durationString}</p>}
                    {event.resources && <p className={styles.detailItem}><strong>Ресурсы:</strong> {event.resources}</p>}
                </div>

                 {event.tags && event.tags.length > 0 && (
                     <div className={styles.tagsContainer}>
                         <strong>Теги:</strong>
                         {event.tags.map((tag) => (
                             <span key={tag.id || tag} className={styles.tag}>{tag.name || tag}</span>
                         ))}
                     </div>
                 )}

                {actionError && <p className={styles.actionError}>{actionError}</p>}

                {showActionButtons && (
                    <div className={styles.actions}>
                        <button onClick={handleParticipateClick} disabled={!!actionLoading} className={styles.actionButton}>
                            {actionLoading === 'participate' ? '...' : (isParticipating ? 'Отменить участие' : 'Участвовать')}
                        </button>
                        <button onClick={handleFavoriteClick} disabled={!!actionLoading} className={`${styles.actionButton} ${isFavorite ? styles.favoriteActive : styles.favoriteInactive}`}>
                             {actionLoading === 'favorite' ? '...' : (isFavorite ? 'В избранном' : 'В избранное')}
                        </button>
                    </div>
                )}

                 {isOrganizerView && event.status && (
                     <p className={`${styles.status} ${styles[`status${event.status}`]}`}>Статус: {event.status}</p>
                 )}
            </div>
        </div>
    );
};

export default Card;