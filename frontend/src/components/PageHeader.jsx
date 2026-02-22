import React from "react";

export default function PageHeader({
  title,
  subtitle,
  eyebrow,
  eyebrowClassName = "bg-slate-100 text-slate-700",
  actions,
  className = "",
}) {
  return (
    <header className={`surface-panel p-6 ${className}`.trim()}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          {eyebrow && (
            <span className={`pill ${eyebrowClassName}`.trim()}>
              {eyebrow}
            </span>
          )}
          <h1 className="app-title text-3xl font-semibold tracking-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm text-slate-500">{subtitle}</p>
          )}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </header>
  );
}
