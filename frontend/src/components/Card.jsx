import React from "react";

export default function Card({
  title,
  description,
  actions,
  className = "",
  children,
}) {
  return (
    <section className={`surface-panel card-reveal p-6 ${className}`.trim()}>
      {(title || description || actions) && (
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            {title && (
              <h2 className="app-title text-base font-semibold text-slate-900">
                {title}
              </h2>
            )}
            {description && (
              <p className="mt-1 text-xs text-slate-500">
                {description}
              </p>
            )}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      {children}
    </section>
  );
}
