import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Heart, Sparkles, ShieldCheck, Swords, Zap, Star } from "lucide-react";
import { GameButton } from "@/components/GameButton";
import { GameCard } from "@/components/GameCard";
import { useGame } from "@/context/GameContext";
import { SFX } from "@/lib/audio";

interface Pet {
  id: string;
  name: string;
  emoji: string;
  rarity: "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary";
  ability: string;
  abilityDesc: string;
  abilityIcon: React.ElementType;
  bonusStat: string;
  bonusValue: number;
}

const allPets: Pet[] = [
  { id: "wolf_pup", name: "Wolf Pup", emoji: "🐺", rarity: "Common", ability: "Pack Howl", abilityDesc: "+10% ATK in PvE", abilityIcon: Swords, bonusStat: "ATK", bonusValue: 10 },
  { id: "fire_sprite", name: "Fire Sprite", emoji: "🔥", rarity: "Uncommon", ability: "Ember Shield", abilityDesc: "+15% DEF in battles", abilityIcon: ShieldCheck, bonusStat: "DEF", bonusValue: 15 },
  { id: "crystal_owl", name: "Crystal Owl", emoji: "🦉", rarity: "Rare", ability: "Arcane Sight", abilityDesc: "+20% XP gain", abilityIcon: Star, bonusStat: "XP", bonusValue: 20 },
  { id: "shadow_cat", name: "Shadow Cat", emoji: "🐱", rarity: "Rare", ability: "Shadow Step", abilityDesc: "+25% dodge in PvP", abilityIcon: Zap, bonusStat: "DODGE", bonusValue: 25 },
  { id: "phoenix_chick", name: "Phoenix Chick", emoji: "🐦‍🔥", rarity: "Epic", ability: "Rebirth Flame", abilityDesc: "Revive once per dungeon", abilityIcon: Heart, bonusStat: "REVIVE", bonusValue: 1 },
  { id: "dragon_whelp", name: "Dragon Whelp", emoji: "🐉", rarity: "Epic", ability: "Dragonfire", abilityDesc: "+30% ATK, +10% DEF", abilityIcon: Swords, bonusStat: "ATK+DEF", bonusValue: 30 },
  { id: "celestial_fox", name: "Celestial Fox", emoji: "🦊", rarity: "Legendary", ability: "Celestial Blessing", abilityDesc: "+25% all stats, +15% loot luck", abilityIcon: Sparkles, bonusStat: "ALL", bonusValue: 25 },
];

const rarityColor: Record<string, string> = {
  Common: "text-muted-foreground",
  Uncommon: "text-emerald",
  Rare: "text-gold",
  Epic: "text-arcane",
  Legendary: "text-crimson",
};

const rarityBorder: Record<string, string> = {
  Common: "border-border",
  Uncommon: "border-emerald/30",
  Rare: "border-gold/30",
  Epic: "border-arcane/30",
  Legendary: "border-crimson/30",
};

const rarityBg: Record<string, string> = {
  Common: "bg-muted",
  Uncommon: "bg-emerald/5",
  Rare: "bg-gold/5",
  Epic: "bg-arcane/5",
  Legendary: "bg-crimson/5",
};

const summonCost: Record<string, number> = {
  basic: 100,
  premium: 500,
};

export default function PetsPage() {
  const navigate = useNavigate();
  const { character, realmTokens, addTokens } = useGame();
  const [ownedPets, setOwnedPets] = useState<Pet[]>([]);
  const [activePet, setActivePet] = useState<Pet | null>(null);
  const [summoning, setSummoning] = useState(false);
  const [summonResult, setSummonResult] = useState<Pet | null>(null);

  if (!character) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground font-crimson text-lg mb-4">Create a character first!</p>
          <GameButton variant="gold" onClick={() => navigate("/lobby")}>Create Character</GameButton>
        </div>
      </div>
    );
  }

  const summonPet = (tier: "basic" | "premium") => {
    const cost = summonCost[tier];
    if (realmTokens < cost) return;
    addTokens(-cost);
    setSummoning(true);
    SFX.click();

    setTimeout(() => {
      const roll = Math.random();
      let pool: Pet[];
      if (tier === "premium") {
        if (roll < 0.05) pool = allPets.filter((p) => p.rarity === "Legendary");
        else if (roll < 0.20) pool = allPets.filter((p) => p.rarity === "Epic");
        else if (roll < 0.50) pool = allPets.filter((p) => p.rarity === "Rare");
        else pool = allPets.filter((p) => p.rarity === "Uncommon");
      } else {
        if (roll < 0.01) pool = allPets.filter((p) => p.rarity === "Epic");
        else if (roll < 0.10) pool = allPets.filter((p) => p.rarity === "Rare");
        else if (roll < 0.35) pool = allPets.filter((p) => p.rarity === "Uncommon");
        else pool = allPets.filter((p) => p.rarity === "Common");
      }
      const pet = pool[Math.floor(Math.random() * pool.length)];
      const alreadyOwned = ownedPets.find((p) => p.id === pet.id);
      if (!alreadyOwned) {
        setOwnedPets((prev) => [...prev, pet]);
      }
      setSummonResult(pet);
      setSummoning(false);
      SFX.loot();
    }, 2000);
  };

  const setActive = (pet: Pet) => {
    setActivePet(pet);
    SFX.click();
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <GameButton variant="outline" size="sm" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="w-4 h-4 mr-1 inline" /> Dashboard
          </GameButton>
          <h1 className="text-3xl font-cinzel font-bold text-arcane glow-arcane">
            <Heart className="w-7 h-7 inline mr-2" />Companions
          </h1>
        </div>

        {/* Active pet */}
        {activePet && (
          <GameCard hover={false} className="mb-6 border-gold/30">
            <div className="flex items-center gap-4">
              <span className="text-5xl">{activePet.emoji}</span>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className={`font-cinzel font-semibold ${rarityColor[activePet.rarity]}`}>{activePet.name}</h3>
                  <span className="text-xs bg-gold/20 text-gold px-2 py-0.5 rounded font-crimson">Active</span>
                </div>
                <div className="flex items-center gap-2 text-sm font-crimson text-muted-foreground">
                  <activePet.abilityIcon className="w-4 h-4 text-gold" />
                  <span>{activePet.ability}: {activePet.abilityDesc}</span>
                </div>
              </div>
            </div>
          </GameCard>
        )}

        {/* Summon */}
        <GameCard hover={false} className="mb-6">
          <h3 className="font-cinzel font-semibold text-foreground mb-4">
            <Sparkles className="w-5 h-5 inline mr-2 text-gold" />Summon Companion
          </h3>

          <AnimatePresence mode="wait">
            {summoning ? (
              <motion.div key="summoning" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-8">
                <motion.span
                  className="text-6xl block mb-4"
                  animate={{ rotateY: [0, 360], scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  ✨
                </motion.span>
                <p className="text-gold font-crimson animate-pulse-gold">Summoning...</p>
              </motion.div>
            ) : summonResult ? (
              <motion.div key="result" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="text-center py-6">
                <motion.span className="text-7xl block mb-3" animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 0.6 }}>
                  {summonResult.emoji}
                </motion.span>
                <h3 className={`font-cinzel text-xl font-bold ${rarityColor[summonResult.rarity]} mb-1`}>{summonResult.name}</h3>
                <p className={`text-sm font-crimson ${rarityColor[summonResult.rarity]} mb-1`}>{summonResult.rarity}</p>
                <p className="text-xs text-muted-foreground font-crimson mb-4">{summonResult.ability}: {summonResult.abilityDesc}</p>
                <GameButton variant="outline" size="sm" onClick={() => setSummonResult(null)}>Continue</GameButton>
              </motion.div>
            ) : (
              <motion.div key="options" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid sm:grid-cols-2 gap-4">
                <div className="text-center p-4 bg-muted rounded-lg border border-border">
                  <p className="font-cinzel text-sm font-semibold text-foreground mb-1">Basic Summon</p>
                  <p className="text-xs text-muted-foreground font-crimson mb-3">Common–Rare pets</p>
                  <GameButton variant="outline" size="sm" onClick={() => summonPet("basic")} disabled={realmTokens < summonCost.basic}>
                    100 $REALM
                  </GameButton>
                </div>
                <div className="text-center p-4 bg-arcane/5 rounded-lg border border-arcane/20">
                  <p className="font-cinzel text-sm font-semibold text-arcane mb-1">Premium Summon</p>
                  <p className="text-xs text-muted-foreground font-crimson mb-3">Uncommon–Legendary pets</p>
                  <GameButton variant="gold" size="sm" onClick={() => summonPet("premium")} disabled={realmTokens < summonCost.premium}>
                    500 $REALM
                  </GameButton>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </GameCard>

        {/* Owned pets */}
        <h2 className="font-cinzel text-xl font-semibold text-foreground mb-4">
          Your Companions ({ownedPets.length})
        </h2>
        {ownedPets.length === 0 ? (
          <p className="text-muted-foreground font-crimson text-sm text-center py-8">
            No companions yet. Summon your first one! 🐾
          </p>
        ) : (
          <div className="grid sm:grid-cols-2 gap-3">
            {ownedPets.map((pet, i) => (
              <motion.div
                key={pet.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <div className={`flex items-center gap-3 p-4 rounded-lg border transition-all cursor-pointer ${rarityBorder[pet.rarity]} ${rarityBg[pet.rarity]} ${activePet?.id === pet.id ? "ring-2 ring-gold" : "hover:ring-1 hover:ring-gold/30"}`}
                  onClick={() => setActive(pet)}
                >
                  <span className="text-3xl">{pet.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-cinzel text-sm font-semibold ${rarityColor[pet.rarity]}`}>{pet.name}</h3>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground font-crimson">
                      <pet.abilityIcon className="w-3 h-3" />
                      <span>{pet.ability}</span>
                    </div>
                  </div>
                  {activePet?.id === pet.id && (
                    <span className="text-xs text-gold font-crimson">Active</span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
