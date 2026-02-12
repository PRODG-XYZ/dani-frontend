'use client';

import { createContext, useContext, useState, useCallback, useEffect, ReactNode, useRef } from 'react';
import { AuthUser } from '@/types';

interface TokenData {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (idToken: string) => Promise<boolean>;
  signOut: () => void;
  getAccessToken: () => Promise<string | null>;
  updateUser: (updates: { name?: string; picture_url?: string }) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  signIn: async () => false,
  signOut: () => {},
  getAccessToken: async () => null,
  updateUser: async () => false,
});

interface AuthProviderProps {
  children: ReactNode;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
const MOCK_AUTH_TOKEN = process.env.NEXT_PUBLIC_MOCK_AUTH_TOKEN;

// Token storage keys
const ACCESS_TOKEN_KEY = 'dani-access-token';
const REFRESH_TOKEN_KEY = 'dani-refresh-token';
const TOKEN_EXPIRY_KEY = 'dani-token-expiry';
const USER_KEY = 'dani-user';

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const refreshPromiseRef = useRef<Promise<string | null> | null>(null);

  // Load stored auth state on mount
  useEffect(() => {
    const loadStoredAuth = async () => {
      try {
        // If mock token is available, use it for testing
        if (MOCK_AUTH_TOKEN) {
          const mockUser: AuthUser = {
            id: 'mock-user-id',
            email: 'dev@eutopiantech.com',
            name: 'Mock User',
            picture_url: null,
            created_at: new Date().toISOString(),
            last_login_at: new Date().toISOString(),
          };
          setUser(mockUser);
          setAccessToken(MOCK_AUTH_TOKEN);
          localStorage.setItem(USER_KEY, JSON.stringify(mockUser));
          localStorage.setItem(ACCESS_TOKEN_KEY, MOCK_AUTH_TOKEN);
          setIsLoading(false);
          return;
        }

        const storedUser = localStorage.getItem(USER_KEY);
        const storedAccessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
        const storedRefreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
        const storedExpiry = localStorage.getItem(TOKEN_EXPIRY_KEY);

        if (storedUser && storedRefreshToken) {
          setUser(JSON.parse(storedUser));
          
          // Check if access token is still valid
          if (storedAccessToken && storedExpiry) {
            const expiryTime = parseInt(storedExpiry, 10);
            if (Date.now() < expiryTime - 60000) { // 1 minute buffer
              setAccessToken(storedAccessToken);
            } else {
              // Token expired, try to refresh
              const newToken = await refreshAccessToken(storedRefreshToken);
              if (!newToken) {
                // Refresh failed, clear auth
                clearAuth();
              }
            }
          } else {
            // No access token, try to refresh
            const newToken = await refreshAccessToken(storedRefreshToken);
            if (!newToken) {
              clearAuth();
            }
          }
        }
      } catch (error) {
        console.error('Error loading stored auth:', error);
        clearAuth();
      } finally {
        setIsLoading(false);
      }
    };

    loadStoredAuth();
  }, []);

  const clearAuth = useCallback(() => {
    setUser(null);
    setAccessToken(null);
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(TOKEN_EXPIRY_KEY);
    localStorage.removeItem(USER_KEY);
  }, []);

  const storeTokens = useCallback((tokens: TokenData, userData: AuthUser) => {
    const expiryTime = Date.now() + (tokens.expires_in * 1000);
    
    localStorage.setItem(ACCESS_TOKEN_KEY, tokens.access_token);
    localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refresh_token);
    localStorage.setItem(TOKEN_EXPIRY_KEY, expiryTime.toString());
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
    
    setAccessToken(tokens.access_token);
    setUser(userData);
  }, []);

  const refreshAccessToken = useCallback(async (refreshToken: string): Promise<string | null> => {
    // Prevent multiple simultaneous refresh requests
    if (refreshPromiseRef.current) {
      return refreshPromiseRef.current;
    }

    refreshPromiseRef.current = (async () => {
      try {
        const response = await fetch(`${API_URL}/auth/refresh`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refresh_token: refreshToken }),
        });

        if (!response.ok) {
          console.error('Token refresh failed:', response.status);
          return null;
        }

        const tokens: TokenData = await response.json();
        const expiryTime = Date.now() + (tokens.expires_in * 1000);
        
        localStorage.setItem(ACCESS_TOKEN_KEY, tokens.access_token);
        localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refresh_token);
        localStorage.setItem(TOKEN_EXPIRY_KEY, expiryTime.toString());
        
        setAccessToken(tokens.access_token);
        return tokens.access_token;
      } catch (error) {
        console.error('Token refresh error:', error);
        return null;
      } finally {
        refreshPromiseRef.current = null;
      }
    })();

    return refreshPromiseRef.current;
  }, []);

  const getAccessToken = useCallback(async (): Promise<string | null> => {
    const storedExpiry = localStorage.getItem(TOKEN_EXPIRY_KEY);
    const storedRefreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    
    // Check if current token is still valid (with 1 minute buffer)
    if (accessToken && storedExpiry) {
      const expiryTime = parseInt(storedExpiry, 10);
      if (Date.now() < expiryTime - 60000) {
        return accessToken;
      }
    }

    // Token expired or missing, try to refresh
    if (storedRefreshToken) {
      const newToken = await refreshAccessToken(storedRefreshToken);
      if (newToken) {
        return newToken;
      }
    }

    // Refresh failed, user needs to re-authenticate
    clearAuth();
    return null;
  }, [accessToken, refreshAccessToken, clearAuth]);

  const signIn = useCallback(async (googleIdToken: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Exchange Google token for our JWT tokens
      const response = await fetch(`${API_URL}/auth/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: googleIdToken }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('Auth failed:', error);
        setIsLoading(false);
        return false;
      }

      const data = await response.json();
      
      // Store tokens and user data
      storeTokens(data.tokens, data.user);
      
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error('Sign in error:', error);
      setIsLoading(false);
      return false;
    }
  }, [storeTokens]);

  const signOut = useCallback(() => {
    clearAuth();
  }, [clearAuth]);

  const updateUser = useCallback(async (updates: { name?: string; picture_url?: string }): Promise<boolean> => {
    const token = await getAccessToken();
    if (!token) {
      return false;
    }

    try {
      const response = await fetch(`${API_URL}/users/me`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        console.error('Failed to update profile:', response.status);
        return false;
      }

      const updatedUserResponse = await response.json();
      
      // Update local state and storage using functional update to avoid stale state
      setUser(prevUser => {
        if (!prevUser) return prevUser;
        
        const newUser: AuthUser = {
          ...prevUser,
          name: updatedUserResponse.name ?? prevUser.name,
          picture_url: updatedUserResponse.picture_url ?? prevUser.picture_url,
        };
        
        // Update localStorage synchronously
        localStorage.setItem(USER_KEY, JSON.stringify(newUser));
        
        return newUser;
      });
      
      return true;
    } catch (error) {
      console.error('Update user error:', error);
      return false;
    }
  }, [getAccessToken]);

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        token: accessToken,
        isAuthenticated: !!user && !!accessToken, 
        isLoading,
        signIn, 
        signOut,
        getAccessToken,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

// Helper to get token for API calls
export async function getStoredToken(): Promise<string | null> {
  if (typeof window === 'undefined') {
    return null;
  }

  // Use mock token if available
  if (MOCK_AUTH_TOKEN) {
    return MOCK_AUTH_TOKEN;
  }

  const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
  const expiry = localStorage.getItem(TOKEN_EXPIRY_KEY);
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);

  // Check if access token is still valid
  if (accessToken && expiry) {
    const expiryTime = parseInt(expiry, 10);
    if (Date.now() < expiryTime - 60000) {
      return accessToken;
    }
  }
  
  // Try to refresh
  if (refreshToken) {
    try {
      const response = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });
      
      if (response.ok) {
        const tokens = await response.json();
        const newExpiry = Date.now() + (tokens.expires_in * 1000);
        localStorage.setItem(ACCESS_TOKEN_KEY, tokens.access_token);
        localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refresh_token);
        localStorage.setItem(TOKEN_EXPIRY_KEY, newExpiry.toString());
        return tokens.access_token;
      }
    } catch (e) {
      console.error('Token refresh failed:', e);
    }
  }
  
  return null;
}
