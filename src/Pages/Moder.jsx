// src/pages/Moder.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom'; // useNavigate все еще нужен для редиректов при ошибках
import {
    getPendingOrganizations, downloadOrgDocument, approveOrganization, rejectOrganization,
    getPendingEvents, approveEvent, rejectEvent
} from '../api/api';
import AlertReg from '../comp/UI/AlertReg/AlertReg.jsx';
import Card from '../comp/UI/Card/Card.jsx';
import styles from '../styles/Moder.module.css';

const Moder = () => {
    const navigate = useNavigate();
    // Состояния организаций
    const [pendingOrgs, setPendingOrgs] = useState([]);
    const [orgsLoading, setOrgsLoading] = useState(true);
    const [orgsError, setOrgsError] = useState(null);
    const [orgActionState, setOrgActionState] = useState({});

    // Состояния событий
    const [pendingEvents, setPendingEvents] = useState([]);
    const [eventsLoading, setEventsLoading] = useState(true);
    const [eventsError, setEventsError] = useState(null);
    const [eventActionState, setEventActionState] = useState({});

    // --- Функции загрузки ---
    const fetchPendingOrgs = useCallback(async () => {
        setOrgsLoading(true); setOrgsError(null);
        try {
            const data = await getPendingOrganizations();
            setPendingOrgs(data || []);
        } catch (err) {
            console.error("Ошибка загрузки организаций:", err);
            setOrgsError(err.message || "Не удалось загрузить заявки.");
            if (err.status === 401 || err.status === 403) navigate('/login');
        } finally {
            setOrgsLoading(false);
        }
    }, [navigate]);

    const fetchPendingEvents = useCallback(async () => {
        setEventsLoading(true); setEventsError(null);
        try {
            const data = await getPendingEvents();
            setPendingEvents(data?.content || []);
        } catch (err) {
            console.error("Ошибка загрузки событий:", err);
            setEventsError(err.message || "Не удалось загрузить мероприятия.");
             if (err.status === 401 || err.status === 403) navigate('/login');
        } finally {
            setEventsLoading(false);
        }
    }, [navigate]);

    useEffect(() => {
        if (!localStorage.getItem('accessToken')) { navigate('/login'); return; }
        fetchPendingOrgs();
        fetchPendingEvents();
    }, [fetchPendingOrgs, fetchPendingEvents, navigate]);

    // --- Общая функция установки состояния действия ---
    const setActionLoadingState = (stateSetter, id, loading, errorMsg = null) => {
        stateSetter(prev => ({
            ...prev,
            [id]: { loading, error: errorMsg }
        }));
    };

    // --- Обработчики для Организаций ---
    const handleDownload = useCallback(async (orgId, orgName) => {
        // ... (код без изменений) ...
         setActionLoadingState(setOrgActionState, orgId, true, 'Загрузка документа...');
        try {
            const blob = await downloadOrgDocument(orgId);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `document_${orgId}_${orgName.replace(/\s+/g, '_')}.pdf`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
            setActionLoadingState(setOrgActionState, orgId, false, null);
        } catch (err) {
            console.error(`Error downloading document for org ${orgId}:`, err);
            setActionLoadingState(setOrgActionState, orgId, false, `Ошибка скачивания: ${err.message}`);
        }
    }, []);

    const handleApproveOrg = useCallback(async (orgId, orgName) => {
        // ... (код без изменений) ...
         if (!window.confirm(`Одобрить организацию "${orgName}"?`)) return;
        setActionLoadingState(setOrgActionState, orgId, true, null);
        try {
            await approveOrganization(orgId);
            setPendingOrgs(prev => prev.filter(org => org.organizationId !== orgId));
        } catch (err) {
             console.error(`Error approving org ${orgId}:`, err);
             setActionLoadingState(setOrgActionState, orgId, false, `Ошибка одобрения: ${err.message}`);
        }
    }, []);

    const handleRejectOrg = useCallback(async (orgId, orgName) => {
        // ... (код без изменений) ...
         const reason = prompt(`Причина отклонения для "${orgName}" (необязательно)?`);
        if (reason === null) return;
        setActionLoadingState(setOrgActionState, orgId, true, null);
        try {
            await rejectOrganization(orgId, reason || null);
            setPendingOrgs(prev => prev.filter(org => org.organizationId !== orgId));
        } catch (err) {
             console.error(`Error rejecting org ${orgId}:`, err);
             setActionLoadingState(setOrgActionState, orgId, false, `Ошибка отклонения: ${err.message}`);
        }
    }, []);

    // --- Обработчики для Событий ---
    const handleApproveEvent = useCallback(async (eventId, eventTitle) => {
        // ... (код без изменений) ...
         if (!window.confirm(`Одобрить мероприятие "${eventTitle}"?`)) return;
        setActionLoadingState(setEventActionState, eventId, true, null);
        try {
            await approveEvent(eventId);
            setPendingEvents(prev => prev.filter(event => event.id !== eventId));
        } catch (err) {
             console.error(`Error approving event ${eventId}:`, err);
             setActionLoadingState(setEventActionState, eventId, false, `Ошибка: ${err.message}`);
        }
    }, []);

    const handleRejectEvent = useCallback(async (eventId, eventTitle) => {
        // ... (код без изменений) ...
         const reason = prompt(`Причина отклонения для "${eventTitle}" (необязательно)?`);
        if (reason === null) return;
        setActionLoadingState(setEventActionState, eventId, true, null);
        try {
            await rejectEvent(eventId, reason || null);
            setPendingEvents(prev => prev.filter(event => event.id !== eventId));
        } catch (err) {
             console.error(`Error rejecting event ${eventId}:`, err);
             setActionLoadingState(setEventActionState, eventId, false, `Ошибка: ${err.message}`);
        }
    }, []);

    // --- Рендеринг Секций ---
    const renderOrgModeration = () => {
        // ... (код без изменений) ...
         if (orgsLoading) return <p className={styles.loadingText}>Загрузка заявок организаций...</p>;
        if (orgsError) return <AlertReg isVisible={true} message={orgsError} type="error" onClose={() => setOrgsError(null)}>OK</AlertReg>;
        if (pendingOrgs.length === 0) return <p className={styles.noItemsText}>Нет организаций, ожидающих модерации.</p>;

        return (
            <div className={styles.cardsContainer}>
                {pendingOrgs.map(org => {
                    const currentActionState = orgActionState[org.organizationId] || { loading: false, error: null };
                    return (
                        <div key={org.organizationId} className={styles.moderationCard}>
                            <div className={styles.cardInfo}>
                                <h3 className={styles.cardTitle}>{org.organizationName || 'Нет имени'}</h3>
                                <p><strong>Пользователь:</strong> {org.applicantUsername || '???'}</p>
                                {currentActionState.error && (
                                    <span className={styles.actionError}>{currentActionState.error}</span>
                                )}
                            </div>
                            <div className={styles.cardActions}>
                                <button
                                    onClick={() => handleDownload(org.organizationId, org.organizationName)}
                                    disabled={currentActionState.loading}
                                    className={`${styles.actionButton} ${styles.downloadButton}`}
                                    title="Скачать подтверждающий документ"
                                >
                                    {currentActionState.loading && currentActionState.error?.includes('Загрузка') ? 'Загрузка...' : 'Документ'}
                                </button>
                                <button
                                    onClick={() => handleApproveOrg(org.organizationId, org.organizationName)}
                                    disabled={currentActionState.loading}
                                    className={`${styles.actionButton} ${styles.approveButton}`}
                                >
                                    {currentActionState.loading ? '...' : 'Одобрить'}
                                </button>
                                <button
                                    onClick={() => handleRejectOrg(org.organizationId, org.organizationName)}
                                    disabled={currentActionState.loading}
                                    className={`${styles.actionButton} ${styles.rejectButton}`}
                                >
                                   {currentActionState.loading ? '...' : 'Отклонить'}
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    const renderEventModeration = () => {
        // ... (код без изменений) ...
         if (eventsLoading) return <p className={styles.loadingText}>Загрузка мероприятий...</p>;
         if (eventsError) return <AlertReg isVisible={true} message={eventsError} type="error" onClose={() => setEventsError(null)}>OK</AlertReg>;
         if (pendingEvents.length === 0) return <p className={styles.noItemsText}>Нет мероприятий на модерации.</p>;

         return (
             <div className={styles.eventCardsContainer}>
                  {pendingEvents.map(event => {
                      const currentActionState = eventActionState[event.id] || { loading: false, error: null };
                      return (
                          <div key={event.id} className={styles.eventModerationItem}>
                              <Card event={event} isLog={true} isOrganizerView={true} />
                              <div className={styles.moderationControls}>
                                   {currentActionState.error && (
                                       <span className={styles.actionError}>{currentActionState.error}</span>
                                   )}
                                   <div className={styles.cardActions}>
                                       <button onClick={() => handleApproveEvent(event.id, event.title)}
                                               disabled={currentActionState.loading}
                                               className={`${styles.actionButton} ${styles.approveButton}`}>
                                           {currentActionState.loading ? '...' : 'Одобрить'}
                                       </button>
                                       <button onClick={() => handleRejectEvent(event.id, event.title)}
                                               disabled={currentActionState.loading}
                                               className={`${styles.actionButton} ${styles.rejectButton}`}>
                                          {currentActionState.loading ? '...' : 'Отклонить'}
                                       </button>
                                  </div>
                              </div>
                          </div>
                      );
                  })}
             </div>
         );
     };

    // --- УДАЛЕНА ФУНКЦИЯ handleProfile ---

    // --- Финальный Рендеринг ---
    return (
        <div className={styles.moderContainer}>
             {/* ИЗМЕНЕН ЗАГОЛОВОК: УДАЛЕНА КНОПКА */}
             <div className={styles.header}>
                 <h1>Страница Модерации</h1>
                 {/* Кнопка удалена */}
            </div>

            {/* Раздел модерации организаций */}
            <div className={styles.section}>
                <h2>Заявки Организаторов</h2>
                <div className={styles.content}>
                    {renderOrgModeration()}
                </div>
            </div>

             <hr className={styles.divider} />

             {/* Раздел модерации событий */}
            <div className={styles.section}>
                 <h2>Мероприятия на Модерации</h2>
                 <div className={styles.content}>
                     {renderEventModeration()}
                 </div>
             </div>
        </div>
    );
};

export default Moder;