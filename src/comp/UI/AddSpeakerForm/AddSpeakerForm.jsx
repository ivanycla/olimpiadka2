import React, { useState } from "react";
import styles from './AddSpeakerForm.module.css';
import Portal from "../Portal/Portal";
import { addSpeakerToEvent } from "../../../api/api"; // <-- ИМПОРТ API

// Добавляем пропс onSpeakerAdded для обновления родителя
const AddSpeakerForm = ({ onClick, eventId, onSpeakerAdded }) => {
    const [name, setName] = useState("");
    const [information, setInformation] = useState(""); // Переименовал bio в information для соответствия DTO
    const [photoUrl, setPhotoUrl] = useState("");    // Переименовал url в photoUrl
    // const [preview, setPreview] = useState(null); // preview не используется, можно убрать

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);


    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        const speakerData = {
            name: name,
            information: information,
            photoUrl: photoUrl,
            // existingSpeakerId: null, // Если у тебя будет поиск существующих спикеров, это поле пригодится
        };

        try {
            console.log("Отправка данных спикера:", speakerData, "для eventId:", eventId);
            const updatedEventWithSpeakers = await addSpeakerToEvent(eventId, speakerData);
            console.log("Спикер успешно добавлен, ответ сервера:", updatedEventWithSpeakers);
            
            // Вызываем колбэк для обновления списка спикеров в родительском компоненте (Card.jsx)
            // Передаем новый список спикеров из ответа сервера
            if (onSpeakerAdded && updatedEventWithSpeakers && updatedEventWithSpeakers.speakers) {
                onSpeakerAdded(updatedEventWithSpeakers.speakers);
            }
            onClick(); // Закрываем модальное окно
        } catch (err) {
            console.error("Ошибка при добавлении спикера:", err);
            setError(err.message || "Не удалось добавить спикера. Попробуйте снова.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Portal>
        <div className={styles.modalOverlay} onClick={onClick}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <form className={styles.form} onSubmit={handleSubmit}>
                    <h3>Добавить спикера</h3> {/* Добавим заголовок */}
                    {error && <p className={styles.errorMessage}>{error}</p>} {/* Отображение ошибки */}

                    <label className={styles.label} htmlFor="name">
                        Введите имя:
                        <input
                            className={styles.input}
                            type="text"
                            id="name"
                            name="name"
                            placeholder="Имя Фамилия"
                            onChange={(e) => setName(e.target.value)}
                            value={name}
                            required
                        />
                    </label>

                    <label className={styles.label} htmlFor="information"> {/* Изменено с bio на information */}
                        Введите информацию (награды, место работы и т.д.):
                        <textarea // Используем textarea для многострочного ввода
                            className={styles.textarea} // Можно добавить стили для textarea
                            id="information"
                            name="information"
                            placeholder="Краткая информация о спикере..."
                            onChange={(e) => setInformation(e.target.value)}
                            value={information}
                            // required // Сделаем необязательным, как на бэке
                        />
                    </label>

                    <label className={styles.label} htmlFor="photoUrl"> {/* Изменено с photo на photoUrl */}
                        Прикрепите ссылку на фотографию:
                        <input
                            className={styles.input} // Можно использовать тот же стиль что и для других инпутов
                            type="url"
                            id="photoUrl"
                            name="photoUrl"
                            placeholder="https://example.com/photo.jpg"
                            onChange={(e)=>setPhotoUrl(e.target.value)}
                            value={photoUrl}
                            // required // Сделаем необязательным, как на бэке
                        />
                    </label>
                    
                    <button type="submit" className={styles.button} disabled={isLoading}>
                        {isLoading ? "Добавление..." : "Добавить"}
                    </button>
                    <button type="button" className={`${styles.button} ${styles.cancelButton}`} onClick={onClick} disabled={isLoading}>
                        Отмена
                    </button>
                </form>
            </div>
        </div>
        </Portal>
    );
};

export default AddSpeakerForm;