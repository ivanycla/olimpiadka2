import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "../styles/Login.module.css";

const API_BASE_URL = "http://localhost:8081";

const Login = () => {
    const [email, setEmail] = useState("");
    const [pass, setPass] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const handleSubmit =()=>{
        if(email==="zalupa@mail.ru"&& pass==="Zalupa2"){
            navigate("/Moder")
        }
    }
    {/*const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
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

            if (response.ok) {
                if (!data.accessToken || !data.refreshToken) {
                    throw new Error("Отсутствуют токены в ответе сервера");
                }

                localStorage.setItem("accessToken", data.accessToken);
                localStorage.setItem("refreshToken", data.refreshToken);
                localStorage.setItem("username", email);

                alert("Вход выполнен успешно!");
                navigate("/UserPage");
            } else {
                setError(data?.message || data?.error || "Неверное имя пользователя или пароль.");
            }
        } catch (err) {
            console.error("Ошибка:", err);
            setError(err.message || "Не удалось подключиться к серверу. Попробуйте позже.");
        } finally {
            setIsLoading(false);
        }
    };
*/}
    return (
        <div className={styles.container}>
            <form onSubmit={handleSubmit} className={styles.form}>
                <p className={styles.title}>Войти</p>

                {error && <p className={styles.error}>{error}</p>}

                <label className={styles.label} htmlFor="login-email">
                    Почта (имя пользователя)
                </label>
                <input
                    type="email"
                    id="login-email"
                    value={email}
                    required
                    onChange={(e) => setEmail(e.target.value)}
                    className={styles.input}
                    autoComplete="username"
                />

                <label className={styles.label} htmlFor="login-password">
                    Пароль
                </label>
                <input
                    type="password"
                    id="login-password"
                    value={pass}
                    required
                    onChange={(e) => setPass(e.target.value)}
                    className={styles.input}
                    autoComplete="current-password"
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