"use client";

import { useEffect, useRef } from "react";

export default function PulsatingSphere2() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const baseRadius = 80;
    let animationFrame: number;
    let time = 0;

    // Simple noise function for wave-like distortion
    const noise = (x: number, y: number, t: number) => {
      return Math.sin(x * 0.05 + t) * Math.cos(y * 0.05 + t * 0.7) * 10;
    };

    const animate = () => {
      // Clear canvas
      ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Calculate pulsating radius
      const pulseRadius = baseRadius + Math.sin(time * 1.5) * 15;

      // Number of points for the wavy circle
      const points = 100;
      const waveAmplitude = 20;

      // Create path for wavy sphere
      ctx.beginPath();
      
      for (let i = 0; i <= points; i++) {
        const angle = (i / points) * Math.PI * 2;
        
        // Add multiple wave frequencies for more organic look
        const wave1 = Math.sin(angle * 5 + time * 2) * waveAmplitude * 0.4;
        const wave2 = Math.sin(angle * 3 - time * 1.5) * waveAmplitude * 0.3;
        const wave3 = Math.cos(angle * 7 + time * 2.5) * waveAmplitude * 0.3;
        const noiseOffset = noise(
          Math.cos(angle) * 100,
          Math.sin(angle) * 100,
          time
        );
        
        const radius = pulseRadius + wave1 + wave2 + wave3 + noiseOffset;
        
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;
        
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      
      ctx.closePath();

      // Create radial gradient
      const gradient = ctx.createRadialGradient(
        centerX,
        centerY,
        0,
        centerX,
        centerY,
        pulseRadius * 2
      );

      gradient.addColorStop(0, "rgba(255, 140, 0, 1)");
      gradient.addColorStop(0.25, "rgba(255, 100, 80, 0.95)");
      gradient.addColorStop(0.4, "rgba(255, 120, 150, 0.7)");
      gradient.addColorStop(0.6, "rgba(255, 150, 180, 0.4)");
      gradient.addColorStop(0.8, "rgba(255, 180, 200, 0.2)");
      gradient.addColorStop(1, "rgba(255, 200, 220, 0)");

      ctx.fillStyle = gradient;
      ctx.fill();

      // Add softer outer glow with wavy edges
      ctx.beginPath();
      for (let i = 0; i <= points; i++) {
        const angle = (i / points) * Math.PI * 2;
        
        const wave1 = Math.sin(angle * 4 + time * 1.8) * waveAmplitude * 0.6;
        const wave2 = Math.cos(angle * 6 - time * 2) * waveAmplitude * 0.4;
        
        const radius = (pulseRadius + wave1 + wave2) * 1.4;
        
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;
        
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.closePath();

      const outerGradient = ctx.createRadialGradient(
        centerX,
        centerY,
        pulseRadius * 0.8,
        centerX,
        centerY,
        pulseRadius * 2.2
      );

      outerGradient.addColorStop(0, "rgba(255, 150, 180, 0.15)");
      outerGradient.addColorStop(0.5, "rgba(255, 180, 200, 0.08)");
      outerGradient.addColorStop(1, "rgba(255, 200, 220, 0)");

      ctx.fillStyle = outerGradient;
      ctx.fill();

      time += 0.02;
      animationFrame = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <canvas
        ref={canvasRef}
        width={400}
        height={400}
        className="rounded-lg"
      />
    </div>
  );
}
