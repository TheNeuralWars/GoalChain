import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
const UserContext = createContext(undefined);
export function UserProvider({ children }) {
    // Inicialización defensiva leyendo desde localStorage
    const [user, setUserState] = useState(() => {
        if (typeof window !== 'undefined') {
            const raw = localStorage.getItem('goalchain_user');
            if (raw) {
                try {
                    const parsed = JSON.parse(raw);
                    if (parsed && parsed.username) {
                        return parsed;
                    }
                }
                catch (e) {
                    console.error('Error inicializando UserContext desde localStorage:', e);
                }
            }
        }
        return null;
    });
    // Setter personalizado que escribe en estado y localStorage de forma sincronizada
    const setUser = (newUser) => {
        setUserState(newUser);
        if (typeof window !== 'undefined') {
            if (newUser) {
                localStorage.setItem('goalchain_user', JSON.stringify(newUser));
            }
            else {
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
        if (typeof window === 'undefined')
            return;
        const handleStorageChange = (e) => {
            if (e.key === 'goalchain_user') {
                if (e.newValue) {
                    try {
                        const parsed = JSON.parse(e.newValue);
                        if (parsed && parsed.username) {
                            setUserState(parsed);
                        }
                    }
                    catch {
                        /* ignore */
                    }
                }
                else {
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
