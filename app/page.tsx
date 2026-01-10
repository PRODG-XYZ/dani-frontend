'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import Logo from '@/components/ui/Logo';
import { useAuth } from '@/contexts/AuthContext';

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

  // Show loading while checking auth status
  if (authLoading) {
    return (
      <div className="auth-page">
        <div className="auth-bg">
          <div className="auth-gradient-orb auth-gradient-orb-1" />
          <div className="auth-gradient-orb auth-gradient-orb-2" />
          <div className="auth-gradient-orb auth-gradient-orb-3" />
        </div>
        <div className="flex items-center justify-center h-screen">
          <div className="flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-[var(--foreground-secondary)]">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      {/* Animated background */}
      <div className="auth-bg">
        <div className="auth-gradient-orb auth-gradient-orb-1" />
        <div className="auth-gradient-orb auth-gradient-orb-2" />
        <div className="auth-gradient-orb auth-gradient-orb-3" />
      </div>

      {/* Auth Card */}
      <div className="auth-container">
        <div className="auth-card glass-strong animate-scale-in">
          {/* Logo & Branding */}
          <div className="auth-header">
            <div className="flex justify-center mb-4">
              <Logo size="lg" showText={true} />
            </div>
            <p className="auth-subtitle">
              Your AI-powered meeting intelligence assistant
            </p>
          </div>

          {/* Divider with text */}
          <div className="auth-divider">
            <span className="auth-divider-line" />
            <span className="auth-divider-text">Sign in to continue</span>
            <span className="auth-divider-line" />
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="flex justify-center mb-4">
              <div className="flex items-center gap-3 text-[var(--foreground-secondary)]">
                <div className="w-5 h-5 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
                <span className="text-sm">Signing in...</span>
              </div>
            </div>
          )}

          {/* Google Sign In Button */}
          {!isLoading && (
            <div className="flex justify-center">
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
          )}

          {/* Terms */}
          <p className="auth-terms mt-6">
            By signing in, you agree to our{' '}
            <a href="#" className="auth-link">Terms of Service</a>
            {' '}and{' '}
            <a href="#" className="auth-link">Privacy Policy</a>
          </p>
        </div>

        {/* Footer */}
        <div className="auth-footer animate-fade-in">
          <p>© {year} DANI. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
