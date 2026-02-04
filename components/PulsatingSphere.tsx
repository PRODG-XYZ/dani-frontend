"use client";

import { useEffect, useRef } from "react";

export default function PulsatingSphere() {
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
      // Clear canvas with slight transparency for trail effect
      ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Calculate pulsating radius
      const pulseRadius = baseRadius + Math.sin(time) * 15;

      // Create radial gradient
      const gradient = ctx.createRadialGradient(
        centerX,
        centerY,
        0,
        centerX,
        centerY,
        pulseRadius * 1.5
      );

      // Orange/red core
      gradient.addColorStop(0, "rgba(255, 140, 0, 1)");
      gradient.addColorStop(0.3, "rgba(255, 100, 80, 0.9)");
      gradient.addColorStop(0.5, "rgba(255, 120, 150, 0.6)");
      gradient.addColorStop(0.7, "rgba(255, 180, 200, 0.3)");
      gradient.addColorStop(1, "rgba(255, 200, 200, 0)");

      // Draw the sphere
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, pulseRadius * 1.5, 0, Math.PI * 2);
      ctx.fill();

      time += 0.03;
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
