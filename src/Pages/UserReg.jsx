import React, { useState } from "react";
import styles from "../styles/UserReg.module.css";
import { useNavigate } from "react-router-dom";
import { registerUser } from '../api/auth';

const API_BASE_URL = "http://localhost:8081";
const UserReg = () => {
    const [email, setEmail] = useState("");
    const [pass, setPass] = useState("");
    const [confirmPass, setConfirmPass] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        // Клиентская валидация
        if (pass !== confirmPass) {
            setError("Пароли не совпадают");
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    username: email,
                    password: pass,
                }),
            });

            const data = await response.json();

            if (response.ok && response.status === 201) {
                // Проверка наличия токенов в ответе
                if (!data.accessToken || !data.refreshToken) {
                    throw new Error("Отсутствуют токены в ответе сервера");
                }

                localStorage.setItem("accessToken", data.accessToken);
                localStorage.setItem("refreshToken", data.refreshToken);
                localStorage.setItem("username", email);

                alert("Регистрация прошла успешно! Вы автоматически вошли в систему.");
                navigate("/UserPage");
            } else {
                setError(data?.message || `Ошибка регистрации: ${response.statusText} (Статус: ${response.status})`);
            }
        } catch (err) {
            console.error("Ошибка:", err);
            setError(err.message || "Не удалось подключиться к серверу. Попробуйте позже.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <form onSubmit={handleSubmit} className={styles.form}>
                <h2>Регистрация</h2>
                
                <label htmlFor="username">Введите свой Email:</label>
                <input
                    type="email"
                    id="username"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="username"
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
                />

                {error && <p className={styles.error}>{error}</p>}
                <button type="submit" disabled={isLoading}>
                    {isLoading ? "Регистрация..." : "Зарегистрироваться"}
                </button>
            </form>
        </div>
    );
};

export default UserReg;