import React, { useState } from "react";
import styles from './AddSpeakerForm.module.css';
import Portal from "../Portal/Portal";
const AddSpeakerForm = ({ onClick,eventId,AddSpeaker }) => {
    const [name, setName] = useState("");
    const [bio, setBio] = useState("");
    const [url, setUrl] = useState(null);
    const [preview, setPreview] = useState(null);

    

    const handleSubmit = (e) => {
        e.preventDefault();
        
        alert("добавь или я потом добавлю отправку ");
        const newSpeaker = {
            eventId:eventId,
            url:url,
            bio:bio,
            name:name,
            id:Date.now()
        }
        AddSpeaker(newSpeaker);
        onClick();
    };

    return (
        <Portal>
        <div className={styles.modalOverlay} onClick={onClick}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <form className={styles.form} onSubmit={handleSubmit}>
                    <label className={styles.label} htmlFor="name">
                        Введите имя:
                        <input
                            className={styles.input}
                            type="text"
                            id="name"
                            name="name"
                            placeholder="Имя"
                            onChange={(e) => setName(e.target.value)}
                            value={name}
                            required
                        />
                    </label>

                    <label className={styles.label} htmlFor="bio">
                        Введите информацию (награды, место работы и т.д.):
                        <input
                            className={styles.input}
                            type="text"
                            id="bio"
                            name="bio"
                            placeholder="Информация"
                            onChange={(e) => setBio(e.target.value)}
                            value={bio}
                            required
                        />
                    </label>

                    <label className={styles.label} htmlFor="photo">
                        Прикрепите ссылку на фотографию:
                        <input
                            className={styles.fileInput}
                            type="url"
                            id="photo"
                            name="photo"
                            onChange={(e)=>setUrl(e.target.value)}
                            value={url}
                            required
                        />
                    </label>
                    

                    <button type="submit" className={styles.button}>
                        Добавить
                    </button>
                </form>
            </div>
        </div>
        </Portal>
    );
};

export default AddSpeakerForm;