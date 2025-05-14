import React, { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import styles from "../styles/SharePage.module.css"
import {
    EmailShareButton,
    TelegramShareButton,
    VKShareButton,
    VKIcon, 
    TelegramIcon,
    EmailIcon
  } from "react-share";
import { getEventById } from "../api/api";
const SharePage = () =>{
    const speaker = [];
    const [event,setEvent] = useState({});
    const location =useLocation();
    const { eventId } = useParams();
    const fetchEvent = async () =>{
        try {
            const data = await getEventById(eventId);
            setEvent(data);
        }
        catch(err) {
            alert (`ощибка ${err}`)
        }
    }
    useEffect (()=>{
        fetchEvent();
    },[eventId]);
    const url = window.location.href;
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

    const placeString = event.location ? [event.location.city, event.location.address].filter(Boolean).join(', ') || 'Не указано' : 'Не указано';
    const dateTimeString = event.startTime ? `${formatDate(event.startTime)} в ${formatTime(event.startTime)}` : 'Не указано';
    const durationString = formatDuration(event.durationMinutes);

    return(
        <div>
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
                        {event.speaker.map((s) => (
                            <button key={s.name} className={styles.speakerBtn} >
                                {s.name}
                            </button>
                        ))}
                    </div>
                )}
                </div>
            <div className="share-buttons">
                    <VKShareButton url={url} title={event?.title}>
                      <VKIcon size={32} round />
                    </VKShareButton>
                    
                    <TelegramShareButton url={url} title={event?.title}>
                      <TelegramIcon size={32} round />
                    </TelegramShareButton>
                    
                    <EmailShareButton url={url} subject={event?.title}>
                      <EmailIcon size={32} round />
                    </EmailShareButton>
                  </div>
        </div>
    </div>
    )
}

export default SharePage