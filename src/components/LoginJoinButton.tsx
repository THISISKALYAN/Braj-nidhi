"use client";
import React from 'react';

interface LoginJoinButtonProps {
  onClick: () => void;
  className?: string;
  label?: string;
}

export default function LoginJoinButton({ onClick, className = '', label = 'Login / Join' }: LoginJoinButtonProps) {
  return (
    <>
      <style>{`
        .ljb-btn,
        .ljb-btn *,
        .ljb-btn :after,
        .ljb-btn :before,
        .ljb-btn:after,
        .ljb-btn:before {
          border: 0 solid;
          box-sizing: border-box;
        }
        .ljb-btn {
          -webkit-tap-highlight-color: transparent;
          background-color: #000;
          background-image: none;
          color: #fff;
          cursor: pointer;
          font-family: var(--font-outfit), ui-sans-serif, system-ui, sans-serif;
          font-size: 13px;
          font-weight: 900;
          letter-spacing: 0.08em;
          line-height: 1.5;
          margin: 0;
          padding: 0.55rem 1.4rem;
          perspective: 800px;
          position: relative;
          text-transform: uppercase;
          transform-style: preserve-3d;
          display: inline-block;
          white-space: nowrap;
          border: none;
          outline: none;
        }
        .ljb-btn span {
          background: #fff;
          color: #000;
          display: grid;
          inset: 0;
          place-items: center;
          position: absolute;
          transform: rotateX(0deg);
          transform-origin: top center;
          transition: transform 0.2s;
          font-size: 13px;
          font-weight: 900;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          font-family: var(--font-outfit), ui-sans-serif, sans-serif;
        }
        .ljb-btn:hover span {
          transform: rotateX(35deg);
        }
        .ljb-btn:before {
          background: #ddd;
          content: "";
          height: 100%;
          left: 0;
          position: absolute;
          top: 0;
          transform: rotateX(0deg);
          width: 100%;
          z-index: -1;
        }
        .ljb-btn:after {
          background: #bbb;
          content: "";
          height: 100%;
          left: 0;
          position: absolute;
          top: 0;
          width: 0;
          z-index: -1;
        }
        .ljb-btn:hover:after {
          animation: ljb-progress 1.2s forwards;
        }
        @keyframes ljb-progress {
          0%   { opacity:1; width:0; }
          10%  { opacity:1; width:15%; }
          25%  { opacity:1; width:25%; }
          40%  { opacity:1; width:35%; }
          55%  { opacity:1; width:75%; }
          60%  { opacity:1; width:100%; }
          100% { opacity:0; width:100%; }
        }
      `}</style>
      <button
        type="button"
        onClick={onClick}
        className={`ljb-btn ${className}`.trim()}
      >
        <span>{label}</span>
        {label}
      </button>
    </>
  );
}
