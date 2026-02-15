import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Swords, Shield, Wand2, ArrowLeft, Wallet } from "lucide-react";
import { GameButton } from "@/components/GameButton";
import { GameCard } from "@/components/GameCard";
import { StatBar } from "@/components/StatBar";
import { useGame } from "@/context/GameContext";
import charWarrior from "@/assets/char-warrior.jpg";
import charMage from "@/assets/char-mage.jpg";
import charRanger from "@/assets/char-ranger.jpg";

const classes = [
  {
    id: "warrior",
    name: "Warrior",
    icon: Swords,
    img: charWarrior,
    desc: "A mighty melee fighter with heavy armor and devastating attacks.",
    stats: { str: 85, int: 20, dex: 40, hp: 95 },
  },
  {
    id: "mage",
    name: "Mage",
    icon: Wand2,
    img: charMage,
    desc: "A master of arcane arts, wielding destructive spells from afar.",
    stats: { str: 15, int: 95, dex: 30, hp: 50 },
  },
  {
    id: "ranger",
    name: "Ranger",
    icon: Shield,
    img: charRanger,
    desc: "A swift hunter with deadly aim and nature-bound abilities.",
    stats: { str: 40, int: 35, dex: 90, hp: 65 },
  },
];

export default function Lobby() {
  const [selected, setSelected] = useState<string | null>(null);
  const [charName, setCharName] = useState("");
  const [minting, setMinting] = useState(false);
  const navigate = useNavigate();
  const { wallet, connectWallet, createCharacter } = useGame();
  const selectedClass = classes.find((c) => c.id === selected);

  const handleCreate = () => {
    if (!selectedClass || !charName.trim()) return;
    setMinting(true);
    // Simulate NFT mint delay
    setTimeout(() => {
      createCharacter({
        name: charName.trim(),
        classId: selectedClass.id,
        className: selectedClass.name,
        level: 1,
        stats: selectedClass.stats,
      });
      setMinting(false);
      navigate("/dashboard");
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <GameButton variant="outline" size="sm" onClick={() => navigate("/")}>
            <ArrowLeft className="w-4 h-4 mr-1 inline" /> Back
          </GameButton>
          <h1 className="text-3xl md:text-4xl font-cinzel font-bold text-gold glow-gold">
            Choose Your Class
          </h1>
        </div>

        {/* Wallet requirement notice */}
        {!wallet && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="gradient-card border border-gold/30 rounded-lg p-4 mb-6 text-center"
          >
            <p className="text-foreground font-crimson mb-3">
              <Wallet className="w-5 h-5 inline mr-2 text-gold" />
              Connect your wallet to mint your character as an NFT on Base
            </p>
            <GameButton variant="gold" size="sm" onClick={connectWallet}>
              <Wallet className="w-4 h-4 mr-1 inline" /> Connect Wallet
            </GameButton>
          </motion.div>
        )}

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {classes.map((cls) => (
            <GameCard
              key={cls.id}
              selected={selected === cls.id}
              onClick={() => setSelected(cls.id)}
              className="text-center"
            >
              <div className="w-full aspect-square rounded-md overflow-hidden mb-4">
                <img src={cls.img} alt={cls.name} className="w-full h-full object-cover" />
              </div>
              <cls.icon className="w-6 h-6 text-gold mx-auto mb-2" />
              <h3 className="font-cinzel text-xl font-semibold text-foreground mb-1">{cls.name}</h3>
              <p className="text-muted-foreground text-sm font-crimson">{cls.desc}</p>
            </GameCard>
          ))}
        </div>

        <AnimatePresence>
          {selectedClass && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="gradient-card border border-border rounded-lg p-6 max-w-xl mx-auto"
            >
              <h3 className="font-cinzel text-2xl font-bold text-gold mb-4 text-center">
                {selectedClass.name} Stats
              </h3>
              <div className="space-y-3 mb-6">
                <StatBar label="Strength" value={selectedClass.stats.str} max={100} color="crimson" />
                <StatBar label="Intelligence" value={selectedClass.stats.int} max={100} color="arcane" />
                <StatBar label="Dexterity" value={selectedClass.stats.dex} max={100} color="emerald" />
                <StatBar label="Health" value={selectedClass.stats.hp} max={100} color="gold" />
              </div>

              <div className="mb-4">
                <label className="text-sm text-muted-foreground font-crimson block mb-1">Character Name</label>
                <input
                  type="text"
                  value={charName}
                  onChange={(e) => setCharName(e.target.value)}
                  placeholder="Enter your name..."
                  className="w-full bg-muted border border-border rounded-md px-4 py-2 text-foreground font-crimson focus:outline-none focus:border-gold transition-colors"
                />
              </div>

              <GameButton
                variant="gold"
                size="lg"
                className="w-full"
                onClick={handleCreate}
                disabled={!charName.trim() || minting}
              >
                {minting ? "⏳ Minting NFT on Base..." : "⚔️ Create Character (Mint NFT)"}
              </GameButton>

              {!wallet && (
                <p className="text-xs text-muted-foreground font-crimson text-center mt-2">
                  Wallet not connected — character will be saved locally
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
