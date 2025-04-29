import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "../styles/Login.module.css";
import AlertReg from "../comp/UI/AlertReg/AlertReg.jsx";
import { loginUser } from "../api/api";

// Стандартизируем пути навигации
const ADMIN_ROUTE = '/moder';
const ORGANIZER_ROUTE = '/Org'; // Использовать этот же путь в App.js/Router
const USER_ROUTE = '/UserPage'; // Использовать этот же путь в App.js/Router

const Login = () => {
    const [email, setEmail] = useState("");
    const [pass, setPass] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const data = await loginUser(email, pass);
            console.log("Login successful, received data:", data); // <-- ЛОГ ДЛЯ ПРОВЕРКИ ОТВЕТА

            // Усиленная проверка данных
            if (data && data.accessToken && data.refreshToken && data.username && Array.isArray(data.roles)) {
                localStorage.setItem('accessToken', data.accessToken);
                localStorage.setItem('refreshToken', data.refreshToken);
                localStorage.setItem('username', data.username);
                localStorage.setItem('roles', JSON.stringify(data.roles)); // Сохраняем роли как JSON-строку

                console.log("Roles received:", data.roles); // <-- ЛОГ РОЛЕЙ

                // Перенаправление на основе ролей
                if (data.roles.includes('ROLE_ADMIN')) {
                    console.log("Redirecting to Admin page...");
                    navigate(ADMIN_ROUTE);
                } else if (data.roles.includes('ROLE_ORGANIZER')) {
                     console.log("Redirecting to Organizer page...");
                    navigate(ORGANIZER_ROUTE);
                } else if (data.roles.includes('ROLE_USER')) {
                     console.log("Redirecting to User page...");
                    navigate(USER_ROUTE);
                } else {
                    // Если есть токен, но роль не опознана, переходим на страницу пользователя
                    console.warn("User role not recognized, redirecting to default user page.");
                    navigate(USER_ROUTE);
                }
            } else {
                // Сценарий, когда ответ 200 ОК, но данные неполные
                console.error("Login response OK, but missing required data:", data);
                setError("Не удалось получить полные данные для входа. Попробуйте еще раз или свяжитесь с поддержкой.");
            }

        } catch (err) {
            console.error("Login error:", err);
            // Используем статус и сообщение из ошибки, сформированной в api.js
            if (err.status === 401) {
                setError("Неверный email или пароль.");
            } else {
                setError(err.message || "Произошла ошибка при входе.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            {/* Используем AlertReg или другой компонент для ошибок */}
            {error && <AlertReg isVisible={!!error} message={error} onClose={() => setError(null)} />}

            <form className={styles.form} onSubmit={handleSubmit}>
                <p className={styles.title}>Войти</p>
                <label className={styles.label}>Email (Ваш логин)</label>
                <input
                    type="email"
                    value={email}
                    required
                    onChange={(e) => setEmail(e.target.value)}
                    className={styles.input}
                    autoComplete="username"
                    placeholder="user@example.com"
                />
                <label className={styles.label}>Пароль</label>
                <input
                    type="password"
                    value={pass}
                    required
                    onChange={(e) => setPass(e.target.value)}
                    className={styles.input}
                    autoComplete="current-password"
                    placeholder="Ваш пароль"
                />
                <button type="submit" className={styles.button} disabled={isLoading}>
                    {isLoading ? 'Вход...' : 'Войти'}
                </button>
            </form>
            <div className={styles.links}>
                <Link to="/UserReg" className={styles.link}>
                    Зарегистрироваться как пользователь
                </Link>
                <Link to="/OrgReg" className={styles.link}>
                    Зарегистрироваться как организатор
                </Link>
            </div>
        </div>
    );
};

export default Login;