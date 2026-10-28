"use client";
import Script from "next/script";
import { MessageCircle } from "lucide-react";
export function SupportWidget() {
  const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace(/\D/g, "");
  const crisp = process.env.NEXT_PUBLIC_CRISP_WEBSITE_ID;
  return (
    <>
      {number && (
        <a
          href={`https://wa.me/${number}?text=${encodeURIComponent("Hello EasyMoveZone, I need help planning a move.")}`}
          target="_blank"
          rel="noreferrer"
          aria-label="Chat with EasyMoveZone on WhatsApp"
          className="fixed bottom-[calc(var(--mobile-tabbar-h,0px)+env(safe-area-inset-bottom,0px)+16px)] right-4 z-50 min-[961px]:bottom-6 min-[961px]:right-6 flex items-center gap-2 rounded-full bg-[#b85a30] px-5 py-4 text-sm font-bold text-white shadow-lg"
        >
          <MessageCircle size={20} />
          WhatsApp
        </a>
      )}
      {crisp && (
        <Script
          id="crisp-widget"
          strategy="lazyOnload"
        >{`window.$crisp=[];window.CRISP_WEBSITE_ID=${JSON.stringify(crisp)};(function(){var d=document,s=d.createElement("script");s.src="https://client.crisp.chat/l.js";s.async=1;d.head.appendChild(s);})();`}</Script>
      )}
    </>
  );
}
