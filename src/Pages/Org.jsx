// src/pages/Org.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom"; // Добавили Link
import CardList from "../comp/UI/CardList/CardList.jsx";
import MapComponent from "../comp/UI/Map/Map.jsx"; // <-- ИСПРАВЛЕН ИМПОРТ
import FilterButton from "../comp/UI/FilterButton/FilterButton.jsx";
import { getMyEventsAsOrganizer } from "../api/api"; // Используем функцию для получения своих событий
import AlertReg from "../comp/UI/AlertReg/AlertReg.jsx";
import styles from "../styles/Org.css"; // Используем стили OrgPage

const CREATE_EVENT_ROUTE = '/CreateEvent'; // Убедитесь, что роут '/CreateEvent' существует в App.js

const Org = () => {
    // Состояния
    const [myEvents, setMyEvents] = useState([]);
    const [eventsLoading, setEventsLoading] = useState(true);
    const [eventsError, setEventsError] = useState(null);
    const [filter, setFilter] = useState('all'); // Состояние фильтра
    // TODO: Добавить состояния для пагинации

    const navigate = useNavigate();

    // --- Функция Загрузки СВОИХ Событий ---
    const fetchMyEvents = useCallback(async (page = 0, size = 50) => { // Загружаем побольше для карты
        console.log(`API: Запрос МОИХ событий (страница ${page}, размер ${size})`);
        setEventsLoading(true);
        setEventsError(null);
        try {
            const eventsPage = await getMyEventsAsOrganizer({ page, size }); // Используем API для организатора
            console.log("Ответ API getMyEventsAsOrganizer:", eventsPage);
            const fetchedEvents = eventsPage?.content || [];
            setMyEvents(fetchedEvents);
            // TODO: Сохранить информацию о пагинации
        } catch (err) {
            console.error("Ошибка загрузки мероприятий организатора:", err);
            setEventsError(err.message || "Не удалось загрузить ваши мероприятия.");
            setMyEvents([]);
            if (err.status === 401 || err.status === 403) navigate('/login'); // Редирект, если не авторизован как организатор
        } finally {
            setEventsLoading(false);
        }
    }, [navigate]); // Добавили navigate в зависимости

    // --- Эффект для Загрузки Событий ---
    useEffect(() => {
         if (!localStorage.getItem('accessToken')) { navigate('/login'); return; } // Проверка токена
        fetchMyEvents();
    }, [fetchMyEvents, navigate]); // Добавили navigate

    // --- Обработчики ---
    const handleProfileClick = () => { navigate("/ProfileOrg"); };
    const handleFilterClick = (type) => { setFilter(type); }; // Обработчик для фильтров

    // --- Подготовка данных для карты ---
    const mapMarkers = myEvents // Используем myEvents
        .filter(event => event?.location && typeof event.location.latitude === 'number' && typeof event.location.longitude === 'number')
        .map((event, index) => ({
            id: event.id || `org-event-${index}`, // Уникальный ID
            lat: event.location.latitude,
            lng: event.location.longitude,
            title: event.title || 'Без названия', // Название для подсказки/заголовка
            // Информация для балуна
            info: `${event.location.address || event.location.city || ''}\nСтатус: ${event.status}\nНачало: ${event.startTime ? new Date(event.startTime).toLocaleString('ru-RU') : 'не указано'}`
        }));
    console.log("Подготовленные маркеры для карты (Org):", mapMarkers);

    return (
        <div className={styles.orgPageContainer}> {/* Используем стили OrgPage */}
            <header className={styles.header}>
                <button onClick={handleProfileClick} className={styles.button}>
                    Профиль
                </button>
            </header>

            <main className={styles.mainContent}>
                {/* Секция Карты */}
                <div className={styles.mapContainer}>
                    {/* Лоадер и ошибка для карты */}
                    {eventsLoading && <p>Загрузка карты...</p>}
                    {eventsError && <AlertReg isVisible={true} message={`Ошибка загрузки карты: ${eventsError}`} type="error" />}
                    {/* Рендерим карту, если нет ошибки */}
                    {!eventsError && <MapComponent markers={mapMarkers} />}
                </div>

                {/* Секция Фильтров */}
                <div className={styles.filterSection}>
                    <h1>Ваши Мероприятия</h1>
                     {/* Кнопка создания нового мероприятия */}
                    <Link to={CREATE_EVENT_ROUTE} className={styles.createButtonLink}>
                         <button className={styles.button}>Создать Новое Мероприятие</button>
                    </Link>
                    {/* Фильтры по типу (можно добавить фильтры по статусу и т.д.) */}
                    <div className={styles.filterList}>
                        <FilterButton onClick={() => handleFilterClick('all')} isActive={filter === 'all'}>Все</FilterButton>
                        <FilterButton onClick={() => handleFilterClick('offline')} isActive={filter === 'offline'}>Оффлайн</FilterButton>
                        <FilterButton onClick={() => handleFilterClick('online')} isActive={filter === 'online'}>Онлайн</FilterButton>
                        {/* Добавьте другие фильтры при необходимости */}
                    </div>
                </div>

                {/* Секция Списка Событий */}
                <div className={styles.eventListSection}>
                    {eventsLoading && <p className={styles.loadingMessage}>Загрузка мероприятий...</p>}
                    {/* Ошибка загрузки списка */}
                    {eventsError && <AlertReg isVisible={true} message={eventsError} type="error" onClose={() => setEventsError(null)} />}
                    {!eventsLoading && !eventsError && (
                        myEvents.length > 0 ? (
                            <CardList
                                events={myEvents} // Передаем только свои события
                                isLog={true} // Организатор авторизован
                                filter={filter} // Передаем текущий фильтр
                                isOrganizerView={true} // Включаем вид организатора (редактировать/удалить)
                                // Не передаем статусы участия/избранного и обработчики для них
                            />
                        ) : (
                            <p className={styles.noEventsMessage}>Вы еще не создали ни одного мероприятия.</p>
                        )
                    )}
                 </div>
            </main>
        </div>
    );
};

export default Org;