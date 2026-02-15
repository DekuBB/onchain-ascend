import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Coins, Swords, Shield, Map, Users, Trophy, ArrowLeft, Flame } from "lucide-react";
import { GameButton } from "@/components/GameButton";
import { GameCard } from "@/components/GameCard";
import { StatBar } from "@/components/StatBar";
import charWarrior from "@/assets/char-warrior.jpg";

const inventory = [
  { name: "Iron Sword", rarity: "Common", qty: 1 },
  { name: "Mana Potion", rarity: "Common", qty: 5 },
  { name: "Dragon Scale", rarity: "Rare", qty: 1 },
  { name: "Shadow Cloak", rarity: "Epic", qty: 1 },
];

const rarityColor: Record<string, string> = {
  Common: "text-muted-foreground",
  Rare: "text-gold",
  Epic: "text-arcane",
  Legendary: "text-crimson",
};

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <GameButton variant="outline" size="sm" onClick={() => navigate("/")}>
            <ArrowLeft className="w-4 h-4 mr-1 inline" /> Home
          </GameButton>
          <h1 className="text-3xl font-cinzel font-bold text-gold glow-gold">Dashboard</h1>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Character */}
          <GameCard hover={false} className="lg:row-span-2">
            <div className="text-center">
              <div className="w-32 h-32 rounded-full overflow-hidden mx-auto mb-4 border-2 border-gold shadow-gold">
                <img src={charWarrior} alt="Character" className="w-full h-full object-cover" />
              </div>
              <h2 className="font-cinzel text-xl font-bold text-foreground">ShadowKnight</h2>
              <p className="text-gold text-sm font-crimson mb-1">Level 12 Warrior</p>
              <p className="text-muted-foreground text-xs font-crimson mb-4">Guild: Dark Wolves</p>
            </div>
            <div className="space-y-3">
              <StatBar label="HP" value={480} max={600} color="crimson" />
              <StatBar label="Mana" value={120} max={200} color="arcane" />
              <StatBar label="XP" value={2400} max={5000} color="gold" />
              <StatBar label="Stamina" value={85} max={100} color="emerald" />
            </div>
          </GameCard>

          {/* Token balance */}
          <GameCard hover={false}>
            <div className="flex items-center gap-3 mb-3">
              <Coins className="w-6 h-6 text-gold" />
              <h3 className="font-cinzel font-semibold text-foreground">Token Balance</h3>
            </div>
            <div className="space-y-2 font-crimson text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">$REALM</span>
                <span className="text-gold font-bold">12,450</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Silver (in-game)</span>
                <span className="text-foreground">34,200</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">NFT Items</span>
                <span className="text-foreground">7</span>
              </div>
            </div>
            <GameButton variant="gold" size="sm" className="w-full mt-4">
              Claim Rewards
            </GameButton>
          </GameCard>

          {/* World Boss */}
          <GameCard hover={false} className="border-arcane/30">
            <div className="flex items-center gap-3 mb-3">
              <Flame className="w-6 h-6 text-arcane animate-pulse-gold" />
              <h3 className="font-cinzel font-semibold text-foreground">World Boss Event</h3>
            </div>
            <p className="text-muted-foreground text-sm font-crimson mb-2">
              🐉 Ancient Dragon — spawns in 2h 14m
            </p>
            <div className="text-xs text-muted-foreground font-crimson space-y-1">
              <div>Reward: 500 $REALM + Legendary NFT</div>
              <div>Players signed up: 142</div>
            </div>
            <GameButton variant="crimson" size="sm" className="w-full mt-4">
              Join Battle
            </GameButton>
          </GameCard>

          {/* Quick actions */}
          <GameCard hover={false} className="lg:col-span-2">
            <h3 className="font-cinzel font-semibold text-foreground mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { icon: Map, label: "World Map", action: () => navigate("/map") },
                { icon: Swords, label: "Arena", action: () => {} },
                { icon: Users, label: "Guild", action: () => {} },
                { icon: Trophy, label: "Rankings", action: () => {} },
              ].map((a) => (
                <motion.button
                  key={a.label}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={a.action}
                  className="flex flex-col items-center gap-2 p-4 rounded-md bg-muted hover:bg-secondary transition-colors cursor-pointer"
                >
                  <a.icon className="w-6 h-6 text-gold" />
                  <span className="text-xs font-crimson text-muted-foreground">{a.label}</span>
                </motion.button>
              ))}
            </div>
          </GameCard>
        </div>

        {/* Inventory */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6"
        >
          <GameCard hover={false}>
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-5 h-5 text-gold" />
              <h3 className="font-cinzel font-semibold text-foreground">Inventory</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {inventory.map((item) => (
                <div
                  key={item.name}
                  className="bg-muted rounded-md p-3 border border-border hover:border-gold/30 transition-colors"
                >
                  <div className="font-crimson text-sm text-foreground">{item.name}</div>
                  <div className="flex justify-between mt-1">
                    <span className={`text-xs ${rarityColor[item.rarity]}`}>{item.rarity}</span>
                    <span className="text-xs text-muted-foreground">x{item.qty}</span>
                  </div>
                </div>
              ))}
            </div>
          </GameCard>
        </motion.div>
      </div>
    </div>
  );
}
