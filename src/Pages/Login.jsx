import React, { useState } from "react";  
import { Link, useNavigate } from "react-router-dom";  
import styles from "../styles/Login.module.css";  

const Login = () => {  
    const [email, setEmail] = useState("");  
    const [pass, setPass] = useState("");  
    const [isLoading, setIsLoading] = useState(false);  
    const navigate = useNavigate();  
    const [error, setError] = useState("");  

    const handleSubmit = async (e) => {  
        e.preventDefault(); 
        setIsLoading(true);   
        setError("");  

        
        alert("на сервер отправлять будем ззапрос ");  
        
      
        setIsLoading(false);  
    };  

    return (  
        <div className={styles.container}>  
            <form onSubmit={handleSubmit} className={styles.form}>  
                <p className={styles.title}>Войти</p>  
                <label className={styles.label}>Почта</label>  
                <input  
                    type="email"  
                    value={email}  
                    required  
                    onChange={(e) => setEmail(e.target.value)}  
                    className={styles.input}  
                />  
                <label className={styles.label}>Пароль</label>  
                <input  
                    type="password"  
                    value={pass}  
                    required  
                    onChange={(e) => setPass(e.target.value)}  
                    className={styles.input}  
                />  
                <button type="submit" className={styles.button} disabled={isLoading}>  
                    {isLoading ? 'Загрузка...' : 'Войти'}  
                </button>  
            </form>  
            <div className={styles.links}>  
                <Link to="/UserReg" className={styles.link}>  
                    Зарегайся как юзер  
                </Link>  
                <Link to="/OrgReg" className={styles.link}>  
                    Зарегайся как организатор  
                </Link>  
            </div>  
        </div>  
    );  
};  

export default Login;  