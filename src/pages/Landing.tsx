import { useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Swords, Shield, Coins, Users, Map, Zap } from "lucide-react";
import { GameButton } from "@/components/GameButton";
import { GameCard } from "@/components/GameCard";
import { playAmbientMusic, stopAllMusic } from "@/lib/audio";
import heroBg from "@/assets/hero-bg.jpg";

const features = [
  { icon: Swords, title: "PvP Combat", desc: "Battle players in open-world PvP zones for glory and loot" },
  { icon: Shield, title: "NFT Gear", desc: "Craft and trade ERC-1155 items on the blockchain" },
  { icon: Coins, title: "Earn Tokens", desc: "Earn $REALM tokens through gameplay and quests" },
  { icon: Users, title: "Guilds", desc: "Form on-chain guilds with shared vaults and wars" },
  { icon: Map, title: "Open World", desc: "Explore vast 2D landscapes with dungeons and resources" },
  { icon: Zap, title: "Live Events", desc: "Daily World Boss battles with rare NFT drops" },
];

export default function Landing() {
  const navigate = useNavigate();

  useEffect(() => {
    playAmbientMusic();
    return () => { stopAllMusic(); };
  }, []);


  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroBg})` }}
        />
        <div className="absolute inset-0 bg-background/70" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/50" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 text-center px-4 max-w-4xl"
        >
          <motion.h1
            className="text-5xl md:text-7xl lg:text-8xl font-cinzel font-black text-gold glow-gold mb-4 tracking-wider"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            CRYPTO REALM
          </motion.h1>
          <motion.p
            className="text-xl md:text-2xl text-foreground/80 font-crimson mb-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            On-Chain MMO RPG • Built on Base
          </motion.p>
          <motion.p
            className="text-base md:text-lg text-muted-foreground font-crimson mb-8 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            Explore, fight, craft, and earn in a fully decentralized medieval world.
            Your items are NFTs. Your gold is real.
          </motion.p>
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
          >
            <GameButton variant="gold" size="lg" onClick={() => navigate("/lobby")}>
              ⚔️ Enter Game
            </GameButton>
            <GameButton variant="outline" size="lg" onClick={() => navigate("/map")}>
              🗺️ View World Map
            </GameButton>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-6 h-10 border-2 border-gold/40 rounded-full flex justify-center pt-2">
            <div className="w-1.5 h-3 bg-gold/60 rounded-full" />
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.h2
            className="text-3xl md:text-4xl font-cinzel font-bold text-center text-gold mb-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            Forge Your Legend
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <GameCard className="h-full">
                  <f.icon className="w-8 h-8 text-gold mb-3" />
                  <h3 className="font-cinzel text-lg font-semibold text-foreground mb-2">{f.title}</h3>
                  <p className="text-muted-foreground font-crimson text-sm">{f.desc}</p>
                </GameCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 border-t border-border">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-cinzel font-bold text-foreground mb-4">
            Season 1 begins soon
          </h2>
          <p className="text-muted-foreground font-crimson mb-6">
            Join thousands of players on Base. Connect your wallet and claim your character.
          </p>
          <GameButton variant="gold" size="lg" onClick={() => navigate("/lobby")}>
            Claim Your Character
          </GameButton>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <span className="font-cinzel text-gold font-bold text-lg">CRYPTO REALM</span>
          <div className="flex gap-6 text-sm text-muted-foreground font-crimson">
            <span>Built on Base</span>
            <span>•</span>
            <span>Powered by Farcaster</span>
            <span>•</span>
            <span>© 2025</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
