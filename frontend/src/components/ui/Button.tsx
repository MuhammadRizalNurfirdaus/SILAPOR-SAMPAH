import { forwardRef } from "react";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = "primary",
      size = "md",
      fullWidth = false,
      isLoading = false,
      className = "",
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-semibold rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 select-none active:scale-[0.98]";

    const variantStyles = {
      primary:
        "bg-primary text-white hover:bg-primary-dark focus-visible:ring-primary shadow-xs disabled:bg-gray-300 disabled:text-gray-500",
      secondary:
        "bg-primary-light text-primary-dark hover:bg-emerald-100 focus-visible:ring-primary disabled:bg-gray-100 disabled:text-gray-400",
      outline:
        "border border-gray-300 text-gray-700 bg-surface hover:bg-gray-50 focus-visible:ring-primary disabled:opacity-50",
      danger:
        "bg-danger text-white hover:bg-red-700 focus-visible:ring-danger shadow-xs disabled:bg-gray-300",
      ghost:
        "text-gray-700 hover:bg-gray-100 focus-visible:ring-primary disabled:opacity-50",
    };

    const sizeStyles = {
      sm: "text-xs px-3 py-1.5 min-h-[38px] sm:min-h-[36px]",
      md: "text-sm sm:text-base px-4 py-2.5 min-h-[44px]",
      lg: "text-base px-6 py-3 min-h-[52px]",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`
          ${baseStyles}
          ${variantStyles[variant]}
          ${sizeStyles[size]}
          ${fullWidth ? "w-full" : ""}
          ${disabled || isLoading ? "cursor-not-allowed opacity-75 active:scale-100" : ""}
          ${className}
        `}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8H4z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
