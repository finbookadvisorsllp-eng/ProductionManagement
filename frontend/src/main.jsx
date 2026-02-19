import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Initialize theme before React renders
(function initializeTheme() {
  const savedTheme = localStorage.getItem('theme');
  const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  const theme = savedTheme || systemTheme;
  
  const root = document.documentElement;
  root.classList.remove('light', 'dark');
  root.classList.add(theme);
  
  // Set initial CSS variables
  if (theme === 'dark') {
    root.style.setProperty('--surface', '#1e293b');
    root.style.setProperty('--surface-2', '#0f172a');
    root.style.setProperty('--surface-3', '#334155');
    root.style.setProperty('--border', '#475569');
    root.style.setProperty('--text-primary', '#f1f5f9');
    root.style.setProperty('--text-secondary', '#cbd5e1');
    root.style.setProperty('--text-muted', '#94a3b8');
    root.style.setProperty('--sidebar-bg', '#0f172a');
    root.style.setProperty('--sidebar-text', '#cbd5e1');
    root.style.setProperty('--sidebar-text-muted', '#94a3b8');
    root.style.setProperty('--sidebar-hover', '#1e293b');
    root.style.setProperty('--sidebar-active', '#334155');
  } else {
    root.style.setProperty('--surface', '#ffffff');
    root.style.setProperty('--surface-2', '#f8fafc');
    root.style.setProperty('--surface-3', '#f1f5f9');
    root.style.setProperty('--border', '#e2e8f0');
    root.style.setProperty('--text-primary', '#0f172a');
    root.style.setProperty('--text-secondary', '#475569');
    root.style.setProperty('--text-muted', '#94a3b8');
    root.style.setProperty('--sidebar-bg', '#1e3a8a');
    root.style.setProperty('--sidebar-text', '#ffffff');
    root.style.setProperty('--sidebar-text-muted', '#cbd5e1');
    root.style.setProperty('--sidebar-hover', '#1e40af');
    root.style.setProperty('--sidebar-active', '#3b82f6');
  }
})();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
