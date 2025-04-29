// src/pages/ViewUserProfile.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    getMyUserProfile, getUserProfileById, getMyFriendIds,
    addFriend, removeFriend,
    getUserParticipatingEvents, getUserFavoriteEvents
} from '../api/api'; // Убедитесь, что все функции импортированы
import CardList from '../comp/UI/CardList/CardList.jsx';
import AlertReg from '../comp/UI/AlertReg/AlertReg.jsx';
import styles from '../styles/ViewUserProfile.module.css'; // Убедитесь, что путь правильный

function ViewUserProfile() {
    const { userId: targetUserIdParam } = useParams(); // Получаем ID из URL
    const targetUserId = parseInt(targetUserIdParam, 10); // Преобразуем в число
    const navigate = useNavigate();

    // Состояния
    const [currentUserId, setCurrentUserId] = useState(null); // ID ТЕКУЩЕГО пользователя
    const [currentUserLoading, setCurrentUserLoading] = useState(true);
    const [targetProfile, setTargetProfile] = useState(null); // Профиль просматриваемого пользователя
    const [targetProfileLoading, setTargetProfileLoading] = useState(true);
    const [targetProfileError, setTargetProfileError] = useState(null);
    const [participatingEvents, setParticipatingEvents] = useState([]); // Мероприятия цели
    const [favoriteEvents, setFavoriteEvents] = useState([]);
    const [eventsLoading, setEventsLoading] = useState(true);
    const [eventsError, setEventsError] = useState(null);
    const [currentUserFriendIds, setCurrentUserFriendIds] = useState(new Set()); // ID друзей ТЕКУЩЕГО пользователя
    const [isFriend, setIsFriend] = useState(false); // Является ли цель другом
    const [friendActionLoading, setFriendActionLoading] = useState(false); // Загрузка добавления/удаления
    const [friendActionError, setFriendActionError] = useState(null); // Ошибка добавления/удаления
    const [myFriendsLoading, setMyFriendsLoading] = useState(true); // Загрузка СВОИХ друзей

    // --- Функции Загрузки Данных ---

    // Загрузка ID текущего пользователя
    const fetchCurrentUser = useCallback(async () => {
        console.log("API: Вызов getMyUserProfile (ViewUserProfile)");
        setCurrentUserLoading(true);
        try {
            const myProfileData = await getMyUserProfile();
            console.log("Профиль текущего пользователя получен:", myProfileData);
            const fetchedUserId = myProfileData?.userId;
            if (!fetchedUserId) { console.error("Не удалось получить userId"); navigate('/login'); }
            else { setCurrentUserId(fetchedUserId); }
        } catch (err) { console.error("Ошибка загрузки профиля текущего пользователя:", err); if (err.status === 401 || err.status === 403) navigate('/login'); }
        finally { setCurrentUserLoading(false); }
    }, [navigate]);

    // Загрузка списка ID друзей ТЕКУЩЕГО пользователя
    const fetchMyFriendList = useCallback(async () => {
        if (!currentUserId) { /* console.log("Пропуск fetchMyFriendList: currentUserId еще не загружен."); */ setMyFriendsLoading(false); return; }
        console.log(`API: Вызов getMyFriendIds для ID=${currentUserId} (ViewUserProfile)`);
        setMyFriendsLoading(true); setFriendActionError(null);
        try {
            const ids = await getMyFriendIds(); // Ожидаем МАССИВ ID
             console.log("Мои ID друзей получены:", ids);
             if (Array.isArray(ids)) {
                 setCurrentUserFriendIds(new Set(ids));
             } else {
                 console.warn("getMyFriendIds вернул не массив:", ids);
                 setCurrentUserFriendIds(new Set());
             }
        } catch (err) { console.error("Не удалось загрузить список своих друзей:", err); setCurrentUserFriendIds(new Set()); setFriendActionError("Не удалось обновить статус дружбы."); }
        finally { setMyFriendsLoading(false); }
    }, [currentUserId]);

    // Загрузка профиля ЦЕЛЕВОГО пользователя
    const fetchTargetProfile = useCallback(async () => {
        if (isNaN(targetUserId)) { setTargetProfileError("Некорректный ID пользователя."); return; }
        console.log(`API: Вызов getUserProfileById для ID=${targetUserId}`);
        setTargetProfileLoading(true); setTargetProfileError(null); setTargetProfile(null);
        try {
             const profileData = await getUserProfileById(targetUserId);
             console.log(`Профиль пользователя ${targetUserId} получен:`, profileData);
             setTargetProfile(profileData);
        } catch (err) { console.error(`Ошибка загрузки профиля ${targetUserId}:`, err); if (err.status === 404) { setTargetProfileError("Пользователь не найден."); } else { setTargetProfileError(err.message || "Не удалось загрузить профиль."); } setTargetProfile(null); }
        finally { setTargetProfileLoading(false); }
    }, [targetUserId]);

    // Загрузка мероприятий ЦЕЛЕВОГО пользователя
    const fetchTargetEvents = useCallback(async () => {
        if (isNaN(targetUserId) || !targetProfile) { setEventsLoading(false); return; }
        console.log(`API: Вызов getUserParticipatingEvents и getUserFavoriteEvents для ID=${targetUserId}`);
        setEventsLoading(true); setEventsError(null);
        try {
            const [participatingResponse, favoritesResponse] = await Promise.all([
                getUserParticipatingEvents(targetUserId, { page: 0, size: 50 }),
                getUserFavoriteEvents(targetUserId, { page: 0, size: 50 })
            ]);
            setParticipatingEvents(participatingResponse?.content || []);
            setFavoriteEvents(favoritesResponse?.content || []);
        } catch (err) { console.error(`Ошибка загрузки мероприятий ${targetUserId}:`, err); if (err.status === 403) { setEventsError("Доступ к мероприятиям пользователя ограничен."); } else if (err.status !== 404) { setEventsError(err.message || "Не удалось загрузить мероприятия.");} setParticipatingEvents([]); setFavoriteEvents([]); }
        finally { setEventsLoading(false); }
    }, [targetUserId, targetProfile]);

    // --- Эффекты ---
    // 1. Загружаем текущего пользователя при монтировании
    useEffect(() => { fetchCurrentUser(); }, [fetchCurrentUser]);

    // 2. Загружаем список СВОИХ друзей, когда ID текущего пользователя становится известен
    useEffect(() => { if (currentUserId) { fetchMyFriendList(); } }, [currentUserId, fetchMyFriendList]);

    // 3. Загружаем профиль ЦЕЛИ, когда ID в URL меняется
     useEffect(() => {
        if (!isNaN(targetUserId)) { fetchTargetProfile(); }
        else { setTargetProfileError("Некорректный ID"); setTargetProfileLoading(false); setEventsLoading(false); }
     }, [targetUserId, fetchTargetProfile]);

    // 4. Загружаем события ЦЕЛИ, когда ЕГО профиль загружен
    useEffect(() => {
        if (targetProfile) { fetchTargetEvents(); }
        else { setParticipatingEvents([]); setFavoriteEvents([]); } // Очищаем, если профиля цели нет
    }, [targetProfile, fetchTargetEvents]);

    // 5. Обновляем статус 'isFriend', когда меняется список СВОИХ друзей или ID ЦЕЛИ
    useEffect(() => {
        console.log(`Эффект: Проверка дружбы. currentUserFriendIds: [${Array.from(currentUserFriendIds).join(', ')}], targetUserId: ${targetUserId}. Результат: ${currentUserFriendIds.has(targetUserId)}`);
        setIsFriend(currentUserFriendIds.has(targetUserId));
    }, [currentUserFriendIds, targetUserId]);

    // --- Обработчики ---
    // Обработчик добавления/удаления друга
    const handleToggleFriend = useCallback(async () => {
        if (!currentUserId) { setFriendActionError("Необходимо войти в систему."); return; }
        if (currentUserId === targetUserId) { console.warn("Попытка добавить/удалить себя."); return; }

        const action = isFriend ? removeFriend : addFriend;
        const actionName = isFriend ? 'удаления' : 'добавления';
        setFriendActionLoading(true); setFriendActionError(null);

        try {
            console.log(`API: Вызов ${actionName} друга с ID=${targetUserId}`);
            await action(targetUserId); // Выполняем addFriend или removeFriend
            console.log(`Успешно ${actionName} друга ${targetUserId}. Перезагрузка списка СВОИХ друзей...`);
            // --- ПЕРЕЗАГРУЖАЕМ СПИСОК СВОИХ ДРУЗЕЙ ---
            await fetchMyFriendList(); // Обновит currentUserFriendIds и запустит useEffect для isFriend
        } catch (err) {
            console.error(`Ошибка ${actionName} друга:`, err);
            const errorMessage = err.data?.message || err.message || `Не удалось ${isFriend ? 'удалить' : 'добавить'} друга`;
            setFriendActionError(errorMessage);
        } finally {
            setFriendActionLoading(false);
        }
    }, [currentUserId, targetUserId, isFriend, fetchMyFriendList]); // Добавили fetchMyFriendList

    // --- Рендеринг ---
    // Ждем загрузки и своего ID, и профиля цели, и своего списка друзей
    const pageLoading = currentUserLoading || targetProfileLoading || myFriendsLoading;

    return (
        <div className={styles.profileContainer}>
            {/* Главный лоадер */}
            {pageLoading && !targetProfile && <p className={styles.loadingMessage}>Загрузка профиля...</p>}
            {/* Ошибка загрузки профиля цели */}
            {targetProfileError && <AlertReg isVisible={true} message={targetProfileError} type="error" />}

            {/* Контент страницы */}
            {!pageLoading && targetProfile && (
                <>
                    {/* Секция Информации */}
                    <div className={styles.infoSection}>
                        <h1>{targetProfile.displayName || targetProfile.username || `Пользователь ${targetUserId}`}</h1>
                        {targetProfile.username && <p className={styles.username}>({targetProfile.username})</p>}
                        <p className={styles.bio}>{targetProfile.bio || 'Информация о себе отсутствует.'}</p>

                        {/* Кнопка управления дружбой */}
                        {currentUserId && currentUserId !== targetUserId && (
                            <div className={styles.friendAction}>
                                <button
                                    onClick={handleToggleFriend}
                                    disabled={friendActionLoading || myFriendsLoading}
                                    className={`${styles.button} ${isFriend ? styles.removeFriendButton : styles.addFriendButton}`}
                                >
                                    {friendActionLoading ? 'Обработка...' : (isFriend ? 'Удалить из друзей' : 'Добавить в друзья')}
                                </button>
                                {friendActionError && <p className={styles.actionError}>{friendActionError}</p>}
                            </div>
                        )}
                        {currentUserId === targetUserId && <p className={styles.ownProfileInfo}>(Это ваш профиль)</p>}
                    </div>

                    <hr className={styles.divider} />

                    {/* Секция Мероприятий */}
                    <div className={styles.eventsSection}>
                        <h2>Мероприятия пользователя</h2>
                        {eventsError && <AlertReg isVisible={true} message={eventsError} type="error" onClose={() => setEventsError(null)} />}

                        <h3>Участвует в:</h3>
                        {/* Показываем лоадер событий, только если профиль цели уже загружен */}
                        {targetProfile && eventsLoading && <p className={styles.loadingMessage}>Загрузка участий...</p>}
                        {targetProfile && !eventsLoading && !eventsError && (
                            participatingEvents.length > 0 ? (
                                <CardList events={participatingEvents} isLog={!!currentUserId} isOrganizerView={true} />
                            ) : ( <p className={styles.noEventsMessage}>Пользователь не участвует в видимых вам мероприятиях.</p> )
                        )}

                        <hr className={styles.dividerSmall} />

                        <h3>Избранное:</h3>
                        {targetProfile && eventsLoading && <p className={styles.loadingMessage}>Загрузка избранного...</p>}
                        {targetProfile && !eventsLoading && !eventsError && (
                            favoriteEvents.length > 0 ? (
                                <CardList events={favoriteEvents} isLog={!!currentUserId} isOrganizerView={true} />
                            ) : ( <p className={styles.noEventsMessage}>У пользователя нет видимых вам избранных мероприятий.</p> )
                        )}
                    </div>
                </>
            )}
            {/* Сообщение, если профиль не найден, но загрузка завершена */}
             {!pageLoading && !targetProfile && !targetProfileError && (
                  <p>Профиль пользователя не найден.</p>
             )}
        </div>
    );
}

export default ViewUserProfile;