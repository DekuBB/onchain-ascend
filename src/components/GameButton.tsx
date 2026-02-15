import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface GameButtonProps {
  children: React.ReactNode;
  variant?: "gold" | "crimson" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
}

const variants = {
  gold: "gradient-gold text-primary-foreground shadow-gold hover:brightness-110",
  crimson: "gradient-crimson text-accent-foreground shadow-crimson hover:brightness-110",
  secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
  outline: "border border-gold/30 text-foreground hover:bg-primary/10 hover:border-gold",
};

const sizes = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-3 text-base",
  lg: "px-8 py-4 text-lg",
};

export function GameButton({
  children,
  variant = "gold",
  size = "md",
  className,
  onClick,
  disabled,
}: GameButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      className={cn(
        "font-cinzel font-semibold rounded-md transition-all duration-200 cursor-pointer",
        variants[variant],
        sizes[size],
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </motion.button>
  );
}
