import type { ReactNode } from 'react';
import clsx from 'clsx';

export interface ResponsiveTableColumn<T> {
  id: string;
  header: ReactNode;
  cell: (item: T) => ReactNode;
  className?: string;
  headerClassName?: string;
  mobileLabel?: ReactNode;
  hideOnMobile?: boolean;
}

interface ResponsiveTableProps<T> {
  data: T[];
  columns: ResponsiveTableColumn<T>[];
  getRowKey: (item: T) => string;
  emptyState?: ReactNode;
}

export default function ResponsiveTable<T>({
  data,
  columns,
  getRowKey,
  emptyState,
}: ResponsiveTableProps<T>) {
  if (data.length === 0) {
    return <>{emptyState}</>;
  }

  return (
    <div className="rounded-md border border-border bg-white overflow-hidden">
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#f0efff] border-b border-border">
              {columns.map((column) => (
                <th
                  key={column.id}
                  className={clsx(
                    'px-4 py-3 text-left text-xs font-extrabold text-text',
                    column.headerClassName,
                  )}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {data.map((item) => (
              <tr key={getRowKey(item)} className="transition-colors hover:bg-primary/5">
                {columns.map((column) => (
                  <td key={column.id} className={clsx('px-4 py-3.5 align-top', column.className)}>
                    {column.cell(item)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="divide-y divide-border md:hidden">
        {data.map((item) => (
          <div key={getRowKey(item)} className="p-4">
            <div className="flex flex-col gap-3">
              {columns
                .filter((column) => !column.hideOnMobile)
                .map((column) => (
                  <div key={column.id} className="flex items-start justify-between gap-4">
                    {column.mobileLabel !== null && (
                      <span className="shrink-0 text-xs font-extrabold uppercase text-secondary">
                        {column.mobileLabel ?? column.header}
                      </span>
                    )}
                    <div className="min-w-0 text-right text-sm text-text">
                      {column.cell(item)}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
