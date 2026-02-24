// src/components/DashboardCard.jsx
export default function DashboardCard({
  title,
  description,
  children,
  actions,
  action, // support singular prop too
  className = "",
  collapsibleOnMobile = true,
}) {
  const renderedActions = actions || action;
  const hasHeader = title || description || renderedActions;
  const shouldAccordion = collapsibleOnMobile && (title || description);
    const sectionClassName = `surface-panel card-reveal hover-lift p-3 sm:p-5 lg:p-6 ${
    shouldAccordion ? "mobile-accordion-card" : ""
  } ${className}`.trim();

  const cardBody = (
    <section className={sectionClassName}>
      {hasHeader && (
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            {title && <h2 className="panel-title">{title}</h2>}
            {description && (
              <p className="panel-subtitle mt-1">{description}</p>
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

  if (!shouldAccordion) {
    return cardBody;
  }

  return (
    <details open>
      <summary className="accordion-summary sm:hidden">
        <span>{title || "Details"}</span>
      </summary>
      <div className="mt-3 sm:mt-0">{cardBody}</div>
    </details>
  );
}
