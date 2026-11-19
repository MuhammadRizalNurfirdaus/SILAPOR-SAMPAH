type StatusVariant =
  | "baru"
  | "diproses"
  | "selesai"
  | "ditolak"
  | "garasi"
  | "beroperasi"
  | "perawatan"
  | "berjalan"
  | "dibatalkan"
  | "primary"
  | "danger"
  | "warning"
  | "info"
  | "gray";

interface BadgeProps {
  status?: StatusVariant;
  children?: React.ReactNode;
  className?: string;
  size?: "sm" | "md";
}

const statusLabels: Record<string, string> = {
  baru: "Baru",
  diproses: "Diproses",
  selesai: "Selesai",
  ditolak: "Ditolak",
  garasi: "Di Garasi",
  beroperasi: "Beroperasi",
  perawatan: "Perawatan",
  berjalan: "Berjalan",
  dibatalkan: "Dibatalkan",
};

const statusClasses: Record<StatusVariant, string> = {
  baru: "bg-blue-50 text-blue-700 border-blue-200",
  diproses: "bg-amber-50 text-amber-800 border-amber-200",
  selesai: "bg-primary-light text-primary-dark border-emerald-200",
  ditolak: "bg-danger-bg text-danger-text border-red-200",
  garasi: "bg-gray-100 text-gray-700 border-gray-200",
  beroperasi: "bg-primary-light text-primary-dark border-emerald-200",
  perawatan: "bg-amber-50 text-amber-800 border-amber-200",
  berjalan: "bg-primary-light text-primary-dark border-emerald-200",
  dibatalkan: "bg-danger-bg text-danger-text border-red-200",
  primary: "bg-primary-light text-primary-dark border-emerald-200",
  danger: "bg-danger-bg text-danger-text border-red-200",
  warning: "bg-warning-bg text-warning-text border-amber-200",
  info: "bg-info-bg text-info-text border-blue-200",
  gray: "bg-gray-100 text-gray-700 border-gray-200",
};

export function Badge({
  status = "gray",
  children,
  className = "",
  size = "md",
}: BadgeProps) {
  const content = children || statusLabels[status] || status;
  const sizeClass = size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-xs font-semibold";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-medium ${sizeClass} ${statusClasses[status]} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" aria-hidden="true" />
      {content}
    </span>
  );
}
