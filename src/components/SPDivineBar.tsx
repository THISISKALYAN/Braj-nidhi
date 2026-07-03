"use client";

import { useState, useEffect } from "react";

const BAR_HEIGHT = 68;

export default function SPDivineBar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: `${BAR_HEIGHT}px`,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1050,
        pointerEvents: "none",
        transform: scrolled ? `translateY(-${BAR_HEIGHT}px)` : "translateY(0)",
        transition: "transform 0.38s cubic-bezier(0.4,0,0.2,1)",
        background: "transparent",
      }}
    >
      <img loading="lazy" decoding="async" src="/sp logo.webp"
        alt="His Divine Grace Srila Prabhupada"
        style={{
          height: "68px",
          width: "auto",
          objectFit: "contain",
          display: "block",
          filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.22))",
        }} />
    </div>
  );
}
