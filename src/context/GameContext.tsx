import { createContext, useContext, useState, ReactNode, useCallback } from "react";

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

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: number | null;
}

export interface Quest {
  id: string;
  name: string;
  description: string;
  type: "battle" | "craft" | "pvp" | "earn";
  target: number;
  progress: number;
  rewardTokens: number;
  rewardXP: number;
  completed: boolean;
}

export interface MarketListing {
  id: string;
  seller: string;
  item: Omit<InventoryItem, "qty">;
  qty: number;
  price: number;
  listedAt: number;
}

// Achievement definitions
const achievementDefs: Omit<Achievement, "unlockedAt">[] = [
  { id: "first_battle", name: "First Blood", description: "Win your first battle", icon: "⚔️" },
  { id: "level_5", name: "Rising Hero", description: "Reach level 5", icon: "⭐" },
  { id: "level_10", name: "Veteran", description: "Reach level 10", icon: "🌟" },
  { id: "legendary_drop", name: "Legendary Find", description: "Obtain a Legendary item", icon: "👑" },
  { id: "first_craft", name: "Apprentice Smith", description: "Craft your first item", icon: "🔨" },
  { id: "pvp_win", name: "Arena Champion", description: "Win a PvP match", icon: "🏆" },
  { id: "guild_join", name: "Brotherhood", description: "Join or create a guild", icon: "🛡️" },
  { id: "earn_1000", name: "Wealthy", description: "Earn 1,000 $REALM total", icon: "💰" },
  { id: "earn_5000", name: "Tycoon", description: "Earn 5,000 $REALM total", icon: "💎" },
  { id: "battles_10", name: "Warmonger", description: "Win 10 battles", icon: "🔥" },
];

// Daily quest templates
const questTemplates: Omit<Quest, "progress" | "completed">[] = [
  { id: "q_battles_3", name: "Battle Ready", description: "Win 3 PvE battles", type: "battle", target: 3, rewardTokens: 150, rewardXP: 50 },
  { id: "q_craft_1", name: "Master Crafter", description: "Craft 1 item", type: "craft", target: 1, rewardTokens: 100, rewardXP: 30 },
  { id: "q_pvp_2", name: "Arena Fighter", description: "Win 2 PvP matches", type: "pvp", target: 2, rewardTokens: 200, rewardXP: 60 },
  { id: "q_earn_500", name: "Gold Rush", description: "Earn 500 $REALM", type: "earn", target: 500, rewardTokens: 100, rewardXP: 40 },
];

const defaultMarket: MarketListing[] = [
  { id: "ml1", seller: "DragonSlayer99", item: { id: "dragon_scale", name: "Dragon Scale", rarity: "Rare", type: "material" }, qty: 2, price: 120, listedAt: Date.now() - 3600000 },
  { id: "ml2", seller: "ArcaneQueen", item: { id: "arcane_blade", name: "Arcane Blade", rarity: "Epic", type: "weapon" }, qty: 1, price: 350, listedAt: Date.now() - 7200000 },
  { id: "ml3", seller: "IronFist", item: { id: "wolf_fang", name: "Wolf Fang", rarity: "Uncommon", type: "material" }, qty: 5, price: 40, listedAt: Date.now() - 1800000 },
  { id: "ml4", seller: "PhoenixRider", item: { id: "crystal_shield", name: "Crystal Shield", rarity: "Rare", type: "armor" }, qty: 1, price: 200, listedAt: Date.now() - 5400000 },
];

interface GameState {
  wallet: string | null;
  farcasterUser: string | null;
  character: Character | null;
  realmTokens: number;
  inventory: InventoryItem[];
  guild: Guild | null;
  availableGuilds: Guild[];
  achievements: Achievement[];
  quests: Quest[];
  marketListings: MarketListing[];
  totalEarned: number;
  battleWins: number;
  pvpWins: number;
  craftCount: number;
  connectWallet: () => void;
  disconnectWallet: () => void;
  loginFarcaster: () => void;
  logoutFarcaster: () => void;
  createCharacter: (char: Character) => void;
  addTokens: (amount: number) => void;
  addXP: (amount: number) => void;
  addItem: (item: InventoryItem) => void;
  removeItems: (items: { itemId: string; qty: number }[]) => void;
  createGuild: (name: string, tag: string) => void;
  joinGuild: (guildId: string) => void;
  leaveGuild: () => void;
  depositToVault: (amount: number) => void;
  unlockAchievement: (id: string) => void;
  recordBattleWin: () => void;
  recordPvPWin: () => void;
  recordCraft: () => void;
  claimQuest: (questId: string) => void;
  listItem: (item: Omit<InventoryItem, "qty">, qty: number, price: number) => void;
  buyListing: (listingId: string) => void;
  cancelListing: (listingId: string) => void;
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
  const [achievements, setAchievements] = useState<Achievement[]>(
    achievementDefs.map((a) => ({ ...a, unlockedAt: null }))
  );
  const [quests, setQuests] = useState<Quest[]>(
    questTemplates.map((q) => ({ ...q, progress: 0, completed: false }))
  );
  const [marketListings, setMarketListings] = useState<MarketListing[]>(defaultMarket);
  const [totalEarned, setTotalEarned] = useState(0);
  const [battleWins, setBattleWins] = useState(0);
  const [pvpWins, setPvpWins] = useState(0);
  const [craftCount, setCraftCount] = useState(0);

  const connectWallet = () => setWallet(randomAddress());
  const disconnectWallet = () => setWallet(null);
  const loginFarcaster = () => setFarcasterUser("@player" + Math.floor(Math.random() * 9999));
  const logoutFarcaster = () => setFarcasterUser(null);

  const unlockAchievement = useCallback((id: string) => {
    setAchievements((prev) =>
      prev.map((a) => (a.id === id && !a.unlockedAt ? { ...a, unlockedAt: Date.now() } : a))
    );
  }, []);

  const updateQuestProgress = useCallback((type: Quest["type"], amount: number) => {
    setQuests((prev) =>
      prev.map((q) => {
        if (q.type !== type || q.completed) return q;
        const newProgress = Math.min(q.progress + amount, q.target);
        return { ...q, progress: newProgress };
      })
    );
  }, []);

  const createCharacter = (char: Character) => {
    setCharacter({ ...char, xp: 0, xpToNext: xpForLevel(1) });
  };

  const addTokens = (amount: number) => {
    setRealmTokens((t) => t + amount);
    if (amount > 0) {
      setTotalEarned((t) => t + amount);
      updateQuestProgress("earn", amount);
    }
  };

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
    if (item.rarity === "Legendary") unlockAchievement("legendary_drop");
  };

  const removeItems = (items: { itemId: string; qty: number }[]) => {
    setInventory((prev) => {
      let updated = [...prev];
      items.forEach(({ itemId, qty }) => {
        updated = updated.map((i) => (i.id === itemId ? { ...i, qty: i.qty - qty } : i)).filter((i) => i.qty > 0);
      });
      return updated;
    });
  };

  const recordBattleWin = useCallback(() => {
    setBattleWins((b) => {
      const n = b + 1;
      if (n === 1) unlockAchievement("first_battle");
      if (n >= 10) unlockAchievement("battles_10");
      return n;
    });
    updateQuestProgress("battle", 1);
  }, [unlockAchievement, updateQuestProgress]);

  const recordPvPWin = useCallback(() => {
    setPvpWins((p) => {
      const n = p + 1;
      if (n === 1) unlockAchievement("pvp_win");
      return n;
    });
    updateQuestProgress("pvp", 1);
  }, [unlockAchievement, updateQuestProgress]);

  const recordCraft = useCallback(() => {
    setCraftCount((c) => {
      const n = c + 1;
      if (n === 1) unlockAchievement("first_craft");
      return n;
    });
    updateQuestProgress("craft", 1);
  }, [unlockAchievement, updateQuestProgress]);

  const claimQuest = (questId: string) => {
    setQuests((prev) =>
      prev.map((q) => {
        if (q.id !== questId || q.completed || q.progress < q.target) return q;
        addTokens(q.rewardTokens);
        addXP(q.rewardXP);
        return { ...q, completed: true };
      })
    );
  };

  const listItem = (item: Omit<InventoryItem, "qty">, qty: number, price: number) => {
    if (!character) return;
    const invItem = inventory.find((i) => i.id === item.id);
    if (!invItem || invItem.qty < qty) return;
    removeItems([{ itemId: item.id, qty }]);
    const listing: MarketListing = {
      id: "ml_" + Date.now(),
      seller: character.name,
      item,
      qty,
      price,
      listedAt: Date.now(),
    };
    setMarketListings((prev) => [listing, ...prev]);
  };

  const buyListing = (listingId: string) => {
    const listing = marketListings.find((l) => l.id === listingId);
    if (!listing || !character || listing.seller === character.name) return;
    if (realmTokens < listing.price) return;
    setRealmTokens((t) => t - listing.price);
    addItem({ ...listing.item, qty: listing.qty });
    setMarketListings((prev) => prev.filter((l) => l.id !== listingId));
  };

  const cancelListing = (listingId: string) => {
    const listing = marketListings.find((l) => l.id === listingId);
    if (!listing || !character || listing.seller !== character.name) return;
    addItem({ ...listing.item, qty: listing.qty });
    setMarketListings((prev) => prev.filter((l) => l.id !== listingId));
  };

  // Check level-based achievements
  if (character) {
    if (character.level >= 5) unlockAchievement("level_5");
    if (character.level >= 10) unlockAchievement("level_10");
    if (totalEarned >= 1000) unlockAchievement("earn_1000");
    if (totalEarned >= 5000) unlockAchievement("earn_5000");
  }

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
    unlockAchievement("guild_join");
  };

  const joinGuild = (guildId: string) => {
    if (!character) return;
    const target = availableGuilds.find((g) => g.id === guildId);
    if (!target) return;
    const updated = { ...target, members: [...target.members, character.name] };
    setGuild(updated);
    setAvailableGuilds((prev) => prev.map((g) => (g.id === guildId ? updated : g)));
    unlockAchievement("guild_join");
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
        achievements, quests, marketListings, totalEarned, battleWins, pvpWins, craftCount,
        connectWallet, disconnectWallet, loginFarcaster, logoutFarcaster,
        createCharacter, addTokens, addXP, addItem, removeItems,
        createGuild, joinGuild, leaveGuild, depositToVault,
        unlockAchievement, recordBattleWin, recordPvPWin, recordCraft,
        claimQuest, listItem, buyListing, cancelListing,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}
