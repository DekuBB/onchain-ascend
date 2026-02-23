import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Trophy, Crown, Medal, Star, Coins, Clock, Swords, Flame } from "lucide-react";
import { GameButton } from "@/components/GameButton";
import { GameCard } from "@/components/GameCard";
import { useGame } from "@/context/GameContext";

interface LeaderboardEntry {
  rank: number;
  name: string;
  className: string;
  level: number;
  score: number;
  guild?: string;
}

const mockLeaderboard: LeaderboardEntry[] = [
  { rank: 1, name: "DragonSlayer99", className: "Warrior", level: 24, score: 18750, guild: "SHW" },
  { rank: 2, name: "ArcaneQueen", className: "Mage", level: 22, score: 16200, guild: "CRO" },
  { rank: 3, name: "PhoenixRider", className: "Ranger", level: 21, score: 15800, guild: "FLG" },
  { rank: 4, name: "BladeWalker", className: "Warrior", level: 19, score: 13400, guild: "FLG" },
  { rank: 5, name: "RuneMaster", className: "Mage", level: 18, score: 12100, guild: "CRO" },
  { rank: 6, name: "StormCaller", className: "Mage", level: 17, score: 10800 },
  { rank: 7, name: "IronFist", className: "Warrior", level: 16, score: 9500, guild: "CRO" },
  { rank: 8, name: "ShadowMage", className: "Mage", level: 15, score: 8900, guild: "FLG" },
  { rank: 9, name: "ArrowStorm", className: "Ranger", level: 14, score: 7600, guild: "SHW" },
  { rank: 10, name: "MageKing", className: "Mage", level: 13, score: 6800, guild: "SHW" },
];

const seasonRewards = [
  { rank: "1st", reward: "5,000 $REALM + Legendary Crown NFT", icon: Crown, color: "text-gold" },
  { rank: "2nd", reward: "3,000 $REALM + Epic Title NFT", icon: Medal, color: "text-muted-foreground" },
  { rank: "3rd", reward: "1,500 $REALM + Rare Banner NFT", icon: Medal, color: "text-crimson" },
  { rank: "Top 10", reward: "500 $REALM + Season Badge", icon: Star, color: "text-arcane" },
  { rank: "Top 50", reward: "100 $REALM", icon: Coins, color: "text-emerald_game" },
];

const rankIcon = (rank: number) => {
  if (rank === 1) return <Crown className="w-5 h-5 text-gold" />;
  if (rank === 2) return <Medal className="w-5 h-5 text-muted-foreground" />;
  if (rank === 3) return <Medal className="w-5 h-5 text-crimson" />;
  return <span className="text-xs text-muted-foreground font-crimson w-5 text-center">#{rank}</span>;
};

const classEmoji: Record<string, string> = {
  Warrior: "⚔️",
  Mage: "🧙",
  Ranger: "🏹",
};

type Tab = "leaderboard" | "rewards" | "history";

export default function SeasonsPage() {
  const navigate = useNavigate();
  const { character } = useGame();
  const [tab, setTab] = useState<Tab>("leaderboard");

  // Calculate days remaining in season (30-day cycle)
  const seasonStart = new Date("2026-02-01").getTime();
  const now = Date.now();
  const daysPassed = Math.floor((now - seasonStart) / 86400000) % 30;
  const daysRemaining = 30 - daysPassed;
  const seasonNumber = Math.floor((now - seasonStart) / (30 * 86400000)) + 1;

  // Insert player into leaderboard if they have a character
  const leaderboard = [...mockLeaderboard];
  if (character) {
    const playerScore = character.level * 100 + character.xp;
    const playerEntry: LeaderboardEntry = {
      rank: 0,
      name: character.name,
      className: character.className,
      level: character.level,
      score: playerScore,
    };
    leaderboard.push(playerEntry);
    leaderboard.sort((a, b) => b.score - a.score);
    leaderboard.forEach((e, i) => { e.rank = i + 1; });
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <GameButton variant="outline" size="sm" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="w-4 h-4 mr-1 inline" /> Dashboard
          </GameButton>
          <h1 className="text-3xl font-cinzel font-bold text-gold glow-gold">
            <Trophy className="w-7 h-7 inline mr-2" />Season {seasonNumber}
          </h1>
        </div>

        {/* Season info */}
        <GameCard hover={false} className="mb-6 border-gold/30">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-cinzel text-xl font-bold text-foreground flex items-center gap-2">
                <Flame className="w-5 h-5 text-crimson" /> Season {seasonNumber}: Age of Dragons
              </h2>
              <p className="text-muted-foreground font-crimson text-sm mt-1">
                Climb the ranks through PvE and PvP battles. Top players earn exclusive rewards!
              </p>
            </div>
            <div className="flex items-center gap-2 text-gold font-crimson">
              <Clock className="w-5 h-5" />
              <div className="text-right">
                <p className="text-lg font-bold">{daysRemaining} days</p>
                <p className="text-xs text-muted-foreground">remaining</p>
              </div>
            </div>
          </div>
        </GameCard>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {([
            { key: "leaderboard" as Tab, label: "Leaderboard", icon: Trophy },
            { key: "rewards" as Tab, label: "Rewards", icon: Coins },
            { key: "history" as Tab, label: "Past Seasons", icon: Clock },
          ]).map((t) => (
            <GameButton
              key={t.key}
              variant={tab === t.key ? "gold" : "outline"}
              size="sm"
              onClick={() => setTab(t.key)}
            >
              <t.icon className="w-4 h-4 mr-1 inline" />{t.label}
            </GameButton>
          ))}
        </div>

        {/* Leaderboard */}
        {tab === "leaderboard" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="space-y-2">
              {leaderboard.slice(0, 15).map((entry) => {
                const isPlayer = character && entry.name === character.name;
                return (
                  <motion.div
                    key={entry.name}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: entry.rank * 0.03 }}
                  >
                    <div
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg border transition-colors ${
                        isPlayer
                          ? "border-gold/50 bg-gold/5"
                          : entry.rank <= 3
                          ? "border-gold/20 gradient-card"
                          : "border-border gradient-card"
                      }`}
                    >
                      <div className="w-8 flex justify-center">{rankIcon(entry.rank)}</div>
                      <span className="text-lg">{classEmoji[entry.className] || "⚔️"}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`font-cinzel text-sm font-semibold truncate ${isPlayer ? "text-gold" : "text-foreground"}`}>
                            {entry.name}
                          </span>
                          {entry.guild && (
                            <span className="text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded font-crimson">[{entry.guild}]</span>
                          )}
                          {isPlayer && <span className="text-xs text-gold font-crimson">(You)</span>}
                        </div>
                        <p className="text-xs text-muted-foreground font-crimson">Lv.{entry.level} {entry.className}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-gold font-crimson">{entry.score.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground font-crimson">pts</p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Rewards */}
        {tab === "rewards" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
            {seasonRewards.map((r) => (
              <GameCard key={r.rank} hover={false}>
                <div className="flex items-center gap-4">
                  <r.icon className={`w-8 h-8 ${r.color}`} />
                  <div>
                    <h3 className={`font-cinzel font-semibold ${r.color}`}>{r.rank} Place</h3>
                    <p className="text-sm text-muted-foreground font-crimson">{r.reward}</p>
                  </div>
                </div>
              </GameCard>
            ))}
          </motion.div>
        )}

        {/* Past seasons */}
        {tab === "history" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
            {seasonNumber > 1 ? (
              Array.from({ length: Math.min(seasonNumber - 1, 3) }, (_, i) => (
                <GameCard key={i} hover={false}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-cinzel font-semibold text-foreground">Season {seasonNumber - 1 - i}</h3>
                      <p className="text-xs text-muted-foreground font-crimson">Winner: DragonSlayer99 — 18,750 pts</p>
                    </div>
                    <Trophy className="w-6 h-6 text-gold/40" />
                  </div>
                </GameCard>
              ))
            ) : (
              <GameCard hover={false}>
                <p className="text-muted-foreground font-crimson text-center py-4">
                  This is the first season! No history yet.
                </p>
              </GameCard>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
