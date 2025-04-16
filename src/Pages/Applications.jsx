import React, { useState, useEffect } from "react";
import ApplicationCheck from "../comp/UI/ApplicationCheck/ApplicationCheck";

const Applications = () => {
  const [application, setApplication] = useState(null);
  const [view, setView] = useState(false);
  const [mock, setMock] = useState({
    id: 1, // Добавлен ID для запросов
    name: "ueva",
    email: "asdasd",
    org: "sadasdsa",
    file: null
  });

  // Загрузка данных с сервера (пример)
  {/* useEffect(() => {
    const fetchApplication = async () => {
      try {
        const response = await fetch('/api/application');
        const data = await response.json();
        setApplication(data);
      } catch (error) {
        console.error('Ошибка загрузки заявки:', error);
      }
    };
    
    fetchApplication();
  }, []);
  */}
  // if (!application) return <div>Загрузка данных...</div>;

  return (
    <div className="application-container">
      <div className="application-preview">
        <h3>{mock.name}</h3> {/* Исправлено с application.applicantName на mock.name */}
        <button onClick={() => setView(true)}>
          Просмотреть заявку
        </button>
      </div>

      {view && (
        <ApplicationCheck
          mock={mock}
          onClose={() => setView(false)}
        />
      )}
    </div>
  );
};

export default Applications;