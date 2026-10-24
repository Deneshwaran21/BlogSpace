import React from "react";
import { AlertCircle } from "lucide-react";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
  errorMessage?: string;
  charCount?: {
    current: number;
    max?: number;
  };
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      helperText,
      errorMessage,
      charCount,
      id,
      className = "",
      required,
      disabled,
      rows = 4,
      ...props
    },
    ref
  ) => {
    const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);
    const hasError = !!errorMessage;

    return (
      <div className="w-full space-y-1.5 text-left">
        <div className="flex items-center justify-between">
          {label && (
            <label
              htmlFor={textareaId}
              className="block text-sm font-medium text-slate-800"
            >
              {label} {required && <span className="text-rose-500">*</span>}
            </label>
          )}
          {charCount && (
            <span className="text-xs text-slate-400">
              {charCount.current}
              {charCount.max ? ` / ${charCount.max}` : " chars"}
            </span>
          )}
        </div>
        <textarea
          ref={ref}
          id={textareaId}
          rows={rows}
          disabled={disabled}
          aria-invalid={hasError ? "true" : "false"}
          aria-describedby={
            hasError
              ? `${textareaId}-error`
              : helperText
              ? `${textareaId}-helper`
              : undefined
          }
          className={`w-full px-3.5 py-2.5 text-sm rounded-lg transition-colors duration-150 border bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed ${
            hasError
              ? "border-rose-400 focus:border-rose-500 focus:ring-rose-500/20"
              : "border-[#D8D4CA] hover:border-slate-400 focus:border-slate-800 focus:ring-slate-800/10"
          } ${className}`}
          {...props}
        />
        {hasError && (
          <p
            id={`${textareaId}-error`}
            className="flex items-center gap-1.5 text-xs text-rose-600 font-medium"
          >
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            {errorMessage}
          </p>
        )}
        {!hasError && helperText && (
          <p id={`${textareaId}-helper`} className="text-xs text-slate-500">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
export default Textarea;
