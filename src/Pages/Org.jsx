import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import CardList from "../comp/UI/CardList/CardList.jsx";
import MapComponent from "../comp/UI/Map/Map.jsx";
import FilterButton from "../comp/UI/FilterButton/FilterButton.jsx";
import { getMyEventsAsOrganizer } from "../api/api";
import AlertReg from "../comp/UI/AlertReg/AlertReg.jsx";
import styles from "../styles/Org.module.css";
import EventStatsCharts from "../comp/UI/EventStatsCharts/EventStatsCharts.jsx"; // <-- ИМПОРТ КОМПОНЕНТА ГРАФИКОВ
import Portal from "../comp/UI/Portal/Portal";                 // <-- Убедись, что путь к Portal верный

const CREATE_EVENT_ROUTE = '/CreateEvent';

const Org = () => {
    const [myEvents, setMyEvents] = useState([]);
    const [eventsLoading, setEventsLoading] = useState(true);
    const [eventsError, setEventsError] = useState(null);
    const [filter, setFilter] = useState('all');
    const [uniqueTags, setUniqueTags] = useState([]);
    const [showStatsModal, setShowStatsModal] = useState(false); // Состояние для модалки

    const navigate = useNavigate();

    const fetchMyEvents = useCallback(async (page = 0, size = 100) => { // Загружаем больше для графиков
        console.log(`API: Запрос МОИХ событий (страница ${page}, размер ${size})`);
        setEventsLoading(true);
        setEventsError(null);
        try {
            const eventsPage = await getMyEventsAsOrganizer({ page, size });
            const fetchedEvents = eventsPage?.content || [];
            setMyEvents(fetchedEvents);
        } catch (err) {
            console.error("Ошибка загрузки мероприятий организатора:", err);
            setEventsError(err.message || "Не удалось загрузить ваши мероприятия.");
            setMyEvents([]);
            if (err.status === 401 || err.status === 403) navigate('/login');
        } finally {
            setEventsLoading(false);
        }
    }, [navigate]);

    useEffect(() => {
        if (!localStorage.getItem('accessToken')) { navigate('/login'); return; }
        fetchMyEvents();
    }, [fetchMyEvents, navigate]);

    const handleEventUpdate = useCallback((updatedEventData) => {
        setMyEvents(prevEvents =>
            prevEvents.map(event =>
                event.id === updatedEventData.id ? updatedEventData : event
            )
        );
    }, []);

    const handleProfileClick = () => { navigate("/ProfileOrg"); };
    const handleFilterClick = (type) => { setFilter(type); };

    const mapMarkers = useMemo(() => myEvents
        .filter(event => event?.location && typeof event.location.latitude === 'number' && typeof event.location.longitude === 'number')
        .map((event) => ({
            id: event.id, 
            lat: event.location.latitude,
            lng: event.location.longitude,
            title: event.title || 'Без названия',
            info: event 
        })), [myEvents]);

    useEffect(() => {
        if (myEvents.length > 0) {
            const allTags = myEvents.flatMap(event => event.tags || []);
            const tagNames = allTags.map(tag => tag.name);
            setUniqueTags([...new Set(tagNames)].map(name => ({ name })));
        } else {
            setUniqueTags([]);
        }
    }, [myEvents]);

    const filteredEventsForList = useMemo(() => { // Переименовал для ясности
        if (!myEvents.length) return [];
        return myEvents.filter(event => {
            const matchesFormat =
                filter === 'all' ||
                (filter === 'offline' && event.format === 'OFFLINE') ||
                (filter === 'online' && event.format === 'ONLINE');
            const matchesTag = event.tags?.some(tag => tag.name === filter);
            if (filter === 'all') return true;
            if (filter === 'offline' || filter === 'online') return matchesFormat;
            return matchesTag;
        });
    }, [myEvents, filter]);

    return (
        <div className={styles.orgPageContainer}>
            <header className={styles.header}>
                <button onClick={handleProfileClick} className={styles.button}>
                    Профиль
                </button>
            </header>

            <main className={styles.mainContent}>
                <div className={styles.mapContainer}>
                    {eventsLoading && <p>Загрузка карты...</p>}
                    {eventsError && <AlertReg isVisible={true} message={`Ошибка загрузки карты: ${eventsError}`} type="error" />}
                    {!eventsError && <MapComponent markers={mapMarkers} />}
                </div>

                <div className={styles.filterSection}>
                    <h1>Ваши Мероприятия</h1>
                    <div className={styles.orgActions}>
                        <Link to={CREATE_EVENT_ROUTE} className={styles.createButtonLink}>
                            <button className={styles.button}>Создать Новое Мероприятие</button>
                        </Link>
                        {myEvents.length > 0 && !eventsLoading && (
                            <button 
                                onClick={() => setShowStatsModal(true)} 
                                className={`${styles.button} ${styles.statsButton}`}
                            >
                                Показать Статистику (Графики)
                            </button>
                        )}
                    </div>
                    <div className={styles.filterList}>
                        <FilterButton onClick={() => handleFilterClick('all')} isActive={filter === 'all'}>Все</FilterButton>
                        <FilterButton onClick={() => handleFilterClick('offline')} isActive={filter === 'offline'}>Оффлайн</FilterButton>
                        <FilterButton onClick={() => handleFilterClick('online')} isActive={filter === 'online'}>Онлайн</FilterButton>
                        {uniqueTags.map((tag) => (
                            <FilterButton 
                            key={tag.name} 
                            onClick={() => handleFilterClick(tag.name)} 
                            isActive={filter === tag.name}
                            >
                            {tag.name}
                            </FilterButton>
                        ))}
                    </div>
                </div>

                <div className={styles.eventListSection}>
                    {eventsLoading && <p className={styles.loadingMessage}>Загрузка мероприятий...</p>}
                    {eventsError && <AlertReg isVisible={true} message={eventsError} type="error" onClose={() => setEventsError(null)} />}
                    {!eventsLoading && !eventsError && (
                        filteredEventsForList.length > 0 ? ( // Используем filteredEventsForList
                            <CardList
                                events={filteredEventsForList} // Передаем отфильтрованные события для списка
                                isLog={true}
                                isOrganizerView={true}
                                onEventUpdate={handleEventUpdate}
                            />
                        ) : (
                            <p className={styles.noEventsMessage}>
                                {filter === 'all' ? 'Вы еще не создали ни одного мероприятия.' : 'Нет мероприятий, соответствующих фильтру.'}
                            </p>
                        )
                    )}
                 </div>
            </main>

            {/* МОДАЛЬНОЕ ОКНО С ГРАФИКАМИ */}
            {showStatsModal && (
                <Portal>
                    <div className={styles.modalOverlay} onClick={() => setShowStatsModal(false)}>
                        <div className={`${styles.modalContent} ${styles.modalContentLarge}`} onClick={(e) => e.stopPropagation()}> {/* Добавил modalContent для общих стилей */}
                            <button className={styles.closeButtonModal} onClick={() => setShowStatsModal(false)}>×</button>
                            <h2>Статистика по мероприятиям</h2>
                            {myEvents.length > 0 ? (
                                <EventStatsCharts eventsData={myEvents} /> 
                            ) : (
                                <p>Нет данных для построения графиков.</p>
                            )}
                        </div>
                    </div>
                </Portal>
            )}
        </div>
    );
};

export default Org;