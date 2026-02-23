import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Trophy, Lock, CheckCircle } from "lucide-react";
import { GameButton } from "@/components/GameButton";
import { GameCard } from "@/components/GameCard";
import { useGame } from "@/context/GameContext";

const rarityBg: Record<string, string> = {
  unlocked: "border-gold/40 bg-gold/5",
  locked: "border-border opacity-60",
};

export default function AchievementsPage() {
  const navigate = useNavigate();
  const { character, achievements, battleWins, pvpWins, craftCount, totalEarned } = useGame();

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

  const unlocked = achievements.filter((a) => a.unlockedAt).length;

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <GameButton variant="outline" size="sm" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="w-4 h-4 mr-1 inline" /> Dashboard
          </GameButton>
          <h1 className="text-3xl font-cinzel font-bold text-gold glow-gold">
            <Trophy className="w-7 h-7 inline mr-2" />Achievements
          </h1>
        </div>

        {/* Stats summary */}
        <GameCard hover={false} className="mb-6">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 text-center font-crimson">
            <div>
              <p className="text-2xl font-bold text-gold">{unlocked}/{achievements.length}</p>
              <p className="text-xs text-muted-foreground">Unlocked</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{battleWins}</p>
              <p className="text-xs text-muted-foreground">PvE Wins</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{pvpWins}</p>
              <p className="text-xs text-muted-foreground">PvP Wins</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{craftCount}</p>
              <p className="text-xs text-muted-foreground">Crafted</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gold">{totalEarned.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Total Earned</p>
            </div>
          </div>
        </GameCard>

        {/* Achievement grid */}
        <div className="grid sm:grid-cols-2 gap-3">
          {achievements.map((ach, i) => {
            const isUnlocked = !!ach.unlockedAt;
            return (
              <motion.div
                key={ach.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <div className={`flex items-center gap-4 p-4 rounded-lg border transition-all ${isUnlocked ? rarityBg.unlocked : rarityBg.locked}`}>
                  <span className="text-3xl">{ach.icon}</span>
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-cinzel text-sm font-semibold ${isUnlocked ? "text-gold" : "text-muted-foreground"}`}>
                      {ach.name}
                    </h3>
                    <p className="text-xs text-muted-foreground font-crimson">{ach.description}</p>
                  </div>
                  {isUnlocked ? (
                    <CheckCircle className="w-5 h-5 text-gold flex-shrink-0" />
                  ) : (
                    <Lock className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
