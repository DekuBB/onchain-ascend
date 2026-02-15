import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface GameCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
  selected?: boolean;
}

export function GameCard({ children, className, hover = true, onClick, selected }: GameCardProps) {
  return (
    <motion.div
      whileHover={hover ? { scale: 1.02, y: -4 } : undefined}
      className={cn(
        "gradient-card border border-border rounded-lg p-4 transition-all duration-300",
        hover && "cursor-pointer",
        selected && "border-gold shadow-gold",
        className
      )}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
}
