// src/pages/ProfileOrg.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getMyOrganizerProfile, updateMyOrganizerProfile, getMyEventsAsOrganizer } from "../api/api";
import CardList from "../comp/UI/CardList/CardList.jsx";
import AlertReg from "../comp/UI/AlertReg/AlertReg.jsx";
import styles from "../styles/ProfileOrg.module.css"; // Убедись, что путь и стили существуют

const CREATE_EVENT_ROUTE = '/CreateEvent'; // Убедись, что этот роут есть в App.js

const ProfileOrg = () => {
    // Состояние профиля
    const [profile, setProfile] = useState(null); // Храним объект профиля (OrganizationProfileDto)
    const [profileLoading, setProfileLoading] = useState(true);
    const [profileError, setProfileError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    // Состояние только для поля 'name' в форме редактирования
    const [editOrgName, setEditOrgName] = useState('');

    // Состояние мероприятий
    const [myEvents, setMyEvents] = useState([]);
    const [eventsLoading, setEventsLoading] = useState(true);
    const [eventsError, setEventsError] = useState(null);
    // TODO: Добавить состояние для пагинации мероприятий

    const navigate = useNavigate();

    // --- Загрузка Данных ---
    const fetchProfile = useCallback(async () => {
        setProfileLoading(true);
        setProfileError(null);
        try {
            console.log("API: Вызов getMyOrganizerProfile (ProfileOrg.jsx)");
            const data = await getMyOrganizerProfile();
            console.log("Профиль организатора получен:", data);
            setProfile(data);
            setEditOrgName(data?.name || ''); // Инициализируем поле редактирования
        } catch (err) {
            console.error("Ошибка загрузки профиля организатора:", err);
            setProfileError(err.message || "Не удалось загрузить профиль.");
            if (err.status === 401 || err.status === 403) {
                 navigate('/login');
            } else if (err.status === 404) {
                 setProfileError("Профиль организатора не найден. Возможно, ваша заявка еще не одобрена или была отклонена.");
            }
        } finally {
            setProfileLoading(false);
        }
    }, [navigate]);

    const fetchMyEvents = useCallback(async () => {
        setEventsLoading(true);
        setEventsError(null);
        try {
            console.log("API: Вызов getMyEventsAsOrganizer");
            const eventsPage = await getMyEventsAsOrganizer({ page: 0, size: 1000 }); // Загружаем все
            console.log("Мероприятия организатора получены:", eventsPage);
            setMyEvents(eventsPage?.content || []);
        } catch (err) {
            console.error("Ошибка загрузки мероприятий организатора:", err);
            setEventsError(err.message || "Не удалось загрузить мероприятия.");
             if (err.status === 401 || err.status === 403) {
                 navigate('/login');
             }
        } finally {
            setEventsLoading(false);
        }
    }, [navigate]); // Добавили navigate в зависимости

    useEffect(() => {
        // Проверяем наличие токена перед загрузкой
        if (!localStorage.getItem('accessToken')) {
             navigate('/login');
             return;
        }
        console.log("ProfileOrg.jsx монтируется, запускаем загрузку...");
        fetchProfile();
        fetchMyEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Пустой массив зависимостей для вызова один раз

    // --- Редактирование Профиля ---
    const handleSaveProfile = async (e) => {
        e.preventDefault();
        const trimmedName = editOrgName.trim();
        if (!trimmedName) {
            setProfileError("Название организации не может быть пустым.");
            return;
        }
        setProfileLoading(true); // Используем общий лоадер профиля
        setProfileError(null);
        try {
            // Отправляем ТОЛЬКО organizationName
            const profileDataToUpdate = {
                organizationName: trimmedName // Имя поля должно совпадать с UpdateOrganizerProfileRequest
            };
            console.log("Данные для отправки (орг):", JSON.stringify(profileDataToUpdate));

            const updatedProfile = await updateMyOrganizerProfile(profileDataToUpdate);
            console.log("Данные ПОСЛЕ сохранения (орг, ответ API):", updatedProfile);

            setProfile(updatedProfile); // Обновляем состояние профиля
            setEditOrgName(updatedProfile?.name || ''); // Обновляем поле формы на всякий случай
            setIsEditing(false);
        } catch (err) {
             console.error("Ошибка сохранения профиля организатора:", err);
             // Отображаем ошибку от сервера или общее сообщение
             const serverMessage = err.data?.message || err.message || "Не удалось сохранить профиль.";
             setProfileError(serverMessage);
        } finally {
             setProfileLoading(false);
        }
    };

    // --- Рендеринг ---
    const renderProfileSection = () => {
        if (profileLoading && !profile) return <p className={styles.loadingMessage}>Загрузка профиля...</p>;
        // Показываем ошибку всегда, кроме режима редактирования
        if (profileError && !isEditing) return <AlertReg isVisible={true} message={profileError} type="error" onClose={() => setProfileError(null)}>OK</AlertReg>;
        if (!profile && !profileLoading && !profileError) return <p>Профиль организатора не найден или не удалось загрузить.</p>;

        if (isEditing) {
            // Форма Редактирования
            return (
                <form onSubmit={handleSaveProfile} className={styles.infoSection}>
                    <h2>Редактирование Профиля</h2>
                    {/* Показываем ошибку сохранения внутри формы */}
                    {profileError && <AlertReg isVisible={true} message={profileError} type="error" onClose={() => setProfileError(null)}>OK</AlertReg>}

                    <div className={styles.formGroup}>
                        <label htmlFor="orgNameEdit">Название организации:</label>
                        <input
                            id="orgNameEdit"
                            name="organizationName" // Используем имя поля из DTO для name атрибута
                            value={editOrgName}
                            onChange={(e) => setEditOrgName(e.target.value)}
                            required // Название обязательно
                            className={styles.inputField}
                        />
                    </div>

                   

                    <div className={styles.editButtons}>
                        <button type="submit" className={styles.button} disabled={profileLoading}>
                            {profileLoading ? 'Сохранение...' : 'Сохранить'}
                        </button>
                        <button type="button" className={`${styles.button} ${styles.cancelButton}`}
                                onClick={() => {
                                    setIsEditing(false);
                                    setProfileError(null);
                                    setEditOrgName(profile?.name || ''); // Восстанавливаем имя
                                }}
                                disabled={profileLoading}>
                            Отмена
                        </button>
                    </div>
                </form>
            );
        } else {
            // Отображение Профиля
            return (
                <div className={styles.infoSection}>
                     <h1>{profile?.name || 'Название не указано'}</h1>
                     {/* Отображаем email пользователя, связанного с организацией */}
                    <p className={styles.email}>Email (логин): {profile?.applicantUsername || 'Неизвестен'}</p>
                     <p><strong>Статус аккредитации:</strong> <span className={styles[`status${profile?.status}`]}>{profile?.status || 'Неизвестен'}</span></p>
                     {/* Поле bio не отображается здесь */}
                     <div className={styles.profileActions}>
                    <button className={styles.button} onClick={() => { setEditOrgName(profile?.name || ''); setIsEditing(true); setProfileError(null); } }>
                        Редактировать профиль
                    </button>
                    <Link to={CREATE_EVENT_ROUTE}>
                    <button className={`${styles.button} ${styles.createButton}`}>
                    Создать Новое Мероприятие
                     </button>
                    </Link>
                </div>
                </div>
            );
        }
    };

    const renderEventsSection = () => {
        if (eventsLoading) return <p className={styles.loadingMessage}>Загрузка ваших мероприятий...</p>;
        if (eventsError) return <AlertReg isVisible={true} message={eventsError} type="error" onClose={() => setEventsError(null)}>OK</AlertReg>;

        return (
            <div className={styles.eventsSection}>
                <h2>Ваши Мероприятия</h2>
                 
                {myEvents.length > 0 ? (
                    <div className={styles.listContainer}>
                         <CardList
                             events={myEvents}
                             isLog={true} // Организатор всегда залогинен для доступа сюда
                             isOrganizerView={true} // Специальный вид карточки для организатора
                         />
                    </div>
                ) : (
                     <p className={styles.noEventsMessage}>Вы еще не создали ни одного мероприятия.</p>
                 )}
            </div>
        );
    };

    // --- Финальный Рендеринг Компонента ---
    return (
        <div className={styles.profileContainer}>
            {renderProfileSection()}
            <hr className={styles.divider} />
            {renderEventsSection()}
        </div>
    );
};

export default ProfileOrg;