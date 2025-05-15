import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyNotifications, markNotificationAsRead, markAllMyNotificationsAsRead } from '../../../api/api';
import Portal from '../Portal/Portal'; // Убедись, что путь к Portal верный
import styles from './Notifications.module.css';

const NotificationItem = ({ notification, onNotificationClick, onCloseModal }) => {
    const navigate = useNavigate();

    const handleClick = async () => {
        if (!notification.isRead) {
            await onNotificationClick(notification.id); // Помечаем как прочитанное
        }
        if (notification.type === 'NEW_EVENT_PUBLISHED' && notification.relatedEntityId) {
            navigate(`/events/${notification.relatedEntityId}`); // Переход на страницу мероприятия
            onCloseModal(); // Закрываем модалку после перехода
        }
        // Добавить обработку других типов уведомлений, если они будут
    };

    return (
        <div 
            className={`${styles.notificationItem} ${notification.isRead ? styles.read : styles.unread}`}
            onClick={handleClick}
            role="button" // Для доступности
            tabIndex={0}  // Для доступности
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleClick()} // Для доступности
        >
            <p className={styles.message}>{notification.message}</p>
            {/* Отображаем "снимки" данных, если они есть */}
            {(notification.organizerDisplayNameSnapshot || notification.eventTitleSnapshot) && (
                 <p className={styles.details}>
                    {notification.organizerDisplayNameSnapshot && <span>Орг: {notification.organizerDisplayNameSnapshot}</span>}
                    {notification.organizerDisplayNameSnapshot && notification.eventTitleSnapshot && " - "}
                    {notification.eventTitleSnapshot && <span>Событие: {notification.eventTitleSnapshot}</span>}
                 </p>
            )}
            <span className={styles.date}>
                {new Date(notification.createdAt).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'})}
            </span>
        </div>
    );
};

const NotificationsModal = ({ isOpen, onClose, onForceBellUpdate }) => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const listInnerRef = useRef(); // Для отслеживания прокрутки

    const loadNotifications = useCallback(async (pageNum, isInitialLoad = false) => {
        if (loading || (!hasMore && !isInitialLoad)) return;
        setLoading(true);
        try {
            const data = await getMyNotifications({ page: pageNum, size: 10 });
            if (isInitialLoad) {
                setNotifications(data.content || []);
            } else {
                setNotifications(prev => [...prev, ...(data.content || [])]);
            }
            setHasMore(!data.last);
            if (isInitialLoad && data.content?.some(n => !n.isRead)) {
                // Опционально: пометить все как прочитанные при первом открытии
                // await markAllMyNotificationsAsRead();
                // if(onForceBellUpdate) onForceBellUpdate();
            }
        } catch (err) {
            console.error("Ошибка загрузки уведомлений:", err);
        } finally {
            setLoading(false);
        }
    }, [loading, hasMore]); // Removed onForceBellUpdate to avoid re-triggering

    useEffect(() => {
        if (isOpen) {
            setPage(0);
            setNotifications([]);
            setHasMore(true);
            loadNotifications(0, true); // true - это initialLoad
        }
    }, [isOpen]); // Убрали loadNotifications из зависимостей, чтобы не было лишних вызовов

    const handleNotificationItemClick = async (notificationId) => {
        try {
            await markNotificationAsRead(notificationId);
            setNotifications(prev => 
                prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
            );
            if (onForceBellUpdate) onForceBellUpdate(); // Обновляем счетчик в колокольчике
            // onClose(); // Закрывать модалку или нет после клика на уведомление - на твое усмотрение
        } catch (error) {
            console.error("Ошибка пометки уведомления как прочитанного:", error);
        }
    };
    
    const handleMarkAllRead = async () => {
        if (notifications.every(n => n.isRead)) return; // Не делаем ничего, если все уже прочитаны
        try {
            await markAllMyNotificationsAsRead();
            setNotifications(prev => prev.map(n => ({...n, isRead: true})));
            if (onForceBellUpdate) onForceBellUpdate();
        } catch (error) {
            console.error("Ошибка пометки всех уведомлений как прочитанных:", error);
        }
    };

    // Ленивая загрузка при прокрутке
    const onScroll = () => {
        if (listInnerRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = listInnerRef.current;
            if (scrollTop + clientHeight >= scrollHeight - 100 && !loading && hasMore) { // -100px до конца
                setPage(prevPage => {
                    loadNotifications(prevPage + 1);
                    return prevPage + 1;
                });
            }
        }
    };

    if (!isOpen) return null;

    return (
        <Portal>
            <div className={styles.modalOverlayFixed} onClick={onClose}>
                <div className={styles.notificationsModalContent} onClick={(e) => e.stopPropagation()}>
                    <div className={styles.modalHeader}>
                        <h3>Уведомления</h3>
                        {notifications.some(n => !n.isRead) && (
                            <button onClick={handleMarkAllRead} className={styles.markAllReadButton}>
                                Прочитать все
                            </button>
                        )}
                        <button onClick={onClose} className={styles.closeModalButton}>×</button>
                    </div>
                    <div className={styles.notificationList} ref={listInnerRef} onScroll={onScroll}>
                        {notifications.length === 0 && !loading && <p className={styles.noNotificationsText}>Нет уведомлений.</p>}
                        {notifications.map(notif => (
                            <NotificationItem 
                                key={notif.id} 
                                notification={notif} 
                                onNotificationClick={handleNotificationItemClick}
                                onCloseModal={onClose} // Передаем для закрытия модалки после перехода
                            />
                        ))}
                        {loading && <p className={styles.loadingMoreText}>Загрузка...</p>}
                        {!loading && !hasMore && notifications.length > 0 && <p className={styles.noMoreNotificationsText}>Больше уведомлений нет.</p>}
                    </div>
                </div>
            </div>
        </Portal>
    );
};

export default NotificationsModal;