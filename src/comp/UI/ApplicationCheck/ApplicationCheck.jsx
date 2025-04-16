import React from "react";

const ApplicationCheck = ({ mock, onClose }) => {
  const handleAccept = async () => {
    try {
      // Реальная логика для принятия
      const response = await fetch(`/api/applications/${mock.id}/accept`, {
        method: 'POST'
      });
      if (response.ok) onClose();
    } catch (error) {
      console.error("Ошибка принятия:", error);
    }
  };

  const handleReject = async () => {
    try {
      // Реальная логика для отклонения
      const response = await fetch(`/api/applications/${mock.id}/reject`, {
        method: 'POST'
      });
      if (response.ok) onClose();
    } catch (error) {
      console.error("Ошибка отклонения:", error);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-button" onClick={onClose}>закрыть</button>
        
        <div className="applicant-info">
          <p><strong>Имя:</strong> {mock.name}</p>
          <p><strong>Организация:</strong> {mock.org}</p>
          <p><strong>Email:</strong> {mock.email}</p>
        </div>

        <div className="action-buttons">
          <button onClick={handleAccept} className="accept-btn">
            Принять
          </button>
          <button onClick={handleReject} className="reject-btn">
            Отклонить
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApplicationCheck;