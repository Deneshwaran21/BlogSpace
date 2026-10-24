import React from "react";

export interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "editorial" | "outline" | "success" | "warm";
  size?: "sm" | "md";
  className?: string;
  dot?: boolean;
}

export function Badge({
  children,
  variant = "editorial",
  size = "md",
  className = "",
  dot = false,
}: BadgeProps) {
  const baseStyles =
    "inline-flex items-center font-medium transition-colors select-none tracking-wide";

  const sizeStyles = {
    sm: "text-[11px] px-2.5 py-0.5 rounded-full gap-1.5",
    md: "text-xs px-3 py-1 rounded-full gap-1.5",
  };

  const variantStyles = {
    editorial: "bg-[#ECE8DF] text-[#374151] hover:bg-[#E2DDD2]",
    default: "bg-slate-100 text-slate-800 hover:bg-slate-200",
    outline: "border border-[#D8D4CA] text-slate-700 bg-transparent hover:bg-slate-50",
    success: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    warm: "bg-amber-50 text-amber-800 border border-amber-200/60",
  };

  return (
    <span
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
    >
      {dot && (
        <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70 shrink-0" />
      )}
      {children}
    </span>
  );
}

export default Badge;
