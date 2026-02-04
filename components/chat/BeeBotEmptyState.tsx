'use client';

import { useEffect, useRef } from 'react';

interface BeeBotEmptyStateProps {
  userName?: string | null;
}

export default function BeeBotEmptyState({ 
  userName,
}: BeeBotEmptyStateProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const baseRadius = 70;
    let animationFrame: number;
    let time = 0;

    const animate = () => {
      // Clear with white for trail effect
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Calculate pulsating radius
      const pulseRadius = baseRadius + Math.sin(time) * 12;

      // Create radial gradient - blue/purple
      const gradient = ctx.createRadialGradient(
        centerX,
        centerY,
        0,
        centerX,
        centerY,
        pulseRadius * 1.3
      );

      // Orange gradient (matching PulsatingSphere)
      gradient.addColorStop(0, 'rgba(255, 140, 0, 1)'); // Orange core
      gradient.addColorStop(0.3, 'rgba(255, 100, 80, 0.9)'); // Orange-red
      gradient.addColorStop(0.5, 'rgba(255, 120, 150, 0.6)'); // Orange-pink
      gradient.addColorStop(0.7, 'rgba(255, 180, 200, 0.3)'); // Light orange-pink
      gradient.addColorStop(1, 'rgba(255, 200, 200, 0)'); // Very light, transparent

      // Draw sphere
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, pulseRadius * 1.3, 0, Math.PI * 2);
      ctx.fill();

      time += 0.025;
      animationFrame = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <div className="flex flex-col items-center justify-center pt-24 pb-12">
      {/* Pulsating Sphere */}
      <div className="mb-6">
        <canvas
          ref={canvasRef}
          width={220}
          height={220}
        />
      </div>

      {/* Greeting */}
      <h1 className="text-4xl font-semibold text-gray-900 mb-1">
        {getGreeting()}{userName ? `, ${userName}` : ''}
      </h1>
      
      <p className="text-2xl text-gray-900">
        How Can I <span className="bg-gradient-to-r from-[#FF8C00] to-[#FF6B35] bg-clip-text text-transparent font-semibold">Assist You Today?</span>
      </p>
    </div>
  );
}
