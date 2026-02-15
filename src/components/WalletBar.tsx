import { Wallet, LogIn, LogOut, User } from "lucide-react";
import { useGame } from "@/context/GameContext";
import { GameButton } from "./GameButton";

export function WalletBar() {
  const { wallet, farcasterUser, connectWallet, disconnectWallet, loginFarcaster, logoutFarcaster } = useGame();

  return (
    <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
      {farcasterUser ? (
        <div className="flex items-center gap-2 bg-secondary/90 backdrop-blur border border-border rounded-md px-3 py-2">
          <User className="w-4 h-4 text-arcane" />
          <span className="text-sm font-crimson text-foreground">{farcasterUser}</span>
          <button onClick={logoutFarcaster} className="text-muted-foreground hover:text-foreground ml-1 cursor-pointer">
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <GameButton variant="outline" size="sm" onClick={loginFarcaster}>
          <LogIn className="w-4 h-4 mr-1 inline" /> Farcaster
        </GameButton>
      )}

      {wallet ? (
        <div className="flex items-center gap-2 bg-secondary/90 backdrop-blur border border-border rounded-md px-3 py-2">
          <Wallet className="w-4 h-4 text-gold" />
          <span className="text-sm font-crimson text-foreground">{wallet.slice(0, 6)}...{wallet.slice(-4)}</span>
          <button onClick={disconnectWallet} className="text-muted-foreground hover:text-foreground ml-1 cursor-pointer">
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <GameButton variant="gold" size="sm" onClick={connectWallet}>
          <Wallet className="w-4 h-4 mr-1 inline" /> Connect Wallet
        </GameButton>
      )}
    </div>
  );
}
