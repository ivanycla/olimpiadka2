import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../styles/OrgReg.module.css"
const OrgReg = () => {
    const [email, setEmail] = useState("");
    const [pass, setPass] = useState("");
    const [confirmPass, setConfirmPass] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [org, setOrg] = useState("");
    const [file, setFile] = useState(null);
    const navigate = useNavigate();
    const regex = /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

       
        if (!file) {
            setError("Пожалуйста, прикрепите документ для подтверждения");
            setIsLoading(false);
            return;
        }

        if (pass === confirmPass && regex.test(pass)){

            alert("Ну отправляем там хуе мое ну и добавить чтобы на почту сообщение приходли");
            navigate("/login");
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
                <h2>Регистрация организатора</h2>
                
                <label htmlFor="email">Введите свой email:</label>
                <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />

                <label htmlFor="organization">Название организации:</label>
                <input
                    type="text"
                    id="organization"
                    value={org}
                    onChange={(e) => setOrg(e.target.value)}
                    required
                />

            <div className={styles.fileInput}>
            <input 
            type="file" 
            id="file" 
            onChange={(e) => setFile(e.target.files[0])}
            required
             />
            <label htmlFor="file">
            {file ? file.name : 'Выберите файл для подтверждения'}
            </label>
</div>

                <label htmlFor="password">Пароль:</label>
                <input
                    type="password"
                    id="password"
                    placeholder="Пароль должен содержать минимум 8 символов, одну заглавную букву и одну цифру"
                    value={pass}
                    onChange={(e) => setPass(e.target.value)}
                    required
                />

                <label htmlFor="confirmPassword">Подтвердите пароль:</label>
                <input
                    type="password"
                    id="confirmPassword"
                    placeholder="Повторите ваш пароль"
                    value={confirmPass}
                    onChange={(e) => setConfirmPass(e.target.value)}
                    required
                />

                {error && <p className={styles.error}>{error}</p>}
                <button type="submit" disabled={isLoading}>
                    {isLoading ? "Загрузка..." : "Отправить на модерацию"}
                </button>
            </form>
            <p>После проверки документов модератором вам придёт уведомление на email</p>
        </div>
    );
};

export default OrgReg;