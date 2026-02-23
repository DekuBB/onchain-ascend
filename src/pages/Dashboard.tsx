import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Coins, Swords, Shield, Map, Users, Trophy, ArrowLeft, Flame, Star, Hammer, Zap, ScrollText, Store, Award } from "lucide-react";
import { GameButton } from "@/components/GameButton";
import { GameCard } from "@/components/GameCard";
import { StatBar } from "@/components/StatBar";
import { useGame } from "@/context/GameContext";
import charWarrior from "@/assets/char-warrior.jpg";
import charMage from "@/assets/char-mage.jpg";
import charRanger from "@/assets/char-ranger.jpg";

const classImages: Record<string, string> = {
  warrior: charWarrior,
  mage: charMage,
  ranger: charRanger,
};

const rarityColor: Record<string, string> = {
  Common: "text-muted-foreground",
  Uncommon: "text-emerald",
  Rare: "text-gold",
  Epic: "text-arcane",
  Legendary: "text-crimson",
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { character, realmTokens, inventory } = useGame();

  if (!character) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground font-crimson text-lg mb-4">No character found. Create one first!</p>
          <GameButton variant="gold" onClick={() => navigate("/lobby")}>Create Character</GameButton>
        </div>
      </div>
    );
  }

  const charImg = classImages[character.classId] || charWarrior;
  const xpPercent = Math.floor((character.xp / character.xpToNext) * 100);

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
                <img src={charImg} alt="Character" className="w-full h-full object-cover" />
              </div>
              <h2 className="font-cinzel text-xl font-bold text-foreground">{character.name}</h2>
              <p className="text-gold text-sm font-crimson mb-1">Level {character.level} {character.className}</p>
              <p className="text-muted-foreground text-xs font-crimson mb-2">Base Chain</p>
              {/* XP Bar */}
              <div className="mb-4">
                <div className="flex justify-between text-xs font-crimson text-muted-foreground mb-1">
                  <span className="flex items-center gap-1"><Star className="w-3 h-3 text-arcane" /> XP</span>
                  <span>{character.xp} / {character.xpToNext}</span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-arcane rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${xpPercent}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <StatBar label="STR" value={character.stats.str} max={100} color="crimson" />
              <StatBar label="INT" value={character.stats.int} max={100} color="arcane" />
              <StatBar label="DEX" value={character.stats.dex} max={100} color="gold" />
              <StatBar label="HP" value={character.stats.hp} max={100} color="emerald" />
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
                <span className="text-gold font-bold">{realmTokens.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">NFT Items</span>
                <span className="text-foreground">{inventory.length}</span>
              </div>
            </div>
            <GameButton variant="gold" size="sm" className="w-full mt-4">Claim Rewards</GameButton>
          </GameCard>

          {/* World Boss */}
          <GameCard hover={false} className="border-arcane/30">
            <div className="flex items-center gap-3 mb-3">
              <Flame className="w-6 h-6 text-arcane animate-pulse-gold" />
              <h3 className="font-cinzel font-semibold text-foreground">World Boss Event</h3>
            </div>
            <p className="text-muted-foreground text-sm font-crimson mb-2">🐉 Ancient Dragon — spawns in 2h 14m</p>
            <div className="text-xs text-muted-foreground font-crimson space-y-1">
              <div>Reward: 500 $REALM + Legendary NFT</div>
              <div>Players signed up: 142</div>
            </div>
            <GameButton variant="crimson" size="sm" className="w-full mt-4" onClick={() => navigate("/battle")}>Join Battle</GameButton>
          </GameCard>

          {/* Quick actions */}
          <GameCard hover={false} className="lg:col-span-2">
            <h3 className="font-cinzel font-semibold text-foreground mb-4">Quick Actions</h3>
            <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
              {[
                { icon: Swords, label: "PvE Battle", action: () => navigate("/battle") },
                { icon: Zap, label: "PvP Arena", action: () => navigate("/pvp") },
                { icon: Map, label: "World Map", action: () => navigate("/map") },
                { icon: Users, label: "Guild", action: () => navigate("/guild") },
                { icon: Hammer, label: "Crafting", action: () => navigate("/crafting") },
                { icon: Store, label: "Market", action: () => navigate("/marketplace") },
                { icon: ScrollText, label: "Quests", action: () => navigate("/quests") },
                { icon: Award, label: "Achieve.", action: () => navigate("/achievements") },
                { icon: Trophy, label: "Rankings", action: () => navigate("/seasons") },
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
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mt-6">
          <GameCard hover={false}>
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-5 h-5 text-gold" />
              <h3 className="font-cinzel font-semibold text-foreground">Inventory ({inventory.length})</h3>
            </div>
            {inventory.length === 0 ? (
              <p className="text-muted-foreground text-sm font-crimson text-center py-4">
                No items yet. Win battles to earn loot! ⚔️
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                {inventory.map((item) => (
                  <div key={item.id} className="bg-muted rounded-md p-3 border border-border hover:border-gold/30 transition-colors">
                    <div className="font-crimson text-sm text-foreground">{item.name}</div>
                    <div className="flex justify-between mt-1">
                      <span className={`text-xs ${rarityColor[item.rarity]}`}>{item.rarity}</span>
                      <span className="text-xs text-muted-foreground">x{item.qty}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </GameCard>
        </motion.div>
      </div>
    </div>
  );
}
