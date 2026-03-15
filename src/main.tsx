import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// gapp SDK mock for local development
if (!(window as any).gapp) {
  (window as any).gapp = {
    __mock: true,
    state: {
      get: async (key: string) => {
        try { return JSON.parse(localStorage.getItem(`gapp_${key}`) ?? 'null'); } catch { return null; }
      },
      set: async (key: string, value: any) => {
        localStorage.setItem(`gapp_${key}`, typeof value === 'string' ? value : JSON.stringify(value));
      },
      delete: async (key: string) => { localStorage.removeItem(`gapp_${key}`); },
      list: async () => Object.keys(localStorage).filter(k => k.startsWith('gapp_')).map(k => k.slice(5)),
      global: {
        get: async (key: string) => {
          try { return JSON.parse(localStorage.getItem(`gapp_global_${key}`) ?? 'null'); } catch { return null; }
        },
        set: async (key: string, value: any) => {
          localStorage.setItem(`gapp_global_${key}`, JSON.stringify(value));
        },
        delete: async (key: string) => { localStorage.removeItem(`gapp_global_${key}`); },
        list: async () => Object.keys(localStorage).filter(k => k.startsWith('gapp_global_')).map(k => k.slice(12)),
      },
      user: {
        get: async () => null,
        set: async () => {},
        delete: async () => {},
        list: async () => [],
      },
      session: {
        get: async () => null,
        set: async () => {},
        delete: async () => {},
        list: async () => [],
      },
      isAuthenticated: () => false,
      getCurrentUserId: () => null,
      migrateSessionToUser: async () => ({ migratedCount: 0, migratedKeys: [] }),
    },
    user: {
      isAuthenticated: () => false,
      getId: () => null,
      getName: () => null,
      getUsername: () => null,
      getAvatarUrl: () => null,
      getProfile: () => null,
    },
  };
  setTimeout(() => window.dispatchEvent(new CustomEvent('gapp:ready', { detail: { isAuthenticated: false, user: null } })), 0);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
