import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, MessageCircle, Send, Users, Globe, SmilePlus } from "lucide-react";
import { GameButton } from "@/components/GameButton";
import { useGame } from "@/context/GameContext";

interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  timestamp: number;
  type: "user" | "system" | "drop";
  channel: "global" | "guild";
}

const emojis = ["⚔️", "🛡️", "🔥", "💎", "👑", "🏆", "💀", "🐉", "✨", "👍", "😂", "🎉"];

const npcMessages: { sender: string; text: string; type: "user" | "drop" }[] = [
  { sender: "DragonSlayer99", text: "Anyone want to raid the dungeon?", type: "user" },
  { sender: "ArcaneQueen", text: "LFG for world boss! 🐉", type: "user" },
  { sender: "IronFist", text: "Just crafted a Legendary! 👑", type: "user" },
  { sender: "PhoenixRider", text: "GG to my guild mates 🔥", type: "user" },
  { sender: "BladeWalker", text: "Anyone selling Dragon Scales?", type: "user" },
  { sender: "System", text: "💎 ShadowMage found Dragonfire Amulet (Legendary)!", type: "drop" },
  { sender: "System", text: "⚔️ StormCaller defeated the Abyssal Dragon!", type: "drop" },
  { sender: "System", text: "🏆 MageKing reached Level 20!", type: "drop" },
  { sender: "RuneMaster", text: "The PvP arena is intense today 😂", type: "user" },
  { sender: "StormCaller", text: "Need 1 more for dungeon run", type: "user" },
];

function generateInitialMessages(): ChatMessage[] {
  const msgs: ChatMessage[] = [];
  for (let i = 0; i < 8; i++) {
    const npc = npcMessages[Math.floor(Math.random() * npcMessages.length)];
    msgs.push({
      id: `init_${i}`,
      sender: npc.sender,
      text: npc.text,
      timestamp: Date.now() - (8 - i) * 30000,
      type: npc.type === "drop" ? "drop" : "user",
      channel: "global",
    });
  }
  return msgs;
}

export default function ChatPage() {
  const navigate = useNavigate();
  const { character, guild } = useGame();
  const [channel, setChannel] = useState<"global" | "guild">("global");
  const [messages, setMessages] = useState<ChatMessage[]>(generateInitialMessages);
  const [input, setInput] = useState("");
  const [showEmojis, setShowEmojis] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const playerName = character?.name || "Player";

  // Simulate NPC messages
  useEffect(() => {
    const interval = setInterval(() => {
      const npc = npcMessages[Math.floor(Math.random() * npcMessages.length)];
      const msg: ChatMessage = {
        id: `npc_${Date.now()}`,
        sender: npc.sender,
        text: npc.text,
        timestamp: Date.now(),
        type: npc.type === "drop" ? "drop" : "user",
        channel: Math.random() > 0.3 ? "global" : "guild",
      };
      setMessages((prev) => [...prev.slice(-50), msg]);
    }, 5000 + Math.random() * 8000);
    return () => clearInterval(interval);
  }, []);

  // Auto scroll
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;
    const msg: ChatMessage = {
      id: `user_${Date.now()}`,
      sender: playerName,
      text: input.trim(),
      timestamp: Date.now(),
      type: "user",
      channel,
    };
    setMessages((prev) => [...prev.slice(-50), msg]);
    setInput("");
    setShowEmojis(false);
  };

  const addEmoji = (emoji: string) => {
    setInput((prev) => prev + emoji);
  };

  const filteredMessages = messages.filter((m) => m.channel === channel || m.type === "drop");

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
  };

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
      <div className="max-w-2xl mx-auto flex flex-col" style={{ height: "calc(100vh - 4rem)" }}>
        <div className="flex items-center gap-4 mb-4">
          <GameButton variant="outline" size="sm" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="w-4 h-4 mr-1 inline" /> Back
          </GameButton>
          <h1 className="text-2xl font-cinzel font-bold text-gold glow-gold">
            <MessageCircle className="w-6 h-6 inline mr-2" />Chat
          </h1>
        </div>

        {/* Channel tabs */}
        <div className="flex gap-2 mb-3">
          <button
            onClick={() => setChannel("global")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-crimson transition-colors cursor-pointer ${
              channel === "global" ? "bg-gold/20 text-gold border border-gold/30" : "bg-muted text-muted-foreground border border-border hover:border-gold/20"
            }`}
          >
            <Globe className="w-3.5 h-3.5" /> Global
          </button>
          <button
            onClick={() => setChannel("guild")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-crimson transition-colors cursor-pointer ${
              channel === "guild" ? "bg-arcane/20 text-arcane border border-arcane/30" : "bg-muted text-muted-foreground border border-border hover:border-arcane/20"
            }`}
          >
            <Users className="w-3.5 h-3.5" /> Guild {!guild && "(—)"}
          </button>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto gradient-card border border-border rounded-lg p-3 space-y-1 mb-3">
          {filteredMessages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className={`text-sm font-crimson py-1 px-2 rounded ${
                msg.type === "drop"
                  ? "bg-gold/10 text-gold border-l-2 border-gold/40"
                  : msg.type === "system"
                  ? "text-muted-foreground italic"
                  : msg.sender === playerName
                  ? "bg-arcane/10"
                  : ""
              }`}
            >
              <span className="text-[10px] text-muted-foreground mr-2">{formatTime(msg.timestamp)}</span>
              {msg.type === "drop" ? (
                <span className="text-gold">{msg.text}</span>
              ) : (
                <>
                  <span className={`font-semibold ${msg.sender === playerName ? "text-arcane" : "text-foreground"}`}>
                    {msg.sender}
                  </span>
                  <span className="text-foreground/80">: {msg.text}</span>
                </>
              )}
            </motion.div>
          ))}
        </div>

        {/* Input */}
        <div className="relative">
          {showEmojis && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute bottom-full mb-2 left-0 bg-secondary border border-border rounded-lg p-2 flex flex-wrap gap-1 w-64"
            >
              {emojis.map((e) => (
                <button
                  key={e}
                  onClick={() => addEmoji(e)}
                  className="text-lg hover:bg-muted rounded p-1 transition-colors cursor-pointer"
                >
                  {e}
                </button>
              ))}
            </motion.div>
          )}
          <div className="flex gap-2">
            <button
              onClick={() => setShowEmojis(!showEmojis)}
              className="p-2 rounded-md bg-muted border border-border hover:border-gold/30 transition-colors cursor-pointer"
            >
              <SmilePlus className="w-5 h-5 text-muted-foreground" />
            </button>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder={channel === "guild" && !guild ? "Join a guild to chat here..." : "Type a message..."}
              disabled={channel === "guild" && !guild}
              className="flex-1 bg-muted border border-border rounded-md px-3 py-2 text-sm font-crimson text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold/50"
            />
            <GameButton variant="gold" size="sm" onClick={sendMessage} disabled={!input.trim() || (channel === "guild" && !guild)}>
              <Send className="w-4 h-4" />
            </GameButton>
          </div>
        </div>
      </div>
    </div>
  );
}
