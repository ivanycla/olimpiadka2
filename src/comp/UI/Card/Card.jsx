import React, { useState, useEffect } from 'react';
import styles from './Card.module.css';
import AddSpeakerForm from '../AddSpeakerForm/AddSpeakerForm';
import ViewSpeaker from '../ViewSpeaker/ViewSpeaker';
import Share from '../Share/Share';

const Card = ({
    event,
    isLog,
    isOrganizerView = false,
    onParticipateToggle = async () => false,
    onFavoriteToggle = async () => false,
    initialIsParticipating = false,
    initialIsFavorite = false,
 }) => {
    const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
    const [isParticipating, setIsParticipating] = useState(initialIsParticipating);
    const [actionError, setActionError] = useState(null);
    const [actionLoading, setActionLoading] = useState(null);
    const [speaker, setSpeaker] = useState([]);
    const [speakerFlag, setSpeakerFlag] = useState(false);
    const [selectedSpeaker, setSelectedSpeaker] = useState(null);

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

    const AddSpeaker = (newSpeaker) => {
        setSpeaker(prev => [...prev, newSpeaker]);
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
                            <span key={tag.id || tag} className={styles.tag}>{tag.name || tag}</span>
                        ))}
                    </div>
                )}

                {speaker.length > 0 && (
                    <div className={styles.tagsContainer}>
                        <strong>Спикеры:</strong>
                        {speaker.map((s) => (
                            <button key={s.name} className={styles.speakerBtn} onClick={() => setSelectedSpeaker(s)}>
                                {s.name}
                            </button>
                        ))}
                    </div>
                )}

                {selectedSpeaker && (
                    <ViewSpeaker speaker={selectedSpeaker} onClose={() => setSelectedSpeaker(null)} />
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
                    <div>
                        <p className={`${styles.status} ${styles[`status${event.status}`]}`}>Статус: {event.status}</p>
                        <button onClick={() => setSpeakerFlag(!speakerFlag)} className={styles.button}>
                            Добавить спикера
                        </button>
                        <Share
                        event={event}
                        />
                    </div>
                )}

                {speakerFlag && (
                    <AddSpeakerForm
                        onClick={() => setSpeakerFlag(!speakerFlag)}
                        eventId={event.id}
                        AddSpeaker={AddSpeaker}
                    />
                )}
            </div>
        </div>
    );
};

export default Card;
