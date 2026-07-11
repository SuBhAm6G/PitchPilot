/**
 * Reusable Card wrapper component with glassmorphism aesthetic.
 */

interface CardProps {
  readonly children: React.ReactNode;
  readonly className?: string;
  readonly as?: "div" | "article" | "section";
}

export default function Card({
  children,
  className = "",
  as: Component = "div",
}: CardProps) {
  return (
    <Component
      className={`rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-5 shadow-lg transition-all duration-300 hover:border-white/20 hover:bg-white/[0.07] ${className}`}
    >
      {children}
    </Component>
  );
}
