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
    <div className="bg-surface rounded-xl border border-border shadow-sm flex flex-col">
      {/* Toolbar: búsqueda, filtros, acciones */}
      <div className="p-3 sm:p-5 border-b border-border bg-bg/50 overflow-visible rounded-t-xl">
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

      {/* Tabla */}
      <div className={clsx('overflow-x-auto flex-1 transition-opacity duration-200', isFetching && !isLoading ? 'opacity-50' : 'opacity-100')}>
        <table className="w-full text-left border-collapse">
          <thead className="bg-bg border-b border-border sticky top-0 z-10">
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th
                    key={header.id}
                    className={clsx('px-3 sm:px-6 py-3 sm:py-4 text-xs font-semibold text-secondary uppercase tracking-wider', header.column.getCanSort() && 'cursor-pointer select-none')}
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
                <tr key={i} className="animate-pulse">
                  {columns.map((_, j) => (
                    <td key={j} className="px-3 sm:px-6 py-3 sm:py-4">
                      <div className="h-4 bg-border rounded w-3/4" />
                    </td>
                  ))}
                </tr>
              ))
            ) : table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map(row => (
                <tr key={row.id} className="hover:bg-bg transition-colors border-b border-border last:border-0">
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

      {/* Paginación */}
      <PaginationTable page={page} pageCount={pageCount} onPageChange={onPageChange} summary={summary} />
    </div>
  );
}
