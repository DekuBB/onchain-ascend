import { createContext, useContext, useState, ReactNode } from "react";

export interface Character {
  name: string;
  classId: string;
  className: string;
  level: number;
  stats: { str: number; int: number; dex: number; hp: number };
}

interface GameState {
  wallet: string | null;
  farcasterUser: string | null;
  character: Character | null;
  realmTokens: number;
  connectWallet: () => void;
  disconnectWallet: () => void;
  loginFarcaster: () => void;
  logoutFarcaster: () => void;
  createCharacter: (char: Character) => void;
  addTokens: (amount: number) => void;
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

export function GameProvider({ children }: { children: ReactNode }) {
  const [wallet, setWallet] = useState<string | null>(null);
  const [farcasterUser, setFarcasterUser] = useState<string | null>(null);
  const [character, setCharacter] = useState<Character | null>(null);
  const [realmTokens, setRealmTokens] = useState(0);

  const connectWallet = () => setWallet(randomAddress());
  const disconnectWallet = () => setWallet(null);
  const loginFarcaster = () => setFarcasterUser("@player" + Math.floor(Math.random() * 9999));
  const logoutFarcaster = () => setFarcasterUser(null);
  const createCharacter = (char: Character) => setCharacter(char);
  const addTokens = (amount: number) => setRealmTokens((t) => t + amount);

  return (
    <GameContext.Provider
      value={{
        wallet, farcasterUser, character, realmTokens,
        connectWallet, disconnectWallet, loginFarcaster, logoutFarcaster,
        createCharacter, addTokens,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}
