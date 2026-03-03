import { useState, useEffect, useCallback } from 'react';

const USERNAME_KEY = 'locationrt_username';

export function useUsername() {
    const [username, setUsernameState] = useState<string | null>(() => {
        try {
            return localStorage.getItem(USERNAME_KEY);
        } catch {
            return null;
        }
    });

    const setUsername = useCallback((name: string) => {
        const trimmed = name.trim();
        if (trimmed) {
            localStorage.setItem(USERNAME_KEY, trimmed);
            setUsernameState(trimmed);
        }
    }, []);

    const clearUsername = useCallback(() => {
        localStorage.removeItem(USERNAME_KEY);
        setUsernameState(null);
    }, []);

    // Sync across tabs
    useEffect(() => {
        const handleStorage = (e: StorageEvent) => {
            if (e.key === USERNAME_KEY) {
                setUsernameState(e.newValue);
            }
        };
        window.addEventListener('storage', handleStorage);
        return () => window.removeEventListener('storage', handleStorage);
    }, []);

    return { username, setUsername, clearUsername, hasUsername: !!username };
}
