/**
 * @fileoverview Reusable, accessible administrative data table with pagination controls.
 */

import { ChevronLeft, ChevronRight, Inbox } from 'lucide-react';
import LoadingSpinner from '../common/LoadingSpinner.jsx';
import Button from '../common/Button.jsx';

export const AdminDataTable = ({
  columns = [],
  data = [],
  loading = false,
  emptyMessage = 'No records found matching the current criteria.',
  emptyIcon: EmptyIcon = Inbox,
  page = 1,
  totalPages = 1,
  totalItems = 0,
  onPageChange,
  keyExtractor = (item, idx) => item.id || item._id || idx,
  headerAction,
  title,
  subtitle,
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
      {(title || headerAction) && (
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            {title && (
              <h3 className="text-base font-bold text-slate-900 tracking-tight">{title}</h3>
            )}
            {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}

      <div className="overflow-x-auto min-h-[220px]">
        <table className="w-full text-left border-collapse text-xs sm:text-sm">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  scope="col"
                  className={`py-3.5 px-4 whitespace-nowrap ${col.className || ''}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="py-12 text-center">
                  <LoadingSpinner message="Loading records..." />
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-12 text-center">
                  <div className="flex flex-col items-center justify-center text-slate-400">
                    <EmptyIcon
                      className="w-10 h-10 stroke-1 mb-2 text-slate-300"
                      aria-hidden="true"
                    />
                    <p className="text-xs text-slate-500 font-medium max-w-sm">{emptyMessage}</p>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((item, rowIdx) => (
                <tr
                  key={keyExtractor(item, rowIdx)}
                  className="hover:bg-slate-50/70 transition-colors"
                >
                  {columns.map((col, colIdx) => (
                    <td
                      key={colIdx}
                      className={`py-3.5 px-4 text-slate-700 align-middle ${col.className || ''}`}
                    >
                      {col.render ? col.render(item, rowIdx) : (item[col.key] ?? '—')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {!loading && totalPages > 1 && onPageChange && (
        <div className="px-5 py-3.5 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
          <p>
            Showing{' '}
            <span className="font-semibold text-slate-800">
              {totalItems > 0 ? (page - 1) * (data.length || 1) + 1 : 0}
            </span>{' '}
            to{' '}
            <span className="font-semibold text-slate-800">
              {Math.min(page * (data.length || 1), totalItems)}
            </span>{' '}
            of <span className="font-semibold text-slate-800">{totalItems}</span> records
          </p>

          <div className="flex items-center space-x-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
              aria-label="Previous Page"
              className="px-2.5 py-1 text-xs"
            >
              <ChevronLeft className="w-3.5 h-3.5 mr-1" aria-hidden="true" />
              Previous
            </Button>

            <span className="px-2 text-slate-500 font-medium">
              Page {page} of {totalPages}
            </span>

            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
              aria-label="Next Page"
              className="px-2.5 py-1 text-xs"
            >
              Next
              <ChevronRight className="w-3.5 h-3.5 ml-1" aria-hidden="true" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDataTable;
