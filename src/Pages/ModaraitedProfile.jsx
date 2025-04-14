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
        name="zalupa"
        description="Хуйня"
        format="онлайн"
        place="хз где"
        duration="залупа"
        date="завтра"
        info="я ебу"
        tags={["хуйня", "залупа"]}
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