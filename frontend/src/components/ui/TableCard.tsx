import React from "react";

export interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  isSecondary?: boolean; // Disembunyikan pada tablet 768-1023px
  className?: string;
}

export interface TableCardProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T) => string;
  renderCard: (item: T) => React.ReactNode;
  emptyMessage?: string;
  className?: string;
}

export function TableCard<T>({
  data,
  columns,
  keyExtractor,
  renderCard,
  emptyMessage = "Tidak ada data yang tersedia",
  className = "",
}: TableCardProps<T>) {
  if (data.length === 0) {
    return (
      <div className="w-full text-center py-12 px-4 bg-surface rounded-xl border border-gray-200">
        <p className="text-sm sm:text-base text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`}>
      {/* Mobile (< 768px): Card Stack Layout */}
      <div className="grid grid-cols-1 gap-3 md:hidden">
        {data.map((item) => (
          <div key={keyExtractor(item)}>{renderCard(item)}</div>
        ))}
      </div>

      {/* Desktop (>= 768px): Regular Table Layout */}
      <div className="hidden md:block overflow-hidden rounded-xl border border-gray-200 bg-surface shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-700">
            <thead className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-600 uppercase tracking-wider">
              <tr>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    scope="col"
                    className={`px-4 py-3.5 ${
                      col.isSecondary ? "hidden lg:table-cell" : ""
                    } ${col.className || ""}`}
                  >
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.map((item) => (
                <tr
                  key={keyExtractor(item)}
                  className="hover:bg-gray-50/80 transition-colors"
                >
                  {columns.map((col) => {
                    const value = (item as Record<string, unknown>)[col.key];
                    return (
                      <td
                        key={col.key}
                        className={`px-4 py-3.5 align-middle ${
                          col.isSecondary ? "hidden lg:table-cell" : ""
                        } ${col.className || ""}`}
                      >
                        {col.render ? col.render(item) : String(value ?? "-")}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
