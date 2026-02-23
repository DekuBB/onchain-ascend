import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Swords, ArrowLeft, Skull, Trophy, Coins, Shield, Star } from "lucide-react";
import { GameButton } from "@/components/GameButton";
import { StatBar } from "@/components/StatBar";
import { useGame, InventoryItem } from "@/context/GameContext";
import { SFX, playBattleMusic, stopAllMusic } from "@/lib/audio";

interface Combatant {
  name: string;
  hp: number;
  maxHp: number;
  atk: number;
  def: number;
}

const enemies: Combatant[] = [
  { name: "Forest Wolf", hp: 60, maxHp: 60, atk: 12, def: 3 },
  { name: "Dark Skeleton", hp: 90, maxHp: 90, atk: 18, def: 6 },
  { name: "Crystal Golem", hp: 150, maxHp: 150, atk: 22, def: 12 },
  { name: "Shadow Drake", hp: 200, maxHp: 200, atk: 30, def: 15 },
];

const enemyEmoji: Record<string, string> = {
  "Forest Wolf": "🐺",
  "Dark Skeleton": "💀",
  "Crystal Golem": "🗿",
  "Shadow Drake": "🐉",
};

const lootTable: Omit<InventoryItem, "qty">[] = [
  { id: "iron_sword", name: "Iron Sword", rarity: "Common", type: "weapon" },
  { id: "mana_potion", name: "Mana Potion", rarity: "Common", type: "consumable" },
  { id: "leather_armor", name: "Leather Armor", rarity: "Common", type: "armor" },
  { id: "wolf_fang", name: "Wolf Fang", rarity: "Uncommon", type: "material" },
  { id: "bone_staff", name: "Bone Staff", rarity: "Uncommon", type: "weapon" },
  { id: "dragon_scale", name: "Dragon Scale", rarity: "Rare", type: "material" },
  { id: "crystal_shield", name: "Crystal Shield", rarity: "Rare", type: "armor" },
  { id: "shadow_cloak", name: "Shadow Cloak", rarity: "Epic", type: "armor" },
  { id: "arcane_blade", name: "Arcane Blade", rarity: "Epic", type: "weapon" },
  { id: "dragonfire_amulet", name: "Dragonfire Amulet", rarity: "Legendary", type: "armor" },
];

function rollLoot(enemyMaxHp: number): InventoryItem[] {
  const drops: InventoryItem[] = [];
  const numDrops = Math.random() < 0.3 ? 2 : 1;
  for (let i = 0; i < numDrops; i++) {
    const roll = Math.random();
    let pool: typeof lootTable;
    if (roll < 0.01 && enemyMaxHp >= 150) pool = lootTable.filter((l) => l.rarity === "Legendary");
    else if (roll < 0.08) pool = lootTable.filter((l) => l.rarity === "Epic");
    else if (roll < 0.25) pool = lootTable.filter((l) => l.rarity === "Rare");
    else if (roll < 0.5) pool = lootTable.filter((l) => l.rarity === "Uncommon");
    else pool = lootTable.filter((l) => l.rarity === "Common");
    if (pool.length > 0) {
      const item = pool[Math.floor(Math.random() * pool.length)];
      drops.push({ ...item, qty: 1 });
    }
  }
  return drops;
}

type BattlePhase = "select" | "fighting" | "victory" | "defeat";

const rarityColor: Record<string, string> = {
  Common: "text-muted-foreground",
  Uncommon: "text-emerald",
  Rare: "text-gold",
  Epic: "text-arcane",
  Legendary: "text-crimson",
};

export default function Battle() {
  const navigate = useNavigate();
  const { character, addTokens, addXP, addItem, recordBattleWin } = useGame();
  const [phase, setPhase] = useState<BattlePhase>("select");
  const [enemy, setEnemy] = useState<Combatant | null>(null);
  const [playerHp, setPlayerHp] = useState(100);
  const [playerMaxHp] = useState(100);
  const [log, setLog] = useState<string[]>([]);
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [reward, setReward] = useState(0);
  const [xpGained, setXpGained] = useState(0);
  const [lootDrops, setLootDrops] = useState<InventoryItem[]>([]);
  const [shakePlayer, setShakePlayer] = useState(false);
  const [shakeEnemy, setShakeEnemy] = useState(false);
  const [defending, setDefending] = useState(false);

  const playerAtk = character ? Math.floor(character.stats.str * 0.4 + character.stats.dex * 0.2) : 20;
  const playerDef = character ? Math.floor(character.stats.str * 0.1 + character.stats.hp * 0.1) : 5;

  const startBattle = (e: Combatant) => {
    setEnemy({ ...e, hp: e.maxHp });
    setPlayerHp(playerMaxHp);
    setLog([`⚔️ Battle started against ${e.name}!`]);
    setIsPlayerTurn(true);
    setDefending(false);
    setPhase("fighting");
    playBattleMusic();
    SFX.click();
  };

  // Stop battle music on victory/defeat/unmount
  useEffect(() => {
    if (phase === "victory" || phase === "defeat") {
      stopAllMusic();
    }
    return () => { stopAllMusic(); };
  }, [phase]);

  const addLog = useCallback((msg: string) => {
    setLog((prev) => [...prev.slice(-8), msg]);
  }, []);

  const attack = () => {
    if (!enemy || !isPlayerTurn) return;
    SFX.attack();
    const dmg = Math.max(1, playerAtk - enemy.def + Math.floor(Math.random() * 8) - 3);
    const newHp = Math.max(0, enemy.hp - dmg);
    setShakeEnemy(true);
    setTimeout(() => setShakeEnemy(false), 300);
    setEnemy((prev) => (prev ? { ...prev, hp: newHp } : null));
    addLog(`⚔️ You deal ${dmg} damage to ${enemy.name}!`);

    if (newHp <= 0) {
      SFX.victory();
      const rew = Math.floor(enemy.maxHp * 0.5 + Math.random() * 50);
      const xp = Math.floor(enemy.maxHp * 0.3 + Math.random() * 20);
      const drops = rollLoot(enemy.maxHp);
      setReward(rew);
      setXpGained(xp);
      setLootDrops(drops);
      addTokens(rew);
      addXP(xp);
      recordBattleWin();
      drops.forEach((d) => addItem(d));
      addLog(`🏆 ${enemy.name} defeated! +${rew} $REALM, +${xp} XP`);
      if (drops.length > 0) {
        SFX.loot();
        drops.forEach((d) => addLog(`📦 Loot: ${d.name} (${d.rarity})`));
      }
      setPhase("victory");
      return;
    }
    setDefending(false);
    setIsPlayerTurn(false);
  };

  const defend = () => {
    if (!isPlayerTurn) return;
    SFX.defend();
    setDefending(true);
    addLog("🛡️ You brace for the next attack! (Defense +50%)");
    setIsPlayerTurn(false);
  };

  // Enemy turn
  useEffect(() => {
    if (isPlayerTurn || phase !== "fighting" || !enemy) return;
    const timer = setTimeout(() => {
      const defMod = defending ? 1.5 : 1;
      const dmg = Math.max(1, Math.floor((enemy.atk - playerDef * defMod) + Math.random() * 6 - 2));
      const newHp = Math.max(0, playerHp - dmg);
      SFX.hit();
      setShakePlayer(true);
      setTimeout(() => setShakePlayer(false), 300);
      setPlayerHp(newHp);
      addLog(`💥 ${enemy.name} hits you for ${dmg} damage!`);

      if (newHp <= 0) {
        SFX.defeat();
        addLog("☠️ You have been defeated...");
        setPhase("defeat");
        return;
      }
      setIsPlayerTurn(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, [isPlayerTurn, phase, enemy, playerHp, playerDef, defending, addLog]);

  if (!character) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground font-crimson text-lg mb-4">You need a character to battle!</p>
          <GameButton variant="gold" onClick={() => navigate("/lobby")}>Create Character</GameButton>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <GameButton variant="outline" size="sm" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="w-4 h-4 mr-1 inline" /> Dashboard
          </GameButton>
          <h1 className="text-3xl font-cinzel font-bold text-gold glow-gold">
            <Swords className="w-7 h-7 inline mr-2" />PvE Arena
          </h1>
        </div>

        {/* Enemy select */}
        {phase === "select" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2 className="font-cinzel text-xl text-foreground mb-4">Choose your opponent</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {enemies.map((e) => (
                <motion.div
                  key={e.name}
                  whileHover={{ scale: 1.03 }}
                  className="gradient-card border border-border rounded-lg p-4 cursor-pointer hover:border-gold/50 transition-colors"
                  onClick={() => startBattle(e)}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-3xl">{enemyEmoji[e.name]}</span>
                    <div>
                      <h3 className="font-cinzel font-semibold text-foreground">{e.name}</h3>
                      <p className="text-xs text-muted-foreground font-crimson">HP: {e.maxHp} | ATK: {e.atk} | DEF: {e.def}</p>
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground font-crimson">
                    <span>Reward: ~{Math.floor(e.maxHp * 0.5)} $REALM</span>
                    <span className={e.maxHp > 120 ? "text-crimson" : "text-gold"}>
                      {e.maxHp > 150 ? "Hard" : e.maxHp > 100 ? "Medium" : "Easy"}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Battle */}
        {phase === "fighting" && enemy && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <motion.div
                animate={shakePlayer ? { x: [-5, 5, -5, 5, 0] } : {}}
                transition={{ duration: 0.3 }}
                className="gradient-card border border-border rounded-lg p-4 text-center"
              >
                <span className="text-4xl mb-2 block">🧙</span>
                <h3 className="font-cinzel font-semibold text-foreground">{character.name}</h3>
                <p className="text-xs text-gold font-crimson mb-1">{character.className} Lv.{character.level}</p>
                <p className="text-[10px] text-muted-foreground font-crimson mb-3">XP: {character.xp}/{character.xpToNext}</p>
                <StatBar label="HP" value={playerHp} max={playerMaxHp} color="crimson" />
              </motion.div>

              <motion.div
                animate={shakeEnemy ? { x: [-5, 5, -5, 5, 0] } : {}}
                transition={{ duration: 0.3 }}
                className="gradient-card border border-crimson/30 rounded-lg p-4 text-center"
              >
                <span className="text-4xl mb-2 block">{enemyEmoji[enemy.name]}</span>
                <h3 className="font-cinzel font-semibold text-foreground">{enemy.name}</h3>
                <p className="text-xs text-crimson font-crimson mb-3">Enemy</p>
                <StatBar label="HP" value={enemy.hp} max={enemy.maxHp} color="crimson" />
              </motion.div>
            </div>

            <div className="flex justify-center gap-4">
              <GameButton variant="crimson" size="lg" onClick={attack} disabled={!isPlayerTurn}>
                <Swords className="w-5 h-5 mr-2 inline" /> Attack
              </GameButton>
              <GameButton variant="outline" size="lg" onClick={defend} disabled={!isPlayerTurn}>
                <Shield className="w-5 h-5 mr-2 inline" /> Defend
              </GameButton>
            </div>

            {!isPlayerTurn && phase === "fighting" && (
              <p className="text-center text-muted-foreground font-crimson animate-pulse-gold">Enemy is attacking...</p>
            )}

            <div className="gradient-card border border-border rounded-lg p-4 max-h-48 overflow-y-auto">
              <h4 className="font-cinzel text-sm text-muted-foreground mb-2">Battle Log</h4>
              {log.map((l, i) => (
                <motion.p key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="text-sm font-crimson text-foreground/80 py-0.5">
                  {l}
                </motion.p>
              ))}
            </div>
          </div>
        )}

        {/* Victory */}
        <AnimatePresence>
          {phase === "victory" && (
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="gradient-card border border-gold rounded-lg p-8 text-center max-w-md mx-auto">
              <Trophy className="w-16 h-16 text-gold mx-auto mb-4" />
              <h2 className="font-cinzel text-3xl font-bold text-gold glow-gold mb-2">Victory!</h2>
              <p className="text-foreground font-crimson mb-4">You defeated {enemy?.name}!</p>
              <div className="flex items-center justify-center gap-4 text-lg font-crimson mb-2">
                <span className="text-gold flex items-center gap-1"><Coins className="w-5 h-5" /> +{reward} $REALM</span>
                <span className="text-arcane flex items-center gap-1"><Star className="w-5 h-5" /> +{xpGained} XP</span>
              </div>
              {lootDrops.length > 0 && (
                <div className="mb-4 space-y-1">
                  <p className="text-sm text-muted-foreground font-crimson">📦 Loot:</p>
                  {lootDrops.map((d, i) => (
                    <p key={i} className={`text-sm font-crimson ${rarityColor[d.rarity]}`}>{d.name} ({d.rarity})</p>
                  ))}
                </div>
              )}
              <div className="flex gap-3 justify-center">
                <GameButton variant="gold" onClick={() => setPhase("select")}>Fight Again</GameButton>
                <GameButton variant="outline" onClick={() => navigate("/dashboard")}>Dashboard</GameButton>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Defeat */}
        <AnimatePresence>
          {phase === "defeat" && (
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="gradient-card border border-crimson rounded-lg p-8 text-center max-w-md mx-auto">
              <Skull className="w-16 h-16 text-crimson mx-auto mb-4" />
              <h2 className="font-cinzel text-3xl font-bold text-crimson glow-crimson mb-2">Defeated</h2>
              <p className="text-muted-foreground font-crimson mb-6">You have fallen in battle...</p>
              <div className="flex gap-3 justify-center">
                <GameButton variant="crimson" onClick={() => setPhase("select")}>Try Again</GameButton>
                <GameButton variant="outline" onClick={() => navigate("/dashboard")}>Dashboard</GameButton>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
