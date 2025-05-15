import React, { useState, useEffect, useCallback, useRef } from 'react'; // Добавил useRef
import { getMyUnreadNotificationsCount } from '../../../api/api';
import styles from './Notifications.module.css';

const NotificationsBell = React.forwardRef(({ onClick }, ref) => { // Оборачиваем в forwardRef
    const [unreadCount, setUnreadCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const isMounted = useRef(true); // Для отслеживания монтирования компонента

    const fetchUnreadCountInternal = useCallback(async () => {
        if (isLoadingRef.current) return; // Используем ref для isLoading
        
        setIsLoading(true);
        isLoadingRef.current = true; // Устанавливаем ref

        try {
            console.log("API: (Bell) Запрос количества непрочитанных уведомлений");
            const data = await getMyUnreadNotificationsCount();
            if (isMounted.current) { // Проверяем, что компонент все еще смонтирован
                 setUnreadCount(data.unreadCount || 0);
            }
        } catch (error) {
            console.error("Ошибка получения количества непрочитанных уведомлений (Bell):", error);
        } finally {
            if (isMounted.current) {
                setIsLoading(false);
            }
            isLoadingRef.current = false; // Сбрасываем ref
        }
    }, []); // Пустой массив зависимостей для useCallback, если нет внешних зависимостей

    // Ref для хранения isLoading, чтобы избежать включения setIsLoading в зависимости useCallback
    const isLoadingRef = useRef(isLoading);
    useEffect(() => {
        isLoadingRef.current = isLoading;
    }, [isLoading]);


    useEffect(() => {
        isMounted.current = true; // Компонент смонтирован
        if (localStorage.getItem('accessToken')) {
            fetchUnreadCountInternal();
            const intervalId = setInterval(fetchUnreadCountInternal, 60000); // Раз в минуту
            return () => {
                isMounted.current = false; // Компонент размонтируется
                clearInterval(intervalId);
            };
        } else {
            setUnreadCount(0);
        }
    }, [fetchUnreadCountInternal]); // Зависимость только от самой функции

    // Предоставляем метод для принудительного обновления через ref
    React.useImperativeHandle(ref, () => ({
        forceRefresh: fetchUnreadCountInternal
    }));

    return (
        <button onClick={onClick} className={styles.bellButton} title="Уведомления">
            <span role="img" aria-label="Уведомления">🔔</span>
            {unreadCount > 0 && (
                <span className={styles.unreadBadge}>{unreadCount > 99 ? '99+' : unreadCount}</span>
            )}
        </button>
    );
});

export default NotificationsBell;