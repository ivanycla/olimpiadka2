// src/comp/UI/CardList/CardList.jsx
import React from 'react';
import Card from '../Card/Card'; // Путь к Card
import styles from './CardList.module.css'; // Стили для списка

const CardList = ({
    events,
    isLog,
    isOrganizerView,
    // Принимаем новые пропсы от Profile
    participatingEventIds,
    favoriteEventIds,
    onParticipateToggle,
    onFavoriteToggle
}) => {

    if (!events || events.length === 0) {
        return <p className={styles.noEvents}>Список мероприятий пуст.</p>; // Или другое сообщение
    }

    return (
        <div className={styles.cardList}>
            {events.map(event => (
                <Card
                    key={event.id}
                    event={event}
                    isLog={isLog}
                    isOrganizerView={isOrganizerView}
                    // Передаем статусы, определенные из Set ID
                    initialIsParticipating={participatingEventIds?.has(event.id)}
                    initialIsFavorite={favoriteEventIds?.has(event.id)}
                    // Передаем колбэки дальше
                    onParticipateToggle={onParticipateToggle}
                    onFavoriteToggle={onFavoriteToggle}
                />
            ))}
        </div>
    );
};

export default CardList;