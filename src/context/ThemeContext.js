import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { THEMES } from '../theme/themes';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [themeId, setThemeId] = useState('manga_black');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    async function loadTheme() {
      try {
        const saved = await AsyncStorage.getItem('tf_theme');
        if (saved && THEMES[saved]) {
          setThemeId(saved);
        }
      } catch (e) {
      } finally {
        setLoaded(true);
      }
    }
    loadTheme();
  }, []);

  const activeTheme = THEMES[themeId] || THEMES.manga_black;

  const selectTheme = async (newThemeId) => {
    if (THEMES[newThemeId]) {
      setThemeId(newThemeId);
      try {
        await AsyncStorage.setItem('tf_theme', newThemeId);
      } catch (e) {}
    }
  };

  return (
    <ThemeContext.Provider value={{ themeId, activeTheme, selectTheme, allThemes: THEMES, isLoaded: loaded }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
