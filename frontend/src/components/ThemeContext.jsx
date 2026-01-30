import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

export const ThemeProvider = ({ children }) => {
    const [isDarkMode, setIsDarkMode] = useState(() => {
        const saved = localStorage.getItem('educode-theme');
        if (saved) return saved === 'dark';
        // Check system preference
        if (window.matchMedia) {
            return window.matchMedia('(prefers-color-scheme: dark)').matches;
        }
        return true; // Default to dark
    });

    const [isTransitioning, setIsTransitioning] = useState(false);

    useEffect(() => {
        localStorage.setItem('educode-theme', isDarkMode ? 'dark' : 'light');
        document.documentElement.classList.toggle('light', !isDarkMode);
        document.documentElement.classList.toggle('dark', isDarkMode);
    }, [isDarkMode]);

    // Listen for system theme changes
    useEffect(() => {
        if (!window.matchMedia) return;

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = (e) => {
            // Only auto-switch if user hasn't explicitly set preference
            const saved = localStorage.getItem('educode-theme');
            if (!saved) {
                setIsDarkMode(e.matches);
            }
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    const toggleTheme = () => {
        setIsTransitioning(true);
        // Small delay to allow transition class to apply
        setTimeout(() => {
            setIsDarkMode(!isDarkMode);
            setTimeout(() => setIsTransitioning(false), 300);
        }, 50);
    };

    return (
        <ThemeContext.Provider value={{ isDarkMode, toggleTheme, isTransitioning }}>
            {isTransitioning && (
                <div className="fixed inset-0 bg-[var(--color-bg)] z-[9999] pointer-events-none animate-fade-out"
                    style={{ animationDuration: '300ms' }} />
            )}
            {children}
        </ThemeContext.Provider>
    );
};

export default ThemeContext;
