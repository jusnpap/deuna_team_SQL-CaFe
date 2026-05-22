import { useState } from "react";
import { ChevronRight, ShieldCheck, Sparkles, Lock, Check, Eye, HelpCircle } from "lucide-react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { useApp } from "../context/AppContext";
import { AvatarCustomizer } from "../components/AvatarCustomizer";
import { getPulsoTierLabel } from "../lib/creditRules";

export function Profile() {
  const {
    selectedBorder,
    selectedAccessory,
    unlockedCosmetics,
    equipCosmetic,
    pulsoScore,
    coins
  } = useApp();

  const [showWorkshop, setShowWorkshop] = useState<boolean>(false);
  const [activeCategory, setActiveCategory] = useState<"borders" | "accessories">("borders");

  // All cosmetic items metadata
  const bordersList = [
    { id: "none", label: "Estilo Clásico", desc: "Borde naranja estándar de Deuna.", preview: "🟠", rarity: "comun" },
    { id: "border_silver", label: "Borde Plateado", desc: "Otorgado al alcanzar nivel Confiable.", preview: "🥈", rarity: "comun" },
    { id: "border_green", label: "Verde Brillante", desc: "Paga 3 créditos consecutivos a tiempo.", preview: "❇️", rarity: "raro" },
    { id: "border_fire", label: "Borde de Fuego", desc: "30 días activo sin deudas o en Cofre Oro.", preview: "🔥", rarity: "epico" },
    { id: "border_rainbow", label: "Borde Arcoíris", desc: "Premio súper raro de la Ruleta (2% prob).", preview: "🌈", rarity: "legendario" },
    { id: "border_gold_pulse", label: "Oro Pulsante", desc: "Exclusivo para usuarios Elite (Nivel 91+).", preview: "👑", rarity: "legendario" }
  ];

  const accessoriesList = [
    { id: "none", label: "Sin accesorio", desc: "Mantén tu avatar limpio y sencillo.", preview: "❌", rarity: "comun" },
    { id: "accessory_star", label: "Estrella de Veci", desc: "Recomienda a un amigo que se active.", preview: "⭐", rarity: "comun" },
    { id: "accessory_cowboy", label: "Sombrero Vaquero", desc: "Premio intermedio en la Ruleta.", preview: "🤠", rarity: "raro" },
    { id: "accessory_chef", label: "Sombrero de Chef", desc: "Exclusivo de la Veci por ventas altas.", preview: "👨‍🍳", rarity: "epico" },
    { id: "accessory_crown", label: "Corona de Elite", desc: "Top 10 usuarios activos o en Cofre Oro.", preview: "👑", rarity: "legendario" },
    { id: "accessory_diamond", label: "Diamante de Logro", desc: "Alcanza Score 100 por primera vez.", preview: "💎", rarity: "legendario" }
  ];

  const getRarityBadge = (rarity: string) => {
    switch (rarity) {
      case "legendario":
        return <span className="text-[9px] font-black bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded uppercase tracking-wider">Legendario</span>;
      case "epico":
        return <span className="text-[9px] font-black bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded uppercase tracking-wider">Épico</span>;
      case "raro":
        return <span className="text-[9px] font-black bg-cyan-100 text-cyan-700 px-1.5 py-0.5 rounded uppercase tracking-wider">Raro</span>;
      default:
        return <span className="text-[9px] font-bold bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded uppercase tracking-wider">Común</span>;
    }
  };

  const handleEquip = (id: string) => {
    const isUnlocked = id === "none" || unlockedCosmetics.includes(id);
    if (!isUnlocked) return;
    equipCosmetic(activeCategory === "borders" ? "border" : "accessory", id);
  };

  return (
    <div className="min-h-full bg-gradient-to-b from-purple-700 to-purple-600 pb-20 relative">
      {/* Top Banner with custom animated avatar */}
      <div className="px-6 py-8 flex flex-col items-center">
        <div className="relative mb-4 cursor-pointer group" onClick={() => setShowWorkshop(true)}>
          <AvatarCustomizer size="lg" />
          <div className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-purple-900 border border-white flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 active:scale-95">
            <Eye className="w-4 h-4 text-white" />
          </div>
        </div>

        <h1 className="text-xl font-black text-white mb-0.5 flex items-center gap-1.5">
          Juan Narvaez
          <ShieldCheck className="w-5 h-5 text-amber-400 fill-amber-400" />
        </h1>
        <p className="text-purple-200 text-[10px] mb-1">
          Nivel Deuna: {getPulsoTierLabel(pulsoScore)} ({pulsoScore} pts) | Deuna Coins: 🪙 {coins}
        </p>
        <p className="text-purple-200 text-[10px] opacity-75">Versión 5.2.74 - Dame un Chance Edition</p>
      </div>

      {/* Main settings panel */}
      <div className="bg-white rounded-t-3xl min-h-[60vh] pt-4 shadow-[0_-8px_30px_rgba(0,0,0,0.15)]">
        <div className="space-y-0.5">
          {/* APARIENCIA COSMETIC WORKSHOP BUTTON */}
          <button
            className="w-full px-6 py-4 flex items-center gap-4 hover:bg-purple-50/50 transition-colors border-b border-gray-100 text-purple-950"
            onClick={() => setShowWorkshop(true)}
          >
            <div className="w-9 h-9 rounded-xl bg-purple-100 flex items-center justify-center text-purple-700">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div className="flex-1 text-left">
              <span className="font-extrabold text-sm block">Apariencia y Cosméticos</span>
              <span className="text-[10px] text-gray-500">Equipa tus bordes, coronas e íconos ganados</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>

          <button className="w-full px-6 py-4 flex items-center gap-4 hover:bg-gray-50 transition-colors border-b border-gray-100">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-500">
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            <span className="flex-1 text-left font-semibold text-xs text-gray-700">Información personal</span>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>

          <button className="w-full px-6 py-4 flex items-center gap-4 hover:bg-gray-50 transition-colors border-b border-gray-100">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-500">
              <circle cx="12" cy="12" r="3"/>
              <path d="M12 1v6m0 6v6M4.22 4.22l4.24 4.24m5.08 5.08l4.24 4.24M1 12h6m6 0h6M4.22 19.78l4.24-4.24m5.08-5.08l4.24-4.24"/>
            </svg>
            <span className="flex-1 text-left font-semibold text-xs text-gray-700">Configuración de límites</span>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>

          <button className="w-full px-6 py-4 flex items-center gap-4 hover:bg-gray-50 transition-colors border-b border-gray-100">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-500">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0110 0v4"/>
            </svg>
            <span className="flex-1 text-left font-semibold text-xs text-gray-700">Cambio de clave</span>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>

          <button className="w-full px-6 py-4 flex items-center gap-4 hover:bg-gray-50 transition-colors border-b border-gray-100">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-500">
              <rect x="3" y="3" width="7" height="7"/>
              <rect x="14" y="3" width="7" height="7"/>
              <rect x="14" y="14" width="7" height="7"/>
              <rect x="3" y="14" width="7" height="7"/>
            </svg>
            <span className="flex-1 text-left font-semibold text-xs text-gray-700">Mi negocio de Veci</span>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>

          <button className="w-full px-6 py-4 flex items-center gap-4 hover:bg-gray-50 transition-colors border-b border-gray-100">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-500">
              <rect x="3" y="8" width="18" height="4" rx="1"/>
              <path d="M12 8V4M9 4h6"/>
            </svg>
            <span className="flex-1 text-left font-semibold text-xs text-gray-700">Certificaciones bancarias</span>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="px-6 py-8">
          <button className="w-full text-purple-700 font-extrabold text-sm text-center">
            Cerrar sesión
          </button>
        </div>

        <div className="flex justify-center pb-8 opacity-40 grayscale">
          <img
            src="https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=120&h=40&fit=crop"
            alt="Deuna Logo"
            className="h-8"
          />
        </div>
      </div>

      {/* APARIENCIA DRESSING ROOM DRAWER OVERLAY */}
      {showWorkshop && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex flex-col justify-end max-w-md mx-auto animate-in slide-in-from-bottom">
          <div className="bg-white rounded-t-3xl p-6 max-h-[85vh] overflow-y-auto relative border-t-2 border-purple-500">
            
            {/* Header drawer */}
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-lg font-black text-purple-950">Taller de Apariencia</h3>
                <p className="text-xs text-gray-500">Personaliza tu avatar visible en toda la red Deuna</p>
              </div>
              <Button
                variant="outline"
                className="rounded-full text-xs font-bold w-8 h-8 p-0"
                onClick={() => setShowWorkshop(false)}
              >
                ✕
              </Button>
            </div>

            {/* Category tabs */}
            <div className="flex gap-2 mb-4 bg-gray-50 p-1 rounded-xl border border-gray-100">
              <button
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                  activeCategory === "borders"
                    ? "bg-purple-700 text-white shadow-sm"
                    : "text-gray-600 hover:text-purple-700"
                }`}
                onClick={() => setActiveCategory("borders")}
              >
                Bordes de Avatar
              </button>
              <button
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                  activeCategory === "accessories"
                    ? "bg-purple-700 text-white shadow-sm"
                    : "text-gray-600 hover:text-purple-700"
                }`}
                onClick={() => setActiveCategory("accessories")}
              >
                Sombreros & Accesorios
              </button>
            </div>

            {/* Live Interactive Avatar Preview */}
            <div className="flex justify-center bg-purple-50/50 rounded-2xl py-6 mb-6 border border-purple-100/50">
              <AvatarCustomizer size="lg" />
            </div>

            {/* List of items */}
            <div className="space-y-2 mb-6">
              {(activeCategory === "borders" ? bordersList : accessoriesList).map((item) => {
                const isUnlocked = item.id === "none" || unlockedCosmetics.includes(item.id);
                const isEquipped = activeCategory === "borders"
                  ? selectedBorder === item.id
                  : selectedAccessory === item.id;

                return (
                  <div
                    key={item.id}
                    onClick={() => isUnlocked && handleEquip(item.id)}
                    className={`flex items-center gap-3 p-3 rounded-2xl border transition-all cursor-pointer ${
                      isEquipped
                        ? "border-purple-600 bg-purple-50"
                        : isUnlocked
                        ? "border-gray-150 hover:border-purple-300 hover:bg-gray-50/50"
                        : "border-gray-200 bg-gray-50/50 opacity-60 cursor-not-allowed"
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-white border border-gray-150 flex items-center justify-center text-xl shrink-0">
                      {item.preview}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <h4 className="text-xs font-black text-purple-950 truncate">{item.label}</h4>
                        {getRarityBadge(item.rarity)}
                      </div>
                      <p className="text-[10px] text-gray-500 leading-tight">{item.desc}</p>
                    </div>

                    <div className="shrink-0">
                      {isEquipped ? (
                        <div className="w-5 h-5 rounded-full bg-purple-600 flex items-center justify-center">
                          <Check className="w-3.5 h-3.5 text-white" />
                        </div>
                      ) : !isUnlocked ? (
                        <Lock className="w-4 h-4 text-gray-400" />
                      ) : (
                        <span className="text-[9px] font-bold text-purple-600 uppercase hover:underline">Equipar</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <Button
              className="w-full bg-purple-700 hover:bg-purple-800 text-white rounded-xl py-3 font-extrabold text-xs"
              onClick={() => setShowWorkshop(false)}
            >
              Confirmar Apariencia
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
