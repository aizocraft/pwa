import React from "react";
import { FloatingWhatsApp } from "react-floating-whatsapp";

const WhatsAppButton: React.FC = () => {
  return (
    <FloatingWhatsApp
      phoneNumber="254741653862"
      accountName="Plasma Water Africa"
      chatMessage="Hi there! 👋 How can we assist you today?"
      statusMessage="Typically replies within 30 minutes"
      placeholder="Type your message..."
      avatar="/logo.png"
      darkMode={false}
    />
  );
};

export default WhatsAppButton;
