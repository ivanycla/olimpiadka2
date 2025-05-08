import React from "react";
import {
  EmailShareButton,
  TelegramShareButton,
  VKShareButton,
  VKIcon, 
  TelegramIcon,
  EmailIcon
} from "react-share";

const Share = ({ event }) => {
  const url = event?.url || "https://example.com/olimpiada/login"; // Используй реальный URL

  return (
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
  );
};

export default Share;
