import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ThemeContext = createContext();
const THEME_STORAGE_KEY = 'theme_preference';

export const Colors = {
    light: {
        background: '#f8fafc',
        card: '#ffffff',
        text: '#1e293b',
        secondaryText: '#64748b',
        primary: '#007bff',
        primaryDark: '#0056b3',
        border: '#e2e8f0',
        input: '#f1f5f9',
        placeholder: '#94a3b8',
        white: '#ffffff',
        black: '#000000',
        error: '#ef4444',
        success: '#10b981',
        warning: '#f59e0b',
        divider: '#f1f5f9',
        iconDefault: '#94a3b8',
        subtle: '#f8fafc'
    },
    dark: {
        background: '#0f172a',
        card: '#1e293b',
        text: '#f8fafc',
        secondaryText: '#94a3b8',
        primary: '#3b82f6',
        primaryDark: '#2563eb',
        border: '#334155',
        input: '#0f172a',
        placeholder: '#94a3b8', // Increased brightness for better contrast
        white: '#ffffff',
        black: '#000000',
        error: '#f87171',
        success: '#34d399',
        warning: '#fbbf24',
        divider: '#334155',
        iconDefault: '#94a3b8', // Match secondary text for consistency
        subtle: '#1e293b'
    }
};

export const ThemeProvider = ({ children }) => {
    const systemColorScheme = useColorScheme();
    const [isDark, setIsDark] = useState(systemColorScheme === 'dark');

    // Load the user's saved preference once on startup. If they've never
    // chosen one, fall back to the system's light/dark setting.
    useEffect(() => {
        (async () => {
            try {
                const stored = await AsyncStorage.getItem(THEME_STORAGE_KEY);
                if (stored === 'light' || stored === 'dark') {
                    setIsDark(stored === 'dark');
                }
            } catch (e) {
                console.error('Failed to load theme preference', e);
            }
        })();
    }, []);

    const theme = isDark ? Colors.dark : Colors.light;

    const toggleTheme = async () => {
        const newValue = !isDark;
        setIsDark(newValue);
        try {
            await AsyncStorage.setItem(THEME_STORAGE_KEY, newValue ? 'dark' : 'light');
        } catch (e) {
            console.error('Failed to save theme preference', e);
        }
    };

    return (
        <ThemeContext.Provider value={{ theme, isDark, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
