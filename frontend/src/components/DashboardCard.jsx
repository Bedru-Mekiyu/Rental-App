// src/components/DashboardCard.jsx
export default function DashboardCard({
  title,
  description,
  children,
  actions,
  action, // support singular prop too
}) {
  const renderedActions = actions || action;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      {(title || description || renderedActions) && (
        <div className="mb-3 flex items-start justify-between gap-2">
          <div>
            {title && (
              <h2 className="text-sm font-semibold text-slate-800">
                {title}
              </h2>
            )}
            {description && (
              <p className="mt-1 text-xs text-slate-500">
                {description}
              </p>
            )}
          </div>
          {renderedActions && (
            <div className="flex items-center gap-2">{renderedActions}</div>
          )}
        </div>
      )}
      {children}
    </section>
  );
}
