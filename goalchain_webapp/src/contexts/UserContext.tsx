import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';

export interface GoalChainUser {
  username: string;
  wallet: string;
  avatar: string;      // Emoji del avatar (ej: '🦅', '🦁')
  role: string;        // 'manager' | 'scout' | 'trader'
  joinedDate?: string; // Fecha de creación o unión
  bio?: string;
  location?: string;
  twitter?: string;
  telegram?: string;
  discord?: string;
  github?: string;
  forwardingEmail?: string;
  accentColor?: string; // e.g. '#14f195'
  following?: string[]; // list of followed usernames
  customPhotoUrl?: string; // base64 string
}

interface UserContextType {
  user: GoalChainUser | null;
  isLoggedIn: boolean;
  setUser: (user: GoalChainUser | null) => void;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  // Inicialización defensiva leyendo desde localStorage
  const [user, setUserState] = useState<GoalChainUser | null>(() => {
    if (typeof window !== 'undefined') {
      const raw = localStorage.getItem('goalchain_user');
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          if (parsed && parsed.username) {
            return parsed as GoalChainUser;
          }
        } catch (e) {
          console.error('Error inicializando UserContext desde localStorage:', e);
        }
      }
    }
    return null;
  });

  // Setter personalizado que escribe en estado y localStorage de forma sincronizada
  const setUser = (newUser: GoalChainUser | null) => {
    setUserState(newUser);
    if (typeof window !== 'undefined') {
      if (newUser) {
        localStorage.setItem('goalchain_user', JSON.stringify(newUser));
      } else {
        localStorage.removeItem('goalchain_user');
      }
    }
  };

  const logout = () => {
    setUser(null);
  };

  const isLoggedIn = user !== null;

  // Sincronización multiactiva en tiempo real entre pestañas (Storage Event)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'goalchain_user') {
        if (e.newValue) {
          try {
            const parsed = JSON.parse(e.newValue);
            if (parsed && parsed.username) {
              setUserState(parsed as GoalChainUser);
            }
          } catch {
            /* ignore */
          }
        } else {
          setUserState(null);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const value = useMemo(() => ({ user, isLoggedIn, setUser, logout }), [user, isLoggedIn]);

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
