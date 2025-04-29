// src/pages/FindUsersPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import FindFriend from '../comp/UI/FindFriend/FindFriend.jsx'; // Импортируем компонент поиска
import { getMyFriendIds } from '../api/api'; // Нужен API для получения текущих друзей
import styles from '../styles/FindUserPage.module.css'; // Стили для ЭТОЙ СТРАНИЦЫ

const FindUsersPage = () => {
    const navigate = useNavigate();
    const [currentUserFriendIds, setCurrentUserFriendIds] = useState(new Set());
    const [isLoadingFriends, setIsLoadingFriends] = useState(true);
    const [error, setError] = useState(null);

    // Загрузка списка ID своих друзей при монтировании
    const fetchMyFriendList = useCallback(async () => {
        setIsLoadingFriends(true);
        setError(null);
        try {
            const ids = await getMyFriendIds();
            setCurrentUserFriendIds(new Set(ids || []));
        } catch (err) {
            console.error("Не удалось загрузить список своих друзей:", err);
            setError("Не удалось загрузить данные. Попробуйте позже.");
            if (err.status === 401 || err.status === 403) navigate('/login');
        } finally {
            setIsLoadingFriends(false);
        }
    }, [navigate]);

    useEffect(() => {
        // Проверка токена перед загрузкой
        if (!localStorage.getItem('accessToken')) {
            navigate('/login');
            return;
        }
        fetchMyFriendList();
    }, [fetchMyFriendList, navigate]);

    // Обработчик для обновления списка друзей ПОСЛЕ добавления в FindFriend
    const handleFriendAdded = useCallback(() => {
        // Просто перезагружаем список ID друзей
        fetchMyFriendList();
        // Можно добавить уведомление об успехе
        alert('Друг успешно добавлен!');
    }, [fetchMyFriendList]);

    // --- Рендеринг Страницы ---
    return (
        <div className={styles.pageContainer}>
            {/* Кнопка для возврата на страницу профиля */}
            <button onClick={() => navigate('/Profile')} className={styles.backButton}>
                ← Назад в профиль {/* Стрелка влево */}
            </button>

            <h1>Поиск Новых Друзей</h1>

            {error && <p className={styles.error}>{error}</p>}

            {isLoadingFriends ? (
                <p className={styles.loadingMessage}>Загрузка вашего списка друзей...</p>
            ) : (
                // Рендерим компонент FindFriend, передавая ему нужные пропсы
                // onClose здесь НЕ нужен, т.к. это не модальное окно
                <FindFriend
                    existingFriendIds={currentUserFriendIds}
                    onFriendAdded={handleFriendAdded}
                    // onClose не передаем
                />
            )}
        </div>
    );
};

export default FindUsersPage;