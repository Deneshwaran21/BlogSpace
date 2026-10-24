import React from "react";
import { BookOpen, Search, RefreshCw } from "lucide-react";
import Button from "./Button";

export interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  actionText?: string;
  onAction?: () => void;
  actionHref?: string;
  secondaryActionText?: string;
  onSecondaryAction?: () => void;
  className?: string;
}

export function EmptyState({
  title = "No articles found",
  description = "We couldn't find any stories matching your current criteria. Try adjusting your filters or explore other topics.",
  icon,
  actionText = "Reset filters",
  onAction,
  actionHref,
  secondaryActionText,
  onSecondaryAction,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center py-16 px-6 text-center bg-white rounded-2xl border border-dashed border-[#D8D4CA] my-8 max-w-2xl mx-auto shadow-xs ${className}`}
    >
      <div className="w-14 h-14 rounded-2xl bg-[#F4F1EA] text-slate-700 flex items-center justify-center mb-5 ring-8 ring-[#FAF9F6]">
        {icon || <Search className="w-6 h-6 text-slate-600" />}
      </div>
      <h3 className="text-xl font-serif font-semibold text-slate-900 mb-2">
        {title}
      </h3>
      <p className="text-sm text-slate-600 max-w-md leading-relaxed mb-6">
        {description}
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        {actionText && (
          <Button
            variant="primary"
            size="sm"
            onClick={onAction}
            href={actionHref}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            {actionText}
          </Button>
        )}
        {secondaryActionText && (
          <Button
            variant="outline"
            size="sm"
            onClick={onSecondaryAction}
            leftIcon={<BookOpen className="w-3.5 h-3.5" />}
          >
            {secondaryActionText}
          </Button>
        )}
      </div>
    </div>
  );
}

export default EmptyState;
