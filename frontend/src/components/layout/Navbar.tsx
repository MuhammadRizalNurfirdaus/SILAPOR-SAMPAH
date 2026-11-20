"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavbarProps {
  role?: "publik" | "sopir" | "kabid" | "admin";
  user?: { username: string; nama_lengkap: string } | null;
  className?: string;
}

export default function Navbar({ role = "publik", user, className = "" }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Tutup menu saat tombol Escape ditekan
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const publicLinks = [
    { href: "/", label: "Beranda" },
    { href: "/peta", label: "Peta Armada" },
    { href: "/aduan/baru", label: "Buat Aduan" },
    { href: "/cek-status", label: "Cek Status" },
  ];

  const staffLinks =
    role === "sopir"
      ? [
          { href: "/sopir", label: "Dashboard" },
          { href: "/sopir/perjalanan", label: "Perjalanan Aktif" },
        ]
      : role === "kabid" || role === "admin"
      ? [
          { href: "/kabid", label: "Pemantauan" },
          { href: "/kabid/galeri", label: "Galeri Bukti" },
          { href: "/kabid/aduan", label: "Daftar Aduan" },
          { href: "/kabid/laporan", label: "Laporan Excel" },
          ...(role === "admin"
            ? [
                { href: "/admin/armada", label: "Kelola Armada" },
                { href: "/admin/pengguna", label: "Kelola Pengguna" },
              ]
            : []),
        ]
      : publicLinks;

  const links = staffLinks;

  return (
    <nav className={`w-full bg-surface border-b border-gray-200 sticky top-0 z-40 ${className}`}>
      <div className="w-full px-4 sm:px-8 md:px-10 lg:px-12 xl:px-16">
        <div className="flex items-center justify-between h-16">
          {/* Logo / Brand Name */}
          <Link
            href="/"
            className="flex items-center gap-2 text-primary font-bold text-lg sm:text-xl tracking-tight focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md py-1"
          >
            <span>SILAPOR SAMPAH</span>
          </Link>

          {/* Desktop Navigation (>= 1024px) */}
          <div className="hidden lg:flex items-center gap-1 xl:gap-2">
            {links.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors min-h-[40px] flex items-center ${
                    isActive
                      ? "bg-primary-light text-primary-dark font-semibold"
                      : "text-gray-700 hover:text-primary hover:bg-gray-100"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Desktop Action / Auth */}
          <div className="hidden lg:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-600 font-medium bg-gray-100 px-2.5 py-1 rounded-full">
                  {user.nama_lengkap} ({role})
                </span>
                <Link
                  href="/api/auth/logout"
                  className="text-xs font-semibold text-danger hover:underline py-1.5 px-2"
                >
                  Keluar
                </Link>
              </div>
            ) : (
              <Link
                href="/login"
                className="bg-primary hover:bg-primary-dark text-white text-sm font-semibold px-4 py-2 rounded-lg shadow-xs transition-colors min-h-[40px] flex items-center"
              >
                Masuk
              </Link>
            )}
          </div>

          {/* Mobile Hamburger Button (< 1024px) */}
          <div className="flex lg:hidden items-center">
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              aria-label={isOpen ? "Tutup menu navigasi" : "Buka menu navigasi"}
              aria-expanded={isOpen}
              className="p-2.5 rounded-lg text-gray-700 hover:text-primary hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary min-w-[44px] min-h-[44px] flex items-center justify-center"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                {isOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Backdrop & Menu (< 1024px) */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 lg:hidden flex flex-col bg-black/40 backdrop-blur-xs"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="w-full max-w-sm bg-surface shadow-xl h-full flex flex-col p-6 ml-auto overflow-y-auto animate-in slide-in-from-right duration-200"
            onClick={(e) => e.stopPropagation()}
            style={{ paddingBottom: "max(1.5rem, env(safe-area-inset-bottom))" }}
          >
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
              <span className="font-bold text-primary text-base">Menu Navigasi</span>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-2 text-gray-500 hover:text-gray-900 rounded-lg min-w-[44px] min-h-[44px] flex items-center justify-center"
                aria-label="Tutup menu"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex flex-col gap-1.5 flex-1">
              {links.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className={`px-4 py-3 rounded-lg text-base font-medium transition-colors min-h-[48px] flex items-center ${
                      isActive
                        ? "bg-primary-light text-primary-dark font-semibold"
                        : "text-gray-800 hover:bg-gray-100"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>

            <div className="pt-4 border-t border-gray-200 mt-4">
              {user ? (
                <div className="flex flex-col gap-2">
                  <div className="text-sm text-gray-700">
                    Masuk sebagai <strong>{user.nama_lengkap}</strong>
                  </div>
                  <Link
                    href="/api/auth/logout"
                    className="w-full text-center bg-danger-bg text-danger-text font-semibold py-2.5 rounded-lg min-h-[44px] flex items-center justify-center"
                  >
                    Keluar
                  </Link>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="w-full text-center bg-primary text-white font-semibold py-2.5 rounded-lg shadow-xs min-h-[44px] flex items-center justify-center"
                >
                  Masuk Sistem
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
