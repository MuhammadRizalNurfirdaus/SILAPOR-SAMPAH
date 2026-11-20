'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

interface AdminUserMenuProps {
  name: string;
  username: string;
}

export function AdminUserMenu({ name, username }: AdminUserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Initial letter for Avatar (Figma: 'U')
  const initial = name ? name.charAt(0).toUpperCase() : 'U';

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        data-testid="admin-user-menu"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-2 text-sm font-medium text-gray-900 hover:text-primary transition-colors py-1.5 px-2.5 rounded-lg hover:bg-gray-100 cursor-pointer min-h-[40px]"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {/* Avatar Figma: circular primary-light with primary-dark initial */}
        <div className="w-8 h-8 rounded-full bg-primary-light flex items-center justify-center text-primary-dark font-bold text-xs shrink-0">
          {initial}
        </div>
        <span className="font-semibold text-gray-800 text-sm hidden sm:inline">
          Admin DLH
        </span>
        <span className="text-gray-500 text-xs">▾</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-surface rounded-xl shadow-lg border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="px-4 py-2 border-b border-gray-100">
            <p className="text-xs font-semibold text-gray-900 truncate">{name}</p>
            <p className="text-[11px] text-gray-500 font-mono truncate">@{username} &bull; Admin DLH</p>
          </div>

          <div className="pt-1">
            <Link
              href="/api/auth/logout"
              onClick={() => setIsOpen(false)}
              className="block px-4 py-2 text-xs font-semibold text-danger hover:bg-danger-bg transition-colors"
            >
              Keluar
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
