import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Hammer, Sparkles, Plus, ArrowRight } from "lucide-react";
import { GameButton } from "@/components/GameButton";
import { GameCard } from "@/components/GameCard";
import { useGame, InventoryItem } from "@/context/GameContext";
import { SFX } from "@/lib/audio";

interface Recipe {
  id: string;
  name: string;
  materials: { itemId: string; qty: number }[];
  result: Omit<InventoryItem, "qty">;
  resultQty: number;
}

const recipes: Recipe[] = [
  {
    id: "r1",
    name: "Fang Blade",
    materials: [
      { itemId: "wolf_fang", qty: 2 },
      { itemId: "iron_sword", qty: 1 },
    ],
    result: { id: "fang_blade", name: "Fang Blade", rarity: "Rare", type: "weapon" },
    resultQty: 1,
  },
  {
    id: "r2",
    name: "Dragonscale Armor",
    materials: [
      { itemId: "dragon_scale", qty: 2 },
      { itemId: "leather_armor", qty: 1 },
    ],
    result: { id: "dragonscale_armor", name: "Dragonscale Armor", rarity: "Epic", type: "armor" },
    resultQty: 1,
  },
  {
    id: "r3",
    name: "Arcane Destroyer",
    materials: [
      { itemId: "arcane_blade", qty: 1 },
      { itemId: "dragon_scale", qty: 3 },
    ],
    result: { id: "arcane_destroyer", name: "Arcane Destroyer", rarity: "Legendary", type: "weapon" },
    resultQty: 1,
  },
  {
    id: "r4",
    name: "Greater Mana Potion",
    materials: [
      { itemId: "mana_potion", qty: 3 },
    ],
    result: { id: "greater_mana_potion", name: "Greater Mana Potion", rarity: "Rare", type: "consumable" },
    resultQty: 1,
  },
  {
    id: "r5",
    name: "Shadow Dragon Cloak",
    materials: [
      { itemId: "shadow_cloak", qty: 1 },
      { itemId: "dragon_scale", qty: 2 },
    ],
    result: { id: "shadow_dragon_cloak", name: "Shadow Dragon Cloak", rarity: "Legendary", type: "armor" },
    resultQty: 1,
  },
  {
    id: "r6",
    name: "Bone Shield",
    materials: [
      { itemId: "bone_staff", qty: 1 },
      { itemId: "crystal_shield", qty: 1 },
    ],
    result: { id: "bone_shield", name: "Bone Shield", rarity: "Epic", type: "armor" },
    resultQty: 1,
  },
];

const rarityColor: Record<string, string> = {
  Common: "text-muted-foreground",
  Uncommon: "text-emerald_game",
  Rare: "text-gold",
  Epic: "text-arcane",
  Legendary: "text-crimson",
};

const rarityBorder: Record<string, string> = {
  Common: "border-border",
  Uncommon: "border-emerald_game/40",
  Rare: "border-gold/40",
  Epic: "border-arcane/40",
  Legendary: "border-crimson/40",
};

export default function CraftingPage() {
  const navigate = useNavigate();
  const { character, inventory, addItem, removeItems, recordCraft } = useGame();
  const [crafting, setCrafting] = useState<string | null>(null);
  const [justCrafted, setJustCrafted] = useState<string | null>(null);

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

  const getItemQty = (itemId: string) => {
    const item = inventory.find((i) => i.id === itemId);
    return item ? item.qty : 0;
  };

  const canCraft = (recipe: Recipe) => {
    return recipe.materials.every((m) => getItemQty(m.itemId) >= m.qty);
  };

  const handleCraft = (recipe: Recipe) => {
    if (!canCraft(recipe)) return;
    setCrafting(recipe.id);
    SFX.click();

    setTimeout(() => {
      // Remove materials
      removeItems(recipe.materials);
      // Add result
      addItem({ ...recipe.result, qty: recipe.resultQty });
      recordCraft();
      SFX.loot();
      setCrafting(null);
      setJustCrafted(recipe.id);
      setTimeout(() => setJustCrafted(null), 2000);
    }, 1500);
  };

  const itemNameMap: Record<string, string> = {};
  // Build name map from loot table + inventory
  inventory.forEach((i) => { itemNameMap[i.id] = i.name; });
  // Add known recipe material names
  const knownNames: Record<string, string> = {
    wolf_fang: "Wolf Fang", iron_sword: "Iron Sword", dragon_scale: "Dragon Scale",
    leather_armor: "Leather Armor", arcane_blade: "Arcane Blade", mana_potion: "Mana Potion",
    shadow_cloak: "Shadow Cloak", bone_staff: "Bone Staff", crystal_shield: "Crystal Shield",
  };
  Object.assign(itemNameMap, knownNames);

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <GameButton variant="outline" size="sm" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="w-4 h-4 mr-1 inline" /> Dashboard
          </GameButton>
          <h1 className="text-3xl font-cinzel font-bold text-gold glow-gold">
            <Hammer className="w-7 h-7 inline mr-2" />Crafting
          </h1>
        </div>

        {/* Inventory summary */}
        <GameCard hover={false} className="mb-6">
          <h3 className="font-cinzel font-semibold text-foreground mb-3">Your Materials</h3>
          {inventory.length === 0 ? (
            <p className="text-muted-foreground text-sm font-crimson">No items. Win battles to earn materials!</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {inventory.map((item) => (
                <span key={item.id} className={`text-xs font-crimson px-2 py-1 rounded bg-muted border ${rarityBorder[item.rarity]} ${rarityColor[item.rarity]}`}>
                  {item.name} x{item.qty}
                </span>
              ))}
            </div>
          )}
        </GameCard>

        {/* Recipes */}
        <h2 className="font-cinzel text-xl font-semibold text-foreground mb-4">
          <Sparkles className="w-5 h-5 inline mr-2 text-gold" />Recipes
        </h2>
        <div className="space-y-4">
          {recipes.map((recipe) => {
            const craftable = canCraft(recipe);
            const isCrafting = crafting === recipe.id;
            const wasCrafted = justCrafted === recipe.id;

            return (
              <motion.div key={recipe.id} layout>
                <GameCard hover={false} className={`${wasCrafted ? "border-gold shadow-gold" : ""}`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex-1">
                      <h3 className={`font-cinzel font-semibold ${rarityColor[recipe.result.rarity]} mb-2`}>
                        {recipe.name}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2 text-xs font-crimson">
                        {recipe.materials.map((m, i) => {
                          const have = getItemQty(m.itemId);
                          const enough = have >= m.qty;
                          return (
                            <span key={m.itemId} className="flex items-center gap-1">
                              {i > 0 && <Plus className="w-3 h-3 text-muted-foreground" />}
                              <span className={enough ? "text-foreground" : "text-crimson"}>
                                {itemNameMap[m.itemId] || m.itemId} ({have}/{m.qty})
                              </span>
                            </span>
                          );
                        })}
                        <ArrowRight className="w-3 h-3 text-gold mx-1" />
                        <span className={rarityColor[recipe.result.rarity]}>
                          {recipe.result.name} ({recipe.result.rarity})
                        </span>
                      </div>
                    </div>

                    <AnimatePresence mode="wait">
                      {isCrafting ? (
                        <motion.div
                          key="crafting"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex items-center gap-2"
                        >
                          <Hammer className="w-5 h-5 text-gold animate-pulse-gold" />
                          <span className="text-gold font-crimson text-sm animate-pulse-gold">Crafting...</span>
                        </motion.div>
                      ) : wasCrafted ? (
                        <motion.div
                          key="done"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0 }}
                        >
                          <span className="text-gold font-crimson text-sm">✨ Crafted!</span>
                        </motion.div>
                      ) : (
                        <motion.div key="btn" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                          <GameButton
                            variant={craftable ? "gold" : "outline"}
                            size="sm"
                            onClick={() => handleCraft(recipe)}
                            disabled={!craftable || !!crafting}
                          >
                            <Hammer className="w-4 h-4 mr-1 inline" />Craft
                          </GameButton>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </GameCard>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
