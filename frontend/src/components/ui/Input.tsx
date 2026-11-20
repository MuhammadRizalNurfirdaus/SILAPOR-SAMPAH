"use client";

import { forwardRef, useState } from "react";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  requiredIndicator?: boolean;
  showPasswordToggle?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      requiredIndicator = false,
      showPasswordToggle = true,
      id,
      type = "text",
      className = "",
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);
    const isPassword = type === "password";
    const actualType = isPassword && showPassword ? "text" : type;

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-semibold text-gray-800 flex items-center gap-1"
          >
            {label}
            {requiredIndicator && <span className="text-danger">*</span>}
          </label>
        )}
        <div className="relative w-full flex items-center">
          <input
            ref={ref}
            id={inputId}
            type={actualType}
            aria-invalid={Boolean(error)}
            aria-describedby={
              error
                ? `${inputId}-error`
                : helperText
                ? `${inputId}-helper`
                : undefined
            }
            className={`
              w-full rounded-lg border bg-surface px-3.5 py-2.5 text-base sm:text-sm text-gray-900
              min-h-[44px] transition-colors
              placeholder:text-gray-400
              focus:outline-none focus:ring-2 focus:ring-offset-1
              disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed
              ${isPassword && showPasswordToggle ? "pr-11" : ""}
              ${
                error
                  ? "border-danger focus:border-danger focus:ring-danger"
                  : "border-gray-300 focus:border-primary focus:ring-primary"
              }
              ${className}
            `}
            {...props}
          />
          {isPassword && showPasswordToggle && (
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? "Sembunyikan kata sandi" : "Lihat kata sandi"}
              title={showPassword ? "Sembunyikan kata sandi" : "Lihat kata sandi"}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-gray-700 focus:outline-none focus-visible:text-primary rounded-md min-w-[36px] min-h-[36px] flex items-center justify-center transition-colors cursor-pointer"
              tabIndex={-1}
            >
              {showPassword ? (
                /* Ikon Tutup / Sembunyikan Kata Sandi (Eye Slash) */
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                  />
                </svg>
              ) : (
                /* Ikon Lihat Kata Sandi (Eye) */
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              )}
            </button>
          )}
        </div>
        {error ? (
          <p id={`${inputId}-error`} className="text-xs text-danger font-medium">
            {error}
          </p>
        ) : helperText ? (
          <p id={`${inputId}-helper`} className="text-xs text-gray-500">
            {helperText}
          </p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = "Input";
