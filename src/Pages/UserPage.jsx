// src/pages/UserPage.jsx
import React, { useState, useEffect, useCallback ,useMemo} from "react";
import { useNavigate } from "react-router-dom";
import {
    getEvents, getMyParticipatingEvents, getMyFavoriteEvents,
    registerForEvent, unregisterFromEvent, addEventToFavorites, removeEventFromFavorites
} from "../api/api";
import CardList from "../comp/UI/CardList/CardList.jsx";
import MapComponent from "../comp/UI/Map/Map.jsx"; // <-- ИСПРАВЛЕН ИМПОРТ
import FilterButton from "../comp/UI/FilterButton/FilterButton.jsx";
import AlertReg from "../comp/UI/AlertReg/AlertReg.jsx"; // <-- ДОБАВЛЕН ИМПОРТ AlertReg
import styles from '../styles/UserPage.module.css'; // Используем стили UserPage

const UserPage = () => {
    // Состояния
    const [allEvents, setAllEvents] = useState([]); // Все опубликованные события
    const [isLoading, setIsLoading] = useState(true); // Общий лоадер для начальной загрузки
    const [error, setError] = useState(null); // Ошибка загрузки событий
    const [participatingEventIds, setParticipatingEventIds] = useState(new Set()); // ID событий, где участвует
    const [favoriteEventIds, setFavoriteEventIds] = useState(new Set()); // ID избранных событий
    const navigate = useNavigate();
    const [filter, setFilter] = useState('all'); // Текущий фильтр
    const [actionError, setActionError] = useState(null); // Ошибка действий (участие/избранное)
    const [statusesLoading, setStatusesLoading] = useState(true); // Отдельный лоадер для статусов
    const [tags,setTags]=useState([]);
    // --- Функции Загрузки Данных ---
    // Загрузка статусов участия и избранного ТЕКУЩЕГО пользователя
    const fetchUserEventStatuses = useCallback(async (showLoading = true) => {
        if (showLoading) setStatusesLoading(true);
        setActionError(null); // Сбрасываем ошибку действий
        try {
            console.log("API: Запрос getMyParticipatingEvents и getMyFavoriteEvents");
            const [participatingResponse, favoritesResponse] = await Promise.all([
                getMyParticipatingEvents({ page: 0, size: 1000 }), // Загружаем все ID
                getMyFavoriteEvents({ page: 0, size: 1000 })      // Загружаем все ID
            ]);
            const participatingIds = new Set(participatingResponse?.content?.map(event => event.id) || []);
            const favoriteIds = new Set(favoritesResponse?.content?.map(event => event.id) || []);
            console.log("Статусы получены:", { participatingIds, favoriteIds });
            setParticipatingEventIds(participatingIds);
            setFavoriteEventIds(favoriteIds);
        } catch (err) {
            console.error("Ошибка загрузки статусов мероприятий пользователя:", err);
            // Не сбрасываем статусы при ошибке, чтобы пользователь не видел скачков
            setActionError(err.message || "Не удалось обновить статусы мероприятий.");
            if (err.status === 401 || err.status === 403) navigate('/login');
        } finally {
            if (showLoading) setStatusesLoading(false);
        }
    }, [navigate]);

    // Загрузка ВСЕХ опубликованных событий
    const fetchAllEvents = useCallback(async () => {
        // setIsLoading(true); // Основной лоадер управляется из useEffect
        setError(null);
        try {
            console.log("API: Запрос getEvents (UserPage)");
            const eventsPage = await getEvents({ page: 0, size: 100 }); // Загружаем больше для карты
            console.log("Ответ getEvents:", eventsPage);
            setAllEvents(eventsPage?.content || []);
        } catch (err) {
            console.error("Ошибка при загрузке мероприятий:", err);
            setError(err.message || "Не удалось загрузить мероприятия.");
            if (err.status === 401 || err.status === 403) navigate('/login');
        }
        // finally { setIsLoading(false); } // Основной лоадер управляется из useEffect
    }, [navigate]);

    // --- Эффект Загрузки ---
     useEffect(() => {
        if (!localStorage.getItem('accessToken')) { navigate('/login'); return; }
        console.log("UserPage монтируется, запускаем начальную загрузку...");
        setIsLoading(true); // Включаем главный лоадер
        Promise.all([
             fetchAllEvents(),          // Грузим все события
             fetchUserEventStatuses(false) // Грузим статусы без показа их лоадера
        ]).finally(() => {
             setIsLoading(false); // Выключаем главный лоадер после ВСЕХ запросов
        });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Пустой массив зависимостей

    // --- Обработчики для Карточек ---
    const handleParticipateToggle = useCallback(async (eventId, currentStatus) => {
        const apiCall = currentStatus ? unregisterFromEvent : registerForEvent;
        setActionError(null);
        // Можно добавить оптимистичное обновление UI здесь, если нужно
        try {
            await apiCall(eventId);
            await fetchUserEventStatuses(false); // Перезагружаем статусы без лоадера
            return true;
        } catch (err) {
            console.error("Ошибка изменения статуса участия с UserPage:", err);
            setActionError(err.message || "Ошибка изменения статуса участия");
            // Откатить оптимистичное обновление, если оно было
            return false;
        }
    }, [fetchUserEventStatuses]);
    
    const filteredEvents = useMemo(() => {
        if (!allEvents.length) return [];
        
        return allEvents.filter(event => {
            const matchesFormat = 
                filter === 'all' ||
                (filter === 'offline' && event.format === 'OFFLINE') ||
                (filter === 'online' && event.format === 'ONLINE');
            
            const matchesTag = 
                filter === 'all' || 
                event.tags?.some(tag => tag.name === filter);
            
            return matchesFormat || matchesTag;
        });
    }, [allEvents, filter]);


    const handleFavoriteToggle = useCallback(async (eventId, currentStatus) => {
        const apiCall = currentStatus ? removeEventFromFavorites : addEventToFavorites;
        setActionError(null);
        // Можно добавить оптимистичное обновление UI здесь
        try {
            await apiCall(eventId);
            await fetchUserEventStatuses(false); // Перезагружаем статусы без лоадера
            return true;
        } catch (err) {
            console.error("Ошибка изменения статуса избранного с UserPage:", err);
            setActionError(err.message || "Ошибка изменения статуса избранного");
             // Откатить оптимистичное обновление, если оно было
            return false;
        }
    }, [fetchUserEventStatuses]);

    // --- Обработчики UI ---
    const handleFilterClick = (type) => { setFilter(type); };
    const handleProfileClick = () => { navigate("/Profile"); }; // Переход на СВОЙ профиль

    // --- Подготовка данных для карты ---
    const mapMarkers = allEvents // Используем allEvents
        .filter(event => event?.location && typeof event.location.latitude === 'number' && typeof event.location.longitude === 'number')
        .map((event, index) => ({
            id: event.id || `userpage-event-${index}`,
            lat: event.location.latitude,
            lng: event.location.longitude,
            title: event.title || 'Без названия',
            info: { // Объект вместо строки
                address: `${event.location.address || event.location.city || ''}`,
                date: event.startTime 
                    ? new Date(event.startTime).toLocaleString('ru-RU') 
                    : 'не указано'
            },
            description: event.description,
            format: event.format,
            duration: event.durationMinutes,
            endTime: event.endTime,
            mediaContentUrl: event.mediaContentUrl,
            organizerUsername: event.organizerUsername
        }));
    console.log("Подготовленные маркеры для карты (UserPage):", mapMarkers);
    useEffect(() => {
        const newTags = allEvents.flatMap(event => event.tags);
        setTags(newTags);
    }, [allEvents]);
    // --- Отображение ---
    return (
        <div className={styles.userPageContainer}>
            <header className={styles.header}>
                 <button className={styles.button} onClick={handleProfileClick}>
                    Профиль
                </button>
                 {/* Другие кнопки в хедере можно добавить здесь */}
            </header>

            <div className={styles.mainContent}>
                {/* Показываем ошибку действия (участие/избранное) */}
                {actionError && <AlertReg isVisible={true} type="error" message={actionError} onClose={() => setActionError(null)} />}
                {/* Показываем общую ошибку загрузки */}
                {error && <AlertReg isVisible={true} type="error" message={error} onClose={() => setError(null)} />}
                {/* Показываем общий лоадер */}
                {isLoading && <p className={styles.loadingMessage}>Загрузка данных...</p>}

                {/* Карта (показываем, если нет ошибки загрузки событий) */}
                {!error && (
                     <div className={styles.mapContainer}>
                         {/* Можно добавить лоадер и сюда, если карта грузится дольше событий */}
                         <MapComponent markers={mapMarkers} />
                     </div>
                 )}

                {/* Контент под картой (показываем, если нет общей загрузки и ошибки) */}
                {!isLoading && !error && (
                    <>
                        <div className={styles.filterList}>
                            <h1>Мероприятия</h1>
                            <FilterButton onClick={() => handleFilterClick('all')} isActive={filter === 'all'}>Все</FilterButton>
                            <FilterButton onClick={() => handleFilterClick('offline')} isActive={filter === 'offline'}>Оффлайн</FilterButton>
                            <FilterButton onClick={() => handleFilterClick('online')} isActive={filter === 'online'}>Онлайн</FilterButton>
                            {tags.map((tag) => (
                            <FilterButton 
                            key={tag.name} 
                            onClick={() => handleFilterClick(tag.name)} 
                            isActive={filter === tag.name}
                            >
                            {tag.name}
                            </FilterButton>
                            ))}
                        </div>

                        {allEvents.length > 0 ? (
                            <CardList
                            events={filteredEvents}// Передаем все события
                                isLog={true}      // Пользователь авторизован
                                filter={filter}     // Передаем фильтр
                                isOrganizerView={false} // Обычный вид карточки
                                participatingEventIds={participatingEventIds} // Передаем ID участий
                                favoriteEventIds={favoriteEventIds}       // Передаем ID избранных
                                onParticipateToggle={handleParticipateToggle} // Обработчик участия
                                onFavoriteToggle={handleFavoriteToggle}       // Обработчик избранного
                                // onInviteClick можно добавить позже, если нужна функция приглашения
                            />
                        ) : (
                            <p className={styles.noEventsMessage}>Мероприятия не найдены.</p>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default UserPage;