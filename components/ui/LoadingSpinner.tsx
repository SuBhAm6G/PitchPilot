/**
 * Loading spinner with accessible labeling.
 */

interface LoadingSpinnerProps {
  readonly size?: "sm" | "md" | "lg";
  readonly label?: string;
}

const SIZE_CLASSES = {
  sm: "h-5 w-5 border-2",
  md: "h-8 w-8 border-[3px]",
  lg: "h-12 w-12 border-4",
} as const;

export default function LoadingSpinner({
  size = "md",
  label = "Loading...",
}: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3" role="status">
      <div
        className={`animate-spin rounded-full border-slate-600 border-t-sky-400 ${SIZE_CLASSES[size]}`}
        aria-hidden="true"
      />
      <span className="sr-only">{label}</span>
    </div>
  );
}
