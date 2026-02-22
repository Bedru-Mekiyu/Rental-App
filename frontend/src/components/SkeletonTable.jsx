import React from "react";
import SkeletonRow from "./SkeletonRow";

export default function SkeletonTable({ rows = 5, columns = 4, className = "" }) {
  return (
    <div
      className={`overflow-hidden rounded-xl border border-slate-200 bg-white ${className}`.trim()}
    >
      <div className="border-b bg-slate-50 px-4 py-3">
        <SkeletonRow className="h-4 w-40" />
      </div>
      <div className="divide-y divide-slate-100">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div
            key={`row-${rowIndex}`}
            className="grid gap-3 px-4 py-3"
            style={{
              gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
            }}
          >
            {Array.from({ length: columns }).map((__, colIndex) => (
              <SkeletonRow key={`cell-${rowIndex}-${colIndex}`} className="h-4 w-full" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
