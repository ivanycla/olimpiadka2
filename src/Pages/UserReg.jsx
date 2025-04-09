import React, { useState } from "react";  
import styles from "../styles/UserReg.module.css";
import { useNavigate } from "react-router-dom";

const UserReg = () => {  
    const [email, setEmail] = useState("");  
    const [pass, setPass] = useState("");  
    const [confirmPass, setConfirmPass] = useState("");  
    const [error, setError] = useState("");  
    const [isLoading, setIsLoading] = useState(false);  
    const navigate = useNavigate();
    const regex = /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/;  

    const handleSubmit = async (e) => {  
        e.preventDefault();  
        setIsLoading(true);  
        setError("");  

        if (pass === confirmPass && regex.test(pass)) {  
            alert("Отправляем на сервачочеккекекекекек");  
            navigate("/login")
        } else {  
            if (pass !== confirmPass) {  
                setError("Пароли не совпадают");  
            } else if (!regex.test(pass)) {  
                setError("Пароль должен содержать хотя бы одну заглавную букву, одну цифру и минимум 8 символов.");  
            }  
        }  
        setIsLoading(false);  
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
                    placeholder="Пароль только на латинице и минимум одна заглавная и одна цифра гы"  
                    value={pass}  
                    onChange={(e) => setPass(e.target.value)}  
                    required  
                />  

                <label htmlFor="confirmPassword">Подтвердите пароль гей:</label>  
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