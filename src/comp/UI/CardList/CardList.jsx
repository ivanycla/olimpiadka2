// CardList.jsx
import React, { useEffect, useState, useMemo } from 'react';
import Card from '../Card/Card';
import styles from './CardList.module.css';
import Priority from '../Priority/Priority';

const CardList = ({
  events,
  isLog,
  isOrganizerView,
  participatingEventIds,
  favoriteEventIds,
  onParticipateToggle,
  onFavoriteToggle,
  setRecommendations,
  moderView
}) => {
  const [priorities, setPriorities] = useState(() => {
    
    try {
      return JSON.parse(localStorage.getItem("priorities")) || {};
    } catch {
      return {};
    }
  });

 
  useEffect(() => {
    return () => {
      try {
        localStorage.setItem("priorities", JSON.stringify(priorities));
      } catch (e) {
        console.error("Ошибка сохранения при выходе:", e);
      }
    };
  }, [priorities]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      localStorage.setItem("priorities", JSON.stringify(priorities));
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [priorities]);



  const handlePriorityChange = (cardId, value) => {
    setPriorities(prev => ({
      ...prev,
      [cardId]: value
    }));
  };

 
  const sortedEvents = useMemo(() => {
    if (!events) return [];
    
    return [...events].sort((a, b) => {
      const priorityA = priorities[a.id] || 0;
      const priorityB = priorities[b.id] || 0;
      return priorityB - priorityA; 
    });
  }, [events, priorities]);

  if (!events || events.length === 0) {
    return <p className={styles.noEvents}>Мероприятия не найдены.</p>;
  }

  return (
    <div className={styles.cardList}>
      {sortedEvents.map(event => (
        <div key={event.id}>
          <Card
            event={event}
            isLog={isLog}
            isOrganizerView={isOrganizerView}
            initialIsParticipating={participatingEventIds?.has(event.id)}
            initialIsFavorite={favoriteEventIds?.has(event.id)}
            onParticipateToggle={onParticipateToggle}
            onFavoriteToggle={onFavoriteToggle}
            moderView={moderView}
            setRecommendations={setRecommendations}
          />
          
          {moderView && (
            <Priority 
              cardId={event.id}
              selectedPriority={priorities[event.id] || null}
              onPriorityChange={handlePriorityChange}
            />
          )}
        </div>
      ))}
    </div>
  );
};

export default CardList;