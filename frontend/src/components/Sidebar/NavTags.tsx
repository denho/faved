import {
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  useSidebar,
} from '@/components/ui/sidebar.tsx';
import * as React from 'react';
import { useCallback, useMemo, useState } from 'react';
import { TagType } from '@/lib/types.ts';
import { SidebarTag } from '@/components/Sidebar/SidebarTag.tsx';
import { PreferencesStoreContext, StoreContext } from '@/store/storeContext.ts';
import { observer } from 'mobx-react-lite';
import { Search, SearchIcon, X } from 'lucide-react';
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from '@/components/ui/input-group.tsx';
import { Kbd } from '@/components/ui/kbd.tsx';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu.tsx';
import { IconDotsVertical } from '@tabler/icons-react';

export const NavTags = observer(({ itemIDsByTagID }: { itemIDsByTagID: Record<string, number[]> }) => {
  const store = React.useContext(StoreContext);
  const prefStore = React.useContext(PreferencesStoreContext);
  const selectedTag = store.tags[store.tagFilter] ?? null;
  const [tagSearchValue, setTagSearchValue] = useState('');
  const { isMobile } = useSidebar();

  const allTags = useMemo(() => {
    const tags = [...store.tagsArray];
    tags.sort((a, b) => {
      if (a.pinned && !b.pinned) {
        return -1;
      }
      if (!a.pinned && b.pinned) {
        return 1;
      }
      return 0;
    });
    return tags;
  }, [store.tagsArray]);

  const [isTagSearchVisible, setIsTagSearchVisible] = useState(false);
  const tagSearchRef = React.useRef(null);

  const hideTagSearch = () => {
    setTagSearchValue('');
    setIsTagSearchVisible(false);
  };

  const showTagSearch = () => {
    setIsTagSearchVisible(true);
  };

  React.useEffect(() => {
    if (isTagSearchVisible) {
      const timeout = setTimeout(() => {
        tagSearchRef.current?.focus();
      }, 50);
      return () => clearTimeout(timeout);
    }
  }, [isTagSearchVisible]);

  const renderTag = useCallback(
    (parentID: number, threadItemIDs = [], threadMatchesSearch = false): [React.JSX.Element[], number[], boolean] => {
      const renderedTags: React.JSX.Element[] = [];
      const tags: TagType[] = allTags.filter((tag: TagType) => tag.parent === parentID) as TagType[];

      let levelItemIDs = [];
      let levelTagsMatchSearch = false;

      for (const tag of tags) {
        const isTagSelected = store.tagFilter === tag.id;
        const isChildTagSelected = !isTagSelected && selectedTag && selectedTag.fullPath.indexOf(tag.fullPath) === 0;

        const isTagSearchActive = tagSearchValue !== '';
        const currentTagMatchesSearch =
          isTagSearchActive && tag.title.toLowerCase().includes(tagSearchValue.toLowerCase());

        const currentTagItemIDs = itemIDsByTagID[tag.id] ?? [];
        const [renderedChildTags, childTagsItemIDs, childTagsMatchSearch] = renderTag(
          tag.id,
          [...threadItemIDs, ...currentTagItemIDs],
          threadMatchesSearch || currentTagMatchesSearch
        );
        // Ensure we don't double count items that are assigned multiple child tags and/or current tag and child tags
        const accountedItemIDs = new Set([
          ...currentTagItemIDs,
          ...(prefStore.includeNestedTagItems ? childTagsItemIDs : []),
        ]);
        levelItemIDs = [...levelItemIDs, ...accountedItemIDs];

        if (!isTagSearchActive || currentTagMatchesSearch || childTagsMatchSearch || threadMatchesSearch) {
          const renderedTag = (
            <SidebarTag
              key={tag.id}
              tag={tag}
              renderedChildTags={renderedChildTags}
              itemCount={accountedItemIDs.size}
              isTagSelected={isTagSelected}
              isChildTagSelected={isChildTagSelected}
              childTagsMatchSearch={childTagsMatchSearch}
              highlightText={currentTagMatchesSearch ? tagSearchValue : null}
            />
          );
          renderedTags.push(renderedTag);
        }

        if (currentTagMatchesSearch || childTagsMatchSearch) {
          levelTagsMatchSearch = true;
        }
      }

      return [renderedTags, levelItemIDs, levelTagsMatchSearch];
    },
    [allTags, selectedTag, store.tagFilter, prefStore.includeNestedTagItems, itemIDsByTagID, tagSearchValue]
  );
  const [renderedTagTree] = renderTag(0);

  return (
    <SidebarGroup className="gap-2">
      {isTagSearchVisible ? (
        <InputGroup className="h-8 w-full">
          <InputGroupInput
            value={tagSearchValue}
            onChange={(e) => setTagSearchValue(String(e.target.value))}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                hideTagSearch();
              }
            }}
            name="search"
            className="h-9 pl-6"
            placeholder="Filter tags..."
            ref={tagSearchRef}
          />
          <InputGroupAddon>
            <SearchIcon />
          </InputGroupAddon>
          <InputGroupAddon align="inline-end" onClick={hideTagSearch}>
            <InputGroupButton>
              <X className="mt-[1px]" /> <Kbd className="pointer-coarse:hidden">Esc</Kbd>
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
      ) : (
        <div className="me-1 flex items-center justify-end gap-2">
          <SidebarGroupLabel className="me-auto">Tags</SidebarGroupLabel>
          <SidebarGroupAction className="relative top-0 right-0 after:hidden" onClick={showTagSearch}>
            <Search /> <span className="sr-only">Filter tags</span>
          </SidebarGroupAction>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarGroupAction className="relative top-0 right-0 after:hidden">
                <IconDotsVertical />
                <span className="sr-only">More</span>
              </SidebarGroupAction>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="rounded-lg"
              side={isMobile ? 'bottom' : 'right'}
              align={isMobile ? 'end' : 'start'}
            >
              <DropdownMenuGroup>
                <DropdownMenuCheckboxItem
                  checked={prefStore.includeNestedTagItems}
                  onCheckedChange={(value) => prefStore.setIncludeNestedTagItems(value)}
                >
                  <span>Include items from nested tags</span>
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={prefStore.displaySidebarTagItemCounts}
                  onCheckedChange={(value) => prefStore.setDisplaySidebarTagItemCounts(value)}
                >
                  <span>Display item count</span>
                </DropdownMenuCheckboxItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>{renderedTagTree}</SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
});
