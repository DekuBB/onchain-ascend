import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Skull, TreePine, Castle, Gem, Flame } from "lucide-react";
import { GameButton } from "@/components/GameButton";
import worldMap from "@/assets/world-map.jpg";

const zones = [
  { id: "town", name: "Caelum Town", icon: Castle, x: "48%", y: "18%", type: "safe", desc: "Starting zone — Trade & recruit" },
  { id: "forest", name: "Darkwood Forest", icon: TreePine, x: "20%", y: "45%", type: "pve", desc: "PvE zone — Hunt creatures for XP" },
  { id: "mine", name: "Crystal Mines", icon: Gem, x: "75%", y: "60%", type: "pve", desc: "Resource zone — Mine rare materials" },
  { id: "arena", name: "Blood Arena", icon: Skull, x: "55%", y: "75%", type: "pvp", desc: "PvP zone — Full loot combat" },
  { id: "boss", name: "Dragon's Lair", icon: Flame, x: "30%", y: "70%", type: "boss", desc: "World Boss — Daily event" },
];

const typeColors: Record<string, string> = {
  safe: "border-emerald-game bg-emerald-game/20",
  pve: "border-gold bg-gold/20",
  pvp: "border-crimson bg-crimson/20",
  boss: "border-arcane bg-arcane/20",
};

const typeBadge: Record<string, string> = {
  safe: "bg-emerald-game text-primary-foreground",
  pve: "bg-gold text-primary-foreground",
  pvp: "bg-crimson text-accent-foreground",
  boss: "bg-arcane text-accent-foreground",
};

export default function WorldMap() {
  const navigate = useNavigate();
  const [activeZone, setActiveZone] = useState<string | null>(null);
  const zone = zones.find((z) => z.id === activeZone);

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <GameButton variant="outline" size="sm" onClick={() => navigate("/")}>
            <ArrowLeft className="w-4 h-4 mr-1 inline" /> Back
          </GameButton>
          <h1 className="text-3xl font-cinzel font-bold text-gold glow-gold">World Map</h1>
        </div>

        <div className="relative rounded-lg overflow-hidden border border-border">
          <img src={worldMap} alt="World Map" className="w-full" />
          {zones.map((z) => (
            <motion.button
              key={z.id}
              className={`absolute w-10 h-10 md:w-12 md:h-12 rounded-full border-2 flex items-center justify-center cursor-pointer transition-all ${typeColors[z.type]} ${activeZone === z.id ? "scale-125 ring-2 ring-foreground/30" : ""}`}
              style={{ left: z.x, top: z.y, transform: "translate(-50%, -50%)" }}
              onClick={() => setActiveZone(z.id)}
              whileHover={{ scale: 1.2 }}
              animate={z.type === "boss" ? { scale: [1, 1.1, 1] } : undefined}
              transition={z.type === "boss" ? { duration: 2, repeat: Infinity } : undefined}
            >
              <z.icon className="w-5 h-5 md:w-6 md:h-6" />
            </motion.button>
          ))}
        </div>

        {zone && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="gradient-card border border-border rounded-lg p-5 mt-6 max-w-md mx-auto text-center"
          >
            <span className={`inline-block px-3 py-0.5 rounded-full text-xs font-cinzel font-semibold mb-2 ${typeBadge[zone.type]}`}>
              {zone.type.toUpperCase()}
            </span>
            <h3 className="font-cinzel text-xl font-bold text-foreground mb-1">{zone.name}</h3>
            <p className="text-muted-foreground font-crimson text-sm mb-4">{zone.desc}</p>
            <GameButton variant={zone.type === "pvp" ? "crimson" : "gold"} size="md">
              Enter Zone
            </GameButton>
          </motion.div>
        )}

        {/* Legend */}
        <div className="flex flex-wrap gap-4 mt-6 justify-center text-xs font-crimson">
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-emerald-game inline-block" /> Safe</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-gold inline-block" /> PvE</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-crimson inline-block" /> PvP</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-arcane inline-block" /> Boss</span>
        </div>
      </div>
    </div>
  );
}
