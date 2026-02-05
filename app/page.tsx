'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { useAuth } from '@/contexts/AuthContext';

// Static Pulsating Sphere for Logo (no animation)
const StaticSphere = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 20;

    const gradient = ctx.createRadialGradient(
      centerX,
      centerY,
      0,
      centerX,
      centerY,
      radius
    );

    gradient.addColorStop(0, 'rgba(255, 140, 0, 1)');
    gradient.addColorStop(0.3, 'rgba(255, 100, 80, 0.9)');
    gradient.addColorStop(0.5, 'rgba(255, 120, 150, 0.6)');
    gradient.addColorStop(0.7, 'rgba(255, 180, 200, 0.3)');
    gradient.addColorStop(1, 'rgba(255, 200, 200, 0)');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fill();
  }, []);

  return <canvas ref={canvasRef} width={48} height={48} className="rounded-xl" />;
};

export default function AuthPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [year, setYear] = useState(2025);
  const router = useRouter();
  const { signIn, isAuthenticated, isLoading: authLoading } = useAuth();

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.push('/chat');
    }
  }, [isAuthenticated, authLoading, router]);

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (!credentialResponse.credential) {
        throw new Error('No credential received from Google');
      }

      // The credential is the ID token we need
      const success = await signIn(credentialResponse.credential);
      
      if (success) {
        router.push('/chat');
      } else {
        setError('Access denied. Your account may not be registered.');
      }
    } catch (err) {
      console.error('Sign in error:', err);
      setError(err instanceof Error ? err.message : 'Sign in failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError('Google sign in failed. Please try again.');
    setIsLoading(false);
  };

  // Don't show loading spinner - just render immediately and let redirect happen

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA] px-4">
      {/* Auth Card */}
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-8">
          {/* Logo & Branding */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center overflow-hidden">
                <StaticSphere />
              </div>
              <span className="text-2xl font-bold text-gray-900">DANI</span>
            </div>
            <p className="text-sm text-gray-600">
              Your AI-powered meeting intelligence assistant
            </p>
          </div>

          {/* Divider with text */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-500 font-medium">Sign in to continue</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm text-center">
              {error}
            </div>
          )}

          {/* Error only - no loading spinner */}

          {/* Google Sign In Button */}
          <div className={`flex justify-center ${isLoading ? 'pointer-events-none opacity-50' : ''}`}>
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              theme="outline"
              size="large"
              text="continue_with"
              shape="rectangular"
              logo_alignment="left"
              width="300"
            />
          </div>

          {/* Terms */}
          <p className="text-xs text-gray-500 text-center mt-6">
            By signing in, you agree to our{' '}
            <a href="#" className="text-[#FF8C00] hover:underline">Terms of Service</a>
            {' '}and{' '}
            <a href="#" className="text-[#FF8C00] hover:underline">Privacy Policy</a>
          </p>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-400">© {year} DANI. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
