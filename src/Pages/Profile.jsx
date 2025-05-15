import React, { useState, useEffect, useCallback, useRef } from "react"; // Добавил useRef
import { useNavigate, Link } from "react-router-dom";
import FindFriend from '../comp/UI/FindFriend/FindFriend'; 
import {
    getMyUserProfile,
    updateMyUserProfile,
    getMyParticipatingEvents,
    getMyFavoriteEvents,
    registerForEvent,       // Убедись, что эти функции возвращают Promise<boolean> или обновленный event
    unregisterFromEvent,    // для корректной работы onParticipateToggle
    addEventToFavorites,    // Аналогично для onFavoriteToggle
    removeEventFromFavorites,
    getMyPrivacySetting,
    updateMyPrivacySetting,
    getMyFriendIds, 
    removeFriend,
    getUserProfileById
    // Не забудь импортировать API для уведомлений, если они не в общем api.js
    // getMyUnreadNotificationsCount, getMyNotifications, markNotificationAsRead, markAllMyNotificationsAsRead
} from "../api/api"; 
import CardList from "../comp/UI/CardList/CardList.jsx";
import AlertReg from "../comp/UI/AlertReg/AlertReg.jsx";
import styles from '../styles/Profile.module.css'; 
import NotificationsBell from '../comp/UI/Notifications/NotificationsBell';   // <-- ИМПОРТ
import NotificationsModal from '../comp/UI/Notifications/NotificationsModal'; // <-- ИМПОРТ
// Убедись, что Portal импортирован, если NotificationsModal его использует внутри себя,
// но здесь он не нужен напрямую, так как NotificationsModal сам его использует.
// import Portal from "../comp/UI/Portal/Portal"; 

const PRIVACY_OPTIONS = {
    PUBLIC: 'Всем авторизованным',
    FRIENDS_ONLY: 'Только друзьям',
    PRIVATE: 'Только мне'
};

const Profile = () => {
    const [profile, setProfile] = useState(null); 
    const [profileLoading, setProfileLoading] = useState(true);
    const [profileError, setProfileError] = useState(null);
    const [isEditing, setIsEditing] = useState(false); 
    const [editFormData, setEditFormData] = useState({ displayName: '', bio: '' }); 

    const [participatingEventIds, setParticipatingEventIds] = useState(new Set());
    const [favoriteEventIds, setFavoriteEventIds] = useState(new Set());
    const [participatingEventsData, setParticipatingEventsData] = useState([]);
    const [favoriteEventsData, setFavoriteEventsData] = useState([]);
    const [eventsLoading, setEventsLoading] = useState(false); 
    const [eventsError, setEventsError] = useState(null);
    const [activeTab, setActiveTab] = useState('participating'); 

    const [privacySetting, setPrivacySetting] = useState('PRIVATE');
    const [privacyLoading, setPrivacyLoading] = useState(false);
    const [privacyError, setPrivacyError] = useState(null);

    const [friendsData, setFriendsData] = useState([]);
    const [friendIds, setFriendIds] = useState(new Set());
    const [friendsLoading, setFriendsLoading] = useState(true);
    const [friendsError, setFriendsError] = useState(null);
    const [showFindFriendModal, setShowFindFriendModal] = useState(false);

    // --- СОСТОЯНИЕ ДЛЯ МОДАЛЬНОГО ОКНА УВЕДОМЛЕНИЙ ---
    const [isNotificationsModalOpen, setIsNotificationsModalOpen] = useState(false);
    const notificationsBellRef = useRef(null); // Для возможного принудительного обновления счетчика
    // --- --- --- --- --- --- --- --- --- --- --- ---
    const navigate = useNavigate();

    // --- Функции Загрузки Данных ---

    // Загрузка профиля ТЕКУЩЕГО пользователя
    const fetchProfile = useCallback(async () => {
        console.log("API: Вызов getMyUserProfile (Profile.jsx)");
        setProfileLoading(true); setProfileError(null);
        try {
            const data = await getMyUserProfile();
            console.log("Профиль получен:", data);
            setProfile(data);
            setEditFormData({ displayName: data?.displayName || '', bio: data?.bio || '' });
        } catch (err) {
            console.error("Ошибка загрузки профиля:", err);
            setProfileError(err.message || "Не удалось загрузить профиль.");
            if (err.status === 401 || err.status === 403) {
                navigate('/login'); // Редирект при отсутствии прав
            }
        } finally {
            setProfileLoading(false);
        }
    }, [navigate]);

    // Загрузка ID мероприятий (участия ИЛИ избранное) и их данных
    const fetchEventsAndIds = useCallback(async (type, showLoading = true) => {
        console.log(`API: Вызов getMy${type === 'participating' ? 'Participating' : 'Favorite'}Events`);
        if (showLoading) setEventsLoading(true); setEventsError(null);
        const fetchFunc = type === 'participating' ? getMyParticipatingEvents : getMyFavoriteEvents;
        const setEventDataFunc = type === 'participating' ? setParticipatingEventsData : setFavoriteEventsData;
        const setIdSetFunc = type === 'participating' ? setParticipatingEventIds : setFavoriteEventIds;
        try {
            const eventsPage = await fetchFunc({ page: 0, size: 1000 }); // Загружаем все сразу (без пагинации пока)
            const eventData = eventsPage?.content || [];
            const eventIds = new Set(eventData.map(event => event.id));
            console.log(`События ${type} получены:`, eventData);
            setEventDataFunc(eventData);
            setIdSetFunc(eventIds);
        } catch (err) {
            console.error(`Ошибка загрузки мероприятий (${type}):`, err);
            setEventsError(err.message || "Не удалось загрузить мероприятия.");
            setEventDataFunc([]); // Очищаем при ошибке
            setIdSetFunc(new Set());
            if (err.status === 401 || err.status === 403) {
                navigate('/login');
            }
        } finally {
            if (showLoading) setEventsLoading(false);
        }
    }, [navigate]);

    // Загрузка настроек приватности
    const fetchPrivacy = useCallback(async () => {
        console.log("API: Вызов getMyPrivacySetting");
        setPrivacyLoading(true); setPrivacyError(null);
        try {
             const response = await getMyPrivacySetting(); // Ожидаем { setting: "VALUE" }
             console.log("Настройки приватности получены:", response);
             // Проверяем, что ответ - объект и содержит поле setting
             if (response && typeof response.setting === 'string') {
                 setPrivacySetting(response.setting);
             } else {
                 console.warn("Некорректный формат ответа от getMyPrivacySetting:", response);
                 setPrivacySetting('PRIVATE'); // Устанавливаем дефолтное значение
             }
         }
        catch (err) { console.error("Ошибка загрузки приватности:", err); setPrivacyError(err.message || "Ошибка"); if (err.status === 401 || err.status === 403) navigate('/login'); }
        finally { setPrivacyLoading(false); }
    }, [navigate]);

    // Загрузка данных о друзьях (ID и затем профили)
    const fetchFriendsData = useCallback(async () => {
        console.log("Начало fetchFriendsData...");
        setFriendsLoading(true);
        setFriendsError(null);
        setFriendsData([]); // Очищаем перед загрузкой
        setFriendIds(new Set());
        try {
            console.log("API: Вызов getMyFriendIds (Profile.jsx)");
            const ids = await getMyFriendIds(); // Ожидаем МАССИВ ID [10, 11]
            console.log("Получены ID друзей (ожидается массив):", ids);

            if (!Array.isArray(ids)) {
                console.error("getMyFriendIds вернул не массив:", ids);
                setFriendsData([]); setFriendIds(new Set());
                setFriendsLoading(false); // <-- Завершить загрузку
                return; // Выход, если не массив
            }
            if (ids.length === 0) {
                 console.log("Список ID друзей пуст.");
                 setFriendsData([]); setFriendIds(new Set());
                 setFriendsLoading(false); // <-- Завершить загрузку
                 return; // Выход, если пустой
            }

            console.log("Сохраняем Set ID друзей:", ids);
            setFriendIds(new Set(ids)); // Сохраняем Set ID

            console.log(`Запрос ${ids.length} профилей друзей...`);
            const profilePromises = ids.map(id =>
                getUserProfileById(id) // Запрашиваем профиль друга
                    .then(profile => {
                        if (!profile) {
                            console.warn(`Профиль для ID ${id} вернулся пустым.`);
                            return { userId: id, username: `Профиль ID:${id} пуст`, error: true };
                        }
                        // Убедимся, что userId есть в объекте
                        return { ...profile, userId: profile.userId || id };
                    })
                    .catch(err => {
                        console.error(`Ошибка загрузки профиля друга ID=${id}:`, err);
                        return { userId: id, username: `Профиль ID:${id} недоступен`, error: true };
                    })
            );

            const resolvedFriendProfiles = await Promise.all(profilePromises);
            console.log("Получены профили друзей:", resolvedFriendProfiles);
            const validFriendsData = resolvedFriendProfiles.filter(p => p !== null);
            setFriendsData(validFriendsData);
            console.log("Установлены данные друзей в состояние:", validFriendsData);
        } catch (err) {
            console.error("Критическая ошибка при загрузке друзей:", err);
            setFriendsError(err.message || "Ошибка загрузки списка друзей.");
            setFriendsData([]); setFriendIds(new Set());
            if (err.status === 401 || err.status === 403) navigate('/login');
        } finally {
            setFriendsLoading(false);
            console.log("fetchFriendsData завершен.");
        }
    }, [navigate]);

    // --- Эффекты Загрузки ---
    useEffect(() => {
        // Выполняется один раз при монтировании компонента
        if (!localStorage.getItem('accessToken')) {
             navigate('/login');
             return;
        }
        console.log("Profile.jsx монтируется, запускаем начальную загрузку...");
        fetchProfile();
        fetchPrivacy();
        fetchFriendsData();
        // Массив зависимостей пуст, чтобы выполнилось только один раз
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        // Загружаем события только после того, как профиль успешно загружен
        if (!profileLoading && profile) {
            console.log("Профиль загружен, запускаем загрузку событий...");
            Promise.all([
                fetchEventsAndIds('participating', true),
                fetchEventsAndIds('favorites', false)
            ]);
        }
    // Перезапускаем, если изменился статус загрузки или сам профиль (например, после редактирования)
    }, [profileLoading, profile, fetchEventsAndIds]);


   // Если Card.jsx вызывает onEventUpdate, и ты хочешь обновлять списки событий в Profile.jsx:
    const handleEventUpdate = useCallback((updatedEventData) => {
        const updateList = (prevList) => 
            prevList.map(event => event.id === updatedEventData.id ? updatedEventData : event);
        
        setParticipatingEventsData(prev => updateList(prev));
        setFavoriteEventsData(prev => updateList(prev));

        // Обновляем ID сеты тоже, на всякий случай, если участие/избранное изменилось
        if (participatingEventIds.has(updatedEventData.id) && !updatedEventData.isCurrentUserParticipating) { // Предполагаем, что DTO содержит это поле
            setParticipatingEventIds(prev => {
                const newSet = new Set(prev);
                newSet.delete(updatedEventData.id);
                return newSet;
            });
        } else if (!participatingEventIds.has(updatedEventData.id) && updatedEventData.isCurrentUserParticipating) {
            setParticipatingEventIds(prev => new Set(prev).add(updatedEventData.id));
        }
        // Аналогично для favoriteEventIds и updatedEventData.isCurrentUserFavorite
    }, [participatingEventIds]); // Добавь favoriteEventIds, если они тоже обновляются


    const handleParticipateToggle = useCallback(async (eventId, currentStatus) => {
       const apiCall = currentStatus ? unregisterFromEvent : registerForEvent;
       setEventsError(null);
       try {
           const response = await apiCall(eventId); // Предполагаем, API возвращает { success: true } или обновленный event
           // Если API возвращает обновленный event:
           // if (response && response.id && handleEventUpdate) {
           //    handleEventUpdate(response);
           // }
           // Для простоты, перезагружаем данные, если API не возвращает обновленный event
           await Promise.all([fetchEventsAndIds('participating', false), fetchEventsAndIds('favorites', false)]);
           return true;
       } catch (err) { console.error("Error toggling participation:", err); setEventsError(err.message || "Ошибка участия."); return false; }
   }, [fetchEventsAndIds]); // Убрал handleEventUpdate из зависимостей, если он не используется для этого

    const handleFavoriteToggle = useCallback(async (eventId, currentStatus) => {
        const apiCall = currentStatus ? removeEventFromFavorites : addEventToFavorites;
        setEventsError(null);
        try {
            await apiCall(eventId);
            await Promise.all([fetchEventsAndIds('participating', false), fetchEventsAndIds('favorites', false)]);
            return true;
        } catch (err) { console.error("Error toggling favorite:", err); setEventsError(err.message || "Ошибка избранного."); return false; }
   }, [fetchEventsAndIds]);

    const handleOpenNotificationsModal = () => {
        setIsNotificationsModalOpen(true);
        // Можно здесь вызвать markAllMyNotificationsAsRead(), если хочешь, чтобы при открытии все помечалось
        // markAllMyNotificationsAsRead().then(() => forceBellUpdate()); 
    };
     const handleCloseNotificationsModal = () => {
        setIsNotificationsModalOpen(false);
        // Принудительно обновить счетчик в колокольчике после закрытия модалки
        if (notificationsBellRef.current && typeof notificationsBellRef.current.fetchUnreadCount === 'function') {
            notificationsBellRef.current.fetchUnreadCount();
        }
    };
    // Функция, вызываемая после УСПЕШНОГО добавления друга в модальном окне
    const handleFriendAdded = useCallback(() => {
        console.log("Вызван handleFriendAdded в Profile.jsx (после добавления друга)");
        setShowFindFriendModal(false); // Сначала закрываем модальное окно
        fetchFriendsData();           // Затем ПЕРЕЗАГРУЖАЕМ список друзей
    }, [fetchFriendsData]); // Зависит от функции перезагрузки


    // Обработчик изменения полей в форме редактирования профиля
    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditFormData(prev => ({ ...prev, [name]: value }));
    };

    // Обработчик сохранения профиля
    const handleSaveProfile = async (e) => {
        e.preventDefault(); // Предотвращаем перезагрузку страницы
        setProfileLoading(true); // Показываем лоадер на кнопке
        setProfileError(null); // Сбрасываем старые ошибки
        try {
            console.log("Отправка данных профиля на обновление:", editFormData);
            const updatedProfileData = await updateMyUserProfile(editFormData); // Вызываем API обновления
            console.log("Ответ API после сохранения профиля:", updatedProfileData);
            setProfile(updatedProfileData); // Обновляем состояние профиля данными из ответа
            // Обновляем и состояние формы на всякий случай
            setEditFormData({
                 displayName: updatedProfileData?.displayName || '',
                 bio: updatedProfileData?.bio || ''
            });
            setIsEditing(false); // Выходим из режима редактирования
            // alert('Профиль успешно сохранен!'); // Можно раскомментировать
        } catch (err) {
            console.error("Ошибка сохранения профиля:", err);
            const serverMessage = err.data?.message || err.message || "Не удалось сохранить профиль.";
            setProfileError(serverMessage); // Показываем ошибку
        } finally {
            setProfileLoading(false); // Убираем лоадер
        }
    };

    // Обработчик изменения настроек приватности
    const handlePrivacyChange = async (event) => {
       const newSetting = event.target.value;
       const previousSetting = privacySetting;
       setPrivacySetting(newSetting); // Меняем сразу для лучшего UX
       setPrivacyLoading(true); setPrivacyError(null);
       try {
           console.log(`API: Вызов updateMyPrivacySetting с setting=${newSetting}`);
           await updateMyPrivacySetting(newSetting); // Отправляем { setting: "VALUE" }
           console.log("Настройки приватности успешно обновлены");
       } catch (err) {
           console.error("Ошибка сохранения настроек приватности:", err);
           setPrivacyError(err.message || "Не удалось сохранить настройки.");
           setPrivacySetting(previousSetting); // Откатываем изменение при ошибке
       } finally {
           setPrivacyLoading(false);
       }
   };

    // Обработчик удаления друга
    const handleRemoveFriend = useCallback(async (friendToRemove) => {
        if (!friendToRemove || !friendToRemove.userId) {
             console.error("Некорректные данные друга для удаления:", friendToRemove);
             return;
        }
        if (!window.confirm(`Вы уверены, что хотите удалить ${friendToRemove.displayName || friendToRemove.username} из друзей?`)) {
             return;
        }
        setFriendsError(null); // Сбрасываем ошибку
        // Можно добавить индикатор загрузки для конкретного друга, если нужно
        try {
            console.log(`API: Вызов removeFriend для ID=${friendToRemove.userId}`);
            await removeFriend(friendToRemove.userId); // Вызываем API удаления
            console.log(`Друг ${friendToRemove.userId} удален, перезагружаем список...`);
            await fetchFriendsData(); // Перезагружаем список с сервера для актуальности
        } catch (err) {
            console.error("Ошибка удаления друга:", err);
            setFriendsError(err.message || "Не удалось удалить друга.");
            // Если было оптимистичное удаление, здесь нужен откат
            // await fetchFriendsData(); // Можно перезагрузить и при ошибке
        } finally {
             // Снимаем индикатор загрузки, если он был
        }
    }, [fetchFriendsData]); // Зависит от fetchFriendsData

    // --- Функции Рендеринга Секций ---

    const renderProfileSection = () => {
        // Показываем лоадер только при самой первой загрузке, пока нет объекта profile
        if (profileLoading && !profile) return <p className={styles.loadingMessage}>Загрузка профиля...</p>;
        // Показываем ошибку, если она есть и мы НЕ в режиме редактирования
        if (profileError && !isEditing) return <AlertReg isVisible={true} message={profileError} type="error" onClose={() => setProfileError(null)}>OK</AlertReg>;
        // Если нет ни профиля, ни загрузки, ни ошибки - значит что-то пошло не так
        if (!profile && !profileLoading && !profileError) return <p>Не удалось загрузить профиль.</p>;

        // Форма редактирования
        if (isEditing) {
            return (
                <div className={styles.modalOverlay}>
                    <form onSubmit={handleSaveProfile} className={styles.modalContent}>
                        <h2>Редактирование профиля</h2>
                            {profileError && (
                                    <AlertReg 
                                    isVisible={true} 
                                    message={profileError} 
                                    type="error" 
                                    onClose={() => setProfileError(null)}
                                    >
                                    OK
                                    </AlertReg>
                                    )}

                     <div className={styles.formGroup}>
                        <label htmlFor="displayName">Отображаемое имя:</label>
                        <input
                        id="displayName"
                        name="displayName"
                        value={editFormData.displayName}
                        onChange={handleEditChange}
                        className={styles.modalInput}
                        disabled={profileLoading}
                        />
                        </div>

                     <div className={styles.formGroup}>
                    <label htmlFor="bio">О себе:</label>
                    <textarea
                     id="bio"
                    name="bio"
                    value={editFormData.bio}
                    onChange={handleEditChange}
                    rows="4"
                    className={styles.modalTextarea}
                    disabled={profileLoading}
                    />
                    </div>

                    <div className={styles.modalButtons}>
                     <button
                    type="submit"
                    className={styles.primaryButton}
                    disabled={profileLoading}
                    >
          {profileLoading ? 'Сохранение...' : 'Сохранить'}
        </button>
        
        <button
          type="button"
          className={styles.secondaryButton}
          onClick={() => {
            setIsEditing(false);
            setProfileError(null);
            setEditFormData({
              displayName: profile?.displayName || '',
              bio: profile?.bio || ''
            });
          }}
          disabled={profileLoading}
        >
          Отмена
        </button>
      </div>
    </form>
  </div>
)}
            
        // Режим просмотра профиля
        else {
            return (
                <div className={styles.infoSection}>
                    {/* Используем данные из состояния profile */}
                    <h1>{profile?.displayName || profile?.username || 'Имя не указано'}</h1>
                    <p className={styles.email}>Email (логин): {profile?.username || 'Неизвестен'}</p>
                    <p className={styles.bio}>{profile?.bio || 'Информация о себе не указана.'}</p>
                    <button className={styles.button} onClick={() => {
                        // Заполняем форму редактирования актуальными данными перед открытием
                        setEditFormData({ displayName: profile?.displayName || '', bio: profile?.bio || '' });
                        setIsEditing(true); // Переключаемся в режим редактирования
                        setProfileError(null); // Сбрасываем возможные ошибки сохранения
                    }}>
                        Редактировать профиль
                    </button>
                </div>
            );
        }
    };

    // Рендеринг секции мероприятий
     const renderEventsSection = () => {
        const eventsToShow = activeTab === 'participating' ? participatingEventsData : favoriteEventsData;
        const noEventsMessage = activeTab === 'participating'
            ? "Вы еще не участвуете в мероприятиях."
            : "У вас нет избранных мероприятий.";

        return (
            <div className={styles.eventsSection}>
                <h2>Мои Мероприятия</h2>
                <div className={styles.tabs}>
                    <button className={`${styles.tabButton} ${activeTab === 'participating' ? styles.activeTab : ''}`} onClick={() => setActiveTab('participating')} disabled={eventsLoading}> Участвую ({participatingEventIds.size}) </button>
                    <button className={`${styles.tabButton} ${activeTab === 'favorites' ? styles.activeTab : ''}`} onClick={() => setActiveTab('favorites')} disabled={eventsLoading}> Избранное ({favoriteEventIds.size}) </button>
                </div>
                {eventsLoading && <p className={styles.loadingMessage}>Загрузка мероприятий...</p>}
                {eventsError && <AlertReg isVisible={true} message={eventsError} type="error" onClose={() => setEventsError(null)}>OK</AlertReg>}
                {!eventsLoading && !eventsError && (
                    eventsToShow.length > 0 ? (
                        <CardList 
                            events={eventsToShow} 
                            isLog={true} 
                            isOrganizerView={false} // Важно: для обычного пользователя это false
                            participatingEventIds={participatingEventIds} 
                            favoriteEventIds={favoriteEventIds} 
                            onParticipateToggle={handleParticipateToggle} 
                            onFavoriteToggle={handleFavoriteToggle}
                            // onEventUpdate={handleEventUpdate} // Передаем, если Card его использует для обновления статистики на карточке
                        />
                    ) : ( <p className={styles.noEventsMessage}>{noEventsMessage}</p> )
                )}
            </div>
        );
    };

    // Рендеринг секции приватности
    const renderPrivacySection = () => {
        return (
            <div className={styles.privacySection}>
                <h2>Настройки приватности</h2>
                {privacyError && <AlertReg isVisible={true} message={privacyError} type="error" onClose={() => setPrivacyError(null)}>OK</AlertReg>}
                <div className={styles.formGroup}>
                    
                    <select id="privacySelect" value={privacySetting} onChange={handlePrivacyChange} disabled={privacyLoading} className={styles.privacySelect}>
                        {Object.entries(PRIVACY_OPTIONS).map(([key, label]) => (<option key={key} value={key}>{label}</option>))}
                    </select>
                    {privacyLoading && <span className={styles.loadingMessage}> Сохранение...</span>}
                </div>
            </div>
        );
    };

   // Рендеринг секции друзей
   const renderFriendsSection = () => {
        return (
            <div className={styles.friendsSection}>
                {/* Считаем количество друзей по длине массива friendsData (исключая ошибки) */}
                <h2>Друзья ({friendsData.filter(f => !f.error).length})</h2>
                {friendsLoading && <p className={styles.loadingMessage}>Загрузка списка друзей...</p>}
                {friendsError && <AlertReg isVisible={true} message={friendsError} type="error" onClose={() => setFriendsError(null)}>OK</AlertReg>}
                {/* Отображаем список, если загрузка завершена и нет ошибки */}
                {!friendsLoading && !friendsError && (
                    friendsData.length > 0 ? (
                        <ul className={styles.friendList}>
                            {friendsData.map(friend => (
                                <li key={friend.userId} className={styles.friendItem}>
                                    {friend.error ? (
                                        // Показываем сообщение об ошибке, если профиль друга не загрузился
                                        <span className={styles.friendError}>{friend.username}</span>
                                    ) : (
                                        // Ссылка на страницу профиля друга
                                        <Link to={`/users/${friend.userId}`} className={styles.friendLink}>
                                            {friend.displayName || friend.username}
                                        </Link>
                                    )}
                                    {/* Кнопка удаления для всех, кроме ошибок */}
                                    {!friend.error && (
                                        <button onClick={() => handleRemoveFriend(friend)}
                                                className={styles.removeFriendButton}
                                                title={`Удалить ${friend.displayName || friend.username}`}>
                                            ×
                                        </button>
                                     )}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        // Сообщение, если список друзей пуст
                        <p className={styles.noFriendsMessage}>У вас пока нет друзей.</p>
                    )
                )}
                 {/* Кнопка открытия модального окна поиска */}
                 <button className={styles.button} onClick={() => setShowFindFriendModal(true)}>
                      Найти друзей
                 </button>

                 {/* Рендеринг модального окна поиска друзей, если оно должно быть показано */}
                 {showFindFriendModal && (
                     <FindFriend
                         onClose={() => setShowFindFriendModal(false)} // Функция для закрытия
                         onFriendAdded={handleFriendAdded}          // Функция обратного вызова после добавления
                         existingFriendIds={friendIds}              // Передаем актуальный Set ID друзей
                     />
                 )}
            </div>
        );
    };

// --- Финальный Рендеринг Компонента ---
// В компоненте Profile измените финальный рендеринг:
// В компоненте Profile измените рендеринг:
 return (
        <div className={styles.profileContainer}>
            {/* --- ДОБАВЛЯЕМ ИКОНКУ УВЕДОМЛЕНИЙ В ЗАГОЛОВОК ПРОФИЛЯ --- */}
            <div className={styles.profilePageHeader}> {/* Используй существующий или добавь новый класс для стилизации */}
                <h1>Мой Профиль</h1>
                <NotificationsBell onClick={handleOpenNotificationsModal} ref={notificationsBellRef} />
            </div>
            {/* --- --- --- --- --- --- --- --- --- --- --- --- */}
            
            <div className={styles.mainRow}>
                {renderProfileSection()}
                {renderPrivacySection()}
                {renderFriendsSection()}
            </div>
            
            <div className={styles.eventsRow}>
                {renderEventsSection()}
            </div>

            {/* --- МОДАЛЬНОЕ ОКНО УВЕДОМЛЕНИЙ --- */}
            <NotificationsModal 
                isOpen={isNotificationsModalOpen} 
                onClose={handleCloseNotificationsModal} // Используем новый обработчик
                onForceBellUpdate={() => { // Простая функция для обновления колокольчика
                    if (notificationsBellRef.current && typeof notificationsBellRef.current.fetchUnreadCount === 'function') {
                        notificationsBellRef.current.fetchUnreadCount();
                    }
                }}
            />
            {/* --- --- --- --- --- --- --- --- */}
        </div>
    );
}
export default Profile;