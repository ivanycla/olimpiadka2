// src/comp/UI/OrgForm/OrgForm.jsx
import React, { useState, useEffect } from 'react';
import styles from "./OrgFrom.module.css"

const OrgForm = ({ onSubmit, initialData = null, isLoading = false, onClose }) => {
    const [formData, setFormData] = useState({
        title: initialData?.title || '',
        description: initialData?.description || '',
        format: initialData?.format || 'OFFLINE',
        locationAddress: initialData?.location?.address || '',
        locationCity: initialData?.location?.city || '',
        startTime: initialData?.startTime 
            ? new Date(new Date(initialData.startTime).getTime() - (new Date().getTimezoneOffset() * 60000)).toISOString().slice(0, 16) 
            : '',
        durationMinutes: initialData?.durationMinutes || '',
        resources: initialData?.resources || '',
        tagsString: initialData?.tags ? initialData.tags.map(tag => tag.name).join(', ') : '',
        mediaContentUrl: initialData?.mediaContentUrl || '',
        latitude: initialData?.location?.latitude || null,
        longitude: initialData?.location?.longitude || null,
    });

    const [geocodeError, setGeocodeError] = useState('');
    const [isGeocoding, setIsGeocoding] = useState(false);

    useEffect(() => {
        if(initialData?.location) {
            setFormData(prev => ({
                ...prev,
                latitude: initialData.location.latitude,
                longitude: initialData.location.longitude
            }));
        }
    }, [initialData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ 
            ...prev, 
            [name]: value,
            ...(name === 'format' && value === 'ONLINE' && { 
                locationAddress: '',
                locationCity: '',
                latitude: null,
                longitude: null
            })
        }));
    };

    const geocodeAddress = async (address) => {
        try {
            const response = await fetch(
                `https://geocode-maps.yandex.ru/1.x/?apikey=${process.env.REACT_APP_YANDEX_MAPS_API_KEY}&format=json&geocode=${encodeURIComponent(address)}`
            );
            
            const data = await response.json();
            const feature = data.response.GeoObjectCollection.featureMember[0]?.GeoObject;
            
            if(!feature) return null;

            const [lng, lat] = feature.Point.pos.split(' ').map(Number);
            const foundAddress = feature.metaDataProperty.GeocoderMetaData.text;
            
            return { 
                lat, 
                lng,
                address: foundAddress
            };
        } catch (error) {
            console.error('Geocoding error:', error);
            return null;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setGeocodeError('');
        setIsGeocoding(true);

        try {
            let coords = null;
            
            // Геокодируем только для оффлайн мероприятий
            if(formData.format === 'OFFLINE') {
                const fullAddress = `${formData.locationCity}, ${formData.locationAddress}`;
                coords = await geocodeAddress(fullAddress);
                
                if(!coords) {
                    setGeocodeError('Не удалось определить координаты по указанному адресу');
                    return;
                }

                // Обновляем адрес из результатов геокодирования
                setFormData(prev => ({
                    ...prev,
                    locationAddress: coords.address.split(', ').slice(1).join(', '),
                    locationCity: formData.locationCity,
                    latitude: coords.lat,
                    longitude: coords.lng
                }));
            }

            const tagsArray = formData.tagsString
                .split(',')
                .map(tag => tag.trim())
                .filter(tag => tag !== '');

            if(tagsArray.length === 0) {
                alert("Пожалуйста, укажите хотя бы один тег.");
                return;
            }

            const submissionData = {
                title: formData.title,
                description: formData.description,
                format: formData.format,
                location: {
                    address: formData.format === 'OFFLINE' ? formData.locationAddress : null,
                    city: formData.format === 'OFFLINE' ? formData.locationCity : null,
                    latitude: formData.format === 'OFFLINE' ? coords.lat : null,
                    longitude: formData.format === 'OFFLINE' ? coords.lng : null,
                },
                startTime: formData.startTime ? new Date(formData.startTime).toISOString() : null,
                durationMinutes: formData.durationMinutes ? parseInt(formData.durationMinutes, 10) : null,
                resources: formData.resources || null,
                mediaContentUrl: formData.mediaContentUrl || null,
                tagNames: tagsArray,
            };

            onSubmit(submissionData);
        } finally {
            setIsGeocoding(false);
        }
    };

    return (
        <div className={styles.formContainer}>
            <form className={styles.form} onSubmit={handleSubmit}>
                <h2 className={styles.formTitle}>
                    {initialData ? 'Редактирование мероприятия' : 'Создание мероприятия'}
                </h2>

                <div className={styles.formGroup}>
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
                </div>

                <div className={styles.formGroup}>
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
                </div>

                <div className={styles.formGroup}>
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
                </div>

                {formData.format === 'OFFLINE' && (
                    <>
                        <div className={styles.formGroup}>
                            <label className={styles.label} htmlFor="locationCity">Город:</label>
                            <input
                                id="locationCity"
                                className={styles.inputField}
                                name="locationCity"
                                value={formData.locationCity}
                                onChange={handleChange}
                                required
                                disabled={isLoading}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label} htmlFor="locationAddress">Адрес:</label>
                            <input
                                id="locationAddress"
                                className={styles.inputField}
                                name="locationAddress"
                                value={formData.locationAddress}
                                onChange={handleChange}
                                required
                                disabled={isLoading}
                                placeholder="Улица, дом, помещение"
                            />
                        </div>
                    </>
                )}

                <div className={styles.formGroup}>
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
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.label} htmlFor="durationMinutes">Длительность (минут):</label>
                    <input
                        id="durationMinutes"
                        className={styles.inputField}
                        type="number"
                        name="durationMinutes"
                        value={formData.durationMinutes}
                        onChange={handleChange}
                        min="1"
                        placeholder="120"
                        disabled={isLoading}
                    />
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.label} htmlFor="resources">Дополнительные ресурсы:</label>
                    <textarea
                        id="resources"
                        className={styles.textareaField}
                        name="resources"
                        value={formData.resources}
                        onChange={handleChange}
                        disabled={isLoading}
                        placeholder="Ссылки, контакты, требования..."
                    />
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.label} htmlFor="tagsString">Теги:</label>
                    <input
                        id="tagsString"
                        className={styles.inputField}
                        name="tagsString"
                        value={formData.tagsString}
                        onChange={handleChange}
                        placeholder="музыка, искусство, выставка"
                        required
                        disabled={isLoading}
                    />
                    <div className={styles.hint}>Укажите через запятую</div>
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.label} htmlFor="mediaContentUrl">URL изображения:</label>
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
                </div>

                {geocodeError && (
                    <div className={styles.error}>
                        ⚠️ {geocodeError}
                    </div>
                )}

                <div className={styles.buttonGroup}>
                    <button 
                        type="submit" 
                        className={styles.submitButton}
                        disabled={isLoading || isGeocoding}
                    >
                        {isGeocoding ? 'Определение координат...' : 
                         isLoading ? 'Сохранение...' : 
                         initialData ? 'Обновить' : 'Создать'}
                    </button>
                    
                    <button
                        type="button"
                        onClick={onClose}
                        className={styles.cancelButton}
                        disabled={isLoading}
                    >
                        Отмена
                    </button>
                </div>
            </form>
        </div>
    );
};

export default OrgForm;