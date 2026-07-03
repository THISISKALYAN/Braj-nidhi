"use client";
import React from 'react';

interface SectionLinkButtonProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export default function SectionLinkButton({ href, children, className = '', style }: SectionLinkButtonProps) {
  return (
    <>
      <style>{`
        .slb-btn {
          outline: none;
          cursor: pointer;
          border: none;
          padding: 0.9rem 2rem;
          margin: 0;
          font-family: var(--font-outfit), sans-serif;
          position: relative;
          display: inline-block;
          letter-spacing: 0.05rem;
          font-weight: 700;
          font-size: 17px;
          border-radius: 500px;
          overflow: hidden;
          background: #66ff66;
          color: ghostwhite;
          text-decoration: none;
          transition: color 0s;
        }
        .slb-btn span {
          position: relative;
          z-index: 10;
          transition: color 0.4s;
        }
        .slb-btn:hover span {
          color: black;
          text-decoration: none;
        }
        .slb-btn::before,
        .slb-btn::after {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 0;
        }
        .slb-btn::before {
          content: "";
          background: #000;
          width: 120%;
          left: -10%;
          transform: skew(30deg);
          transition: transform 0.4s cubic-bezier(0.3, 1, 0.8, 1);
        }
        .slb-btn:hover::before {
          transform: translate3d(100%, 0, 0);
        }
      `}</style>
      <a href={href} className={`slb-btn ${className}`.trim()} style={style}>
        <span>{children}</span>
      </a>
    </>
  );
}
