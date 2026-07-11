/**
 * Severity / status badge with color-coded styling.
 */

interface BadgeProps {
  readonly label: string;
  readonly variant: "low" | "medium" | "high" | "critical" | "success" | "info";
  readonly className?: string;
}

export type BadgeVariant = BadgeProps["variant"];

const VARIANT_STYLES: Record<BadgeProps["variant"], string> = {
  low: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  medium: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  high: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  critical: "bg-red-500/20 text-red-300 border-red-500/30 animate-pulse",
  success: "bg-green-500/20 text-green-300 border-green-500/30",
  info: "bg-sky-500/20 text-sky-300 border-sky-500/30",
};

export default function Badge({ label, variant, className = "" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-wide uppercase ${VARIANT_STYLES[variant]} ${className}`}
      aria-label={`Status: ${label}`}
    >
      {label}
    </span>
  );
}
