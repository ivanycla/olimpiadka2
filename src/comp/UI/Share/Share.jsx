
    import React from "react";
import {
  EmailShareButton,
  TelegramShareButton,
  VKShareButton,
  VKIcon, 
  TelegramIcon,
  EmailIcon
} from "react-share";
import { Helmet } from "react-helmet-async";

const Share = ({ event }) => {
  const url = "http://localhost:3000/olimpiada/login";
  
  return (
    <>
      <Helmet>
        <title>{event?.title || "Мероприятие"}</title>
        <meta property="og:title" content={event?.title} />
        <meta property="og:description" content={event?.description} />
        <meta property="og:image" content={event?.mediaContentUrl} />
        <meta property="og:url" content={url} />
      </Helmet>

      <div className="share-buttons">
        <VKShareButton url={url} title={event?.title}>
          <VKIcon size={32} round />
        </VKShareButton>
        
        <TelegramShareButton url={url} title={event?.title}>
          <TelegramIcon size={32} round />
        </TelegramShareButton>
        
        <EmailShareButton url={url} subject={event?.title}>
          <EmailIcon size={32} round />
        </EmailShareButton>
      </div>
      </>
  );
};



  export default Share;