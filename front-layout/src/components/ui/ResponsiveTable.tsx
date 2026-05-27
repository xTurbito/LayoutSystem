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
  mobileRole?: 'primary' | 'meta' | 'actions';
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

  const mobileColumns = columns.filter((column) => !column.hideOnMobile);
  const primaryColumn =
    mobileColumns.find((column) => column.mobileRole === 'primary') ??
    mobileColumns.find((column) => column.mobileLabel === null) ??
    mobileColumns[0];
  const actionColumns = mobileColumns.filter((column) => column.mobileRole === 'actions');
  const metaColumns = mobileColumns.filter(
    (column) => column.id !== primaryColumn?.id && column.mobileRole !== 'actions',
  );

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
          <div key={getRowKey(item)} className="p-3.5">
            {primaryColumn && (
              <div className="mb-3 text-left">
                {primaryColumn.cell(item)}
              </div>
            )}

            {metaColumns.length > 0 && (
              <div className="grid grid-cols-1 gap-2 rounded-md bg-bg/70 px-3 py-2.5">
                {metaColumns.map((column) => (
                  <div key={column.id} className="flex items-start justify-between gap-4">
                    <span className="shrink-0 text-[11px] font-extrabold uppercase text-secondary">
                      {column.mobileLabel ?? column.header}
                    </span>
                    <div className="min-w-0 text-right text-sm font-semibold text-text">
                      {column.cell(item)}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {actionColumns.length > 0 && (
              <div className="mt-3 flex items-center justify-end gap-2 border-t border-border pt-3">
                {actionColumns.map((column) => (
                  <div key={column.id}>{column.cell(item)}</div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
