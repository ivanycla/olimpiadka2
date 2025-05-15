import React, { useState } from "react";
import Card from "../comp/UI/Card/Card";
import NotificationForm from "../comp/UI/NotificationForm/NotificationForm";

const ModaraitedProfile = () => {
  const [flagNotif, setFlagNotif] = useState(false);
  
  const handleNotification = () => {
    setFlagNotif(true);
  };

  const handleCloseNotification = () => {
    setFlagNotif(false);
  };

  return (
    <div>
      <div>
        <p>Имя: залупа</p>
        <p>Email: chmo</p>
      </div>
      
      <Card
        name="name"
        description="description"
        format="format"
        place="place"
        duration="duration"
        date="date"
        info="info"
        tags={["tag1", "tag2"]}
      />
        {flagNotif && (
        <NotificationForm 
        onClose={() => setFlagNotif(false)}
        />
      )}
      <button onClick={handleNotification}>Отправить предупреждение</button>
      
    
    </div>
  );
};

export default ModaraitedProfile;