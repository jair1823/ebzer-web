import React from "react";
import { hexToRgba } from "../utils";

interface StatusBadgeProps {
  color: string;
  label: string;
  size?: "sm" | "md";
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  color,
  label,
  size = "sm",
}) => {
  const bg = hexToRgba(color, 0.18);
  const textColor = `color-mix(in srgb, ${color} 55%, rgb(var(--text-primary)))`;
  const padding = size === "md" ? "px-3 py-1.5 text-sm" : "px-2.5 py-1 text-xs";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ${padding}`}
      style={{ backgroundColor: bg, color: textColor }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full flex-shrink-0"
        style={{ backgroundColor: color }}
        aria-hidden="true"
      />
      {label}
    </span>
  );
};
