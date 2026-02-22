import React from "react";

export default function SkeletonRow({ className = "h-6 w-full" }) {
  return <div className={`skeleton ${className}`.trim()} />;
}
