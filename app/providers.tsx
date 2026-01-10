'use client';

import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from '@/contexts/AuthContext';

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  // Warn if Google Client ID is not configured
  if (!GOOGLE_CLIENT_ID && typeof window !== 'undefined') {
    console.warn(
      '⚠️ NEXT_PUBLIC_GOOGLE_CLIENT_ID is not set. Google Sign-In will not work. ' +
      'Please add it to your .env.local file.'
    );
  }

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProvider>
        {children}
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}
