interface PaginationProps {
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  summary?: string;
}


export default function PaginationTable({ page, pageCount, onPageChange, summary }: PaginationProps) {
  const safePageCount = Math.max(1, pageCount);

  return (
    <nav aria-label="Paginación" className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-3 sm:px-6 py-3 sm:py-4 border-t border-border bg-bg">
      {summary && <p className="text-xs sm:text-sm text-secondary">{summary}</p>}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          type="button"
          className="px-2 sm:px-3 py-1 border border-border rounded-lg hover:bg-primary hover:text-white hover:border-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 text-xs sm:text-sm text-secondary cursor-pointer"
          onClick={() => onPageChange(Math.max(0, page - 1))}
          disabled={page === 0}
        >
          Anterior
        </button>
        <span className="text-xs sm:text-sm text-secondary whitespace-nowrap">
          Página{' '}
          <span className="font-medium text-primary">{page + 1}</span>
          {' '}de{' '}
          <span className="font-medium text-primary">{safePageCount}</span>
        </span>
        <button
          type="button"
          className="px-2 sm:px-3 py-1 border border-border rounded-lg hover:bg-primary hover:text-white hover:border-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 text-xs sm:text-sm text-secondary cursor-pointer"
          onClick={() => onPageChange(Math.min(safePageCount - 1, page + 1))}
          disabled={page >= safePageCount - 1}
        >
          Siguiente
        </button>
      </div>
    </nav>
  );
}
