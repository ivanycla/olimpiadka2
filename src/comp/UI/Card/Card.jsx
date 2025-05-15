import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom'; // Импортируем navigate
import styles from './Card.module.css';
import AddSpeakerForm from '../AddSpeakerForm/AddSpeakerForm';
import ViewSpeaker from '../ViewSpeaker/ViewSpeaker';
import Share from '../Share/Share';
import { removeSpeakerFromEvent } from '../../../api/api';
import Mark from '../Mark/Mark';
import Comments from '../Comments/Comments';
import ModerCards from '../../../Pages/ModerCards';
import Priority from '../Priority/Priority';
const Card = ({
    event,
    isLog,
    isOrganizerView = false,
    onParticipateToggle = async () => false,
    onFavoriteToggle = async () => false,
    initialIsParticipating = false,
    initialIsFavorite = false,
    onEventUpdate,
    setRecommendations,
    
}) => {
    const navigate = useNavigate();

    const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
    const [isParticipating, setIsParticipating] = useState(initialIsParticipating);
    const [actionError, setActionError] = useState(null);
    const [actionLoading, setActionLoading] = useState(null);
    const [showAddSpeakerForm, setShowAddSpeakerForm] = useState(false);
    const [selectedSpeaker, setSelectedSpeaker] = useState(null);
    const [speakerActionLoading, setSpeakerActionLoading] = useState(false);
    const [commentFlag,setCommentFlag]=useState(false);
    
    const currentSpeakers = event?.speakers || [];

    useEffect(() => {
        setIsParticipating(initialIsParticipating);
    }, [initialIsParticipating]);

    useEffect(() => {
        setIsFavorite(initialIsFavorite);
    }, [initialIsFavorite]);

    const showActionButtons = isLog && !isOrganizerView;

    const handleParticipateClick = async () => {
        if (!event?.id || actionLoading) return;
        setActionLoading('participate');
        setActionError(null);
        const success = await onParticipateToggle(event.id, isParticipating);
        if (!success) setActionError("Ошибка изменения статуса участия");
        setActionLoading(null);
        const newTags = event.tags.map(t => t.name);
        setRecommendations((prev) => {
    const updated = Array.from(new Set([...prev, ...newTags]));
    localStorage.setItem("recommendations", JSON.stringify(updated));
    return updated;
    })
    };

    const handleFavoriteClick = async () => {
        if (!event?.id || actionLoading) return;
        setActionLoading('favorite');
        setActionError(null);
        const success = await onFavoriteToggle(event.id, isFavorite);
        if (!success) setActionError("Ошибка изменения статуса избранного");
        setActionLoading(null);
    };

    const formatDate = (dateString) => {
        if (!dateString) return '?';
        try {
            return new Date(dateString).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
        } catch {
            return 'Неверная дата';
        }
    };
    const formatTime = (dateString) => {
        if (!dateString) return '?';
        try {
            return new Date(dateString).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
        } catch {
            return '?';
        }
    };
    const formatDuration = (minutes) => {
        if (minutes == null || isNaN(minutes) || minutes <= 0) return null;
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours > 0 ? `${hours} ч ` : ''}${mins > 0 ? `${mins} мин` : ''}`.trim();
    };

    const handleSpeakerAdded = useCallback((updatedEventDataWithSpeakers) => {
        if (onEventUpdate) {
            onEventUpdate(updatedEventDataWithSpeakers);
        }
        setShowAddSpeakerForm(false);
    }, [onEventUpdate]);

    const handleRemoveSpeaker = async (speakerIdToRemove) => {
        if (!event?.id || speakerActionLoading) return;
        const speakerName = currentSpeakers.find(s => s.id === speakerIdToRemove)?.name || '';
        if (!window.confirm(`Удалить спикера "${speakerName}"?`)) return;

        setSpeakerActionLoading(true);
        setActionError(null);
        try {
            const updatedEventData = await removeSpeakerFromEvent(event.id, speakerIdToRemove);
            if (onEventUpdate) onEventUpdate(updatedEventData);
            if (selectedSpeaker?.id === speakerIdToRemove) setSelectedSpeaker(null);
        } catch (err) {
            console.error("Ошибка при удалении спикера:", err);
            setActionError(err.message || "Не удалось удалить спикера.");
        } finally {
            setSpeakerActionLoading(false);
        }
    };

    if (!event) return <div className={styles.card}>Ошибка: нет данных.</div>;

    const placeString = event.location ? [event.location.city, event.location.address].filter(Boolean).join(', ') : 'Не указано';
    const dateTimeString = event.startTime ? `${formatDate(event.startTime)} в ${formatTime(event.startTime)}` : 'Не указано';
    const durationString = formatDuration(event.durationMinutes);

    const displayParticipantCount = typeof event.participantCount === 'number' ? event.participantCount : 0;
    const displayFavoriteCount = typeof event.favoriteCount === 'number' ? event.favoriteCount : 0;

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
                {event.organizerUsername && <p className={styles.organizer}>Орг: {event.organizerUsername}</p>}
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
                            <span key={tag.id || tag.name} className={styles.tag}>{tag.name || tag.name}</span>
                        ))}
                    </div>
                )}

                {currentSpeakers.length > 0 && (
                    <div className={styles.speakerListContainer}>
                        <strong>Спикеры:</strong>
                        {currentSpeakers.map((s) => (
                            <div key={s.id} className={styles.speakerItem}>
                                <button
                                    className={styles.speakerBtn}
                                    onClick={() => setSelectedSpeaker(s)}
                                >
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

                {isOrganizerView && (
                    <div className={styles.eventStatsSimple}>
                        <span>👥 Участников: {displayParticipantCount}</span>
                        <span>⭐️ В избранном: {displayFavoriteCount}</span>
                    </div>
                )}

                {actionError && <p className={styles.actionError}>{actionError}</p>}

                {showActionButtons && (
                    <div className={styles.actions}>
                        <button onClick={handleParticipateClick} disabled={!!actionLoading} className={styles.actionButton}>
                            {actionLoading === 'participate' ? '...' : (isParticipating ? 'Отменить участие' : 'Участвовать')}
                        </button>
                        <button
                            onClick={handleFavoriteClick}
                            disabled={!!actionLoading}
                            className={`${styles.actionButton} ${isFavorite ? styles.favoriteActive : styles.favoriteInactive}`}
                        >
                            {actionLoading === 'favorite' ? '...' : (isFavorite ? 'В избранном' : 'В избранное')}
                        </button>
                    </div>
                )}

                {isOrganizerView && event.status && (
                    <div className={styles.organizerActions}>
                        <p className={`${styles.status} ${styles[`status${event.status}`]}`}>Статус: {event.status}</p>
                        <button onClick={() => setShowAddSpeakerForm(true)} className={styles.button}>
                            Добавить спикера
                        </button>
                    
                    </div>
                )}


                {showAddSpeakerForm && (
                    <AddSpeakerForm
                        onClick={() => setShowAddSpeakerForm(false)}
                        eventId={event.id}
                        onSpeakerAdded={handleSpeakerAdded}
                    />
                )}

                
                <button
                    className={styles.button}
                    onClick={() => {
                        if (!event?.id) return;
                        navigate(`/share/${event.id}`, {
                            state: {
                                event: event,
                                durationString: durationString,
                                dateTimeString: dateTimeString,
                                placeString: placeString,
                                speaker: currentSpeakers
                            }
                        });
                    }}
                >
                    Поделиться событием
                </button>
                <Mark
                    cardId={event.id}
                    />
                    <button 
                    onClick={()=>setCommentFlag(true)}
                    className={styles.button}
                    >
                        комментарии
                    </button>
                    {commentFlag && (
                        <Comments
                        event={event}
                        onClose={()=>setCommentFlag(false)}
                        />
                    )}
            </div>
        </div>
    );
};

export default Card;