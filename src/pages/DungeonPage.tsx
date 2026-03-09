import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Skull, Swords, Shield, Trophy, Coins, Star, ChevronDown, Flame } from "lucide-react";
import { GameButton } from "@/components/GameButton";
import { GameCard } from "@/components/GameCard";
import { StatBar } from "@/components/StatBar";
import { useGame, InventoryItem } from "@/context/GameContext";
import { SFX, playBattleMusic, stopAllMusic } from "@/lib/audio";

interface DungeonFloor {
  floor: number;
  enemy: { name: string; emoji: string; hp: number; maxHp: number; atk: number; def: number };
  isBoss: boolean;
}

function generateDungeon(): DungeonFloor[] {
  const mobs = [
    { name: "Cave Rat", emoji: "🐀", base: { hp: 40, atk: 8, def: 2 } },
    { name: "Goblin Scout", emoji: "👺", base: { hp: 55, atk: 12, def: 4 } },
    { name: "Undead Knight", emoji: "💀", base: { hp: 80, atk: 18, def: 8 } },
    { name: "Dark Elemental", emoji: "👻", base: { hp: 100, atk: 22, def: 6 } },
    { name: "Orc Warlord", emoji: "👹", base: { hp: 120, atk: 26, def: 10 } },
  ];
  const bosses = [
    { name: "Dungeon Guardian", emoji: "🗿", base: { hp: 200, atk: 30, def: 14 } },
    { name: "Lich King", emoji: "👑", base: { hp: 280, atk: 38, def: 12 } },
    { name: "Abyssal Dragon", emoji: "🐉", base: { hp: 400, atk: 45, def: 18 } },
  ];

  const floors: DungeonFloor[] = [];
  for (let f = 1; f <= 5; f++) {
    const scale = 1 + (f - 1) * 0.25;
    const isBoss = f === 5;
    const pool = isBoss ? bosses : mobs;
    const template = pool[Math.floor(Math.random() * pool.length)];
    floors.push({
      floor: f,
      isBoss,
      enemy: {
        name: template.name,
        emoji: template.emoji,
        hp: Math.floor(template.base.hp * scale),
        maxHp: Math.floor(template.base.hp * scale),
        atk: Math.floor(template.base.atk * scale),
        def: Math.floor(template.base.def * scale),
      },
    });
  }
  return floors;
}

const dungeonLoot: Record<string, Omit<InventoryItem, "qty">[]> = {
  common: [
    { id: "iron_sword", name: "Iron Sword", rarity: "Common", type: "weapon" },
    { id: "mana_potion", name: "Mana Potion", rarity: "Common", type: "consumable" },
  ],
  uncommon: [
    { id: "wolf_fang", name: "Wolf Fang", rarity: "Uncommon", type: "material" },
    { id: "bone_staff", name: "Bone Staff", rarity: "Uncommon", type: "weapon" },
  ],
  rare: [
    { id: "dragon_scale", name: "Dragon Scale", rarity: "Rare", type: "material" },
    { id: "crystal_shield", name: "Crystal Shield", rarity: "Rare", type: "armor" },
    { id: "dungeon_key", name: "Dungeon Key", rarity: "Rare", type: "material" },
  ],
  epic: [
    { id: "shadow_cloak", name: "Shadow Cloak", rarity: "Epic", type: "armor" },
    { id: "arcane_blade", name: "Arcane Blade", rarity: "Epic", type: "weapon" },
    { id: "abyssal_gem", name: "Abyssal Gem", rarity: "Epic", type: "material" },
  ],
  legendary: [
    { id: "dragonfire_amulet", name: "Dragonfire Amulet", rarity: "Legendary", type: "armor" },
    { id: "abyssal_crown", name: "Abyssal Crown", rarity: "Legendary", type: "armor" },
  ],
};

function rollDungeonLoot(floor: number, isBoss: boolean): InventoryItem[] {
  const drops: InventoryItem[] = [];
  const numDrops = isBoss ? 3 : Math.random() < 0.4 ? 2 : 1;
  for (let i = 0; i < numDrops; i++) {
    const roll = Math.random();
    const floorBonus = floor * 0.03;
    let pool: Omit<InventoryItem, "qty">[];
    if (roll < 0.02 + (isBoss ? 0.08 : 0) + floorBonus) pool = dungeonLoot.legendary;
    else if (roll < 0.10 + floorBonus) pool = dungeonLoot.epic;
    else if (roll < 0.30 + floorBonus) pool = dungeonLoot.rare;
    else if (roll < 0.55) pool = dungeonLoot.uncommon;
    else pool = dungeonLoot.common;
    const item = pool[Math.floor(Math.random() * pool.length)];
    drops.push({ ...item, qty: 1 });
  }
  return drops;
}

const rarityColor: Record<string, string> = {
  Common: "text-muted-foreground",
  Uncommon: "text-emerald",
  Rare: "text-gold",
  Epic: "text-arcane",
  Legendary: "text-crimson",
};

type Phase = "entrance" | "fighting" | "floor_clear" | "dungeon_clear" | "defeat";

export default function DungeonPage() {
  const navigate = useNavigate();
  const { character, addTokens, addXP, addItem, recordBattleWin } = useGame();
  const [phase, setPhase] = useState<Phase>("entrance");
  const [dungeon, setDungeon] = useState<DungeonFloor[]>([]);
  const [currentFloor, setCurrentFloor] = useState(0);
  const [enemyHp, setEnemyHp] = useState(0);
  const [playerHp, setPlayerHp] = useState(100);
  const [playerMaxHp] = useState(100);
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [defending, setDefending] = useState(false);
  const [log, setLog] = useState<string[]>([]);
  const [shakePlayer, setShakePlayer] = useState(false);
  const [shakeEnemy, setShakeEnemy] = useState(false);
  const [totalReward, setTotalReward] = useState(0);
  const [totalXP, setTotalXP] = useState(0);
  const [allLoot, setAllLoot] = useState<InventoryItem[]>([]);
  const [floorLoot, setFloorLoot] = useState<InventoryItem[]>([]);

  const playerAtk = character ? Math.floor(character.stats.str * 0.4 + character.stats.dex * 0.2) : 20;
  const playerDef = character ? Math.floor(character.stats.str * 0.1 + character.stats.hp * 0.1) : 5;

  useEffect(() => {
    if (phase === "dungeon_clear" || phase === "defeat") stopAllMusic();
    return () => { stopAllMusic(); };
  }, [phase]);

  const addLog = useCallback((msg: string) => {
    setLog((prev) => [...prev.slice(-8), msg]);
  }, []);

  const enterDungeon = () => {
    const d = generateDungeon();
    setDungeon(d);
    setCurrentFloor(0);
    setTotalReward(0);
    setTotalXP(0);
    setAllLoot([]);
    startFloor(d, 0);
  };

  const startFloor = (d: DungeonFloor[], floorIdx: number) => {
    const floor = d[floorIdx];
    setEnemyHp(floor.enemy.maxHp);
    setPlayerHp(playerMaxHp);
    setIsPlayerTurn(true);
    setDefending(false);
    setFloorLoot([]);
    setLog([`📍 Floor ${floor.floor} — ${floor.isBoss ? "⚠️ BOSS: " : ""}${floor.enemy.emoji} ${floor.enemy.name} appears!`]);
    setPhase("fighting");
    playBattleMusic();
    SFX.click();
  };

  const attack = () => {
    if (!isPlayerTurn || phase !== "fighting") return;
    const floor = dungeon[currentFloor];
    if (!floor) return;
    SFX.attack();
    const dmg = Math.max(1, playerAtk - floor.enemy.def + Math.floor(Math.random() * 8) - 3);
    const newHp = Math.max(0, enemyHp - dmg);
    setShakeEnemy(true);
    setTimeout(() => setShakeEnemy(false), 300);
    setEnemyHp(newHp);
    addLog(`⚔️ You deal ${dmg} to ${floor.enemy.name}!`);

    if (newHp <= 0) {
      SFX.victory();
      const rew = Math.floor(floor.enemy.maxHp * 0.6 * (1 + floor.floor * 0.15));
      const xp = Math.floor(floor.enemy.maxHp * 0.4 * (1 + floor.floor * 0.1));
      const drops = rollDungeonLoot(floor.floor, floor.isBoss);
      addTokens(rew);
      addXP(xp);
      recordBattleWin();
      drops.forEach((d) => addItem(d));
      setTotalReward((r) => r + rew);
      setTotalXP((x) => x + xp);
      setAllLoot((l) => [...l, ...drops]);
      setFloorLoot(drops);
      addLog(`🏆 ${floor.enemy.name} defeated! +${rew} $REALM, +${xp} XP`);
      stopAllMusic();

      if (currentFloor >= dungeon.length - 1) {
        setPhase("dungeon_clear");
      } else {
        setPhase("floor_clear");
      }
      return;
    }
    setDefending(false);
    setIsPlayerTurn(false);
  };

  const defend = () => {
    if (!isPlayerTurn) return;
    SFX.defend();
    setDefending(true);
    addLog("🛡️ You brace for the attack!");
    setIsPlayerTurn(false);
  };

  const nextFloor = () => {
    const next = currentFloor + 1;
    setCurrentFloor(next);
    startFloor(dungeon, next);
  };

  // Enemy turn
  useEffect(() => {
    if (isPlayerTurn || phase !== "fighting") return;
    const floor = dungeon[currentFloor];
    if (!floor) return;
    const timer = setTimeout(() => {
      const defMod = defending ? 1.5 : 1;
      const dmg = Math.max(1, Math.floor(floor.enemy.atk - playerDef * defMod + Math.random() * 6 - 2));
      const newHp = Math.max(0, playerHp - dmg);
      SFX.hit();
      setShakePlayer(true);
      setTimeout(() => setShakePlayer(false), 300);
      setPlayerHp(newHp);
      addLog(`💥 ${floor.enemy.name} hits for ${dmg}!`);

      if (newHp <= 0) {
        SFX.defeat();
        addLog("☠️ You perished in the dungeon...");
        stopAllMusic();
        setPhase("defeat");
        return;
      }
      setIsPlayerTurn(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, [isPlayerTurn, phase, dungeon, currentFloor, playerHp, playerDef, defending, addLog]);

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

  const floor = dungeon[currentFloor];

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <GameButton variant="outline" size="sm" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="w-4 h-4 mr-1 inline" /> Dashboard
          </GameButton>
          <h1 className="text-3xl font-cinzel font-bold text-arcane glow-arcane">
            <Skull className="w-7 h-7 inline mr-2" />Dungeon
          </h1>
          {phase === "fighting" && (
            <span className="ml-auto text-muted-foreground font-crimson text-sm">
              Floor {currentFloor + 1}/{dungeon.length}
            </span>
          )}
        </div>

        {/* Entrance */}
        {phase === "entrance" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-lg mx-auto text-center">
            <GameCard hover={false} className="border-arcane/30">
              <span className="text-6xl block mb-4">🏰</span>
              <h2 className="font-cinzel text-2xl font-bold text-foreground mb-2">The Abyss Dungeon</h2>
              <p className="text-muted-foreground font-crimson text-sm mb-4">
                Descend through 5 floors of increasingly dangerous foes. A powerful boss awaits on the final floor.
                Deeper floors yield rarer loot and greater rewards.
              </p>
              <div className="grid grid-cols-3 gap-3 text-center font-crimson text-xs text-muted-foreground mb-6">
                <div className="bg-muted rounded-md p-2">
                  <ChevronDown className="w-4 h-4 text-arcane mx-auto mb-1" />
                  <p>5 Floors</p>
                </div>
                <div className="bg-muted rounded-md p-2">
                  <Flame className="w-4 h-4 text-crimson mx-auto mb-1" />
                  <p>Boss on F5</p>
                </div>
                <div className="bg-muted rounded-md p-2">
                  <Star className="w-4 h-4 text-gold mx-auto mb-1" />
                  <p>Better Loot</p>
                </div>
              </div>
              <GameButton variant="crimson" size="lg" onClick={enterDungeon}>
                <Skull className="w-5 h-5 mr-2 inline" /> Enter Dungeon
              </GameButton>
            </GameCard>
          </motion.div>
        )}

        {/* Fighting */}
        {phase === "fighting" && floor && (
          <div className="space-y-6">
            {/* Floor indicator */}
            <div className="flex justify-center gap-1">
              {dungeon.map((_, i) => (
                <div key={i} className={`w-8 h-2 rounded-full transition-colors ${
                  i < currentFloor ? "bg-gold" : i === currentFloor ? "bg-arcane animate-pulse" : "bg-muted"
                }`} />
              ))}
            </div>

            <div className="grid grid-cols-2 gap-6">
              <motion.div
                animate={shakePlayer ? { x: [-5, 5, -5, 5, 0] } : {}}
                transition={{ duration: 0.3 }}
                className="gradient-card border border-border rounded-lg p-4 text-center"
              >
                <span className="text-4xl mb-2 block">🧙</span>
                <h3 className="font-cinzel font-semibold text-foreground">{character.name}</h3>
                <p className="text-xs text-gold font-crimson mb-3">{character.className} Lv.{character.level}</p>
                <StatBar label="HP" value={playerHp} max={playerMaxHp} color="crimson" />
              </motion.div>

              <motion.div
                animate={shakeEnemy ? { x: [-5, 5, -5, 5, 0] } : {}}
                transition={{ duration: 0.3 }}
                className={`gradient-card border rounded-lg p-4 text-center ${floor.isBoss ? "border-crimson/50" : "border-arcane/30"}`}
              >
                <span className="text-4xl mb-2 block">{floor.enemy.emoji}</span>
                <h3 className="font-cinzel font-semibold text-foreground">{floor.enemy.name}</h3>
                <p className={`text-xs font-crimson mb-3 ${floor.isBoss ? "text-crimson" : "text-muted-foreground"}`}>
                  {floor.isBoss ? "⚠️ BOSS" : `Floor ${floor.floor}`}
                </p>
                <StatBar label="HP" value={enemyHp} max={floor.enemy.maxHp} color={floor.isBoss ? "crimson" : "arcane"} />
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

            {!isPlayerTurn && <p className="text-center text-muted-foreground font-crimson animate-pulse-gold">Enemy attacking...</p>}

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

        {/* Floor Clear */}
        <AnimatePresence>
          {phase === "floor_clear" && floor && (
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="gradient-card border border-gold rounded-lg p-6 text-center max-w-md mx-auto">
              <h2 className="font-cinzel text-2xl font-bold text-gold mb-2">Floor {floor.floor} Cleared!</h2>
              <div className="flex items-center justify-center gap-4 text-sm font-crimson mb-3">
                <span className="text-gold"><Coins className="w-4 h-4 inline mr-1" />+{Math.floor(floor.enemy.maxHp * 0.6 * (1 + floor.floor * 0.15))}</span>
                <span className="text-arcane"><Star className="w-4 h-4 inline mr-1" />+{Math.floor(floor.enemy.maxHp * 0.4 * (1 + floor.floor * 0.1))} XP</span>
              </div>
              {floorLoot.length > 0 && (
                <div className="mb-4 space-y-1">
                  <p className="text-xs text-muted-foreground font-crimson">📦 Loot:</p>
                  {floorLoot.map((d, i) => (
                    <p key={i} className={`text-sm font-crimson ${rarityColor[d.rarity]}`}>{d.name} ({d.rarity})</p>
                  ))}
                </div>
              )}
              <p className="text-xs text-muted-foreground font-crimson mb-4">
                {dungeon.length - currentFloor - 1} floors remaining · {dungeon[currentFloor + 1]?.isBoss ? "⚠️ Boss ahead!" : "Enemies grow stronger..."}
              </p>
              <div className="flex gap-3 justify-center">
                <GameButton variant="gold" onClick={nextFloor}>
                  <ChevronDown className="w-4 h-4 mr-1 inline" /> Descend
                </GameButton>
                <GameButton variant="outline" onClick={() => setPhase("entrance")}>Leave Dungeon</GameButton>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dungeon Clear */}
        <AnimatePresence>
          {phase === "dungeon_clear" && (
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="gradient-card border border-gold rounded-lg p-8 text-center max-w-md mx-auto">
              <Trophy className="w-16 h-16 text-gold mx-auto mb-4" />
              <h2 className="font-cinzel text-3xl font-bold text-gold glow-gold mb-2">Dungeon Conquered!</h2>
              <p className="text-foreground font-crimson mb-4">All 5 floors cleared!</p>
              <div className="flex items-center justify-center gap-4 text-lg font-crimson mb-3">
                <span className="text-gold"><Coins className="w-5 h-5 inline mr-1" />{totalReward} $REALM</span>
                <span className="text-arcane"><Star className="w-5 h-5 inline mr-1" />{totalXP} XP</span>
              </div>
              {allLoot.length > 0 && (
                <div className="mb-4 space-y-1 max-h-32 overflow-y-auto">
                  <p className="text-sm text-muted-foreground font-crimson">📦 All Loot:</p>
                  {allLoot.map((d, i) => (
                    <p key={i} className={`text-sm font-crimson ${rarityColor[d.rarity]}`}>{d.name} ({d.rarity})</p>
                  ))}
                </div>
              )}
              <div className="flex gap-3 justify-center">
                <GameButton variant="gold" onClick={enterDungeon}>Run Again</GameButton>
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
              <h2 className="font-cinzel text-3xl font-bold text-crimson glow-crimson mb-2">Perished</h2>
              <p className="text-muted-foreground font-crimson mb-2">Fell on floor {currentFloor + 1}</p>
              {totalReward > 0 && (
                <p className="text-gold font-crimson text-sm mb-2">Kept: {totalReward} $REALM, {totalXP} XP</p>
              )}
              <div className="flex gap-3 justify-center mt-4">
                <GameButton variant="crimson" onClick={enterDungeon}>Try Again</GameButton>
                <GameButton variant="outline" onClick={() => navigate("/dashboard")}>Dashboard</GameButton>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
