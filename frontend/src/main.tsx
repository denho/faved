import { createRoot } from 'react-dom/client';
import './index.css';
import { App } from './App.tsx';
import { mainStore } from './store/mainStore.ts';
import { preferencesStore } from './store/preferencesStore.ts';
import { PreferencesStoreContext, StoreContext } from './store/storeContext.ts';
import { ThemeProvider } from './components/ThemeProvider.tsx';
import { StrictMode } from 'react';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <StoreContext.Provider value={mainStore}>
      <PreferencesStoreContext.Provider value={preferencesStore}>
        <ThemeProvider defaultTheme="system" storageKey="faved-ui-theme">
          <App />
        </ThemeProvider>
      </PreferencesStoreContext.Provider>
    </StoreContext.Provider>
  </StrictMode>
);
