import { createContext } from 'react';
import { mainStore } from './mainStore';
import { preferencesStore } from './preferencesStore.ts';

export const StoreContext = createContext<typeof mainStore | null>(null);
export const PreferencesStoreContext = createContext<typeof preferencesStore | null>(null);
