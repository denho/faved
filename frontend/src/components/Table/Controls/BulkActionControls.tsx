import * as React from 'react';
import { useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button.tsx';
import { RefreshCw, Square, SquareCheckBig, SquareMinus, TagsIcon, Trash, X } from 'lucide-react';
import { StoreContext } from '@/store/storeContext.ts';
import { Spinner } from '@/components/ui/spinner.tsx';
import { DeleteDialog } from '@/components/Table/Controls/DeleteDialog.tsx';
import { useSidebar } from '@/components/ui/sidebar.tsx';
import { cn } from '@/lib/utils.ts';
import { TagSelect } from '@/components/Table/Controls/TagSelect.tsx';
import { Separator } from '@/components/ui/separator.tsx';
import { observer } from 'mobx-react-lite';

export const BulkActionControls = observer(({ table, rowSelection }: { table: any; rowSelection: any }) => {
  const { isMobile, state } = useSidebar();
  const enableSidebarIndent = !isMobile && state === 'expanded';
  const store = React.useContext(StoreContext);
  const [deleteInProgress, setDeleteInProgress] = React.useState(false);
  const [fetchInProgress, setFetchInProgress] = React.useState(false);
  const selectedRows = useMemo(() => table.getFilteredSelectedRowModel().rows, [rowSelection, table]);
  const selectedRowsCount = selectedRows.length;
  const selectedItemIds = useMemo(() => selectedRows.map((row) => row.original.id), [selectedRows]);

  const deleteSelected = async () => {
    setDeleteInProgress(true);
    const result = await store.deleteItems(selectedItemIds);
    if (!result) {
      return;
    }
    store.fetchItems();
    table.resetRowSelection();
    setDeleteInProgress(false);
  };

  const refetchSelected = async () => {
    setFetchInProgress(true);
    const result = await store.refetchItemsMetadata(selectedItemIds);
    if (result) {
      store.fetchItems();
    }
    setFetchInProgress(false);
  };

  const updateTagsSelected = async ({ newSelectedTagsAll, newSelectedTagsSome }) => {
    await store.updateItemsTags({
      itemIds: selectedItemIds,
      newSelectedTagsAll,
      newSelectedTagsSome,
    });
    await store.fetchItems();
    return true;
  };

  const showToolbar = selectedRowsCount > 0 || store.keepBulkActionsToolbar;

  useEffect(() => {
    store.setHideOnboardingBanner(showToolbar);
  }, [showToolbar, store]);

  if (!showToolbar) {
    return null;
  }
  const selectedTags = selectedRows.map((row) => row.original.tags).flat();

  // Count occurrences of each tag
  const selectedRowsCountByTag = selectedTags.reduce(
    (count, tagID) => ((count[tagID] = (count[tagID] || 0) + 1), count),
    {}
  );
  const selectedTagsAll = Object.keys(selectedRowsCountByTag)
    .filter((tagID) => selectedRowsCountByTag[tagID] === selectedRowsCount)
    .map((tagID) => Number(tagID));
  const selectedTagsSome = Object.keys(selectedRowsCountByTag)
    .filter((tagID) => selectedRowsCountByTag[tagID] < selectedRowsCount)
    .map((tagID) => Number(tagID));
  return (
    <div
      className={cn(
        'bg-primary fixed bottom-[5dvh] z-50 flex translate-x-1/2 gap-0.5 rounded-l-lg rounded-r-lg p-1',
        enableSidebarIndent ? 'right-[calc((100%-287px)/2)]' : 'right-1/2'
      )}
    >
      <Button
        className="hover:bg-muted-foreground dark:hover:bg-accent-foreground group flex items-center gap-2 rounded-l-lg rounded-r-lg py-1.5"
        variant="default"
        onClick={() => {
          table.toggleAllPageRowsSelected(!table.getIsAllPageRowsSelected());
          store.setKeepBulkActionsToolbar(true);
        }}
      >
        {(table.getIsSomePageRowsSelected() && <SquareMinus />) ||
          (table.getIsAllPageRowsSelected() && <SquareCheckBig />) || <Square />}

        <Separator className="bg-primary-foreground" orientation="vertical" />

        <span className="whitespace-nowrap">{selectedRowsCount} selected</span>
      </Button>

      <TagSelect selectedTagsAll={selectedTagsAll} selectedTagsSome={selectedTagsSome} onSubmit={updateTagsSelected}>
        <Button
          disabled={!selectedRowsCount}
          variant="default"
          className="hover:bg-muted-foreground dark:hover:bg-accent-foreground rounded-lg"
        >
          <TagsIcon />
          <span className="hidden @md/main:block">Tags</span>
        </Button>
      </TagSelect>

      <Button
        variant="default"
        onClick={refetchSelected}
        disabled={fetchInProgress || !selectedRowsCount}
        className="hover:bg-muted-foreground dark:hover:bg-accent-foreground rounded-lg"
      >
        {fetchInProgress ? <RefreshCw className="animate-spin" /> : <RefreshCw />}
        <span className="hidden @md/main:block">Refetch</span>
      </Button>

      <DeleteDialog onConfirm={deleteSelected} itemsCount={selectedRowsCount}>
        <Button
          variant="default"
          disabled={deleteInProgress || !selectedRowsCount}
          className="hover:bg-muted-foreground dark:hover:bg-accent-foreground rounded-lg"
        >
          {deleteInProgress ? <Spinner /> : <Trash />}
          <span className="hidden @md/main:block">Delete</span>
        </Button>
      </DeleteDialog>
      <Button
        variant="default"
        size="icon"
        onClick={() => {
          store.setKeepBulkActionsToolbar(false);
          table.resetRowSelection();
        }}
        className="hover:bg-muted-foreground dark:hover:bg-accent-foreground rounded-lg"
      >
        <X />
      </Button>
    </div>
  );
});
