// src/comp/UI/InviteFriendModal/InviteFriendModal.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { getMyFriendIds, getUserProfileById, registerFriendForEvent } from '../../../api/api'; // <--- ЗАМЕНИЛИ inviteFriendToEvent
import styles from './InviteFriendModal.module.css';

const InviteFriendModal = ({ eventId, eventTitle, onClose }) => {
    // ... состояния friends, isLoading, error, inviteStatus ...

    // Загрузка списка друзей (без изменений)
    const fetchFriendsData = useCallback(async () => { /* ... */ });
    useEffect(() => { fetchFriendsData(); }, [fetchFriendsData]);

    // ===> ИЗМЕНЕННЫЙ ОБРАБОТЧИК <===
    const handleRegisterFriend = async (friendId) => {
        setInviteStatus(prev => ({ ...prev, [friendId]: { status: 'loading' } })); // Используем то же состояние 'inviteStatus'
        try {
            await registerFriendForEvent(eventId, friendId); // <--- ВЫЗЫВАЕМ НОВУЮ ФУНКЦИЮ API
            setInviteStatus(prev => ({ ...prev, [friendId]: { status: 'invited' } })); // Используем статус 'invited' для обозначения успеха
             // Можно добавить уведомление об успехе
        } catch (err) {
            console.error(`Ошибка регистрации друга ${friendId} на событие ${eventId}:`, err);
            // Показываем ошибку (например, "Друг уже участвует")
            setInviteStatus(prev => ({
                ...prev,
                [friendId]: { status: 'error', message: err.message || 'Не удалось зарегистрировать' }
            }));
        }
    };
    // ===> КОНЕЦ ИЗМЕНЕНИЯ <===


    return (
        <div className={styles.inviteModal}>
            <div className={styles.modalContent}>
                <button onClick={onClose} className={styles.closeButton}>×</button>
                {/* ИЗМЕНИЛИ ЗАГОЛОВОК */}
                <h2>Зарегистрировать друга на "{eventTitle || 'Мероприятие'}"</h2>

                {error && <p className={styles.error}>{error}</p>}
                {isLoading && <p>Загрузка друзей...</p>}

                {!isLoading && !error && friends.length > 0 && (
                    <ul className={styles.friendList}>
                        {friends.map(friend => {
                            const currentStatus = inviteStatus[friend.userId];
                            // Друга можно регистрировать только один раз (или если была ошибка)
                            const isActionDisabled = currentStatus?.status === 'loading' || currentStatus?.status === 'invited';
                            return (
                                <li key={friend.userId} className={styles.friendItem}>
                                    <span className={styles.friendName}>
                                        {friend.displayName || friend.username}
                                    </span>
                                    <div className={styles.inviteAction}>
                                        <button
                                            onClick={() => handleRegisterFriend(friend.userId)} // <--- ВЫЗЫВАЕМ НОВЫЙ ОБРАБОТЧИК
                                            disabled={isActionDisabled}
                                            className={styles.inviteButton} // Можно переименовать стиль или оставить
                                        >
                                            {currentStatus?.status === 'loading' ? 'Регистрация...' :
                                            currentStatus?.status === 'invited' ? 'Зарегистрирован' :
                                            'Зарегистрировать'}
                                        </button>
                                        {currentStatus?.status === 'error' && (
                                            <span className={styles.inviteError}>{currentStatus.message}</span>
                                        )}
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                )}
                 {/* ... сообщения об отсутствии друзей ... */}
            </div>
        </div>
    );
};

export default InviteFriendModal;