import { createContext, useContext, useState, ReactNode } from "react";

export interface InventoryItem {
  id: string;
  name: string;
  rarity: "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary";
  type: "weapon" | "armor" | "consumable" | "material";
  qty: number;
}

export interface Character {
  name: string;
  classId: string;
  className: string;
  level: number;
  xp: number;
  xpToNext: number;
  stats: { str: number; int: number; dex: number; hp: number };
}

export interface Guild {
  id: string;
  name: string;
  tag: string;
  leader: string;
  members: string[];
  vault: number;
  createdAt: number;
}

interface GameState {
  wallet: string | null;
  farcasterUser: string | null;
  character: Character | null;
  realmTokens: number;
  inventory: InventoryItem[];
  guild: Guild | null;
  availableGuilds: Guild[];
  connectWallet: () => void;
  disconnectWallet: () => void;
  loginFarcaster: () => void;
  logoutFarcaster: () => void;
  createCharacter: (char: Character) => void;
  addTokens: (amount: number) => void;
  addXP: (amount: number) => void;
  addItem: (item: InventoryItem) => void;
  createGuild: (name: string, tag: string) => void;
  joinGuild: (guildId: string) => void;
  leaveGuild: () => void;
  depositToVault: (amount: number) => void;
}

const GameContext = createContext<GameState | null>(null);

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used within GameProvider");
  return ctx;
}

function randomAddress() {
  const hex = "0123456789abcdef";
  let addr = "0x";
  for (let i = 0; i < 40; i++) addr += hex[Math.floor(Math.random() * 16)];
  return addr;
}

function xpForLevel(level: number) {
  return Math.floor(100 * Math.pow(1.5, level - 1));
}

const defaultGuilds: Guild[] = [
  { id: "g1", name: "Shadow Wolves", tag: "SHW", leader: "DragonSlayer99", members: ["DragonSlayer99", "MageKing", "ArrowStorm"], vault: 2500, createdAt: Date.now() - 86400000 * 7 },
  { id: "g2", name: "Crystal Order", tag: "CRO", leader: "RuneMaster", members: ["RuneMaster", "IronFist"], vault: 1200, createdAt: Date.now() - 86400000 * 3 },
  { id: "g3", name: "Flame Legion", tag: "FLG", leader: "PhoenixRider", members: ["PhoenixRider", "BladeWalker", "ShadowMage", "StormCaller"], vault: 4800, createdAt: Date.now() - 86400000 * 14 },
];

export function GameProvider({ children }: { children: ReactNode }) {
  const [wallet, setWallet] = useState<string | null>(null);
  const [farcasterUser, setFarcasterUser] = useState<string | null>(null);
  const [character, setCharacter] = useState<Character | null>(null);
  const [realmTokens, setRealmTokens] = useState(0);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [guild, setGuild] = useState<Guild | null>(null);
  const [availableGuilds, setAvailableGuilds] = useState<Guild[]>(defaultGuilds);

  const connectWallet = () => setWallet(randomAddress());
  const disconnectWallet = () => setWallet(null);
  const loginFarcaster = () => setFarcasterUser("@player" + Math.floor(Math.random() * 9999));
  const logoutFarcaster = () => setFarcasterUser(null);

  const createCharacter = (char: Character) => {
    setCharacter({ ...char, xp: 0, xpToNext: xpForLevel(1) });
  };

  const addTokens = (amount: number) => setRealmTokens((t) => t + amount);

  const addXP = (amount: number) => {
    setCharacter((prev) => {
      if (!prev) return prev;
      let { xp, xpToNext, level, stats } = prev;
      xp += amount;
      while (xp >= xpToNext) {
        xp -= xpToNext;
        level += 1;
        xpToNext = xpForLevel(level);
        stats = {
          str: Math.min(100, stats.str + 2),
          int: Math.min(100, stats.int + 2),
          dex: Math.min(100, stats.dex + 2),
          hp: Math.min(100, stats.hp + 3),
        };
      }
      return { ...prev, xp, xpToNext, level, stats };
    });
  };

  const addItem = (item: InventoryItem) => {
    setInventory((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) => (i.id === item.id ? { ...i, qty: i.qty + item.qty } : i));
      }
      return [...prev, item];
    });
  };

  const createGuild = (name: string, tag: string) => {
    if (!character) return;
    const newGuild: Guild = {
      id: "g_" + Date.now(),
      name,
      tag: tag.toUpperCase().slice(0, 4),
      leader: character.name,
      members: [character.name],
      vault: 0,
      createdAt: Date.now(),
    };
    setGuild(newGuild);
    setAvailableGuilds((prev) => [...prev, newGuild]);
  };

  const joinGuild = (guildId: string) => {
    if (!character) return;
    const target = availableGuilds.find((g) => g.id === guildId);
    if (!target) return;
    const updated = { ...target, members: [...target.members, character.name] };
    setGuild(updated);
    setAvailableGuilds((prev) => prev.map((g) => (g.id === guildId ? updated : g)));
  };

  const leaveGuild = () => {
    if (!guild || !character) return;
    const updated = { ...guild, members: guild.members.filter((m) => m !== character.name) };
    setAvailableGuilds((prev) => prev.map((g) => (g.id === guild.id ? updated : g)));
    setGuild(null);
  };

  const depositToVault = (amount: number) => {
    if (!guild || amount <= 0 || amount > realmTokens) return;
    setRealmTokens((t) => t - amount);
    const updated = { ...guild, vault: guild.vault + amount };
    setGuild(updated);
    setAvailableGuilds((prev) => prev.map((g) => (g.id === guild.id ? updated : g)));
  };

  return (
    <GameContext.Provider
      value={{
        wallet, farcasterUser, character, realmTokens, inventory, guild, availableGuilds,
        connectWallet, disconnectWallet, loginFarcaster, logoutFarcaster,
        createCharacter, addTokens, addXP, addItem,
        createGuild, joinGuild, leaveGuild, depositToVault,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}