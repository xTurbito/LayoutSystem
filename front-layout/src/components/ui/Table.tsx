import { useState, useMemo } from 'react';
import {
  flexRender,
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table';
import { ChevronUp, ChevronDown, ChevronsUpDown, Inbox } from 'lucide-react';
import clsx from 'clsx';
import SearchInput from './SearchInput';
import PaginationTable from './PaginationTable';

interface GenericTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  className?: string;
  tableContainerClassName?: string;
  mobileContainerClassName?: string;
  summary?: string;
  showSearch?: boolean;
  searchFields?: (keyof T)[];
  searchPlaceholder?: string;
  filters?: React.ReactNode;
  actions?: React.ReactNode;
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  onSearchChange?: (value: string) => void;
  isLoading?: boolean;
  isFetching?: boolean;
  skeletonRows?: number;
  mobileTitle?: (item: T) => React.ReactNode;
  mobileSubtitle?: (item: T) => React.ReactNode;
  mobileBadges?: (item: T) => React.ReactNode;
  mobileFields?: Array<{
    label: React.ReactNode;
    value: (item: T) => React.ReactNode;
  }>;
  mobileActions?: (item: T) => React.ReactNode;
}

function filterBySearch<T>(data: T[], searchFields: (keyof T)[] | undefined, search: string): T[] {
  if (!Array.isArray(data)) return [];
  if (!searchFields || !search) return data;

  const query = search.toLowerCase();
  return data.filter(item =>
    searchFields.some(field => {
      const rawValue = item[field];
      return rawValue != null && String(rawValue).toLowerCase().includes(query);
    })
  );
}

export default function GenericTable<T>({
  columns,
  data,
  className,
  tableContainerClassName,
  mobileContainerClassName,
  summary,
  showSearch = true,
  searchFields,
  searchPlaceholder = 'Buscar…',
  filters,
  actions,
  page,
  pageCount,
  onPageChange,
  onSearchChange,
  isLoading = false,
  isFetching = false,
  skeletonRows = 8,
  mobileTitle,
  mobileSubtitle,
  mobileBadges,
  mobileFields,
  mobileActions,
}: GenericTableProps<T>) {
  const [search, setSearch] = useState('');
  const [sorting, setSorting] = useState<SortingState>([]);

  function handleSearch(value: string) {
    setSearch(value);
    onPageChange(0);
    onSearchChange?.(value);
  }

  const filteredData = useMemo(
    () => onSearchChange ? data : filterBySearch(data, searchFields, search),
    [data, searchFields, search, onSearchChange]
  );

  const table = useReactTable<T>({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: { sorting },
    onSortingChange: setSorting,
  });

  return (
    <div className={clsx(
      'flex flex-col overflow-hidden rounded-[var(--radius-card)] border border-border/70 bg-surface shadow-[var(--shadow-1)]',
      className,
    )}>
      {/* Toolbar: búsqueda, filtros, acciones */}
      {(showSearch || filters || actions) && (
      <div className="overflow-visible border-b border-border/70 bg-surface px-3 py-3 sm:px-5 sm:py-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Izquierda: Search + Filters */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 flex-1 min-w-0">
            {showSearch && (
              <div className="w-full md:flex-1 min-w-0">
                <SearchInput
                  value={search}
                  onChange={handleSearch}
                  placeholder={searchPlaceholder}
                  className="w-full"
                />
              </div>
            )}
            {filters && (
              <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2 md:flex md:w-auto md:shrink-0">
                {filters}
              </div>
            )}
          </div>

          {/* Derecha: Actions */}
          {actions && (
            <div className="flex flex-col sm:flex-row gap-2 justify-end lg:justify-start">
              {actions}
            </div>
          )}
        </div>
      </div>
      )}

      {/* Tabla desktop/tablet */}
      <div className={clsx(
        mobileTitle ? 'hidden overflow-x-auto md:block' : 'overflow-x-auto',
        'flex-1 transition-opacity duration-200',
        isFetching && !isLoading ? 'opacity-50' : 'opacity-100',
        tableContainerClassName,
      )}>
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 z-10 bg-surface">
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th
                    key={header.id}
                    aria-sort={
                      header.column.getIsSorted() === 'asc'
                        ? 'ascending'
                        : header.column.getIsSorted() === 'desc'
                          ? 'descending'
                          : undefined
                    }
                    className="px-3 py-3 text-left text-xs font-bold uppercase tracking-wide text-secondary sm:px-6 sm:py-4"
                  >
                    {header.column.getCanSort() ? (
                      <button
                        type="button"
                        className="-mx-2 inline-flex min-h-10 cursor-pointer items-center gap-1 rounded-full px-2 text-left font-bold uppercase tracking-wide material-state hover:bg-primary/8 hover:text-text active:bg-primary/12 material-focus"
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        <span>{flexRender(header.column.columnDef.header, header.getContext())}</span>
                        {header.column.getIsSorted() === 'asc' ? <ChevronUp size={13} aria-hidden="true" /> :
                        header.column.getIsSorted() === 'desc' ? <ChevronDown size={13} aria-hidden="true" /> :
                        <ChevronsUpDown size={13} className="opacity-50" aria-hidden="true" />}
                      </button>
                    ) : (
                      <span className="inline-flex min-h-10 items-center">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                      </span>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="bg-surface">
            {isLoading ? (
              Array.from({ length: skeletonRows }).map((_, i) => (
                <tr key={i}>
                  {columns.map((_, j) => (
                    <td key={j} className="px-3 sm:px-6 py-3 sm:py-4">
                      <div className="skeleton-box h-4 w-3/4 rounded" />
                    </td>
                  ))}
                </tr>
              ))
            ) : table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row, i) => (
                <tr
                  key={row.id}
                  className="animate-stagger-in transition-colors hover:bg-primary/5"
                  style={{ '--row-i': Math.min(i, 12) } as React.CSSProperties}
                >
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id} className="px-3 sm:px-6 py-3 sm:py-4 text-sm">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-3 sm:px-6 py-12 text-center">
                  <div className="flex flex-col items-center gap-2 text-secondary">
                    <Inbox size={32} className="opacity-40" />
                    <span className="text-sm">No hay registros para mostrar.</span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Cards mobile */}
      {mobileTitle && (
        <div className={clsx(
          'md:hidden transition-opacity duration-200',
          isFetching && !isLoading ? 'opacity-50' : 'opacity-100',
          mobileContainerClassName,
        )}>
          {isLoading ? (
            <div className="divide-y divide-border">
              {Array.from({ length: Math.min(skeletonRows, 4) }).map((_, index) => (
                <div key={index} className="p-3.5">
                  <div className="skeleton-box h-4 w-2/3 rounded-full" />
                  <div className="skeleton-box mt-2 h-3 w-1/2 rounded-full" />
                  <div className="skeleton-box mt-4 h-20 rounded-xl" />
                </div>
              ))}
            </div>
          ) : table.getRowModel().rows.length > 0 ? (
            <div className="divide-y divide-border">
              {table.getRowModel().rows.map((row, i) => (
                <article
                  key={row.id}
                  className="animate-stagger-in p-3.5 transition-colors hover:bg-primary/5"
                  style={{ '--row-i': Math.min(i, 12) } as React.CSSProperties}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-sm font-black text-text">
                        {mobileTitle(row.original)}
                      </div>
                      {mobileSubtitle && (
                        <div className="mt-1 text-xs text-secondary">
                          {mobileSubtitle(row.original)}
                        </div>
                      )}
                    </div>
                    {(mobileBadges || mobileActions) && (
                      <div className="flex shrink-0 items-center gap-2">
                        {mobileBadges && mobileBadges(row.original)}
                        {mobileActions && mobileActions(row.original)}
                      </div>
                    )}
                  </div>

                  {mobileFields && mobileFields.length > 0 && (
                    <div className="mt-3 grid grid-cols-1 gap-2 rounded-lg bg-surface-container/70 px-3 py-2">
                      {mobileFields.map((field, index) => (
                        <div key={index} className="flex min-h-8 items-center justify-between gap-4">
                          <span className="shrink-0 text-[10px] font-extrabold uppercase text-secondary">
                            {field.label}
                          </span>
                          <div className="min-w-0 text-right text-xs font-semibold text-text">
                            {field.value(row.original)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </article>
              ))}
            </div>
          ) : (
            <div className="px-3 py-12 text-center">
              <div className="flex flex-col items-center gap-2 text-secondary">
                <Inbox size={32} className="opacity-40" />
                <span className="text-sm">No hay registros para mostrar.</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Paginación */}
      <PaginationTable page={page} pageCount={pageCount} onPageChange={onPageChange} summary={summary} />
    </div>
  );
}
