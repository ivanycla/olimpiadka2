import React, { useState, useEffect, useCallback } from 'react';
import styles from './Card.module.css';
import AddSpeakerForm from '../AddSpeakerForm/AddSpeakerForm';
import ViewSpeaker from '../ViewSpeaker/ViewSpeaker';
import Share from '../Share/Share';
import { 
    removeSpeakerFromEvent,
    subscribeToOrganizer,
    unsubscribeFromOrganizer,
    checkSubscriptionStatus
} from '../../../api/api'; // Проверь путь

const Card = ({
    event,
    isLog,
    isOrganizerView = false,
    onParticipateToggle = async () => { console.warn("onParticipateToggle not provided"); return false; },
    onFavoriteToggle = async () => { console.warn("onFavoriteToggle not provided"); return false; },
    initialIsParticipating = false,
    initialIsFavorite = false,
    onEventUpdate 
 }) => {
    const [isFavoriteState, setIsFavoriteState] = useState(initialIsFavorite);
    const [isParticipatingState, setIsParticipatingState] = useState(initialIsParticipating);
    const [actionError, setActionError] = useState(null);
    const [actionLoading, setActionLoading] = useState(null); // Для "Участвовать" и "В избранное"
    
    const [showAddSpeakerForm, setShowAddSpeakerForm] = useState(false);
    const [selectedSpeaker, setSelectedSpeaker] = useState(null);
    const [speakerActionLoading, setSpeakerActionLoading] = useState(false); // Для действий со спикерами

    const currentSpeakers = event?.speakers || [];

    // --- Состояния и логика для подписки ---
    const [isSubscribedToEventOrganizer, setIsSubscribedToEventOrganizer] = useState(false);
    const [subscriptionLoading, setSubscriptionLoading] = useState(false);
    const [currentLoggedInUserId, setCurrentLoggedInUserId] = useState(null);

    useEffect(() => {
        const userIdFromStorage = localStorage.getItem('userId');
        if (userIdFromStorage) {
            try {
                setCurrentLoggedInUserId(Number(userIdFromStorage));
            } catch (e) {
                console.error("Failed to parse userId from localStorage", e);
            }
        }
    }, []);

    useEffect(() => {
        // Загружаем статус подписки, только если:
        // 1. Пользователь залогинен (isLog)
        // 2. Это не карточка в представлении организатора (т.е. обычный пользователь видит карточку)
        // 3. Есть ID организатора у события (event.organizerUserId)
        // 4. ID текущего пользователя известен
        // 5. ID текущего пользователя не совпадает с ID организатора события (нельзя подписаться на себя)
        if (isLog && !isOrganizerView && event?.organizerUserId && currentLoggedInUserId && currentLoggedInUserId !== event.organizerUserId) {
            const fetchSubscriptionStatus = async () => {
                setSubscriptionLoading(true);
                try {
                    const response = await checkSubscriptionStatus(event.organizerUserId);
                    setIsSubscribedToEventOrganizer(response.isSubscribed);
                } catch (error) {
                    console.error(`Ошибка проверки подписки на организатора ${event.organizerUserId}:`, error);
                } finally {
                    setSubscriptionLoading(false);
                }
            };
            fetchSubscriptionStatus();
        } else {
            setIsSubscribedToEventOrganizer(false); // Сбрасываем в других случаях
        }
    }, [isLog, isOrganizerView, event?.organizerUserId, currentLoggedInUserId]); // Зависимости


    useEffect(() => { setIsParticipatingState(initialIsParticipating); }, [initialIsParticipating, event?.id]);
    useEffect(() => { setIsFavoriteState(initialIsFavorite); }, [initialIsFavorite, event?.id]);

    const showActionButtons = isLog && !isOrganizerView;

    const handleParticipateClick = async () => {
        if (!event?.id || actionLoading) return;
        setActionLoading('participate');
        setActionError(null);
        try {
            const updatedEventOrSuccess = await onParticipateToggle(event.id, isParticipatingState);
            if (onEventUpdate && typeof updatedEventOrSuccess === 'object' && updatedEventOrSuccess.id) {
                onEventUpdate(updatedEventOrSuccess);
                // Состояние кнопки обновится через useEffect при получении нового event пропса
                // или нужно будет определить, участвует ли пользователь, из updatedEventOrSuccess
            } else if (updatedEventOrSuccess === true || typeof updatedEventOrSuccess === 'undefined') {
                setIsParticipatingState(prev => !prev); // Оптимистичное обновление
            } else {
                 setActionError("Ошибка изменения статуса участия");
            }
        } catch (err) {
            setActionError(err.message || "Ошибка изменения статуса участия");
        } finally {
            setActionLoading(null);
        }
    };

    const handleFavoriteClick = async () => {
        if (!event?.id || actionLoading) return;
        setActionLoading('favorite');
        setActionError(null);
        try {
            const updatedEventOrSuccess = await onFavoriteToggle(event.id, isFavoriteState);
            if (onEventUpdate && typeof updatedEventOrSuccess === 'object' && updatedEventOrSuccess.id) {
                onEventUpdate(updatedEventOrSuccess);
            } else if (updatedEventOrSuccess === true || typeof updatedEventOrSuccess === 'undefined') {
                setIsFavoriteState(prev => !prev);
            } else {
                setActionError("Ошибка изменения статуса избранного");
            }
        } catch (err) {
            setActionError(err.message || "Ошибка изменения статуса избранного");
        } finally {
            setActionLoading(null);
        }
    };

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
        return `${hours > 0 ? `${hours} ч ` : ''}${mins > 0 ? `${mins} мин` : ''}`.trim();
    };

    const handleSpeakerAdded = useCallback((updatedEventData) => {
        if (onEventUpdate) {
            onEventUpdate(updatedEventData);
        }
        setShowAddSpeakerForm(false);
    }, [onEventUpdate]);

    const handleRemoveSpeaker = async (speakerIdToRemove) => {
        if (!event?.id || speakerActionLoading) return;
        const speakerName = currentSpeakers.find(s => s.id === speakerIdToRemove)?.name || 'этого спикера';
        if (!window.confirm(`Удалить спикера "${speakerName}"?`)) return;

        setSpeakerActionLoading(true);
        setActionError(null);
        try {
            const updatedEventData = await removeSpeakerFromEvent(event.id, speakerIdToRemove);
            if (onEventUpdate) {
                onEventUpdate(updatedEventData);
            }
            if (selectedSpeaker?.id === speakerIdToRemove) {
                setSelectedSpeaker(null);
            }
        } catch (err) {
            console.error("Ошибка при удалении спикера:", err);
            setActionError(err.message || "Не удалось удалить спикера.");
        } finally {
            setSpeakerActionLoading(false);
        }
    };

    
    const handleToggleSubscriptionToOrganizer = async () => {
        if (!event?.organizerUserId || subscriptionLoading || !currentLoggedInUserId || currentLoggedInUserId === event.organizerUserId) {
            return;
        }
        setSubscriptionLoading(true);
        setActionError(null);
        try {
            if (isSubscribedToEventOrganizer) {
                await unsubscribeFromOrganizer(event.organizerUserId);
                setIsSubscribedToEventOrganizer(false);
            } else {
                await subscribeToOrganizer(event.organizerUserId);
                setIsSubscribedToEventOrganizer(true);
            }
        } catch (err) {
            console.error("Ошибка подписки/отписки от организатора:", err);
            setActionError(err.message || "Не удалось изменить статус подписки.");
        } finally {
            setSubscriptionLoading(false);
        }
    };

    if (!event) return <div className={styles.card}><p>Ошибка: нет данных о мероприятии.</p></div>;

    const placeString = event.location ? [event.location.city, event.location.address].filter(Boolean).join(', ') || 'Не указано' : 'Не указано';
    const dateTimeString = event.startTime ? `${formatDate(event.startTime)} в ${formatTime(event.startTime)}` : 'Не указано';
    const durationString = formatDuration(event.durationMinutes);
    const displayParticipantCount = typeof event.participantCount === 'number' ? event.participantCount : 0;
    const displayFavoriteCount = typeof event.favoriteCount === 'number' ? event.favoriteCount : 0; 
    const canShowSubscribeButton = isLog && !isOrganizerView && currentLoggedInUserId && event.organizerUserId && currentLoggedInUserId !== event.organizerUserId;
   if (!event) return <div className={styles.card}><p>Ошибка: нет данных о мероприятии.</p></div>;

    console.log(`--- Card Debug for Event: "${event.title}" (ID: ${event.id}) ---`);
    console.log(`isLog: ${isLog}`);
    console.log(`isOrganizerView: ${isOrganizerView}`);
    console.log(`currentLoggedInUserId: ${currentLoggedInUserId} (Type: ${typeof currentLoggedInUserId})`);
    console.log(`event.organizerUserId: ${event.organizerUserId} (Type: ${typeof event.organizerUserId})`);
    console.log(`event.organizerUsername: ${event.organizerUsername}`);
    
    const localShowActionButtons = isLog && !isOrganizerView;
    const localCanShowSubscribeButton = isLog && !isOrganizerView && currentLoggedInUserId && event.organizerUserId && currentLoggedInUserId !== event.organizerUserId;

    console.log(`showActionButtons (локально): ${localShowActionButtons}`);
    console.log(`canShowSubscribeButton (локально): ${localCanShowSubscribeButton}`);
    console.log(`isSubscribedToEventOrganizer: ${isSubscribedToEventOrganizer}`);
    console.log(`subscriptionLoading: ${subscriptionLoading}`);
    // --- --- --- --- --- --- --- ---
    return (
        <div className={styles.card}>
            {event.mediaContentUrl ? (
                <div className={styles.imageContainer}>
                    <img src={event.mediaContentUrl} alt={event.title || 'Медиа'} className={styles.image} />
                </div>
            ) : (
                <div className={styles.imagePlaceholder}>Нет изображения</div>
            )}

            <div className={styles.content}>
                <h3 className={styles.title}>{event.title || 'Без названия'}</h3>
                
                {event.organizerUsername && (
                    <div className={styles.organizerContainer}>
                        <p className={styles.organizer}>Орг: {event.organizerUsername}</p>
                        {/* Кнопка подписки не здесь, а в блоке .actions для обычных пользователей */}
                    </div>
                )}

                {event.description && <p className={styles.description}>{event.description}</p>}
                <div className={styles.details}>
                    <p className={styles.detailItem}><strong>Формат:</strong> {event.format || '?'}</p>
                    <p className={styles.detailItem}><strong>Место:</strong> {placeString}</p>
                    <p className={styles.detailItem}><strong>Когда:</strong> {dateTimeString}</p>
                    {durationString && <p className={styles.detailItem}><strong>Длит.:</strong> {durationString}</p>}
                    {event.resources && <p className={styles.detailItem}><strong>Ресурсы:</strong> {event.resources}</p>}
                </div>

                {event.tags?.length > 0 && (
                    <div className={styles.tagsContainer}>
                        <strong>Теги:</strong>
                        {event.tags.map((tag) => (
                            <span key={tag.id || tag.name} className={styles.tag}>{tag.name}</span>
                        ))}
                    </div>
                )}

                {currentSpeakers.length > 0 && (
                    <div className={styles.speakerListContainer}>
                        <strong>Спикеры:</strong>
                        {currentSpeakers.map((s) => (
                            <div key={s.id} className={styles.speakerItem}>
                                <button className={styles.speakerBtn} onClick={() => setSelectedSpeaker(s)}>
                                    {s.name}
                                </button>
                                {isOrganizerView && (
                                    <button
                                        onClick={() => handleRemoveSpeaker(s.id)}
                                        className={styles.removeSpeakerBtn}
                                        disabled={speakerActionLoading}
                                        title="Удалить спикера"
                                    >
                                        ×
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {selectedSpeaker && (
                    <ViewSpeaker
                        speaker={selectedSpeaker}
                        onClose={() => setSelectedSpeaker(null)}
                    />
                )}
                
                {/* Статистика для организатора/админа на карточке */}
                {isOrganizerView && (
                     <div className={styles.eventStatsSimple}>
                        <span>👥 Участников: {displayParticipantCount}</span>
                        <span>⭐ В избранном: {displayFavoriteCount}</span>
                    </div>
                )}
                      
                {actionError && <p className={styles.actionError}>{actionError}</p>}

                {/* Кнопки "Участвовать", "В избранное", "Подписаться на организатора" */}
                {showActionButtons && (
                    <div className={styles.actions}> {/* Открываем общий контейнер для кнопок действий */}
                        <button onClick={handleParticipateClick} disabled={!!actionLoading} className={styles.actionButton}>
                            {actionLoading === 'participate' ? '...' : (isParticipatingState ? 'Отменить участие' : 'Участвовать')}
                        </button>
                        <button onClick={handleFavoriteClick} disabled={!!actionLoading} className={`${styles.actionButton} ${isFavoriteState ? styles.favoriteActive : styles.favoriteInactive}`}>
                            {actionLoading === 'favorite' ? '...' : (isFavoriteState ? 'В избранном' : 'В избранное')}
                        </button>
                        
                        {/* КНОПКА ПОДПИСКИ ТЕПЕРЬ ВНУТРИ .actions */}
                        {canShowSubscribeButton && (
                             <button
                                onClick={handleToggleSubscriptionToOrganizer}
                                disabled={subscriptionLoading}
                                className={`${styles.actionButton} ${isSubscribedToEventOrganizer ? styles.unsubscribeButton : styles.subscribeButton}`}
                             >
                                 {subscriptionLoading ? 'Загрузка...' : (isSubscribedToEventOrganizer ? 'Отписаться от орг.' : 'Подписаться на орг.')}
                             </button>
                        )}
                    </div> // <--- Закрываем общий контейнер .actions
                )}
                {/* Лишний закрывающий div был здесь, я его убрал */}

                {/* Блок действий для организатора (статус, добавить спикера, поделиться) */}
                {isOrganizerView && event.status && (
                    <div className={styles.organizerActions}>
                        <p className={`${styles.status} ${styles[`status${event.status}`]}`}>Статус: {event.status}</p>
                        <button onClick={() => setShowAddSpeakerForm(true)} className={styles.button}>
                            Добавить спикера
                        </button>
                        <Share event={event} />
                    </div>
                )}

                {showAddSpeakerForm && (
                    <AddSpeakerForm
                        onClick={() => setShowAddSpeakerForm(false)}
                        eventId={event.id}
                        onSpeakerAdded={handleSpeakerAdded}
                    />
                )}
            </div> {/* Закрытие div className={styles.content} */}
        </div> // Закрытие div className={styles.card}
    );
};

export default Card;