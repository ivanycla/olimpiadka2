// src/pages/Guestt.jsx
import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { getEvents } from "../api/api";
import CardList from "../comp/UI/CardList/CardList.jsx";
import MapComponent from "../comp/UI/Map/Map.jsx"; // <-- ИСПРАВЛЕН ИМПОРТ
import FilterButton from "../comp/UI/FilterButton/FilterButton.jsx";
import styles from '../styles/Guestt.module.css';

const Guestt = () => {
    const [events, setEvents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('all');

    // --- Загрузка Мероприятий ---
    const fetchEvents = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            console.log("API: Вызов getEvents (Guestt.jsx)");
            const eventsPage = await getEvents({ page: 0, size: 100 }); // Загружаем больше событий для карты
            console.log("Ответ getEvents:", eventsPage);
            setEvents(eventsPage?.content || []);
        } catch (err) {
            console.error("Ошибка при загрузке мероприятий для гостя:", err);
            setError(err.message || "Не удалось загрузить мероприятия.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchEvents();
    }, [fetchEvents]);

    // --- Обработчик Фильтра ---
    function handleFilter(type) {
        setFilter(type);
    }

    // --- Подготовка данных для карты ---
    const mapMarkers = events
        .filter(event => event?.location && typeof event.location.latitude === 'number' && typeof event.location.longitude === 'number')
        .map((event, index) => ({
            id: event.id || `guest-event-${index}`, // Уникальный ID
            lat: event.location.latitude,
            lng: event.location.longitude,
            title: event.title || 'Без названия', // Название для подсказки/заголовка
            // Информация для балуна
            info: `${event.location.address || event.location.city || ''}\nНачало: ${event.startTime ? new Date(event.startTime).toLocaleString('ru-RU') : 'не указано'}`
        }));
     console.log("Подготовленные маркеры для карты (Guestt):", mapMarkers);

    // --- Отображение ---
    return (
        <div className={styles.guestPageContainer}>
            <header className={styles.header}>
                 <div></div> {/* Пустой div для выравнивания */}
                <div className={styles.authActions}>
                    <Link to="/login" className={styles.button}>
                        Войти / Зарегистрироваться
                    </Link>
                </div>
            </header>

            <div className={styles.mainContent}>
                {/* Карта */}
                <div className={styles.mapContainer}>
                     {/* Показываем карту, если нет глобальной ошибки загрузки событий */}
                     {!error ? (
                         <MapComponent markers={mapMarkers} />
                     ) : (
                         <p className={`${styles.statusText} ${styles.errorText}`}>Не удалось загрузить карту: {error}</p>
                     )}
                </div>

                {/* Статус загрузки списка событий */}
                {isLoading && <p className={styles.statusText}>Загрузка мероприятий...</p>}
                {/* Ошибка загрузки списка событий */}
                {error && !isLoading && <p className={`${styles.statusText} ${styles.errorText}`}>Ошибка загрузки мероприятий: {error}</p>}

                {/* Контент под картой (фильтры и список) */}
                {!isLoading && !error && (
                    <>
                        <div className={styles.filterList}>
                            <h1>Мероприятия</h1>
                            <FilterButton onClick={() => handleFilter('all')} isActive={filter === 'all'}>Все</FilterButton>
                            <FilterButton onClick={() => handleFilter('offline')} isActive={filter === 'offline'}>Оффлайн</FilterButton>
                            <FilterButton onClick={() => handleFilter('online')} isActive={filter === 'online'}>Онлайн</FilterButton>
                            {/* Добавьте другие кнопки фильтров, если нужно */}
                        </div>

                        {events.length > 0 ? (
                            <CardList
                                events={events}
                                isLog={false} // Гость не авторизован
                                isOrganizerView={false}
                                filter={filter}
                                // Передаем пустые Set, так как гость не может участвовать/добавлять в избранное
                                participatingEventIds={new Set()}
                                favoriteEventIds={new Set()}
                                // Передаем пустые обработчики или null
                                onParticipateToggle={() => {}}
                                onFavoriteToggle={() => {}}
                            />
                        ) : (
                             <p className={styles.statusText}>Опубликованных мероприятий пока нет.</p>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default Guestt;