import { SidebarProvider } from '@/components/ui/sidebar.tsx';
import React, { useContext } from 'react';
import { observer } from 'mobx-react-lite';
import { StoreContext } from '@/store/storeContext.ts';
import { AppSidebar } from '@/components/Sidebar/AppSidebar.tsx';
import { SettingsDialog } from '../components/Settings/SettingsDialog.tsx';
import { EditItemDialog } from '@/components/EditItem/EditItemDialog.tsx';
import { ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { useDefaultLayout, usePanelCallbackRef } from 'react-resizable-panels';
import { useIsMobile } from '@/hooks/use-mobile.ts';
import { SidebarPanelContext } from '@/contexts/SidebarPanelContext.ts';
import { OnboardingBanner } from '@/components/OnboardingBanner/OnboardingBanner';

export const Dashboard = observer(({ children }: { children: React.ReactNode }) => {
  const store = useContext(StoreContext);

  const isMobile = useIsMobile();
  const { defaultLayout, onLayoutChanged } = useDefaultLayout({
    id: 'dashboard-layout',
  });
  const [panelRef, setPanelRef] = usePanelCallbackRef();

  const contextValue = React.useMemo(() => ({ panelRef }), [panelRef]);

  return (
    <>
      <SidebarPanelContext.Provider value={contextValue}>
        <SidebarProvider
          style={
            {
              '--sidebar-width': '100%',
            } as React.CSSProperties
          }
        >
          <ResizablePanelGroup
            orientation="horizontal"
            className="fixed w-full"
            defaultLayout={defaultLayout}
            onLayoutChanged={onLayoutChanged}
          >
            {isMobile ? (
              <AppSidebar />
            ) : (
              <ResizablePanel
                minSize="280px"
                maxSize="40%"
                defaultSize="340px"
                collapsible={true}
                groupResizeBehavior="preserve-pixel-size"
                panelRef={setPanelRef}
              >
                <AppSidebar />
              </ResizablePanel>
            )}
            <ResizablePanel>
              <main className="@container/main h-full">{children}</main>
            </ResizablePanel>
          </ResizablePanelGroup>
        </SidebarProvider>
        {store.isItemModalOpen && <EditItemDialog />}
        {store.isSettingsModalOpen && <SettingsDialog />}

        <OnboardingBanner />
      </SidebarPanelContext.Provider>
    </>
  );
});
