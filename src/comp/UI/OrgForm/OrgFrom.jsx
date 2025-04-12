import React, { useState } from 'react';  
import styles from "../OrgForm/OrgFrom.module.css"

const OrgForm = ({ onSubmit }) => {  
  const [formData, setFormData] = useState({  
    name: '',  
    description: '',  
    format: 'offline',  
    place: '',  
    duration: '',  
    date: '',  
    info: '',  
    tags: '',  
    img: null  
  });  

  const handleChange = (e) => {  
    const { name, value, files } = e.target;  
    setFormData(prev => ({  
      ...prev,  
      [name]: files ? files[0] : value  
    }));  
  };  

  const handleSubmit = (e) => {  
    e.preventDefault();  
    const tagsArray = formData.tags.split(',').map(tag => tag.trim());  
    onSubmit({  
      ...formData,  
      tags: tagsArray  
    });  
  };  

  return (  
    <form className={styles.form} onSubmit={handleSubmit}>  
      <h2 className={styles.header}>Создание мероприятия</h2>  

      <label className={styles.label}>Название:</label>  
      <input  
        className={styles.inputField}  
        name="name"  
        value={formData.name}  
        onChange={handleChange}  
        required  
      />  

      <label className={styles.label}>Описание:</label>  
      <textarea  
        className={styles.textareaField}  
        name="description"  
        value={formData.description}  
        onChange={handleChange}  
        required  
      />  

      <label className={styles.label}>Формат:</label>  
      <select  
        className={styles.selectField}  
        name="format"  
        value={formData.format}  
        onChange={handleChange}  
      >  
        <option value="offline">Оффлайн</option>  
        <option value="online">Онлайн</option>  
      </select>  

      <label className={styles.label}>Место проведения:</label>  
      <input  
        className={styles.inputField}  
        name="place"  
        value={formData.place}  
        onChange={handleChange}  
        required  
      />  

      <label className={styles.label}>Длительность:</label>  
      <input  
        className={styles.inputField}  
        name="duration"  
        value={formData.duration}  
        onChange={handleChange}  
        required  
      />  

      <label className={styles.label}>Дата:</label>  
      <input  
        className={styles.inputField}  
        type="date"  
        name="date"  
        value={formData.date}  
        onChange={handleChange}  
        required  
      />  

      <label className={styles.label}>Дополнительная информация:</label>  
      <textarea  
        className={styles.textareaField}  
        name="info"  
        value={formData.info}  
        onChange={handleChange}  
      />  

      <label className={styles.label}>Теги (через запятую):</label>  
      <input  
        className={styles.inputField}  
        name="tags"  
        value={formData.tags}  
        onChange={handleChange}  
        placeholder="music, art, conference"  
      />  

      <label className={styles.label}>Изображение:</label>  
      <input  
        className={styles.inputField}  
        type="file"  
        name="img"  
        onChange={handleChange}  
        accept="image/*"  
      />  

      <button className={styles.button} type="submit">  
        Создать мероприятие  
      </button>  
    </form>  
  );  
};  

export default OrgForm;  