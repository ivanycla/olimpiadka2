// src/comp/UI/FindFriend/FindFriend.jsx
import React, { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { searchUsers, addFriend } from '../../../api/api'; // Убедитесь, что путь к API правильный
import styles from './FindFriend.module.css'; // Убедитесь, что путь к стилям правильный

// Компонент для отображения одного пользователя в результатах поиска
const SearchResultItem = ({ user, existingFriendIds, addFriendStatus, onAddFriend }) => {
    const isAlreadyFriend = existingFriendIds.has(user.userId);
    const currentAddStatus = addFriendStatus[user.userId];
    // Считаем пользователя организатором, если у него есть РОЛЬ_ОРГАНИЗАТОРА
    // Убедитесь, что ваш API /users/search возвращает поле roles: ["ROLE_USER", "ROLE_ORGANIZER"] или подобное
    const isOrganizer = user.roles?.includes('ROLE_ORGANIZER');
    // Кнопку показываем, если НЕ друг и НЕ организатор
    const showAddButton = !isAlreadyFriend && !isOrganizer;

    return (
        <li className={styles.resultItem}>
            <div className={styles.userInfo}>
                <Link to={`/users/${user.userId}`} className={styles.profileLinkFromName}>
                    <span className={styles.userName}>{user.displayName || user.username}</span>
                    {/* Показываем метку только если он организатор */}
                    {isOrganizer && <span className={styles.organizerLabel}> (Организатор)</span>}
                </Link>
                {/* Отображение username (email) */}
                <span className={styles.userUsername}> ({user.username})</span>
            </div>
            <div className={styles.actionArea}>
                {showAddButton && (
                    <>
                        <button
                            onClick={() => onAddFriend(user.userId)} // Вызываем переданный обработчик
                            // Блокируем кнопку во время загрузки или если уже добавлен
                            disabled={currentAddStatus?.status === 'loading' || currentAddStatus?.status === 'added'}
                            className={styles.addButton}
                        >
                            {currentAddStatus?.status === 'loading' ? 'Добавление...' :
                             currentAddStatus?.status === 'added' ? 'Добавлен ✓' :
                             'Добавить в друзья'}
                        </button>
                        {/* Показываем сообщение об ошибке, если оно есть */}
                        {currentAddStatus?.status === 'error' && (
                            <span className={styles.addError}>{currentAddStatus.message || 'Ошибка добавления'}</span>
                        )}
                    </>
                )}
                {isAlreadyFriend && <span className={styles.alreadyFriend}>Уже в друзьях</span>}
                {/* Пояснение для организаторов, которых нельзя добавить */}
                {isOrganizer && !isAlreadyFriend && <span className={styles.organizerLabelInfo}>Организатор</span>}
            </div>
        </li>
    );
};

// Основной компонент модального окна поиска
const FindFriend = ({ onClose, onFriendAdded, existingFriendIds }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchError, setSearchError] = useState(null);
    // Состояние для отслеживания статуса добавления КАЖДОГО пользователя в результатах
    const [addFriendStatus, setAddFriendStatus] = useState({}); // { userId1: { status: 'loading' | 'added' | 'error', message? }, userId2: ... }

    // Функция поиска пользователей
    const performSearch = useCallback(async (query) => {
        const trimmedQuery = query.trim();
        // Не ищем, если запрос слишком короткий
        if (!trimmedQuery || trimmedQuery.length < 2) {
            setSearchResults([]); // Очищаем результаты
            return;
        }
        setIsLoading(true);
        setSearchError(null);
        setAddFriendStatus({}); // Сбрасываем статусы добавления при новом поиске
        try {
            console.log(`API: Вызов searchUsers с query=${trimmedQuery}`);
            const results = await searchUsers(trimmedQuery); // Вызываем API поиска
            console.log("Результаты поиска:", results);
            // Убедимся, что результаты - это массив
            setSearchResults(Array.isArray(results) ? results : []);
        } catch (error) {
            console.error("Ошибка поиска пользователей:", error);
            setSearchError("Не удалось выполнить поиск. Попробуйте позже.");
            setSearchResults([]);
        } finally {
            setIsLoading(false);
        }
    }, []); // Пустой массив зависимостей

    // Обработчик отправки формы поиска
    const handleSearchSubmit = (e) => {
        e.preventDefault(); // Предотвращаем перезагрузку страницы
        performSearch(searchQuery);
    };

    // Обработчик клика по кнопке "Добавить в друзья"
    const handleAddFriendClick = useCallback(async (friendToAddId) => {
        // Обновляем статус для конкретного пользователя на 'loading'
        setAddFriendStatus(prev => ({ ...prev, [friendToAddId]: { status: 'loading' } }));
        try {
            console.log(`API: Вызов addFriend с ID=${friendToAddId}`);
            await addFriend(friendToAddId); // Вызываем API добавления
            console.log(`Друг ${friendToAddId} успешно добавлен`);
            // Обновляем статус для пользователя на 'added'
            setAddFriendStatus(prev => ({ ...prev, [friendToAddId]: { status: 'added' } }));

            // ===> ВЫЗЫВАЕМ КОЛЛБЭК РОДИТЕЛЯ (Profile.jsx) <===
            if (onFriendAdded) {
                onFriendAdded(); // Сигнализируем родителю, что нужно обновить список и закрыть окно
            }
            // ===> КОНЕЦ ВЫЗОВА КОЛЛБЭКА <===

        } catch (error) {
            console.error(`Ошибка добавления друга ${friendToAddId}:`, error);
            // Обновляем статус для пользователя на 'error' и сохраняем сообщение
            const errorMessage = error.data?.message || error.message || 'Не удалось добавить друга.';
            setAddFriendStatus(prev => ({ ...prev, [friendToAddId]: { status: 'error', message: errorMessage } }));
        }
        // finally здесь не нужен, т.к. статус 'added' или 'error' должен остаться видимым
    }, [onFriendAdded]); // Зависит от переданной функции onFriendAdded

    return (
        // Оверлей для затемнения фона (закрывает модалку по клику)
        <div className={styles.modalOverlay} onClick={onClose}>
             {/* Контейнер модального окна (клик по нему НЕ закрывает) */}
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                {/* Кнопка закрытия "X" */}
                <button onClick={onClose} className={styles.closeButton} title="Закрыть" aria-label="Закрыть окно поиска">×</button>
                <h2>Поиск пользователей</h2>
                {/* Форма поиска */}
                <form onSubmit={handleSearchSubmit} className={styles.searchForm}>
                    <input
                        type="search"
                        placeholder="Введите имя или email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={styles.searchInput}
                        aria-label="Поле поиска пользователей"
                        autoFocus // Фокус на поле при открытии
                    />
                    <button
                        type="submit"
                        disabled={isLoading || searchQuery.trim().length < 2}
                        className={styles.searchButton}
                    >
                        {isLoading ? 'Поиск...' : 'Найти'}
                    </button>
                </form>

                {/* Отображение ошибки поиска */}
                {searchError && <p className={styles.error}>{searchError}</p>}

                {/* Контейнер с результатами */}
                <div className={styles.resultsContainer}>
                    {/* Индикатор загрузки */}
                    {isLoading && <p className={styles.loadingMessage}>Загрузка...</p>}

                    {/* Список результатов */}
                    {!isLoading && searchResults.length > 0 && (
                        <ul className={styles.resultsList}>
                            {searchResults.map(user => (
                                // Рендерим компонент для каждого найденного пользователя
                                <SearchResultItem
                                    key={user.userId} // Уникальный ключ
                                    user={user}       // Данные пользователя
                                    existingFriendIds={existingFriendIds} // Set ID друзей текущего пользователя
                                    addFriendStatus={addFriendStatus}     // Объект со статусами добавления
                                    onAddFriend={handleAddFriendClick}    // Функция-обработчик клика на "Добавить"
                                />
                            ))}
                        </ul>
                    )}

                    {/* Сообщения об отсутствии результатов или необходимости ввода */}
                    {!isLoading && searchResults.length === 0 && searchQuery.trim().length >= 2 && !searchError && (
                        <p className={styles.noResultsMessage}>Пользователи не найдены.</p>
                    )}
                    {!isLoading && searchQuery.trim().length < 2 && !searchError && (
                        <p className={styles.infoMessage}>Введите минимум 2 символа для поиска.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FindFriend;