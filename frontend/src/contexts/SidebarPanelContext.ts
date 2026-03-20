import { createContext } from 'react';
import type { PanelImperativeHandle } from 'react-resizable-panels';

type SidebarPanelContextType = {
  panelRef: PanelImperativeHandle | null;
};

export const SidebarPanelContext = createContext<SidebarPanelContextType>({
  panelRef: null,
});
