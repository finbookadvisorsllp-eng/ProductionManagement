import { useState, useEffect } from 'react';

export default function useTheme() {
  // Check if user has a saved theme preference or default to light
  const getInitialTheme = () => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme || 'light';
  };

  const [theme, setTheme] = useState(getInitialTheme);

  // Apply theme to document and save to localStorage
  useEffect(() => {
    const root = document.documentElement;
    
    // Remove previous theme classes
    root.classList.remove('light', 'dark');
    
    // Add current theme class
    root.classList.add(theme);
    
    // Save to localStorage
    localStorage.setItem('theme', theme);
    
    // Apply theme-specific CSS variables
    if (theme === 'dark') {
      root.style.setProperty('--surface', '#1e293b');
      root.style.setProperty('--surface-2', '#0f172a');
      root.style.setProperty('--surface-3', '#334155');
      root.style.setProperty('--border', '#475569');
      root.style.setProperty('--text-primary', '#f1f5f9');
      root.style.setProperty('--text-secondary', '#cbd5e1');
      root.style.setProperty('--text-muted', '#94a3b8');
      
      // Dark theme sidebar
      root.style.setProperty('--sidebar-bg', '#0f172a');
      root.style.setProperty('--sidebar-text', '#cbd5e1');
      root.style.setProperty('--sidebar-text-muted', '#94a3b8');
      root.style.setProperty('--sidebar-hover', '#1e293b');
      root.style.setProperty('--sidebar-active', '#334155');
    } else {
      // Reset to light theme defaults
      root.style.setProperty('--surface', '#ffffff');
      root.style.setProperty('--surface-2', '#f8fafc');
      root.style.setProperty('--surface-3', '#f1f5f9');
      root.style.setProperty('--border', '#e2e8f0');
      root.style.setProperty('--text-primary', '#0f172a');
      root.style.setProperty('--text-secondary', '#475569');
      root.style.setProperty('--text-muted', '#94a3b8');
      
      // Light theme sidebar
      root.style.setProperty('--sidebar-bg', '#1e3a8a');
      root.style.setProperty('--sidebar-text', '#ffffff');
      root.style.setProperty('--sidebar-text-muted', '#cbd5e1');
      root.style.setProperty('--sidebar-hover', '#1e40af');
      root.style.setProperty('--sidebar-active', '#3b82f6');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  return { theme, toggleTheme };
}