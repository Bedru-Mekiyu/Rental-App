import DashboardCard from "./DashboardCard";

export default function ResponsiveSection({
  title,
  description,
  actions,
  className = "",
  children,
}) {
  return (
    <details className={className} open>
      <summary className="accordion-summary sm:hidden">
        <span>{title}</span>
      </summary>
      <div className="mt-3 sm:mt-0">
        <DashboardCard
          title={title}
          description={description}
          actions={actions}
          className="mobile-accordion-card"
          collapsibleOnMobile={false}
        >
          {children}
        </DashboardCard>
      </div>
    </details>
  );
}
