// src/comp/UI/CardList/CardList.jsx
import React from 'react';
import Card from '../Card/Card';
import styles from './CardList.module.css';

const CardList = ({
    events,
    isLog,
    isOrganizerView,
    participatingEventIds,
    favoriteEventIds,
    onParticipateToggle,
    onFavoriteToggle
}) => {
    // Добавляем проверку на пустой массив
    if (!events || events.length === 0) {
        return <p className={styles.noEvents}>Мероприятия не найдены.</p>;
    }

    return (
        <div className={styles.cardList}>
            {events.map(event => (
                <Card
                    key={event.id}
                    event={event}
                    isLog={isLog}
                    isOrganizerView={isOrganizerView}
                    initialIsParticipating={participatingEventIds?.has(event.id)}
                    initialIsFavorite={favoriteEventIds?.has(event.id)}
                    onParticipateToggle={onParticipateToggle}
                    onFavoriteToggle={onFavoriteToggle}
                />
            ))}
        </div>
    );
};

export default CardList;