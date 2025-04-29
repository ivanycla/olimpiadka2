import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom"; // Добавлен Link
import styles from "../styles/OrgReg.module.css";
import { registerOrganizer } from "../api/api"; // <-- ИМПОРТ ИЗ API
import AlertReg from "../comp/UI/AlertReg/AlertReg.jsx"; // Для показа сообщений

const OrgReg = () => {
    const [email, setEmail] = useState("");
    const [pass, setPass] = useState("");
    const [confirmPass, setConfirmPass] = useState("");
    const [orgName, setOrgName] = useState(""); // Используем camelCase
    const [file, setFile] = useState(null);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    // Упрощенная валидация пароля (как на бэкенде)
    const validatePassword = (password) => {
        return password.length >= 6;
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setError(""); // Сбросить ошибку файла, если она была
        } else {
            setFile(null);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccessMessage("");

        // --- Клиентская валидация ---
        if (!file) {
            setError("Пожалуйста, прикрепите документ для подтверждения.");
            return;
        }
        if (pass !== confirmPass) {
            setError("Пароли не совпадают.");
            return;
        }
        if (!validatePassword(pass)) {
            setError("Пароль должен быть не менее 6 символов.");
            return;
        }
        if (!email || !orgName) {
             setError("Пожалуйста, заполните все поля.");
             return;
        }
        // --- Конец клиентской валидации ---

        setIsLoading(true);

        try {
            // Вызываем функцию из api.js для регистрации организатора
            const responseMessage = await registerOrganizer(email, pass, orgName, file);

            // --- УСПЕШНАЯ ОТПРАВКА ЗАЯВКИ (Ожидаем 202 Accepted) ---
            console.log("Organizer registration request submitted successfully:", responseMessage);
            setSuccessMessage(responseMessage || "Заявка на регистрацию организатора успешно отправлена и ожидает модерации. Вы можете войти после одобрения.");

            // Очищаем форму после успеха
            setEmail("");
            setPass("");
            setConfirmPass("");
            setOrgName("");
            setFile(null);
            // Можно очистить input type="file" через ref или замену ключа компонента,
            // но для простоты пока оставим так, пользователь может выбрать другой файл если надо.

             // Можно добавить небольшой таймаут и редирект на страницу логина или главную
             setTimeout(() => {
                 navigate('/login'); // Переход на страницу входа
             }, 3000); // Через 3 секунды

        } catch (err) {
             // Ошибки от api.js (сеть или ответ сервера != 2xx)
            console.error("Organizer registration error:", err);
             // err.message будет содержать текст ошибки от бэкенда (например, "Email уже используется")
            setError(err.message || "Произошла ошибка при отправке заявки.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <form onSubmit={handleSubmit} className={styles.form} encType="multipart/form-data">
                <h2>Регистрация организатора</h2>

                {/* Показ сообщений */}
                {error && <AlertReg isVisible={!!error} message={error} type="error" onClose={() => setError("")} />}
                {successMessage && <AlertReg isVisible={!!successMessage} message={successMessage} type="success" onClose={() => setSuccessMessage("")} />}

                <label htmlFor="email">Введите свой email (логин):</label>
                <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="org.email@example.com"
                    autoComplete="username"
                    disabled={isLoading || !!successMessage}
                />

                <label htmlFor="organization">Название организации:</label>
                <input
                    type="text"
                    id="organization"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    required
                    placeholder="Название вашей компании"
                    disabled={isLoading || !!successMessage}
                />

                <label htmlFor="file">Документ для подтверждения:</label>
                <div className={styles.fileInputContainer}> {/* Добавим контейнер для стилизации */}
                    <input
                        type="file"
                        id="file"
                        onChange={handleFileChange}
                        required
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" // Ограничиваем типы файлов (пример)
                        className={styles.inputFile} // Скрываем стандартный инпут
                        disabled={isLoading || !!successMessage}
                     />
                     {/* Стилизованная кнопка/область */}
                     <label htmlFor="file" className={styles.fileLabel}>
                         {file ? file.name : 'Выбрать файл...'}
                     </label>
                </div>


                <label htmlFor="password">Пароль:</label>
                <input
                    type="password"
                    id="password"
                    placeholder="Минимум 6 символов"
                    value={pass}
                    onChange={(e) => setPass(e.target.value)}
                    required
                    autoComplete="new-password"
                    disabled={isLoading || !!successMessage}
                />

                <label htmlFor="confirmPassword">Подтвердите пароль:</label>
                <input
                    type="password"
                    id="confirmPassword"
                    placeholder="Повторите ваш пароль"
                    value={confirmPass}
                    onChange={(e) => setConfirmPass(e.target.value)}
                    required
                    autoComplete="new-password"
                    disabled={isLoading || !!successMessage}
                />

                <button type="submit" disabled={isLoading || !!successMessage}>
                    {isLoading ? "Отправка..." : "Отправить на модерацию"}
                </button>
            </form>
             {/* Пояснение и ссылка на вход */}
             {!successMessage && (
                 <>
                    <p style={{ color: "#d5d5d5", textAlign: 'center', marginTop: '1rem' }}>
                        После проверки документов модератором вы получите уведомление на email (если настроено) или сможете войти в систему.
                     </p>
                    <p style={{ textAlign: 'center', marginTop: '0.5rem' }}>
                        Уже есть аккаунт? <Link to="/Login">Войти</Link>
                    </p>
                 </>
             )}
        </div>
    );
};

export default OrgReg;