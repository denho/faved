import * as React from 'react';
import {
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  useSidebar,
} from '@/components/ui/sidebar.tsx';
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible.tsx';
import { IconChevronRight, IconDotsVertical, IconPinned } from '@tabler/icons-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu.tsx';
import { PreferencesStoreContext, StoreContext } from '@/store/storeContext.ts';
import { cn, colorMap, getColorClass } from '@/lib/utils.ts';
import { useItemListState } from '@/hooks/useItemListState.ts';
import { TagType } from '@/lib/types.ts';
import { DeleteTagDialog } from '@/components/Sidebar/DeleteTagDialog.tsx';
import { Popover, PopoverAnchor, PopoverContent, PopoverHeader } from '@/components/ui/popover.tsx';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field.tsx';
import { Input } from '@/components/ui/input.tsx';
import { Button } from '@/components/ui/button.tsx';
import { Textarea } from '@/components/ui/textarea.tsx';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip.tsx';
import { Info } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner.tsx';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer.tsx';
import { TagSelect } from '@/components/EditItem/TagSelect.tsx';

const TagItem = ({
  tag,
  highlightText,
  prependedNode = null,
  childTags = null,
  itemCount,
  isTagSelected,
  className,
}: {
  tag: TagType;
  highlightText: string | null;
  prependedNode?: React.ReactNode;
  childTags?: React.ReactNode;
  itemCount: number;
  isTagSelected: boolean;
  className?: string;
}) => {
  const prefStore = React.useContext(PreferencesStoreContext);
  const { setTagFilter } = useItemListState();
  const { isMobile, toggleSidebar } = useSidebar();

  const [isEditOpen, setIsEditOpen] = React.useState(false);

  const selectTag = () => {
    if (isEditOpen) {
      return;
    }
    setTagFilter(tag.id);
    if (isMobile) {
      toggleSidebar();
    }
  };

  return (
    <SidebarMenuItem className="relative">
      <SidebarMenuButton
        onClick={selectTag}
        isActive={isTagSelected}
        className={cn(
          prependedNode ? `ps-0` : 'ps-8',
          prefStore.displaySidebarTagItemCounts
            ? 'group-has-data-[sidebar=menu-action]/menu-item:pr-12 pointer-coarse:group-has-data-[sidebar=menu-action]/menu-item:pr-17'
            : 'group-has-data-[sidebar=menu-action]/menu-item:pr-8 pointer-coarse:group-has-data-[sidebar=menu-action]/menu-item:pr-8',
          className,
          isEditOpen ? 'bg-primary/5 pointer-events-none' : ''
        )}
      >
        {prependedNode}

        <div className={cn('flex w-full items-center gap-2')}>
          <span className={cn('h-2.5 w-2.5 flex-none rounded-full', getColorClass(tag.color))}></span>

          <span title={tag.title} className="line-clamp-1 break-all">
            {highlightText !== null
              ? tag.title.split(new RegExp(`(${highlightText})`, 'gi')).map((part, i) =>
                  part.toLowerCase() === highlightText.toLowerCase() ? (
                    <mark key={i} className="rounded-sm bg-yellow-200 px-0.5 dark:bg-yellow-800">
                      {part}
                    </mark>
                  ) : (
                    part
                  )
                )
              : tag.title}
          </span>
          {tag.description && (
            <Tooltip>
              <TooltipTrigger asChild className="pointer-coarse:hidden">
                <Info className="h-3 w-3 opacity-50" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs whitespace-pre-wrap">{tag.description}</p>
              </TooltipContent>
            </Tooltip>
          )}

          {tag.pinned && <IconPinned className="ms-auto h-4 w-4 flex-none" />}
        </div>
      </SidebarMenuButton>

      {childTags}

      <TagActions tag={tag} isEditOpen={isEditOpen} setIsEditOpen={setIsEditOpen} hasChildTags={childTags !== null} />

      {prefStore.displaySidebarTagItemCounts && (
        <SidebarMenuBadge className="pointer-coarse:right-6">{itemCount}</SidebarMenuBadge>
      )}
    </SidebarMenuItem>
  );
};

const TagActions = ({ tag, isEditOpen, setIsEditOpen, hasChildTags }) => {
  const { isMobile } = useSidebar();
  const store = React.useContext(StoreContext);

  const deleteTag = () => {
    store.onDeleteTag(tag.id);
  };

  const showEditControls = () => {
    setIsEditOpen(true);
  };

  return (
    <>
      {isMobile ? (
        <Drawer open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Edit tag</DrawerTitle>
            </DrawerHeader>

            <div className="mx-4 mb-4">
              <TagEditForm tag={tag} setIsEditOpen={setIsEditOpen} />
            </div>
          </DrawerContent>
        </Drawer>
      ) : (
        <Popover open={isEditOpen} modal={true}>
          <PopoverAnchor className="absolute bottom-0 left-[--spacing]" />
          <PopoverContent align="start" sideOffset={2} className="w-md max-w-[100dvw]">
            <PopoverHeader className="mb-2 text-center">Edit tag</PopoverHeader>
            <TagEditForm tag={tag} setIsEditOpen={setIsEditOpen} />
          </PopoverContent>
        </Popover>
      )}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <SidebarMenuAction showOnHover={true} className="cursor-pointer rounded-sm">
            <IconDotsVertical />
            <span className="sr-only">More</span>
          </SidebarMenuAction>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-24 rounded-lg"
          side={isMobile ? 'bottom' : 'right'}
          align={isMobile ? 'end' : 'start'}
        >
          <DropdownMenuItem onClick={showEditControls}>
            <span>Edit tag</span>
          </DropdownMenuItem>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger> Color</DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                {Object.keys(colorMap).map((color) => (
                  <DropdownMenuItem
                    key={color}
                    className={`text-${colorMap[color]}-foreground hover:bg-${colorMap[color]}-foreground/10`}
                    onClick={() => store.onChangeTagColor(tag.id, color)}
                  >
                    <span className={`mr-1 inline-block h-3 w-3 rounded-full ${colorMap[color]}`}></span>{' '}
                    {color.charAt(0).toUpperCase() + color.slice(1)}
                    <span className="ml-auto">{tag.color === color ? '✓' : ''}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
          <DropdownMenuItem onClick={() => store.updateTagPinned(tag.id, !tag.pinned)}>
            <span>{tag.pinned ? 'Unpin' : 'Pin'} tag</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem variant="destructive" onClick={(e) => e.preventDefault()} className="p-0">
              <DeleteTagDialog onConfirm={deleteTag} hasChildTags={hasChildTags}>
                <span className="w-full px-2 py-1">Delete</span>
              </DeleteTagDialog>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

const TagEditForm = ({ tag, setIsEditOpen }: { tag: TagType; setIsEditOpen: (bool) => void }) => {
  const store = React.useContext(StoreContext);
  const [isUpdateInProgress, setIsUpdateInProgress] = React.useState(false);

  const [newTagParent, setNewTagParent] = React.useState<number>(tag.parent);
  const [newTagTitle, setNewTagTitle] = React.useState<string>(tag.title);
  const [newTagDescription, setNewTagDescription] = React.useState<string>(tag.description);

  const hideEditControls = () => {
    setIsEditOpen(false);
  };

  const submit = async () => {
    setIsUpdateInProgress(true);
    const success = await store.updateTag(tag.id, newTagParent, newTagTitle, newTagDescription);
    setIsUpdateInProgress(false);
    if (!success) {
      return;
    }
    hideEditControls();
  };

  const revert = () => {
    setNewTagTitle(tag.fullPath);
    setNewTagDescription(tag.description);
    hideEditControls();
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      onKeyDown={(e) => {
        if (e.key === 'Escape') {
          revert();
        }
      }}
    >
      <FieldGroup className="gap-3" autoFocus={false}>
        <Field orientation="vertical" className="gap-1.5">
          <FieldLabel htmlFor="tag-name">Parent tag</FieldLabel>
          <TagSelect
            isMultiple={false}
            onChange={(tagID: number) => {
              setNewTagParent(tagID as number);
            }}
            selectedTagIDs={[newTagParent]}
            excludedTagIDs={[tag.id]}
          />
        </Field>
        <Field orientation="vertical" className="gap-1.5">
          <FieldLabel htmlFor="tag-name">Title</FieldLabel>
          <Input
            id="tag-name"
            autoComplete="off"
            value={newTagTitle as string}
            onChange={(e) => setNewTagTitle(e.target.value)}
          />
        </Field>
        <Field orientation="vertical" className="gap-1.5">
          <FieldLabel htmlFor="tag-description">Description</FieldLabel>
          <Textarea
            id="tag-description"
            value={newTagDescription as string}
            onChange={(e) => setNewTagDescription(e.target.value)}
          />
        </Field>
      </FieldGroup>
      <div className="flex flex-col-reverse gap-2 pt-4 md:flex-row md:justify-end">
        <Button type="reset" size="sm" onClick={revert} variant="secondary">
          Cancel
        </Button>
        <Button type="submit" size="sm" variant="default" disabled={isUpdateInProgress}>
          {isUpdateInProgress && <Spinner />}
          Save
        </Button>
      </div>
    </form>
  );
};

export function SidebarTag({
  tag,
  renderedChildTags,
  itemCount,
  isTagSelected,
  isChildTagSelected,
  childTagsMatchSearch,
  highlightText,
}: {
  tag: TagType;
  renderedChildTags: React.ReactNode[];
  itemCount: number;
  isTagSelected: boolean;
  isChildTagSelected: boolean;
  childTagsMatchSearch: boolean;
  highlightText: string | null;
}) {
  const [isCollapsibleOpen, setIsCollapsibleOpen] = React.useState(isChildTagSelected || childTagsMatchSearch);

  React.useEffect(() => {
    if (isChildTagSelected !== true || isChildTagSelected === isCollapsibleOpen) {
      return;
    }
    setIsCollapsibleOpen(isChildTagSelected);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isChildTagSelected]);

  React.useEffect(() => {
    if (childTagsMatchSearch !== true || childTagsMatchSearch === isCollapsibleOpen) {
      return;
    }
    setIsCollapsibleOpen(childTagsMatchSearch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [childTagsMatchSearch]);

  const hasChildTags = renderedChildTags.length > 0;

  return hasChildTags ? (
    <Collapsible className="group/collapsible" open={isCollapsibleOpen}>
      <TagItem
        tag={tag}
        itemCount={itemCount}
        isTagSelected={isTagSelected}
        highlightText={highlightText}
        className={cn(isChildTagSelected && !isCollapsibleOpen ? 'bg-primary/10' : '', 'gap-0')}
        prependedNode={
          <div
            className="p-2 hover:cursor-pointer"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsCollapsibleOpen(!isCollapsibleOpen);
            }}
          >
            <IconChevronRight className={cn('h-4 w-4 transition-transform', isCollapsibleOpen ? `rotate-90` : '')} />
          </div>
        }
        childTags={
          <CollapsibleContent>
            <SidebarMenuSub className="mr-0 pr-0">{renderedChildTags}</SidebarMenuSub>
          </CollapsibleContent>
        }
      />
    </Collapsible>
  ) : (
    <TagItem tag={tag} itemCount={itemCount} highlightText={highlightText} isTagSelected={isTagSelected} />
  );
}
