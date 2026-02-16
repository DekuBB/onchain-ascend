import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Users, Shield, Coins, Crown, Plus, LogIn, LogOut, Vault } from "lucide-react";
import { GameButton } from "@/components/GameButton";
import { GameCard } from "@/components/GameCard";
import { useGame } from "@/context/GameContext";

export default function GuildPage() {
  const navigate = useNavigate();
  const { character, guild, availableGuilds, realmTokens, createGuild, joinGuild, leaveGuild, depositToVault } = useGame();
  const [showCreate, setShowCreate] = useState(false);
  const [guildName, setGuildName] = useState("");
  const [guildTag, setGuildTag] = useState("");
  const [depositAmount, setDepositAmount] = useState("");

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

  const handleCreate = () => {
    if (guildName.trim().length < 3 || guildTag.trim().length < 2) return;
    createGuild(guildName.trim(), guildTag.trim());
    setShowCreate(false);
    setGuildName("");
    setGuildTag("");
  };

  const handleDeposit = () => {
    const amt = parseInt(depositAmount);
    if (isNaN(amt) || amt <= 0) return;
    depositToVault(amt);
    setDepositAmount("");
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <GameButton variant="outline" size="sm" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="w-4 h-4 mr-1 inline" /> Dashboard
          </GameButton>
          <h1 className="text-3xl font-cinzel font-bold text-gold glow-gold">
            <Users className="w-7 h-7 inline mr-2" />Guilds
          </h1>
        </div>

        {/* My Guild */}
        {guild ? (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <GameCard hover={false} className="mb-6 border-gold/30">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Shield className="w-6 h-6 text-gold" />
                    <h2 className="font-cinzel text-2xl font-bold text-foreground">{guild.name}</h2>
                    <span className="text-xs bg-gold/20 text-gold px-2 py-0.5 rounded font-crimson">[{guild.tag}]</span>
                  </div>
                  <p className="text-muted-foreground font-crimson text-sm">
                    <Crown className="w-3 h-3 inline mr-1" />Leader: {guild.leader}
                  </p>
                </div>
                <GameButton variant="outline" size="sm" onClick={leaveGuild}>
                  <LogOut className="w-4 h-4 mr-1 inline" /> Leave
                </GameButton>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 mb-4">
                <div className="bg-muted rounded-md p-3">
                  <p className="text-xs text-muted-foreground font-crimson mb-1">Members ({guild.members.length})</p>
                  <div className="space-y-1">
                    {guild.members.map((m) => (
                      <div key={m} className="flex items-center gap-2 text-sm font-crimson text-foreground">
                        <span className="w-2 h-2 rounded-full bg-emerald" />
                        {m} {m === guild.leader && <Crown className="w-3 h-3 text-gold" />}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-muted rounded-md p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Vault className="w-4 h-4 text-gold" />
                    <p className="text-xs text-muted-foreground font-crimson">Guild Vault</p>
                  </div>
                  <p className="text-2xl font-bold text-gold font-crimson mb-3">{guild.vault.toLocaleString()} $REALM</p>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Amount"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      className="flex-1 bg-background border border-border rounded px-2 py-1 text-sm font-crimson text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold/50"
                    />
                    <GameButton variant="gold" size="sm" onClick={handleDeposit} disabled={realmTokens <= 0}>
                      <Coins className="w-3 h-3 mr-1 inline" />Deposit
                    </GameButton>
                  </div>
                  <p className="text-xs text-muted-foreground font-crimson mt-1">Your balance: {realmTokens} $REALM</p>
                </div>
              </div>
            </GameCard>
          </motion.div>
        ) : (
          <div className="mb-6">
            {/* Create Guild */}
            {showCreate ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <GameCard hover={false} className="mb-4">
                  <h3 className="font-cinzel font-semibold text-foreground mb-4">
                    <Plus className="w-5 h-5 inline mr-2" />Create New Guild
                  </h3>
                  <div className="space-y-3">
                    <input
                      placeholder="Guild Name (min 3 chars)"
                      value={guildName}
                      onChange={(e) => setGuildName(e.target.value)}
                      className="w-full bg-muted border border-border rounded px-3 py-2 text-sm font-crimson text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold/50"
                    />
                    <input
                      placeholder="Tag (2-4 chars, e.g. SHW)"
                      value={guildTag}
                      onChange={(e) => setGuildTag(e.target.value.toUpperCase().slice(0, 4))}
                      className="w-full bg-muted border border-border rounded px-3 py-2 text-sm font-crimson text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold/50"
                    />
                    <div className="flex gap-3">
                      <GameButton variant="gold" onClick={handleCreate}>Create Guild</GameButton>
                      <GameButton variant="outline" onClick={() => setShowCreate(false)}>Cancel</GameButton>
                    </div>
                  </div>
                </GameCard>
              </motion.div>
            ) : (
              <GameButton variant="gold" size="lg" className="mb-4" onClick={() => setShowCreate(true)}>
                <Plus className="w-5 h-5 mr-2 inline" />Create Guild
              </GameButton>
            )}
          </div>
        )}

        {/* Available Guilds */}
        <h2 className="font-cinzel text-xl font-semibold text-foreground mb-4">Available Guilds</h2>
        <div className="space-y-3">
          {availableGuilds.filter((g) => g.id !== guild?.id).map((g) => (
            <motion.div key={g.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}>
              <GameCard hover className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-gold" />
                    <h3 className="font-cinzel font-semibold text-foreground">{g.name}</h3>
                    <span className="text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded font-crimson">[{g.tag}]</span>
                  </div>
                  <div className="flex gap-4 mt-1 text-xs text-muted-foreground font-crimson">
                    <span><Users className="w-3 h-3 inline mr-1" />{g.members.length} members</span>
                    <span><Coins className="w-3 h-3 inline mr-1" />{g.vault.toLocaleString()} $REALM vault</span>
                    <span><Crown className="w-3 h-3 inline mr-1" />{g.leader}</span>
                  </div>
                </div>
                {!guild && (
                  <GameButton variant="outline" size="sm" onClick={() => joinGuild(g.id)}>
                    <LogIn className="w-4 h-4 mr-1 inline" />Join
                  </GameButton>
                )}
              </GameCard>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}