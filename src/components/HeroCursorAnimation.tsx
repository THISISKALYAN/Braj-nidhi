"use client";

import React, { useEffect, useRef } from 'react';

const HeroCursorAnimation = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let particlesArray: Particle[] = [];
    let hue = 35; // Golden hue
    
    const mouse = {
      x: -1000,
      y: -1000,
    };

    let animationFrameId: number;
    let isMouseMoving = false;
    let mouseTimeout: NodeJS.Timeout;

    const resizeCanvas = () => {
      // Get parent element's dimensions to only cover the hero section
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
      } else {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      
      isMouseMoving = true;
      clearTimeout(mouseTimeout);
      mouseTimeout = setTimeout(() => {
        isMouseMoving = false;
      }, 100);

      for (let i = 0; i < 3; i++) {
        particlesArray.push(new Particle());
      }
    };
    
    // We attach mousemove to window to ensure smooth tracking, but coordinate space is relative to canvas
    window.addEventListener('mousemove', handleMouseMove);
    
    class Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      color: string;

      constructor() {
        this.x = mouse.x;
        this.y = mouse.y;
        this.size = Math.random() * 2 + 0.5;
        this.speedX = Math.random() * 2 - 1;
        this.speedY = Math.random() * 2 - 1;
        this.color = `hsla(${hue}, 100%, 70%, 0.8)`;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.size > 0.1) this.size -= 0.05;
      }

      draw() {
        if (!ctx) return;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const handleParticles = () => {
      for (let i = 0; i < particlesArray.length; i++) {
        particlesArray[i].update();
        particlesArray[i].draw();
        
        // Draw lines between particles to create the "line" effect
        for (let j = i; j < particlesArray.length; j++) {
          const dx = particlesArray[i].x - particlesArray[j].x;
          const dy = particlesArray[i].y - particlesArray[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 50) {
            ctx.beginPath();
            ctx.strokeStyle = `hsla(${hue}, 100%, 70%, ${0.2 - distance/250})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(particlesArray[i].x, particlesArray[i].y);
            ctx.lineTo(particlesArray[j].x, particlesArray[j].y);
            ctx.stroke();
            ctx.closePath();
          }
        }
        
        if (particlesArray[i].size <= 0.1) {
          particlesArray.splice(i, 1);
          i--;
        }
      }
    };

    const animate = () => {
      if (!ctx) return;
      // Add slight trailing effect
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.clearRect(0, 0, canvas.width, canvas.height); // or use fillRect for trailing, but clearRect is cleaner for transparent bg
      handleParticles();
      
      // Change color slowly if desired, or keep it golden
      // hue += 0.5;
      
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
      clearTimeout(mouseTimeout);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 5 // Ensure it is above the background but below interactive elements
      }}
    />
  );
};

export default HeroCursorAnimation;
