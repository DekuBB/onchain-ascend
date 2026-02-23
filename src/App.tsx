import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { GameProvider } from "@/context/GameContext";
import { WalletBar } from "@/components/WalletBar";
import { useFarcasterSDK } from "@/hooks/use-farcaster-sdk";
import Landing from "./pages/Landing";
import Lobby from "./pages/Lobby";
import WorldMap from "./pages/WorldMap";
import Dashboard from "./pages/Dashboard";
import Battle from "./pages/Battle";
import GuildPage from "./pages/GuildPage";
import CraftingPage from "./pages/CraftingPage";
import PvPArena from "./pages/PvPArena";
import SeasonsPage from "./pages/SeasonsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppContent = () => {
  useFarcasterSDK();

  return (
    <BrowserRouter>
      <WalletBar />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/lobby" element={<Lobby />} />
        <Route path="/map" element={<WorldMap />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/battle" element={<Battle />} />
        <Route path="/guild" element={<GuildPage />} />
        <Route path="/crafting" element={<CraftingPage />} />
        <Route path="/pvp" element={<PvPArena />} />
        <Route path="/seasons" element={<SeasonsPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <GameProvider>
        <Toaster />
        <Sonner />
        <AppContent />
      </GameProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
