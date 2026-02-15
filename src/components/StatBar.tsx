import { cn } from "@/lib/utils";

interface StatBarProps {
  label: string;
  value: number;
  max: number;
  color?: "gold" | "crimson" | "emerald" | "arcane";
  showNumbers?: boolean;
}

const colorMap = {
  gold: "bg-gold",
  crimson: "bg-crimson",
  emerald: "bg-emerald-game",
  arcane: "bg-arcane",
};

const trackMap = {
  gold: "bg-gold/20",
  crimson: "bg-crimson/20",
  emerald: "bg-emerald_game/20",
  arcane: "bg-arcane/20",
};

export function StatBar({ label, value, max, color = "gold", showNumbers = true }: StatBarProps) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground font-crimson">{label}</span>
        {showNumbers && <span className="text-foreground font-crimson">{value}/{max}</span>}
      </div>
      <div className={cn("h-2 rounded-full", trackMap[color])}>
        <div
          className={cn("h-full rounded-full transition-all duration-500", colorMap[color])}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
