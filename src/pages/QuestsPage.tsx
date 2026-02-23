import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ScrollText, CheckCircle, Circle, Coins, Star, Gift } from "lucide-react";
import { GameButton } from "@/components/GameButton";
import { GameCard } from "@/components/GameCard";
import { useGame } from "@/context/GameContext";

const questTypeIcon: Record<string, string> = {
  battle: "⚔️",
  craft: "🔨",
  pvp: "🏆",
  earn: "💰",
};

export default function QuestsPage() {
  const navigate = useNavigate();
  const { character, quests, claimQuest } = useGame();

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

  const activeQuests = quests.filter((q) => !q.completed);
  const completedQuests = quests.filter((q) => q.completed);

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <GameButton variant="outline" size="sm" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="w-4 h-4 mr-1 inline" /> Dashboard
          </GameButton>
          <h1 className="text-3xl font-cinzel font-bold text-gold glow-gold">
            <ScrollText className="w-7 h-7 inline mr-2" />Daily Quests
          </h1>
        </div>

        {/* Active Quests */}
        <h2 className="font-cinzel text-xl text-foreground mb-4 flex items-center gap-2">
          <Circle className="w-5 h-5 text-gold" /> Active Quests
        </h2>
        <div className="space-y-3 mb-8">
          {activeQuests.length === 0 ? (
            <GameCard hover={false}>
              <p className="text-muted-foreground font-crimson text-center py-4">All quests completed! 🎉</p>
            </GameCard>
          ) : (
            activeQuests.map((quest, i) => {
              const pct = Math.floor((quest.progress / quest.target) * 100);
              const canClaim = quest.progress >= quest.target;
              return (
                <motion.div key={quest.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <GameCard hover={false} className={canClaim ? "border-gold/40 shadow-gold" : ""}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xl">{questTypeIcon[quest.type]}</span>
                          <h3 className="font-cinzel text-sm font-semibold text-foreground">{quest.name}</h3>
                        </div>
                        <p className="text-xs text-muted-foreground font-crimson mb-2">{quest.description}</p>
                        {/* Progress bar */}
                        <div className="w-full h-2 bg-muted rounded-full overflow-hidden mb-1">
                          <motion.div
                            className="h-full bg-gold rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.5 }}
                          />
                        </div>
                        <div className="flex justify-between text-xs font-crimson">
                          <span className="text-muted-foreground">{quest.progress}/{quest.target}</span>
                          <span className="text-gold flex items-center gap-2">
                            <span><Coins className="w-3 h-3 inline" /> {quest.rewardTokens}</span>
                            <span><Star className="w-3 h-3 inline" /> {quest.rewardXP} XP</span>
                          </span>
                        </div>
                      </div>
                      {canClaim && (
                        <GameButton variant="gold" size="sm" onClick={() => claimQuest(quest.id)}>
                          <Gift className="w-4 h-4 mr-1 inline" />Claim
                        </GameButton>
                      )}
                    </div>
                  </GameCard>
                </motion.div>
              );
            })
          )}
        </div>

        {/* Completed */}
        {completedQuests.length > 0 && (
          <>
            <h2 className="font-cinzel text-xl text-foreground mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald_game" /> Completed
            </h2>
            <div className="space-y-2">
              {completedQuests.map((quest) => (
                <div key={quest.id} className="flex items-center gap-3 px-4 py-3 rounded-lg border border-border gradient-card opacity-60">
                  <span className="text-xl">{questTypeIcon[quest.type]}</span>
                  <div className="flex-1">
                    <h3 className="font-cinzel text-sm text-muted-foreground">{quest.name}</h3>
                  </div>
                  <CheckCircle className="w-4 h-4 text-emerald_game" />
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
