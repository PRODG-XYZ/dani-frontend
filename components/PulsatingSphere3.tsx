"use client";

import { useEffect, useRef } from "react";

export default function PulsatingSphere3() {
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

    const animate = () => {
      // Clear canvas
      ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Calculate pulsating radius
      const pulseRadius = baseRadius + Math.sin(time * 1.5) * 15;

      // Draw circular core with gradient
      const gradient = ctx.createRadialGradient(
        centerX,
        centerY,
        0,
        centerX,
        centerY,
        pulseRadius * 1.5
      );

      gradient.addColorStop(0, "rgba(255, 140, 0, 1)");
      gradient.addColorStop(0.3, "rgba(255, 100, 80, 0.9)");
      gradient.addColorStop(0.5, "rgba(255, 120, 150, 0.6)");
      gradient.addColorStop(0.7, "rgba(255, 180, 200, 0.3)");
      gradient.addColorStop(1, "rgba(255, 200, 200, 0)");

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, pulseRadius * 1.5, 0, Math.PI * 2);
      ctx.fill();

      // Draw wavy outer pink edge
      const points = 100;
      const waveAmplitude = 25;
      
      ctx.beginPath();
      for (let i = 0; i <= points; i++) {
        const angle = (i / points) * Math.PI * 2;
        
        // Multiple wave frequencies for organic water-like effect
        const wave1 = Math.sin(angle * 5 + time * 2) * waveAmplitude * 0.4;
        const wave2 = Math.sin(angle * 3 - time * 1.5) * waveAmplitude * 0.3;
        const wave3 = Math.cos(angle * 7 + time * 2.5) * waveAmplitude * 0.3;
        
        const radius = pulseRadius * 1.8 + wave1 + wave2 + wave3;
        
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;
        
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.closePath();

      // Gradient for wavy outer edge
      const outerGradient = ctx.createRadialGradient(
        centerX,
        centerY,
        pulseRadius * 1.3,
        centerX,
        centerY,
        pulseRadius * 2.2
      );

      outerGradient.addColorStop(0, "rgba(255, 180, 200, 0.2)");
      outerGradient.addColorStop(0.5, "rgba(255, 200, 220, 0.1)");
      outerGradient.addColorStop(1, "rgba(255, 220, 230, 0)");

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
