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

interface GameState {
  wallet: string | null;
  farcasterUser: string | null;
  character: Character | null;
  realmTokens: number;
  inventory: InventoryItem[];
  connectWallet: () => void;
  disconnectWallet: () => void;
  loginFarcaster: () => void;
  logoutFarcaster: () => void;
  createCharacter: (char: Character) => void;
  addTokens: (amount: number) => void;
  addXP: (amount: number) => void;
  addItem: (item: InventoryItem) => void;
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

export function GameProvider({ children }: { children: ReactNode }) {
  const [wallet, setWallet] = useState<string | null>(null);
  const [farcasterUser, setFarcasterUser] = useState<string | null>(null);
  const [character, setCharacter] = useState<Character | null>(null);
  const [realmTokens, setRealmTokens] = useState(0);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);

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

  return (
    <GameContext.Provider
      value={{
        wallet, farcasterUser, character, realmTokens, inventory,
        connectWallet, disconnectWallet, loginFarcaster, logoutFarcaster,
        createCharacter, addTokens, addXP, addItem,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}
