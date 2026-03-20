'use client';

import * as React from 'react';
import { startTransition, useContext, useEffect, useMemo, useState } from 'react';
import {
  type ColumnDef,
  type ColumnFiltersState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
  type VisibilityState,
} from '@tanstack/react-table';
import { StoreContext } from '@/store/storeContext.ts';
import { Search } from '../components/Table/Controls/Search.tsx';
import { observer } from 'mobx-react-lite';
import { Sorter } from '../components/Table/Controls/Sorter.tsx';
import { Pagination } from '../components/Table/Controls/Pagination.tsx';
import { CardsLayout } from '../components/Table/Layouts/CardsLayout.tsx';
import { PreviewImage } from '@/components/Table/Fields/PreviewImage.tsx';
import { ItemType, LayoutType, TagFilterType } from '@/lib/types.ts';
import { ItemsActions } from '@/components/Table/Fields/ItemActions.tsx';
import Loading from '@/layouts/Loading.tsx';
import {
  cn,
  getSavedLayoutColumnVisibilityPreference,
  getSavedLayoutPreference,
  saveLayoutColumnVisibilityPreference,
  saveLayoutPreference,
} from '@/lib/utils.ts';
import { TableLayout } from '@/components/Table/Layouts/TableLayout.tsx';
import { FieldToggler } from '@/components/Table/Controls/FieldToggler.tsx';
import { TagBadge } from '@/components/Table/Fields/TagBadge.tsx';
import { ListLayout } from '@/components/Table/Layouts/ListLayout.tsx';
import { LayoutSelector } from '@/components/Table/Controls/LayoutSelector.tsx';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu.tsx';
import { Button } from '@/components/ui/button.tsx';
import { PlusIcon, Settings2 } from 'lucide-react';
import { toast } from 'sonner';
import { Dashboard } from '@/layouts/Dashboard.tsx';
import { Checkbox } from '@/components/ui/checkbox.tsx';
import { BulkActionControls } from '@/components/Table/Controls/BulkActionControls.tsx';
import { useUrlState } from '@/hooks/useUrlState.ts';
import { useItemListState } from '@/hooks/useItemListState.ts';
import { SidebarToggler } from '@/components/Sidebar/SidebarToggler.tsx';

const columns: ColumnDef<ItemType>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() ? 'indeterminate' : false)}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className={cn(
          'onhover-visible bg-primary-foreground',
          table.getIsAllPageRowsSelected() || table.getIsSomePageRowsSelected() ? 'opacity-100!' : ''
        )}
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className={cn(
          'onhover-visible bg-primary-foreground dark:bg-primary-foreground',
          row.getIsSelected() ? 'opacity-100!' : ''
        )}
      />
    ),
    enableSorting: false,
    enableHiding: false,
    meta: { isAction: true },
  },
  {
    accessorKey: 'image',
    header: 'Image',
    enableSorting: false,
    enableHiding: true,
    cell: ({ row }) => {
      const imageURL = row.getValue('image') as string;
      return imageURL && <PreviewImage imageUrl={imageURL} item={row.original} />;
    },
  },
  {
    accessorKey: 'title',
    header: 'Title',
    enableSorting: true,
    enableHiding: true,
    meta: { class: 'min-w-xs' },
    cell: ({ row }) => {
      const value = row.getValue('title') as string;
      return <span title={value}>{value}</span>;
    },
  },
  {
    accessorKey: 'url',
    header: 'URL',
    enableSorting: true,
    enableHiding: true,
    meta: { class: 'min-w-xs break-all\n' },
    cell: ({ row }) => {
      const value = row.getValue('url') as string;
      return (
        <a className="underline" href={value} target="_blank" rel="noopener noreferrer">
          {value}
        </a>
      );
    },
  },
  {
    accessorKey: 'tags',
    header: 'Tags',
    enableSorting: false,
    enableHiding: true,
    meta: { class: 'min-w-xs' },

    filterFn: (row, columnId, filterValue: number[] | 'none' | null) => {
      if (filterValue === null) {
        return true;
      }
      const tagIDs = row.getValue('tags') as number[];
      if (filterValue === 'none') {
        return tagIDs.length === 0;
      }
      return tagIDs.some((val) => filterValue.includes(val));
    },
    cell: ({ row }) => {
      const tagIDs = row.getValue('tags') as number[];
      if (tagIDs.length === 0) {
        return null;
      }
      return (
        <div className="flex w-full flex-wrap gap-1 py-2 leading-6.5">
          {tagIDs.map((tagID) => (
            <TagBadge key={tagID} tagID={tagID} />
          ))}
        </div>
      );
    },
  },
  {
    accessorKey: 'description',
    header: 'Description',
    enableSorting: true,
    enableHiding: true,
    meta: { class: 'min-w-xs' },
  },
  {
    accessorKey: 'comments',
    header: 'Notes',
    enableSorting: true,
    enableHiding: true,
    meta: { class: 'min-w-xs' },
  },
  {
    accessorKey: 'created_at',
    header: 'Created date',
    enableSorting: true,
    enableHiding: true,
    meta: { class: 'min-w-[170px]' },
  },
  {
    accessorKey: 'updated_at',
    header: 'Updated date',
    enableSorting: true,
    enableHiding: true,
    meta: { class: 'min-w-[170px]' },
  },
  {
    id: 'actions',
    cell: ({ row }) => <ItemsActions row={row} />,
    enableSorting: false,
    enableHiding: false,
    meta: { isAction: true, isPinned: true },
  },
];

const Table: React.FC = observer(() => {
  const store = React.useContext(StoreContext);

  const { searchParams, setUrlState } = useUrlState();
  const pageIndexParam = useMemo(() => Number(searchParams.get('page') ?? 1) - 1, [searchParams]);
  const pageSizeParam = useMemo(() => Number(searchParams.get('per-page') ?? 25), [searchParams]);
  const sortByParam = useMemo(() => searchParams.get('sort') ?? 'created_at', [searchParams]);
  const isSortOrderDescParam = useMemo(() => searchParams.get('order') !== 'asc', [searchParams]);
  const searchKeywordParam = useMemo(() => searchParams.get('search') ?? '', [searchParams]);
  const tagFilterParam = useMemo<TagFilterType>(() => {
    const value = searchParams.get('tag');
    if (value === 'none') {
      return value;
    }
    if (value === null) {
      return null;
    }
    const numValue = Number(value);
    return isNaN(numValue) ? null : numValue;
  }, [searchParams]);

  const [globalFilter, setGlobalFilter] = React.useState<string>(searchKeywordParam);

  const tagColumnFilter = store.itemListFilters.tags;

  const columnFilters: ColumnFiltersState = [
    {
      id: 'tags',
      value: tagColumnFilter,
    },
  ];
  const [rowSelection, setRowSelection] = React.useState({});
  const [layout, setLayout] = useState<LayoutType>(getSavedLayoutPreference());
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>(
    getSavedLayoutColumnVisibilityPreference(layout)
  );
  const [pagination, setPagination] = useState({
    pageIndex: pageIndexParam,
    pageSize: pageSizeParam,
  });
  const [sorting, setSorting] = React.useState<SortingState>([
    {
      id: sortByParam,
      desc: isSortOrderDescParam,
    },
  ]);
  const [columnOrder, setColumnOrder] = useState<string[]>([
    'select',
    'image',
    'title',
    'url',
    'tags',
    'description',
    'comments',
    'created_at',
    'updated_at',
    'actions',
  ]);

  /**
   * State and URL syncing
   */
  // Search >
  const setGlobalFilterFromTable = (updaterOrValue) => {
    const newGlobalFilter = typeof updaterOrValue === 'function' ? updaterOrValue(globalFilter) : updaterOrValue;
    setGlobalFilter(newGlobalFilter);
    setPagination((oldValue) => {
      return {
        pageIndex: 0,
        pageSize: oldValue.pageSize,
      };
    });
  };

  // Update state from navigation changes
  useEffect(() => {
    if (globalFilter === searchKeywordParam) {
      return;
    }
    setGlobalFilter(searchKeywordParam);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchKeywordParam]);

  // Update URL from state change with delay
  useEffect(() => {
    if (globalFilter === searchKeywordParam) {
      return;
    }

    const timeoutId = setTimeout(() => {
      setUrlState({
        search: globalFilter,
        // Preventing race conditions
        page: 1,
      });
    }, 300);

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [globalFilter]);
  // ^ Search

  // Pagination >
  const setPaginationFromTable = (updaterOrValue) => {
    const newPagination = typeof updaterOrValue === 'function' ? updaterOrValue(pagination) : updaterOrValue;

    setPagination(newPagination);
    setUrlState({
      page: newPagination.pageIndex + 1,
      'per-page': newPagination.pageSize,
    });
  };

  // Update state from navigation changes
  useEffect(() => {
    if (pagination.pageIndex === pageIndexParam && pagination.pageSize === pageSizeParam) {
      return;
    }

    setPagination({
      pageIndex: pageIndexParam,
      pageSize: pageSizeParam,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageIndexParam, pageSizeParam]);
  // ^ Pagination

  // Sorting >
  // Update state from navigation changes
  useEffect(() => {
    if (sorting[0].id === sortByParam && sorting[0].desc === isSortOrderDescParam) {
      return;
    }

    updateSorting(sortByParam, isSortOrderDescParam, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortByParam, isSortOrderDescParam]);
  // ^ Sorting

  // Tag >
  const { setTagFilter } = useItemListState();
  // Update state from navigation changes
  useEffect(() => {
    if (store.tagFilter === tagFilterParam) {
      return;
    }

    setTagFilter(tagFilterParam, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tagFilterParam]);
  // ^ Tag
  /**
   * End of state and URL syncing
   */

  useEffect(() => {
    const savedColumnVisibility = getSavedLayoutColumnVisibilityPreference(layout);
    setColumnVisibility(savedColumnVisibility);
  }, [layout]);

  const table = useReactTable({
    data: store.items,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilterFromTable,
    onColumnOrderChange: setColumnOrder,
    onPaginationChange: setPaginationFromTable,
    globalFilterFn: 'includesString',
    autoResetPageIndex: false,
    state: {
      sorting,
      columnFilters,
      columnOrder,
      columnVisibility,
      rowSelection,
      globalFilter,
      pagination,
    },
  });
  const currentRows = table.getPaginationRowModel().rows;
  const sortableColumns = table.getAllColumns().filter((column) => column.getCanSort());
  const visibilityToggleColumns = table.getAllColumns().filter((column) => column.getCanHide());

  // Reset row selection on table state changes
  useEffect(() => {
    startTransition(() => {
      table.resetRowSelection();
      store.setKeepBulkActionsToolbar(false);
    });
  }, [globalFilter, sorting, pagination, store.tagFilter, table, store]);

  useEffect(() => {
    if (table.getState().pagination.pageIndex >= table.getPageCount()) {
      table.lastPage();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table.getPageCount()]);

  const updateSorting = (columnId: string, isDesc: boolean, skipURLUpdate: boolean = false) => {
    setSorting([
      {
        id: columnId,
        desc: isDesc,
      },
    ]);
    setPagination((oldValue) => {
      return {
        pageIndex: 0,
        pageSize: oldValue.pageSize,
      };
    });
    if (skipURLUpdate) {
      return;
    }

    setUrlState({
      sort: columnId,
      order: isDesc ? 'desc' : 'asc',
      page: 1,
    });
  };

  const updateLayout = (newValue: LayoutType) => {
    setLayout(newValue);
    saveLayoutPreference(newValue);
  };

  const updateColumnVisibility = (columnId: string, isVisible: boolean) => {
    const newVisibility = {
      ...table.getState().columnVisibility,
      [columnId]: isVisible,
    };
    const remainingVisibleColumns = visibilityToggleColumns.filter((column) => newVisibility[column.id] !== false);

    if (remainingVisibleColumns.length === 0) {
      toast.error("The last remaining visible field can't be hidden", {
        position: 'top-center',
      });
      return;
    }
    setColumnVisibility(newVisibility);
    saveLayoutColumnVisibilityPreference(layout, newVisibility);
  };

  const layouts: Record<LayoutType, React.ReactNode> = {
    list: <ListLayout rows={currentRows} />,
    cards: <CardsLayout rows={currentRows} />,
    table: <TableLayout table={table} rows={currentRows} />,
  };

  return (
    <div className="flex h-full flex-col">
      <header className="bg-background sticky top-0 z-50 flex h-14 w-full items-center gap-1.5 border-b px-4 backdrop-blur-sm group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
        <SidebarToggler />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <Settings2 className="h-4 w-4" />
              <span className="hidden @xl/main:inline-block">View</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="min-w-40">
            <DropdownMenuLabel>Layout</DropdownMenuLabel>
            <div className="mx-1 mb-3">
              <LayoutSelector layout={layout} onChange={updateLayout} />
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Visible fields</DropdownMenuLabel>
            <FieldToggler columns={visibilityToggleColumns} onChange={updateColumnVisibility} />
          </DropdownMenuContent>
        </DropdownMenu>
        <Search table={table} globalFilter={globalFilter} />
        <Sorter
          selectedSortColumn={sorting[0]?.id}
          isDesc={sorting[0]?.desc}
          onChange={updateSorting}
          columns={sortableColumns}
        />
        <Button
          variant="default"
          onClick={() => {
            store.openItemCreateModal();
          }}
        >
          <PlusIcon />
          <span className="hidden @xl/main:inline-block">Add</span>
        </Button>
      </header>

      <div className="h-full overflow-x-clip overflow-y-scroll">
        {currentRows.length > 0 ? (
          <div className={`flex h-full flex-col justify-between gap-5 item-list--${layout}`}>
            {layouts[layout]}
            <Pagination table={table} />
          </div>
        ) : (
          <div className="text-muted-foreground flex h-full items-center justify-center text-lg">No items.</div>
        )}
        <BulkActionControls table={table} rowSelection={rowSelection} />
      </div>
    </div>
  );
});

export const ItemList = () => {
  const store = useContext(StoreContext);

  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const loadData = async () => {
      await Promise.all([store.fetchItems(), store.fetchTags()]);
      setIsLoading(false);
    };

    loadData();
  }, [store]);

  if (isLoading) {
    return <Loading />;
  }

  return (
    <Dashboard>
      <Table />
    </Dashboard>
  );
};
