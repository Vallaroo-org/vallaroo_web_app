'use client';

import { useState } from 'react';

interface ShareButtonProps {
  store: {
    whatsapp_number?: string;
    name: string;
  };
}

const ShareButton = ({ store }: ShareButtonProps) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleWhatsAppInquiry = () => {
    if (store.whatsapp_number) {
      const whatsappMessage = encodeURIComponent(`I'm interested in your shop: ${store.name}.`);
      const cleanedWhatsappNumber = store.whatsapp_number.replace(/\D/g, '');
      const whatsappUrl = `https://wa.me/${cleanedWhatsappNumber.startsWith('91') ? cleanedWhatsappNumber : '91' + cleanedWhatsappNumber}?text=${whatsappMessage}`;
      window.open(whatsappUrl, '_blank');
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={copyToClipboard}
        className="bg-blue-500 text-white px-4 py-2 rounded-md"
      >
        {copied ? 'Copied!' : 'Share'}
      </button>
      {store.whatsapp_number && (
        <button
          onClick={handleWhatsAppInquiry}
          className="bg-green-500 text-white px-4 py-2 rounded-md"
        >
          Inquire on WhatsApp
        </button>
      )}
    </div>
  );
};

export default ShareButton;