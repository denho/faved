import { useIsMobile } from '@/hooks/use-mobile.ts';
import { useContext } from 'react';
import { SidebarPanelContext } from '@/contexts/SidebarPanelContext.ts';
import { SidebarTrigger } from '@/components/ui/sidebar.tsx';
import { Button } from '@/components/ui/button.tsx';
import { PanelLeftIcon } from 'lucide-react';
import { Separator } from '@/components/ui/separator.tsx';

const ButtonSeparator = () => <Separator orientation="vertical" className="mx-1 data-[orientation=vertical]:h-8" />;
export const SidebarToggler = () => {
  const isMobile = useIsMobile();
  const { panelRef } = useContext(SidebarPanelContext);

  if (isMobile) {
    return (
      <>
        <SidebarTrigger />
        <ButtonSeparator />
      </>
    );
  }

  if (panelRef) {
    return (
      <>
        <Button
          data-sidebar="trigger"
          data-slot="sidebar-trigger"
          variant="ghost"
          onClick={() => (panelRef.isCollapsed() ? panelRef.expand() : panelRef.collapse())}
        >
          <PanelLeftIcon />
          <span className="sr-only">Toggle Sidebar</span>
        </Button>
        <ButtonSeparator />
      </>
    );
  }
  return null;
};
