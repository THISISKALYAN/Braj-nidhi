"use client";
import React from 'react';

interface BookNowButtonProps {
  href?: string;
  onClick?: () => void;
  style?: React.CSSProperties;
  className?: string;
  label?: string;
}

export default function BookNowButton({
  href = '/guesthouse#rooms-suites',
  onClick,
  style,
  className = '',
  label = 'Book Now',
}: BookNowButtonProps) {
  return (
    <>
      <style>{`
        .bnb-96,
        .bnb-96 *,
        .bnb-96 :after,
        .bnb-96 :before,
        .bnb-96:after,
        .bnb-96:before {
          border: 0 solid;
          box-sizing: border-box;
        }
        .bnb-96 {
          -webkit-tap-highlight-color: transparent;
          background-color: #000;
          background-image: none;
          color: #fff;
          cursor: pointer;
          font-family: var(--font-outfit), ui-sans-serif, system-ui, sans-serif;
          font-size: 100%;
          line-height: 1.5;
          margin: 0;
          padding: 0;
          text-decoration: none;
          display: block;
          font-weight: 900;
          -webkit-mask-image: none;
          padding: 0.6rem 1.4rem;
          perspective: 800px;
          position: relative;
          text-transform: uppercase;
          transform-style: preserve-3d;
          letter-spacing: 0.05em;
          font-size: 13px;
        }
        .bnb-96 span {
          background: #fff;
          color: #000;
          display: grid;
          inset: 0;
          place-items: center;
          position: absolute;
          transform: rotateX(0deg);
          transform-origin: top center;
          transition: 0.2s;
          font-size: 13px;
          font-weight: 900;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          font-family: var(--font-outfit), ui-sans-serif, sans-serif;
        }
        .bnb-96:hover span {
          transform: rotateX(35deg);
        }
        .bnb-96:after,
        .bnb-96:before {
          background: #ddd;
          content: "";
          height: 100%;
          left: 0;
          position: absolute;
          top: 0;
          width: 100%;
          z-index: -1;
        }
        .bnb-96:after {
          background: #ccc;
          width: 0;
        }
        .bnb-96:hover:after {
          animation: bnb-progress 1.2s;
        }
        @keyframes bnb-progress {
          0%   { opacity: 1; width: 0; }
          10%  { opacity: 1; width: 15%; }
          25%  { opacity: 1; width: 25%; }
          40%  { opacity: 1; width: 35%; }
          55%  { opacity: 1; width: 75%; }
          60%  { opacity: 1; width: 100%; }
          to   { opacity: 0; width: 100%; }
        }
      `}</style>
      <a
        href={href}
        onClick={onClick}
        className={`bnb-96 ${className}`.trim()}
        style={style}
      >
        <span>{label}</span>
        {label}
      </a>
    </>
  );
}
