import React, { useState } from "react";  
import { Link,useNavigate } from "react-router-dom";  
import styles from "../styles/Login.module.css";  

const Login = () => {  
    const [email, setEmail] = useState("");  
    const [pass, setPass] = useState("");  
    const [isLoading, setIsLoading] = useState(false);  
    const navigate = useNavigate();  
    // const [error, setError] = useState("");  
     
    const [error, setError] = useState("");  

    const handleSubmit = async (e) => {  
        e.preventDefault(); 
        setIsLoading(true);   
        // setError("");  
        if(localStorage.getItem("email") === email && localStorage.getItem("pass") === pass){
            navigate('/UserPage')
        }
        
        else alert("Неверны пароль или почта, гадай сам, бож")
        if(email==="zalupa@mail.ru"&&pass==="Zalupa1"){
            navigate("/OrgPage")
        }
        // alert("на сервер отправлять будем ззапрос ");//тут запрос на сервер взять от туда юзерid  засторить локально? при навигации на профиль юзерid  отправиь запрос на сервер найти по юзер id???  
        if(email==="zalupa@mail.ru"&&pass==="Zalupa2"){
            navigate("/moder")
        }

        alert("на сервер отправлять будем ззапрос ");//тут запрос на сервер взять от туда юзерid  засторить локально? при навигации на профиль юзерid  отправиь запрос на сервер найти по юзер id???  
        
      
        setIsLoading(false);  
    };  

    return (  
        <div className={styles.container}>  
            <form className={styles.form}>  
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
                <Link to="/UserPage">
                <button type="submit" className={styles.button} onClick={(e) => handleSubmit(e)} disabled={isLoading}>  
                    {isLoading ? 'Загрузка...' : 'Войти'}  
                </button>  
                </Link>
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
