import { makeAutoObservable, autorun } from 'mobx';

class PreferencesStore {
  includeNestedTagItems = true;
  displaySidebarTagItemCounts = true;

  constructor() {
    makeAutoObservable(this);

    this.load();

    autorun(() => {
      localStorage.setItem(
        'app:preferences',
        JSON.stringify({
          includeNestedTagItems: this.includeNestedTagItems,
          displaySidebarTagItemCounts: this.displaySidebarTagItemCounts,
        })
      );
    });
  }

  load() {
    try {
      const stored = localStorage.getItem('app:preferences');
      if (!stored) {
        return;
      }

      const data = JSON.parse(stored);

      Object.assign(this, data);
    } catch {
      // Ignore storage errors - failing silently is acceptable for preferences
    }
  }

  setIncludeNestedTagItems = (val: boolean) => {
    this.includeNestedTagItems = val;
  };

  setDisplaySidebarTagItemCounts = (val: boolean) => {
    this.displaySidebarTagItemCounts = val;
  };
}

export const preferencesStore = new PreferencesStore();
