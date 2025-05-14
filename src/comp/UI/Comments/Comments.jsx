import React, { useEffect, useState } from "react";
import Mark from "../Mark/Mark";
import Portal from "../Portal/Portal";
import { getMyUserProfile } from "../../../api/api";
import styles from "./Comments.module.css";
import { Link } from "react-router-dom";

const Comments = ({ event,onClose }) => {
    const [comment, setComment] = useState("");
    const [fetchComments, setFetchComments] = useState([]);
    const [username, setUserName] = useState("");

    const fetchUser = async () => {
        try {
            const data = await getMyUserProfile();
            setUserName(data.username);
        } catch (error) {
            console.error("Error fetching user:", error);
        }
    };

    useEffect(() => {
        fetchUser();
    }, [event]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!comment.trim()) return;

        const newComment = {
            id: Date.now(),
            text: comment,
            author: username,
            date: new Date().toISOString()
        };

        setFetchComments(prev => [...prev, newComment]);
        setComment("");
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
    {/*
        const fetchingComment = async()=>{
            try {
            const data = getCommentsById(event.id);
            setFetchComment(data);
            }
            catch(err) {
                console.log(`ошибка ${err}`)
            }
        }
     useEffect (()=>{
        fetchingComment();
    },[event])
    */ }

    const placeString = event.location ? [event.location.city, event.location.address].filter(Boolean).join(', ') || 'Не указано' : 'Не указано';
    const dateTimeString = event.startTime ? `${formatDate(event.startTime)} в ${formatTime(event.startTime)}` : 'Не указано';
    const durationString = formatDuration(event.durationMinutes);
    return (
        <Portal>
            <div className={styles.container}>
                <div className={styles.modalWrapper}>
                <button 
                        className={styles.closeButton} 
                        onClick={onClose}
                        aria-label="Закрыть"
                    >
                        &times;
                    </button>
                    {/* Левая колонка с информацией о событии */}
                    <div className={styles.eventCard}>
                        <div className={styles.eventContent}>
                            {event.mediaContentUrl ? (
                                <div className={styles.eventImageContainer}>
                                    <img 
                                        src={event.mediaContentUrl} 
                                        alt={event.title || 'Медиа'} 
                                        className={styles.eventImage} 
                                    />
                                </div>
                            ) : (
                                <div className={styles.eventImagePlaceholder}>
                                    Нет изображения
                                </div>
                            )}

                            <h3 className={styles.eventTitle}>
                                {event.title || 'Без названия'}
                            </h3>

                            {event.organizerUsername && (
                                <p className={styles.organizerText}>
                                    Организатор: {event.organizerUsername}
                                </p>
                            )}

                            {event.description && (
                                <p className={styles.eventDescription}>
                                    {event.description}
                                </p>
                            )}

                            <div className={styles.detailsList}>
                                <p className={styles.detailItem}>
                                    <strong>Формат:</strong> {event.format || '?'}
                                </p>
                                <p className={styles.detailItem}>
                                    <strong>Место:</strong> {placeString}
                                </p>
                                <p className={styles.detailItem}>
                                    <strong>Когда:</strong> {dateTimeString}
                                </p>
                                {durationString && (
                                    <p className={styles.detailItem}>
                                        <strong>Длительность:</strong> {durationString}
                                    </p>
                                )}
                                {event.resources && (
                                    <p className={styles.detailItem}>
                                        <strong>Ресурсы:</strong> {event.resources}
                                    </p>
                                )}
                            </div>

                            {event.tags?.length > 0 && (
                                <div className={styles.tagsContainer}>
                                    {event.tags.map((tag) => (
                                        <span 
                                            key={tag.id || tag} 
                                            className={styles.tagItem}
                                        >
                                            {tag.name || tag}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Правая колонка с комментариями и оценкой */}
                    <div className={styles.commentsColumn}>
                        

                        <div className={styles.commentsSection}>
                            <h2 className={styles.commentsTitle}>Комментарии</h2>
                            
                            <form onSubmit={handleSubmit} className={styles.commentForm}>
                                <input
                                    type="text"
                                    placeholder="Напишите комментарий..."
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    className={styles.commentInput}
                                />
                                <button 
                                    type="submit" 
                                    className={styles.submitButton}
                                >
                                    Отправить
                                </button>
                            </form>

                            <div className={styles.commentsList}>
                                {fetchComments.length > 0 ? (
                                    fetchComments.map((comment) => (
                                        <div key={comment.id} className={styles.commentItem}>
                                            <div className={styles.commentHeader}>
                                                <Link 
                                                to={"/Profile"}
                                                className={styles.commentAuthor}>
                                                    {comment.author}
                                                </Link>
                                                <span className={styles.commentDate}>
                                                    {new Date(comment.date).toLocaleDateString('ru-RU')}
                                                </span>
                                            </div>
                                            <p className={styles.commentText}>
                                                {comment.text}
                                            </p>
                                        </div>
                                    ))
                                ) : (
                                    <p className={styles.noComments}>
                                        Пока нет комментариев. Будьте первым!
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Portal>
    );
};

export default Comments;