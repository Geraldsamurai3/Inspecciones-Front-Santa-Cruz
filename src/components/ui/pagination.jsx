import React, { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight, MoreHorizontal } from "lucide-react";

/**
 * Pagination component (reusable across app)
 *
 * Props:
 * - page: number (1-based)
 * - total?: number (total items)
 * - pageSize?: number (default 10) – used only if total is provided
 * - pageCount?: number (total pages) – alternative to (total/pageSize)
 * - onPageChange: (newPage: number) => void
 * - siblingCount?: number (default 1) – how many pages to show adjacent to current
 * - boundaryCount?: number (default 1) – how many pages to show at the start and end
 * - disabled?: boolean – disable all controls
 * - className?: string – wrapper className for layout overrides
 * - hideIfSinglePage?: boolean (default true)
 * - showFirstLast?: boolean (default true)
 * - showPrevNext?: boolean (default true)
 */
export default function Pagination({
  page = 1,
  total,
  pageSize = 10,
  pageCount: pageCountProp,
  onPageChange,
  siblingCount = 1,
  boundaryCount = 1,
  disabled = false,
  className = "",
  hideIfSinglePage = true,
  showFirstLast = true,
  showPrevNext = true,
}) {
  const pageCount = useMemo(() => {
    if (typeof pageCountProp === "number" && pageCountProp > 0) return pageCountProp;
    if (typeof total === "number" && total >= 0) return Math.max(1, Math.ceil(total / Math.max(1, pageSize)));
    return 1;
  }, [pageCountProp, total, pageSize]);

  const items = useMemo(() => getPaginationItems({ page, pageCount, siblingCount, boundaryCount }), [page, pageCount, siblingCount, boundaryCount]);

  if (hideIfSinglePage && pageCount <= 1) return null;

  const canPrev = page > 1;
  const canNext = page < pageCount;

  const goTo = (p) => {
    if (!onPageChange || disabled) return;
    const safe = Math.max(1, Math.min(pageCount, p));
    if (safe !== page) onPageChange(safe);
  };

  return (
    <nav className={`flex items-center justify-center gap-2 ${className}`} aria-label="Paginación">
      {showFirstLast && (
        <Button type="button" variant="outline" size="sm" aria-label="Primera página" onClick={() => goTo(1)} disabled={!canPrev || disabled} className="h-9 px-2">
          <ChevronsLeft className="w-4 h-4" />
        </Button>
      )}
      {showPrevNext && (
        <Button type="button" variant="outline" size="sm" aria-label="Página anterior" onClick={() => goTo(page - 1)} disabled={!canPrev || disabled} className="h-9 px-2">
          <ChevronLeft className="w-4 h-4" />
        </Button>
      )}

      <ul className="flex items-center gap-1" role="list">
        {items.map((it, idx) => {
          if (typeof it === "number") {
            const active = it === page;
            return (
              <li key={`p-${it}`}>
                <Button
                  type="button"
                  variant={active ? "" : "outline"}
                  size="sm"
                  aria-current={active ? "page" : undefined}
                  aria-label={`Página ${it}`}
                  onClick={() => goTo(it)}
                  disabled={disabled}
                  className={`h-9 w-9 p-0 ${active ? "bg-blue-600 text-white hover:bg-blue-700" : ""}`}
                >
                  {it}
                </Button>
              </li>
            );
          }
          // Ellipsis
          return (
            <li key={`e-${idx}`} aria-hidden className="h-9 w-9 grid place-items-center text-gray-500">
              <MoreHorizontal className="w-4 h-4" />
            </li>
          );
        })}
      </ul>

      {showPrevNext && (
        <Button type="button" variant="outline" size="sm" aria-label="Página siguiente" onClick={() => goTo(page + 1)} disabled={!canNext || disabled} className="h-9 px-2">
          <ChevronRight className="w-4 h-4" />
        </Button>
      )}
      {showFirstLast && (
        <Button type="button" variant="outline" size="sm" aria-label="Última página" onClick={() => goTo(pageCount)} disabled={!canNext || disabled} className="h-9 px-2">
          <ChevronsRight className="w-4 h-4" />
        </Button>
      )}
    </nav>
  );
}

function range(start, end) {
  const res = [];
  for (let i = start; i <= end; i++) res.push(i);
  return res;
}

function getPaginationItems({ page, pageCount, siblingCount, boundaryCount }) {
  const totalPageNumbers = boundaryCount * 2 + siblingCount * 2 + 3; // first, last, current

  if (pageCount <= totalPageNumbers) {
    return range(1, pageCount);
  }

  const leftSibling = Math.max(page - siblingCount, 1);
  const rightSibling = Math.min(page + siblingCount, pageCount);
  const showLeftEllipsis = leftSibling > boundaryCount + 2;
  const showRightEllipsis = rightSibling < pageCount - boundaryCount - 1;

  const firstPages = range(1, boundaryCount);
  const lastPages = range(pageCount - boundaryCount + 1, pageCount);

  if (!showLeftEllipsis && showRightEllipsis) {
    const leftRange = range(1, rightSibling + (boundaryCount + 1 - leftSibling));
    return [...leftRange, '…', ...lastPages];
  }

  if (showLeftEllipsis && !showRightEllipsis) {
    const rightRange = range(leftSibling - (boundaryCount + 1 - (pageCount - rightSibling)), pageCount);
    return [...firstPages, '…', ...rightRange];
  }

  if (showLeftEllipsis && showRightEllipsis) {
    const middle = range(leftSibling, rightSibling);
    return [...firstPages, '…', ...middle, '…', ...lastPages];
  }

  return range(1, pageCount);
}

/**
 * Example usage:
 * <Pagination
 *   page={page}
 *   total={filtered.length}
 *   pageSize={ITEMS_PER_PAGE}
 *   onPageChange={setPage}
 * />
 */
