// src/comp/UI/OrgForm/OrgForm.jsx
import React, { useState, useEffect } from 'react';
import styles from "./OrgFrom.module.css"; // Используем стили
// import { getTags } from "../../../api/api"; // Пока не используем загрузку тегов

const OrgForm = ({ onSubmit, initialData = null, isLoading = false ,onClose}) => {
    // Инициализация состояния
    const [formData, setFormData] = useState({
        title: initialData?.title || '',
        description: initialData?.description || '',
        format: initialData?.format || 'OFFLINE',
        locationAddress: initialData?.location?.address || '',
        locationCity: initialData?.location?.city || '',
        startTime: initialData?.startTime ? new Date(new Date(initialData.startTime).getTime() - (new Date().getTimezoneOffset() * 60000)).toISOString().slice(0, 16) : '',
        durationMinutes: initialData?.durationMinutes || '',
        resources: initialData?.resources || '',
        tagsString: initialData?.tags ? initialData.tags.map(tag => tag.name).join(', ') : '',
        mediaContentUrl: initialData?.mediaContentUrl || '',
    });

    // Убрали загрузку тегов, пока не нужна
    // const [availableTags, setAvailableTags] = useState([]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Преобразуем строку тегов в массив имен
        const tagsArray = formData.tagsString
            .split(',')
            .map(tag => tag.trim())
            .filter(tag => tag !== ''); // Убираем пустые строки, если пользователь ввел лишние запятые

        // Проверяем, что есть хотя бы один тег, если это обязательно на бэкенде
        if (tagsArray.length === 0) {
             // Замените alert на использование setError из родительского компонента, если он передан
             alert("Пожалуйста, укажите хотя бы один тег.");
             return; // Прерываем отправку
         }

        const submissionData = {
            title: formData.title,
            description: formData.description,
            format: formData.format,
            location: {
                address: formData.locationAddress || null,
                city: formData.locationCity || null,
                latitude: null, // Пока не используем
                longitude: null, // Пока не используем
            },
            startTime: formData.startTime ? new Date(formData.startTime).toISOString() : null,
            durationMinutes: formData.durationMinutes ? parseInt(formData.durationMinutes, 10) : null,
            resources: formData.resources || null,
            mediaContentUrl: formData.mediaContentUrl || null,
            // --- ИСПРАВЛЕНО: Отправляем МАССИВ строк ---
            tagNames: tagsArray, // <--- Передаем массив строк
            // ----------------------------------------
        };

        onSubmit(submissionData); // Вызываем колбэк родителя
    };

    return (
        <div>
        <form className={styles.form} onSubmit={handleSubmit}>
            
            <label className={styles.label} htmlFor="title">Название:</label>
            <input
                id="title"
                className={styles.inputField}
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                maxLength={255}
                disabled={isLoading}
            />

            <label className={styles.label} htmlFor="description">Описание:</label>
            <textarea
                id="description"
                className={styles.textareaField}
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                disabled={isLoading}
            />

            <label className={styles.label} htmlFor="format">Формат:</label>
            <select
                id="format"
                className={styles.selectField}
                name="format"
                value={formData.format}
                onChange={handleChange}
                required
                disabled={isLoading}
            >
                <option value="OFFLINE">Оффлайн</option>
                <option value="ONLINE">Онлайн</option>
            </select>

             <label className={styles.label} htmlFor="locationAddress">Адрес (если Оффлайн):</label>
             <input
                 id="locationAddress"
                 className={styles.inputField}
                 name="locationAddress"
                 value={formData.locationAddress}
                 onChange={handleChange}
                 placeholder="Улица, дом"
                 disabled={isLoading}
             />
              <label className={styles.label} htmlFor="locationCity">Город:</label>
              <input
                  id="locationCity"
                  className={styles.inputField}
                  name="locationCity"
                  value={formData.locationCity}
                  onChange={handleChange}
                  placeholder="Город"
                  required // Считаем город обязательным
                  disabled={isLoading}
              />

            <label className={styles.label} htmlFor="startTime">Дата и время начала:</label>
            <input
                id="startTime"
                className={styles.inputField}
                type="datetime-local"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                required
                disabled={isLoading}
            />

            <label className={styles.label} htmlFor="durationMinutes">Длительность (в минутах):</label>
            <input
                id="durationMinutes"
                className={styles.inputField}
                type="number"
                name="durationMinutes"
                value={formData.durationMinutes}
                onChange={handleChange}
                min="1"
                placeholder="Например, 120"
                disabled={isLoading}
            />

            <label className={styles.label} htmlFor="resources">Дополнительная информация (ресурсы):</label>
            <textarea
                id="resources"
                className={styles.textareaField}
                name="resources"
                value={formData.resources}
                onChange={handleChange}
                disabled={isLoading}
            />

            <label className={styles.label} htmlFor="tagsString">Теги (через запятую):</label>
            <input
                id="tagsString"
                className={styles.inputField}
                name="tagsString"
                value={formData.tagsString}
                onChange={handleChange}
                placeholder="music, art, conference"
                required // Оставляем обязательным, если бэкенд требует @NotEmpty
                disabled={isLoading}
            />

             <label className={styles.label} htmlFor="mediaContentUrl">URL Изображения:</label>
             <input
                 id="mediaContentUrl"
                 className={styles.inputField}
                 type="url"
                 name="mediaContentUrl"
                 value={formData.mediaContentUrl}
                 onChange={handleChange}
                 placeholder="https://example.com/image.jpg"
                 disabled={isLoading}
             />
    
    <div className={styles.buttonContainer}>
                <button 
                    type="submit" 
                    className={styles.button} 
                    disabled={isLoading}
                >
                    {isLoading ? 'Сохранение...' : (initialData ? 'Обновить' : 'Создать')}
                </button>
                
                <button
                    type="button"
                    onClick={onClose}
                    className={`${styles.button} ${styles.closeButton}`}
                >
                    Закрыть
                </button>
            </div>
        </form>
    </div>
    );
};

export default OrgForm;