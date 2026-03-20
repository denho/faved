import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar.tsx';
import { PreferencesStoreContext, StoreContext } from '@/store/storeContext.ts';
import * as React from 'react';
import { observer } from 'mobx-react-lite';
import { useItemListState } from '@/hooks/useItemListState.ts';

export const NavMain = observer(
  ({ allItemCount, untaggedItemCount }: { allItemCount: number; untaggedItemCount: number }) => {
    const store = React.useContext(StoreContext);
    const prefStore = React.useContext(PreferencesStoreContext);
    const { isMobile, toggleSidebar } = useSidebar();
    const { setTagFilter } = useItemListState();

    const setAllTags = () => {
      setTagFilter(null);
      if (isMobile) {
        toggleSidebar();
      }
    };

    const setWithoutTags = () => {
      setTagFilter('none');
      if (isMobile) {
        toggleSidebar();
      }
    };

    const navLinks = [
      {
        title: 'All items',
        onClick: setAllTags,
        isSelected: store.tagFilter === null,
        icon: null,
        badge: allItemCount,
      },
      {
        title: 'Untagged',
        onClick: setWithoutTags,
        isSelected: store.tagFilter === 'none',
        icon: null,
        badge: untaggedItemCount,
      },
    ];

    return (
      <SidebarGroup>
        <SidebarGroupContent className="flex flex-col gap-2">
          <SidebarMenu>
            {navLinks.map((link) => (
              <SidebarMenuItem key={link.title}>
                <SidebarMenuButton
                  tooltip={link.title}
                  onClick={link.onClick}
                  isActive={link.isSelected}
                  className={'min-w-8 duration-200 ease-linear'}
                >
                  {link.icon && <link.icon />}
                  <span>{link.title}</span>
                </SidebarMenuButton>
                {prefStore.displaySidebarTagItemCounts && <SidebarMenuBadge>{link.badge}</SidebarMenuBadge>}
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    );
  }
);
