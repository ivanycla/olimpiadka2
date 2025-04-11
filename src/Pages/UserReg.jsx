import React, { useState } from "react";
import axios from "axios";
import styles from "../styles/UserReg.module.css";
import { useNavigate } from "react-router-dom";

const UserReg = () => {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const passRegex = /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/;


  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");


    // Валидация пароля
    if (pass !== confirmPass) {
      setError("Пароли не совпадают");
      setIsLoading(false);
      return;
    }

    if (!passRegex.test(pass)) {
      setError("Пароль должен содержать минимум 8 символов, одну заглавную букву и цифру");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("http://100.101.149.152:8081/api/users/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email : email, password: pass })
      }); 
      console.log(response)
      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.message || "Ошибка регистрации");
        return;
      }

      navigate("/login");
    } catch (err) {
      setError("Сервер недоступен. Попробуйте позже."+err);
    } finally {
      setIsLoading(false);
    }
  };
    return (
        <div className={styles.container}>
            <form onSubmit={handleSubmit} className={styles.form}>
                <h2>Регистрация</h2>
                <label htmlFor="email">Введите свой Гмаил:</label>
                <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />

                <label htmlFor="password">Пароль:</label>
                <input
                    type="password"
                    id="password"
                    placeholder="Пароль только на латинице и минимум одна заглавная и одна цифра"
                    value={pass}
                    onChange={(e) => setPass(e.target.value)}
                    required
                />

                <label htmlFor="confirmPassword">Подтвердите пароль:</label>
                <input
                    type="password"
                    id="confirmPassword"
                    placeholder="Пароль только на латинице и минимум одна заглавная и одна цифра"
                    value={confirmPass}
                    onChange={(e) => setConfirmPass(e.target.value)}
                    required
                />

                {error && <p className={styles.error}>{error}</p>}
                <button type="submit" disabled={isLoading}>
                    {isLoading ? "Загрузка..." : "Зарегистрироваться"}
                </button>
            </form>
        </div>
    );
};

export default UserReg;