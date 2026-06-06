import { useState, useMemo, useRef, useEffect } from 'react';
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
  summary?: string;
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
  summary,
  searchFields,
  searchPlaceholder = 'Buscar...',
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
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
  }, []);

  function handleSearch(value: string) {
    setSearch(value); // valor del input siempre instantáneo
    // Filtro cliente: reset de página inmediato (useMemo refiltra local)
    if (!onSearchChange) {
      onPageChange(0);
      return;
    }
    // Filtro servidor: debounce para no disparar query por cada tecla
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onPageChange(0);
      onSearchChange(value);
    }, 300);
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
    <div className="bg-surface rounded-xl border border-border shadow-[0_18px_45px_rgba(63,73,246,0.08)] flex flex-col overflow-hidden">
      {/* Toolbar: búsqueda, filtros, acciones */}
      <div className="p-3 sm:p-5 border-b border-border bg-white/80 overflow-visible">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Izquierda: Search + Filters */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1 min-w-0">
            <div className="w-full sm:flex-1 min-w-0">
              <SearchInput value={search} onChange={handleSearch} placeholder={searchPlaceholder} />
            </div>
            {filters && (
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto shrink-0">
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

      {/* Tabla desktop/tablet */}
      <div className={clsx(
        mobileTitle ? 'hidden overflow-x-auto md:block' : 'overflow-x-auto',
        'flex-1 transition-opacity duration-200',
        isFetching && !isLoading ? 'opacity-50' : 'opacity-100',
      )}>
        <table className="w-full text-left border-collapse">
          <thead className="bg-[#f0efff] border-b border-border sticky top-0 z-10">
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th
                    key={header.id}
                    className={clsx('px-3 sm:px-6 py-3 sm:py-4 text-xs font-extrabold text-text uppercase', header.column.getCanSort() && 'cursor-pointer select-none')}
                    onClick={header.column.getCanSort() ? header.column.getToggleSortingHandler() : undefined}
                  >
                    <span className="flex items-center gap-1">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getCanSort() && (
                        header.column.getIsSorted() === 'asc' ? <ChevronUp size={13} /> :
                        header.column.getIsSorted() === 'desc' ? <ChevronDown size={13} /> :
                        <ChevronsUpDown size={13} className="opacity-40" />
                      )}
                    </span>
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
                      <div className="skeleton-box h-4 rounded w-3/4" />
                    </td>
                  ))}
                </tr>
              ))
            ) : table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row, i) => (
                <tr
                  key={row.id}
                  className="animate-stagger-in hover:bg-primary/5 transition-colors border-b border-border last:border-0"
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
        <div className={clsx('md:hidden transition-opacity duration-200', isFetching && !isLoading ? 'opacity-50' : 'opacity-100')}>
          {isLoading ? (
            <div className="divide-y divide-border">
              {Array.from({ length: Math.min(skeletonRows, 4) }).map((_, index) => (
                <div key={index} className="p-3.5">
                  <div className="skeleton-box h-4 w-2/3 rounded" />
                  <div className="skeleton-box mt-2 h-3 w-1/2 rounded" />
                  <div className="skeleton-box mt-4 h-20 rounded-md" />
                </div>
              ))}
            </div>
          ) : table.getRowModel().rows.length > 0 ? (
            <div className="divide-y divide-border">
              {table.getRowModel().rows.map((row, i) => (
                <article
                  key={row.id}
                  className="animate-stagger-in p-3.5"
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
                    {mobileBadges && (
                      <div className="shrink-0">
                        {mobileBadges(row.original)}
                      </div>
                    )}
                  </div>

                  {mobileFields && mobileFields.length > 0 && (
                    <div className="mt-3 grid grid-cols-1 gap-2 rounded-md bg-bg/70 px-3 py-2.5">
                      {mobileFields.map((field, index) => (
                        <div key={index} className="flex items-start justify-between gap-4">
                          <span className="shrink-0 text-[11px] font-extrabold uppercase text-secondary">
                            {field.label}
                          </span>
                          <div className="min-w-0 text-right text-sm font-semibold text-text">
                            {field.value(row.original)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {mobileActions && (
                    <div className="mt-3 flex items-center justify-end gap-2 border-t border-border pt-3">
                      {mobileActions(row.original)}
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
