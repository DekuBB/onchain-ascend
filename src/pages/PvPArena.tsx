import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Swords, Coins, Trophy, Skull, Shield, Zap } from "lucide-react";
import { GameButton } from "@/components/GameButton";
import { GameCard } from "@/components/GameCard";
import { StatBar } from "@/components/StatBar";
import { useGame } from "@/context/GameContext";
import { SFX, playBattleMusic, stopAllMusic } from "@/lib/audio";

interface Opponent {
  name: string;
  className: string;
  level: number;
  hp: number;
  maxHp: number;
  atk: number;
  def: number;
  emoji: string;
}

const opponents: Opponent[] = [
  { name: "ShadowBlade", className: "Warrior", level: 3, hp: 90, maxHp: 90, atk: 20, def: 8, emoji: "⚔️" },
  { name: "FrostMage42", className: "Mage", level: 5, hp: 70, maxHp: 70, atk: 28, def: 4, emoji: "🧙" },
  { name: "SwiftArrow", className: "Ranger", level: 4, hp: 80, maxHp: 80, atk: 24, def: 6, emoji: "🏹" },
  { name: "IronTitan", className: "Warrior", level: 8, hp: 140, maxHp: 140, atk: 32, def: 14, emoji: "🛡️" },
  { name: "DarkSorcerer", className: "Mage", level: 10, hp: 100, maxHp: 100, atk: 40, def: 5, emoji: "💀" },
];

type Phase = "lobby" | "wager" | "fighting" | "victory" | "defeat";

const wagerOptions = [50, 100, 250, 500];

export default function PvPArena() {
  const navigate = useNavigate();
  const { character, realmTokens, addTokens, addXP } = useGame();
  const [phase, setPhase] = useState<Phase>("lobby");
  const [selectedOpponent, setSelectedOpponent] = useState<Opponent | null>(null);
  const [wager, setWager] = useState(0);
  const [opponentHp, setOpponentHp] = useState(0);
  const [playerHp, setPlayerHp] = useState(100);
  const [playerMaxHp] = useState(100);
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [defending, setDefending] = useState(false);
  const [log, setLog] = useState<string[]>([]);
  const [shakePlayer, setShakePlayer] = useState(false);
  const [shakeEnemy, setShakeEnemy] = useState(false);

  const playerAtk = character ? Math.floor(character.stats.str * 0.4 + character.stats.dex * 0.2) : 20;
  const playerDef = character ? Math.floor(character.stats.str * 0.1 + character.stats.hp * 0.1) : 5;

  useEffect(() => {
    if (phase === "victory" || phase === "defeat") stopAllMusic();
    return () => { stopAllMusic(); };
  }, [phase]);

  const addLog = useCallback((msg: string) => {
    setLog((prev) => [...prev.slice(-8), msg]);
  }, []);

  const selectOpponent = (opp: Opponent) => {
    setSelectedOpponent(opp);
    setPhase("wager");
    SFX.click();
  };

  const startFight = (w: number) => {
    if (!selectedOpponent || w > realmTokens) return;
    setWager(w);
    addTokens(-w);
    setOpponentHp(selectedOpponent.maxHp);
    setPlayerHp(playerMaxHp);
    setIsPlayerTurn(true);
    setDefending(false);
    setLog([`⚔️ PvP match vs ${selectedOpponent.name}! Wager: ${w} $REALM`]);
    setPhase("fighting");
    playBattleMusic();
    SFX.click();
  };

  const attack = () => {
    if (!selectedOpponent || !isPlayerTurn) return;
    SFX.attack();
    const dmg = Math.max(1, playerAtk - selectedOpponent.def + Math.floor(Math.random() * 10) - 4);
    const newHp = Math.max(0, opponentHp - dmg);
    setShakeEnemy(true);
    setTimeout(() => setShakeEnemy(false), 300);
    setOpponentHp(newHp);
    addLog(`⚔️ You deal ${dmg} to ${selectedOpponent.name}!`);

    if (newHp <= 0) {
      SFX.victory();
      const winnings = wager * 2;
      const xp = Math.floor(selectedOpponent.level * 15 + Math.random() * 20);
      addTokens(winnings);
      addXP(xp);
      addLog(`🏆 Victory! Won ${winnings} $REALM, +${xp} XP`);
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
    addLog("🛡️ You brace for the attack!");
    setIsPlayerTurn(false);
  };

  useEffect(() => {
    if (isPlayerTurn || phase !== "fighting" || !selectedOpponent) return;
    const timer = setTimeout(() => {
      const defMod = defending ? 1.5 : 1;
      const dmg = Math.max(1, Math.floor(selectedOpponent.atk - playerDef * defMod + Math.random() * 8 - 3));
      const newHp = Math.max(0, playerHp - dmg);
      SFX.hit();
      setShakePlayer(true);
      setTimeout(() => setShakePlayer(false), 300);
      setPlayerHp(newHp);
      addLog(`💥 ${selectedOpponent.name} hits for ${dmg}!`);

      if (newHp <= 0) {
        SFX.defeat();
        addLog(`☠️ Defeated! Lost ${wager} $REALM`);
        setPhase("defeat");
        return;
      }
      setIsPlayerTurn(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, [isPlayerTurn, phase, selectedOpponent, playerHp, playerDef, defending, addLog, wager]);

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

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <GameButton variant="outline" size="sm" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="w-4 h-4 mr-1 inline" /> Dashboard
          </GameButton>
          <h1 className="text-3xl font-cinzel font-bold text-crimson glow-crimson">
            <Swords className="w-7 h-7 inline mr-2" />PvP Arena
          </h1>
          <span className="ml-auto text-gold font-crimson text-sm flex items-center gap-1">
            <Coins className="w-4 h-4" /> {realmTokens} $REALM
          </span>
        </div>

        {/* Lobby */}
        {phase === "lobby" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2 className="font-cinzel text-xl text-foreground mb-4">Choose Your Opponent</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {opponents.map((opp) => (
                <GameCard key={opp.name} className="hover:border-crimson/50" onClick={() => selectOpponent(opp)}>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-3xl">{opp.emoji}</span>
                    <div>
                      <h3 className="font-cinzel font-semibold text-foreground">{opp.name}</h3>
                      <p className="text-xs text-muted-foreground font-crimson">Lv.{opp.level} {opp.className}</p>
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground font-crimson">
                    <span>HP: {opp.maxHp} | ATK: {opp.atk} | DEF: {opp.def}</span>
                    <span className={opp.level > 7 ? "text-crimson" : opp.level > 4 ? "text-gold" : "text-emerald_game"}>
                      {opp.level > 7 ? "Hard" : opp.level > 4 ? "Medium" : "Easy"}
                    </span>
                  </div>
                </GameCard>
              ))}
            </div>
          </motion.div>
        )}

        {/* Wager */}
        {phase === "wager" && selectedOpponent && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <GameCard hover={false} className="max-w-md mx-auto text-center">
              <span className="text-5xl block mb-3">{selectedOpponent.emoji}</span>
              <h2 className="font-cinzel text-2xl font-bold text-foreground mb-1">{selectedOpponent.name}</h2>
              <p className="text-muted-foreground font-crimson text-sm mb-6">Lv.{selectedOpponent.level} {selectedOpponent.className}</p>

              <h3 className="font-cinzel text-lg text-gold mb-3 flex items-center justify-center gap-2">
                <Coins className="w-5 h-5" /> Place Your Wager
              </h3>
              <div className="grid grid-cols-2 gap-3 mb-4">
                {wagerOptions.map((w) => (
                  <GameButton
                    key={w}
                    variant={realmTokens >= w ? "gold" : "outline"}
                    size="sm"
                    disabled={realmTokens < w}
                    onClick={() => startFight(w)}
                  >
                    {w} $REALM
                  </GameButton>
                ))}
              </div>
              <p className="text-xs text-muted-foreground font-crimson mb-4">Win = 2x wager | Lose = lose wager</p>
              <GameButton variant="outline" size="sm" onClick={() => setPhase("lobby")}>Back</GameButton>
            </GameCard>
          </motion.div>
        )}

        {/* Fighting */}
        {phase === "fighting" && selectedOpponent && (
          <div className="space-y-6">
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
                className="gradient-card border border-crimson/30 rounded-lg p-4 text-center"
              >
                <span className="text-4xl mb-2 block">{selectedOpponent.emoji}</span>
                <h3 className="font-cinzel font-semibold text-foreground">{selectedOpponent.name}</h3>
                <p className="text-xs text-crimson font-crimson mb-3">{selectedOpponent.className} Lv.{selectedOpponent.level}</p>
                <StatBar label="HP" value={opponentHp} max={selectedOpponent.maxHp} color="crimson" />
              </motion.div>
            </div>

            <div className="text-center">
              <span className="text-gold font-crimson text-sm">
                <Coins className="w-4 h-4 inline mr-1" />Wager: {wager} $REALM
              </span>
            </div>

            <div className="flex justify-center gap-4">
              <GameButton variant="crimson" size="lg" onClick={attack} disabled={!isPlayerTurn}>
                <Swords className="w-5 h-5 mr-2 inline" /> Attack
              </GameButton>
              <GameButton variant="outline" size="lg" onClick={defend} disabled={!isPlayerTurn}>
                <Shield className="w-5 h-5 mr-2 inline" /> Defend
              </GameButton>
            </div>

            {!isPlayerTurn && (
              <p className="text-center text-muted-foreground font-crimson animate-pulse-gold">Opponent attacking...</p>
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
              <p className="text-foreground font-crimson mb-4">You defeated {selectedOpponent?.name}!</p>
              <p className="text-gold font-crimson text-lg mb-6">
                <Coins className="w-5 h-5 inline mr-1" /> Won {wager * 2} $REALM
              </p>
              <div className="flex gap-3 justify-center">
                <GameButton variant="gold" onClick={() => setPhase("lobby")}>Fight Again</GameButton>
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
              <p className="text-muted-foreground font-crimson mb-2">Lost to {selectedOpponent?.name}</p>
              <p className="text-crimson font-crimson text-lg mb-6">Lost {wager} $REALM</p>
              <div className="flex gap-3 justify-center">
                <GameButton variant="crimson" onClick={() => setPhase("lobby")}>Try Again</GameButton>
                <GameButton variant="outline" onClick={() => navigate("/dashboard")}>Dashboard</GameButton>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
