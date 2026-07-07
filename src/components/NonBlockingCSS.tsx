"use client";
import { useEffect } from "react";

export default function NonBlockingCSS() {
  useEffect(() => {
    const loadStyle = (href: string) => {
      if (document.querySelector(`link[href="${href}"]`)) return;
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = href;
      document.head.appendChild(link);
    };
    loadStyle("https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css");
    loadStyle("https://cdn.jsdelivr.net/npm/swiper@10/swiper-bundle.min.css");
  }, []);
  return null;
}
