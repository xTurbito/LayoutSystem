interface PaginationProps {
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  summary?: string;
}


export default function PaginationTable({ page, pageCount, onPageChange, summary }: PaginationProps) {
  const safePageCount = Math.max(1, pageCount);

  return (
    <nav aria-label="Paginación" className="flex flex-col items-center justify-between gap-3 px-3 py-3 sm:flex-row sm:px-6 sm:py-4">
      {summary && <p className="w-full text-center text-xs text-secondary sm:w-auto sm:text-left sm:text-sm">{summary}</p>}
      <div className="flex w-full flex-wrap items-center justify-center gap-2 sm:w-auto sm:justify-end">
        <button
          type="button"
          className="min-h-10 cursor-pointer rounded-full px-4 py-2 text-xs font-bold text-secondary material-state hover:bg-primary/8 hover:text-primary active:bg-primary/12 disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm material-focus"
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
          className="min-h-10 cursor-pointer rounded-full px-4 py-2 text-xs font-bold text-secondary material-state hover:bg-primary/8 hover:text-primary active:bg-primary/12 disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm material-focus"
          onClick={() => onPageChange(Math.min(safePageCount - 1, page + 1))}
          disabled={page >= safePageCount - 1}
        >
          Siguiente
        </button>
      </div>
    </nav>
  );
}
