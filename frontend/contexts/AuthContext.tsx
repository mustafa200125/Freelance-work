import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { Platform } from 'react-native';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

interface User {
  user_id: string;
  email: string;
  name: string;
  picture?: string;
  user_type: 'job_seeker' | 'employer';
  phone?: string;
  profession?: string;
  skills?: string[];
  experience_years?: number;
  bio?: string;
  city?: string;
  area?: string;
  latitude?: number;
  longitude?: number;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (userType: 'job_seeker' | 'employer') => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
    
    // Handle deep links (cold start)
    Linking.getInitialURL().then(url => {
      if (url) {
        handleAuthRedirect(url);
      }
    });

    // Handle deep links (hot start)
    const subscription = Linking.addEventListener('url', ({ url }) => {
      handleAuthRedirect(url);
    });

    return () => subscription.remove();
  }, []);

  const handleAuthRedirect = async (url: string) => {
    // Parse session_id from URL (support both hash and query)
    let sessionId = null;
    
    if (url.includes('#session_id=')) {
      sessionId = url.split('#session_id=')[1]?.split('&')[0];
    } else if (url.includes('?session_id=')) {
      sessionId = url.split('?session_id=')[1]?.split('&')[0];
    }

    if (sessionId) {
      await exchangeSessionId(sessionId);
    }
  };

  const exchangeSessionId = async (sessionId: string, userType: string = 'job_seeker') => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ session_id: sessionId, user_type: userType }),
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        await AsyncStorage.setItem('user', JSON.stringify(userData));
      }
    } catch (error) {
      console.error('Failed to exchange session ID:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkAuth = async () => {
    try {
      // Check stored user
      const storedUser = await AsyncStorage.getItem('user');
      if (storedUser) {
        // Verify with backend
        const response = await fetch(`${BACKEND_URL}/api/auth/me`, {
          credentials: 'include',
        });
        
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        } else {
          await AsyncStorage.removeItem('user');
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (userType: 'job_seeker' | 'employer') => {
    try {
      const redirectUrl = Platform.OS === 'web'
        ? `${BACKEND_URL}/`
        : Linking.createURL('/');

      const authUrl = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;

      if (Platform.OS === 'web') {
        window.location.href = authUrl;
      } else {
        const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUrl);
        
        if (result.type === 'success' && result.url) {
          const url = result.url;
          let sessionId = null;
          
          if (url.includes('#session_id=')) {
            sessionId = url.split('#session_id=')[1]?.split('&')[0];
          } else if (url.includes('?session_id=')) {
            sessionId = url.split('?session_id=')[1]?.split('&')[0];
          }

          if (sessionId) {
            await exchangeSessionId(sessionId, userType);
          }
        }
      }
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const logout = async () => {
    try {
      await fetch(`${BACKEND_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
      
      await AsyncStorage.removeItem('user');
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const updateUser = (data: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...data };
      setUser(updatedUser);
      AsyncStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}