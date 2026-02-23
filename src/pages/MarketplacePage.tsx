import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Store, Coins, Tag, ShoppingCart, X, Plus } from "lucide-react";
import { GameButton } from "@/components/GameButton";
import { GameCard } from "@/components/GameCard";
import { useGame } from "@/context/GameContext";

const rarityColor: Record<string, string> = {
  Common: "text-muted-foreground",
  Uncommon: "text-emerald_game",
  Rare: "text-gold",
  Epic: "text-arcane",
  Legendary: "text-crimson",
};

type Tab = "browse" | "sell" | "my-listings";

export default function MarketplacePage() {
  const navigate = useNavigate();
  const { character, realmTokens, inventory, marketListings, buyListing, listItem, cancelListing } = useGame();
  const [tab, setTab] = useState<Tab>("browse");
  const [sellItemId, setSellItemId] = useState("");
  const [sellQty, setSellQty] = useState("1");
  const [sellPrice, setSellPrice] = useState("");

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

  const handleSell = () => {
    const item = inventory.find((i) => i.id === sellItemId);
    if (!item) return;
    const qty = parseInt(sellQty);
    const price = parseInt(sellPrice);
    if (isNaN(qty) || isNaN(price) || qty <= 0 || price <= 0 || qty > item.qty) return;
    listItem({ id: item.id, name: item.name, rarity: item.rarity, type: item.type }, qty, price);
    setSellItemId("");
    setSellQty("1");
    setSellPrice("");
  };

  const myListings = marketListings.filter((l) => l.seller === character.name);
  const otherListings = marketListings.filter((l) => l.seller !== character.name);

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <GameButton variant="outline" size="sm" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="w-4 h-4 mr-1 inline" /> Dashboard
          </GameButton>
          <h1 className="text-3xl font-cinzel font-bold text-gold glow-gold">
            <Store className="w-7 h-7 inline mr-2" />Marketplace
          </h1>
          <span className="ml-auto text-gold font-crimson text-sm flex items-center gap-1">
            <Coins className="w-4 h-4" /> {realmTokens} $REALM
          </span>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {([
            { key: "browse" as Tab, label: "Browse", icon: ShoppingCart },
            { key: "sell" as Tab, label: "Sell", icon: Tag },
            { key: "my-listings" as Tab, label: "My Listings", icon: Store },
          ]).map((t) => (
            <GameButton key={t.key} variant={tab === t.key ? "gold" : "outline"} size="sm" onClick={() => setTab(t.key)}>
              <t.icon className="w-4 h-4 mr-1 inline" />{t.label}
            </GameButton>
          ))}
        </div>

        {/* Browse */}
        {tab === "browse" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
            {otherListings.length === 0 ? (
              <GameCard hover={false}>
                <p className="text-muted-foreground font-crimson text-center py-4">No listings available.</p>
              </GameCard>
            ) : (
              otherListings.map((listing) => (
                <GameCard key={listing.id} hover={false}>
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className={`font-cinzel text-sm font-semibold ${rarityColor[listing.item.rarity]}`}>
                          {listing.item.name}
                        </h3>
                        <span className="text-xs text-muted-foreground font-crimson">x{listing.qty}</span>
                        <span className={`text-xs font-crimson ${rarityColor[listing.item.rarity]}`}>({listing.item.rarity})</span>
                      </div>
                      <p className="text-xs text-muted-foreground font-crimson">
                        Seller: {listing.seller} • {listing.item.type}
                      </p>
                    </div>
                    <div className="text-right flex items-center gap-3">
                      <div>
                        <p className="text-lg font-bold text-gold font-crimson">{listing.price}</p>
                        <p className="text-xs text-muted-foreground font-crimson">$REALM</p>
                      </div>
                      <GameButton
                        variant="gold"
                        size="sm"
                        disabled={realmTokens < listing.price}
                        onClick={() => buyListing(listing.id)}
                      >
                        Buy
                      </GameButton>
                    </div>
                  </div>
                </GameCard>
              ))
            )}
          </motion.div>
        )}

        {/* Sell */}
        {tab === "sell" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <GameCard hover={false}>
              <h3 className="font-cinzel font-semibold text-foreground mb-4">
                <Plus className="w-5 h-5 inline mr-2" />List Item for Sale
              </h3>
              {inventory.length === 0 ? (
                <p className="text-muted-foreground font-crimson text-sm">No items to sell. Win battles first!</p>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-muted-foreground font-crimson block mb-1">Select Item</label>
                    <select
                      value={sellItemId}
                      onChange={(e) => setSellItemId(e.target.value)}
                      className="w-full bg-muted border border-border rounded px-3 py-2 text-sm font-crimson text-foreground focus:outline-none focus:border-gold/50"
                    >
                      <option value="">Choose an item...</option>
                      {inventory.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name} ({item.rarity}) - x{item.qty}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-muted-foreground font-crimson block mb-1">Quantity</label>
                      <input
                        type="number"
                        min="1"
                        value={sellQty}
                        onChange={(e) => setSellQty(e.target.value)}
                        className="w-full bg-muted border border-border rounded px-3 py-2 text-sm font-crimson text-foreground focus:outline-none focus:border-gold/50"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground font-crimson block mb-1">Price ($REALM)</label>
                      <input
                        type="number"
                        min="1"
                        placeholder="Set price"
                        value={sellPrice}
                        onChange={(e) => setSellPrice(e.target.value)}
                        className="w-full bg-muted border border-border rounded px-3 py-2 text-sm font-crimson text-foreground focus:outline-none focus:border-gold/50"
                      />
                    </div>
                  </div>
                  <GameButton variant="gold" onClick={handleSell} disabled={!sellItemId || !sellPrice}>
                    <Tag className="w-4 h-4 mr-1 inline" />List for Sale
                  </GameButton>
                </div>
              )}
            </GameCard>
          </motion.div>
        )}

        {/* My Listings */}
        {tab === "my-listings" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
            {myListings.length === 0 ? (
              <GameCard hover={false}>
                <p className="text-muted-foreground font-crimson text-center py-4">You have no active listings.</p>
              </GameCard>
            ) : (
              myListings.map((listing) => (
                <GameCard key={listing.id} hover={false}>
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h3 className={`font-cinzel text-sm font-semibold ${rarityColor[listing.item.rarity]}`}>
                        {listing.item.name} <span className="text-muted-foreground">x{listing.qty}</span>
                      </h3>
                      <p className="text-xs text-muted-foreground font-crimson">{listing.price} $REALM</p>
                    </div>
                    <GameButton variant="outline" size="sm" onClick={() => cancelListing(listing.id)}>
                      <X className="w-4 h-4 mr-1 inline" />Cancel
                    </GameButton>
                  </div>
                </GameCard>
              ))
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
