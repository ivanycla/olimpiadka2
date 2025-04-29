// src/pages/CreateEvent.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import OrgForm from '../comp/UI/OrgForm/OrgFrom'; // Импортируем форму
import AlertReg from '../comp/UI/AlertReg/AlertReg.jsx'; // Для ошибок
import { createEvent } from '../api/api'; // Импортируем функцию API
import styles from "../styles/CreateEvent.module.css"; // Стили для страницы

const PROFILE_ORG_ROUTE = '/ProfileOrg'; // Куда перенаправить после успеха

const CreateEvent = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [close,setClose]=useState(false);
    const handleCreateSubmit = async (eventData) => {
        setIsLoading(true);
        setError(null);
        console.log("Submitting event data:", eventData); // Лог данных перед отправкой

        try {
            const createdEvent = await createEvent(eventData);
            console.log("Event created successfully:", createdEvent);
            // Перенаправляем на страницу профиля организатора после успеха
            navigate(PROFILE_ORG_ROUTE);
            // Можно показать сообщение об успехе, но редирект важнее
        } catch (err) {
            console.error("Error creating event:", err);
            setError(err.message || "Не удалось создать мероприятие.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        // Используем стили контейнера, похожие на другие страницы
        <div className={styles.createEventContainer}>
             {/* Ошибка будет показана над формой */}
             {error && <AlertReg isVisible={true} message={error} type="error" onClose={() => setError(null)}>OK</AlertReg>}

            
            <OrgForm
                onSubmit={handleCreateSubmit}
                isLoading={isLoading}
                onClose={() => navigate("/ProfileOrg")}
                // initialData можно передавать для формы редактирования
            />
        </div>
    );
}

export default CreateEvent;