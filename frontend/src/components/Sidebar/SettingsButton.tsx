'use client';

import * as React from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button.tsx';
import { StoreContext } from '@/store/storeContext.ts';
import { observer } from 'mobx-react-lite';
import { useSidebar } from '@/components/ui/sidebar.tsx';

export const SettingsButton = observer(() => {
  const store = React.useContext(StoreContext);
  const { isMobile, toggleSidebar } = useSidebar();

  return (
    <Button
      variant="ghost"
      size="icon"
      className="relative"
      onClick={() => {
        store.setPreSelectedItemSettingsModal(null);
        store.setIsSettingsModalOpen(true);
        if (isMobile) {
          toggleSidebar();
        }
      }}
    >
      <span className="sr-only">Settings</span>
      <SlidersHorizontal />
      {store.appInfo?.update_available && (
        <div className="absolute -top-0.5 -right-0.5 h-2 w-2 flex-none rounded-full border-1 border-yellow-500 bg-yellow-500"></div>
      )}
    </Button>
  );
});
