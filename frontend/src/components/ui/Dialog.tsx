"use client";

import { useEffect, useRef } from "react";

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function Dialog({
  isOpen,
  onClose,
  title,
  description,
  children,
  className = "",
}: DialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const dialog = dialogRef.current;
    if (dialog && !dialog.open) {
      dialog.showModal();
    }

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = prevOverflow;
      if (dialog && dialog.open) {
        dialog.close();
      }
    };
  }, [isOpen, onClose]);

  // Jika tidak terbuka, jangan render apapun di DOM (cegah intercept click & tumpukan modal)
  if (!isOpen) return null;

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target === dialogRef.current) {
      onClose();
    }
  };

  return (
    <dialog
      ref={dialogRef}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={handleBackdropClick}
      className={`
        fixed inset-0 m-0 w-full h-full max-w-full max-h-full
        bg-black/50 backdrop-blur-xs p-0 z-50
        flex items-end sm:items-center justify-center
        border-none outline-hidden
        open:animate-in open:fade-in-0
        ${className}
      `}
    >
      {/* Modal / Bottom Sheet Body */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-lg bg-surface shadow-2xl overflow-hidden flex flex-col
          rounded-t-2xl sm:rounded-2xl max-h-[90dvh] sm:max-h-[85vh]
          animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-200"
        style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
      >
        {/* Mobile handle indicator */}
        <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mt-3 sm:hidden" />

        <div className="p-5 sm:p-6 flex items-start justify-between border-b border-gray-100">
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">
              {title}
            </h3>
            {description && (
              <p className="text-sm text-gray-500 mt-1">{description}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup dialog"
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg min-w-[36px] min-h-[36px] flex items-center justify-center cursor-pointer transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-5 sm:p-6 overflow-y-auto">{children}</div>
      </div>
    </dialog>
  );
}
