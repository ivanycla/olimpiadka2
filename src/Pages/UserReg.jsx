import React, { useState } from "react";
import styles from "../styles/UserReg.module.css";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "../api/api";
import AlertReg from "../comp/UI/AlertReg/AlertReg.jsx";

const USER_ROUTE = '/UserPage'; // Используйте '/userpage', если изменили роут на нижний регистр

const UserReg = () => {
    const [email, setEmail] = useState("");
    const [pass, setPass] = useState("");
    const [confirmPass, setConfirmPass] = useState("");
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(""); // <-- Первичная очистка ошибки при старте отправки
        setSuccessMessage("");

        if (pass !== confirmPass) {
            setError("Пароли не совпадают");
            return;
        }

        if (pass.length < 6) {
             setError("Пароль должен быть не менее 6 символов.");
             return;
        }

        setIsLoading(true);

        try {
            // Используем функцию из api.js
            const data = await registerUser(email, pass);
            console.log("Registration successful, received data:", data);

            // --- ДОБАВЛЕНО: Гарантированная очистка ошибки ПОСЛЕ успешного ответа ---
            setError("");
            // ------------------------------------------------------------------------

            // --- УСПЕШНАЯ РЕГИСТРАЦИЯ И АВТО-ЛОГИН ---
            if (data && data.accessToken && data.refreshToken && data.username) {
                localStorage.setItem('accessToken', data.accessToken);
                localStorage.setItem('refreshToken', data.refreshToken);
                localStorage.setItem('username', data.username);
                 if (data.roles && Array.isArray(data.roles)) {
                    localStorage.setItem('roles', JSON.stringify(data.roles));
                 }

                // Установка сообщения об успехе (теперь ошибка точно пуста)
                setSuccessMessage("Регистрация прошла успешно! Вы автоматически вошли в систему.");

                // Небольшая задержка перед редиректом
                setTimeout(() => {
                   navigate(USER_ROUTE); // Перенаправляем на страницу пользователя
                }, 1500);

            } else {
                // Если бэкенд вернул 201, но без данных для авто-логина
                console.error("Registration response OK, but missing login data:", data);
                setError("Регистрация прошла, но не удалось выполнить вход автоматически. Попробуйте войти вручную.");
            }

        } catch (err) {
            // Ошибки от api.js
            console.error("Registration error:", err);
            setError(err.message || "Произошла ошибка при регистрации.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <form onSubmit={handleSubmit} className={styles.form}>
                <h2>Регистрация пользователя</h2>

                {/* Показ сообщений об ошибке или успехе */}
                {/* Эта логика отображения остается прежней, но теперь 'error' будет надежно очищен */}
                {error && <AlertReg isVisible={!!error} message={error} type="error" onClose={() => setError("")} />}
                {successMessage && <AlertReg isVisible={!!successMessage} message={successMessage} type="success" onClose={() => setSuccessMessage("")} />}

                {/* Остальные input и button без изменений */}
                <label htmlFor="email">Email (будет вашим логином):</label>
                <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="your.email@example.com"
                    autoComplete="username"
                    disabled={isLoading || !!successMessage}
                />

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
                    placeholder="Повторите пароль"
                    value={confirmPass}
                    onChange={(e) => setConfirmPass(e.target.value)}
                    required
                    autoComplete="new-password"
                    disabled={isLoading || !!successMessage}
                />

                <button type="submit" disabled={isLoading || !!successMessage}>
                    {isLoading ? "Регистрация..." : "Зарегистрироваться"}
                </button>
            </form>

            <p style={{ textAlign: 'center', marginTop: '1rem' }}>
                Уже есть аккаунт? <Link to="/Login">Войти</Link> {/* Используйте '/login', если изменили роут */}
            </p>
        </div>
    );
};

export default UserReg;