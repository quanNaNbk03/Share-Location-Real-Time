import { useState, useEffect, createContext, useContext } from 'react';

const ThemeContext = createContext<{ theme: string; toggle: () => void }>({
    theme: 'dark',
    toggle: () => { },
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = useState<string>(() => {
        return localStorage.getItem('theme') || 'dark';
    });

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggle = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));

    return (
        <ThemeContext.Provider value={{ theme, toggle }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function ThemeToggle() {
    const { theme, toggle } = useContext(ThemeContext);
    return (
        <button
            className="theme-toggle"
            onClick={toggle}
            title={theme === 'dark' ? 'Chuyển sáng' : 'Chuyển tối'}
            aria-label="Chuyển chế độ sáng/tối"
        >
            {theme === 'dark' ? '☀️' : '🌙'}
        </button>
    );
}
