import { useState, useEffect } from "react";
import { HelpCircle, Sparkles, Trophy, Lock, Gift, Star, RefreshCw, CheckCircle, ChevronRight, Coins } from "lucide-react";
import { Card } from "../components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui/tabs";
import { Button } from "../components/ui/button";
import { useApp } from "../context/AppContext";
import confetti from "canvas-confetti";
import {
  getPulsoTierLabel,
  getChestTierForPulso,
  getRotationForPrizeIndex,
  RULETA_PRIZES,
} from "../lib/creditRules";

export function Beneficios() {
  const {
    pulsoScore,
    xp,
    coins,
    ruletaSpins,
    chestsOpenedToday,
    unlockedCosmetics,
    openChest,
    spinRuleta,
    updatePulsoScore,
    buyShopItem,
    equipCosmetic,
    selectedBorder,
    selectedAccessory,
    chestCooldownUntil
  } = useApp();

  const [activeTab, setActiveTab] = useState("club");

  // Real-time ticking state for cofre cooldown
  const [tickerNow, setTickerNow] = useState(Date.now());
  useEffect(() => {
    if (chestCooldownUntil > Date.now()) {
      const interval = setInterval(() => {
        setTickerNow(Date.now());
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [chestCooldownUntil]);

  const cooldownRemainingMs = chestCooldownUntil - tickerNow;
  const isChestOnCooldown = cooldownRemainingMs > 0;

  // Format dynamic cooldown countdown timer as HH:MM:SS
  const formatCooldown = (ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const pad = (n: number) => String(n).padStart(2, "0");
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  };
  
  // Interactive testing states
  const [shakingChest, setShakingChest] = useState<string | null>(null);
  const [openedChestResult, setOpenedChestResult] = useState<{
    xp: number;
    coins: number;
    spins: number;
    cosmetic?: string;
    tier: string;
  } | null>(null);

  // Ruleta states
  const [spinning, setSpinning] = useState<boolean>(false);
  const [wheelRotation, setWheelRotation] = useState<number>(0);
  const [ruletaResult, setRuletaResult] = useState<{
    label: string;
    type: string;
    value: number | string;
  } | null>(null);

  // Shop feedback states
  const [purchaseSuccessMessage, setPurchaseSuccessMessage] = useState<string | null>(null);
  const [purchaseErrorMessage, setPurchaseErrorMessage] = useState<string | null>(null);

  // SVG Gauge calculations for a 360-degree complete circle
  const radius = 45;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius; // 282.74
  
  // Normalize score from 10 to 100 direct percent
  const scorePercent = Math.max(0, Math.min(100, pulsoScore)) / 100;
  const progressStrokeDashoffset = circumference - (circumference * scorePercent);

  // Determine current tier title & color
  const getTierDetails = (score: number) => {
    const title = getPulsoTierLabel(score);
    if (score <= 55)
      return {
        title,
        color: "text-orange-600",
        bg: "bg-orange-50",
        stroke: "#ea580c",
        desc: "Nivel Bronce. Accede a adelantos de hasta $3.50. ¡Transacciona y sube tu XP para subir de nivel!",
      };
    if (score <= 75)
      return {
        title,
        color: "text-slate-600",
        bg: "bg-slate-50",
        stroke: "#64748b",
        desc: "Nivel Plata. Accede a adelantos de hasta $7.50. Mantén un buen historial de pago.",
      };
    return {
      title,
      color: "text-cyan-600",
      bg: "bg-cyan-50",
      stroke: "#0891b2",
      desc: "Nivel Diamante. Accede al adelanto máximo de $10.00, retención preferencial y Cofre Diamante diario.",
    };
  };

  const currentTier = getTierDetails(pulsoScore);

  const handleOpenChest = (tier: "bronce" | "plata" | "diamante") => {
    if (chestsOpenedToday[tier]) return;

    // Shake chest animation trigger
    setShakingChest(tier);
    
    setTimeout(() => {
      setShakingChest(null);
      const reward = openChest(tier);
      setOpenedChestResult({
        ...reward,
        tier
      });
      confetti({
        particleCount: 80,
        spread: 60,
        colors: ["#7c3aed", "#eab308", "#10b981"]
      });
    }, 600);
  };

  const handleSpinRuleta = () => {
    if (ruletaSpins <= 0 || spinning) return;

    setSpinning(true);
    setRuletaResult(null);

    const prizeIndex = Math.floor(Math.random() * RULETA_PRIZES.length);
    setWheelRotation(getRotationForPrizeIndex(prizeIndex, wheelRotation));

    setTimeout(() => {
      const reward = spinRuleta(prizeIndex);
      setSpinning(false);
      setRuletaResult(reward);
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
      });
    }, 2600);
  };

  const cosmeticLabels: Record<string, string> = {
    border_green: "Borde verde brillante ❇️",
    border_fire: "Borde de fuego 🔥",
    border_rainbow: "Borde arcoíris 🌈",
    accessory_crown: "Corona de Elite 👑",
    accessory_chef: "Sombrero de Chef 👨‍🍳",
    accessory_cowboy: "Sombrero Vaquero 🤠",
    border_silver: "Borde plateado 🥈",
    accessory_star: "Estrella de servicio ⭐"
  };

  const shopItems = [
    {
      id: "shop_ticket",
      name: "Boleto de Ruleta",
      description: "Agrega +1 giro en la Ruleta de la Fortuna Deuna.",
      cost: 10,
      icon: "🎟️",
      rewardType: "spins" as const,
      rewardValue: 1
    },
    {
      id: "border_fire",
      name: "Borde de Fuego",
      description: "¡Desbloquea un ardiente borde animado para tu perfil!",
      cost: 35,
      icon: "🔥",
      rewardType: "cosmetic" as const,
      rewardValue: "border_fire"
    },
    {
      id: "border_rainbow",
      name: "Borde Arcoíris",
      description: "¡Luce un hermoso borde con colores del arcoíris!",
      cost: 30,
      icon: "🌈",
      rewardType: "cosmetic" as const,
      rewardValue: "border_rainbow"
    },
    {
      id: "accessory_crown",
      name: "Corona de Elite",
      description: "Una corona dorada digna de un cliente VIP.",
      cost: 45,
      icon: "👑",
      rewardType: "cosmetic" as const,
      rewardValue: "accessory_crown"
    },
    {
      id: "accessory_cowboy",
      name: "Sombrero Vaquero",
      description: "¡Añade un toque del oeste a tu avatar!",
      cost: 25,
      icon: "🤠",
      rewardType: "cosmetic" as const,
      rewardValue: "accessory_cowboy"
    },
    {
      id: "accessory_chef",
      name: "Sombrero de Chef",
      description: "¡Para los cocineros expertos y de buen gusto!",
      cost: 20,
      icon: "👨‍🍳",
      rewardType: "cosmetic" as const,
      rewardValue: "accessory_chef"
    }
  ];

  const handleBuyItem = (item: typeof shopItems[0]) => {
    if (coins < item.cost) {
      setPurchaseErrorMessage(`Monedas insuficientes. Necesitas 🪙 ${item.cost - coins} más.`);
      setTimeout(() => setPurchaseErrorMessage(null), 3000);
      return;
    }

    const success = buyShopItem(item.name, item.cost, item.rewardType, item.rewardValue);
    if (success) {
      setPurchaseSuccessMessage(`¡Canjeaste exitosamente: ${item.name}! 🎉`);
      confetti({
        particleCount: 60,
        spread: 40,
        colors: ["#7c3aed", "#eab308"]
      });
      setTimeout(() => setPurchaseSuccessMessage(null), 3000);
    }
  };

  const handleToggleCosmetic = (rewardValue: string) => {
    const isBorder = rewardValue.startsWith("border_");
    const currentlyEquipped = isBorder ? selectedBorder === rewardValue : selectedAccessory === rewardValue;
    
    if (currentlyEquipped) {
      equipCosmetic(isBorder ? "border" : "accessory", "none");
      setPurchaseSuccessMessage("¡Cosmético desequipado! ✨");
    } else {
      equipCosmetic(isBorder ? "border" : "accessory", rewardValue);
      setPurchaseSuccessMessage("¡Cosmético equipado con éxito! ✨");
    }
    setTimeout(() => setPurchaseSuccessMessage(null), 2000);
  };

  // Adaptive single chest details
  const currentChestTier = getChestTierForPulso(pulsoScore);
  
  const getChestDetails = (tier: "bronce" | "plata" | "diamante") => {
    if (tier === "bronce") {
      return {
        title: "Cofre de Bronce",
        icon: "📦",
        textColor: "text-orange-600",
        borderColor: "border-orange-200",
        hoverBorder: "hover:border-orange-400",
        bgColor: "bg-orange-50/50",
        badgeBg: "bg-orange-100 text-orange-800",
        description: "Recompensas básicas por actividad diaria. ¡Mantén tu racha!",
        rewards: "✨ +10 XP | 🪙 +2 Deuna Coins"
      };
    } else if (tier === "plata") {
      return {
        title: "Cofre de Plata",
        icon: "🎁",
        textColor: "text-slate-600",
        borderColor: "border-slate-200",
        hoverBorder: "hover:border-slate-400",
        bgColor: "bg-slate-50/50",
        badgeBg: "bg-slate-100 text-slate-800",
        description: "Recompensas intermedias por mantener un Nivel Plata Activo (56-75).",
        rewards: "✨ +25 XP | 🪙 +5 Coins | 🎟️ +1 Boleto | 🌈 Probabilidad de Cosmético"
      };
    } else {
      return {
        title: "Cofre de Diamante",
        icon: "💎",
        textColor: "text-cyan-600",
        borderColor: "border-cyan-200",
        hoverBorder: "hover:border-cyan-400",
        bgColor: "bg-cyan-50/50",
        badgeBg: "bg-cyan-100 text-cyan-800",
        description: "¡Máximo nivel! Recompensas legendarias para usuarios Nivel Diamante (Score 76+).",
        rewards: "✨ +50 XP | 🪙 +15 Coins | 🎟️ +1 Boleto | 👑 Alta Probabilidad de Cosmético Raro"
      };
    }
  };

  const chestDetails = getChestDetails(currentChestTier);
  const opened = chestsOpenedToday[currentChestTier];
  const isShaking = shakingChest === currentChestTier;

  return (
    <div className="min-h-full bg-gray-50 pb-20">
      {/* Top Header */}
      <div className="bg-white px-6 py-4 flex items-center justify-between border-b border-gray-100">
        <h1 className="text-xl font-extrabold text-purple-950">Beneficios & Recompensas</h1>
        <div className="flex gap-2">
          <span className="text-xs bg-purple-50 text-purple-700 px-2.5 py-1 rounded-full font-bold flex items-center gap-1 border border-purple-100 animate-pulse">
            🪙 {coins}
          </span>
          <span className="text-xs bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full font-bold flex items-center gap-1 border border-amber-100">
            🎟️ Ruletas: {ruletaSpins}
          </span>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full bg-white border-b border-gray-200 rounded-none p-0 flex">
          <TabsTrigger
            value="club"
            className="flex-1 py-4 data-[state=active]:border-b-4 data-[state=active]:border-purple-700 data-[state=active]:text-purple-700 data-[state=active]:font-extrabold text-gray-500 rounded-none font-semibold text-[10px] uppercase tracking-wider"
          >
            Niveles & Cofre
          </TabsTrigger>
          <TabsTrigger
            value="tienda"
            className="flex-1 py-4 data-[state=active]:border-b-4 data-[state=active]:border-purple-700 data-[state=active]:text-purple-700 data-[state=active]:font-extrabold text-gray-500 rounded-none font-semibold text-[10px] uppercase tracking-wider"
          >
            Tienda Coins
          </TabsTrigger>
          <TabsTrigger
            value="ruleta"
            className="flex-1 py-4 data-[state=active]:border-b-4 data-[state=active]:border-purple-700 data-[state=active]:text-purple-700 data-[state=active]:font-extrabold text-gray-500 rounded-none font-semibold text-[10px] uppercase tracking-wider"
          >
            Gira y Gana
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Niveles Deuna and Cofres Diarios */}
        <TabsContent value="club" className="px-6 py-6 space-y-6 animate-in fade-in duration-200">
          
          {/* COFRES DIARIOS Section (Single Smart Adaptive Chest) */}
          <div>
            <h2 className="text-base font-extrabold text-purple-950 mb-3 flex items-center gap-1.5">
              <Gift className="w-4 h-4 text-purple-600" />
              Tu Cofre del Día
            </h2>
            
            <div className="max-w-sm mx-auto">
              <Card
                onClick={() => !opened && !isChestOnCooldown && handleOpenChest(currentChestTier)}
                className={`p-6 text-center flex flex-col items-center justify-between cursor-pointer border-2 relative transition-all shadow-md group ${
                  opened || isChestOnCooldown
                    ? "bg-gray-50 border-gray-100 opacity-70 pointer-events-none"
                    : isShaking
                    ? `${chestDetails.borderColor} ${chestDetails.bgColor} animate-chest-shake`
                    : `bg-white ${chestDetails.borderColor} ${chestDetails.hoverBorder} hover:scale-[1.02] active:scale-[0.98]`
                }`}
              >
                {/* Floating active tier badge */}
                <span className={`absolute top-3 right-3 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${chestDetails.badgeBg}`}>
                  Nivel {currentChestTier.toUpperCase()}
                </span>

                <div className="my-3 flex flex-col items-center">
                  <span className={`text-6xl mb-4 block filter drop-shadow-[0_4px_6px_rgba(0,0,0,0.1)] transition-transform group-hover:scale-110 ${opened || isChestOnCooldown ? "grayscale opacity-50" : ""}`}>
                    {chestDetails.icon}
                  </span>
                  <h3 className={`text-base font-black ${chestDetails.textColor} tracking-tight mb-1`}>
                    {chestDetails.title}
                  </h3>
                  <p className="text-xs font-bold text-gray-500 mb-3 px-2 leading-relaxed text-center">
                    {chestDetails.description}
                  </p>
                </div>

                <div className="w-full bg-purple-50/50 border border-purple-100/50 rounded-xl p-3.5 mt-2">
                  <p className="text-[9px] font-black text-purple-800 uppercase tracking-widest mb-1.5 text-center">Contenido del Cofre</p>
                  <p className="text-[11px] font-extrabold text-purple-950 text-center leading-normal">
                    {chestDetails.rewards}
                  </p>
                </div>

                <div className="mt-4 w-full">
                  <span className="text-[10px] uppercase font-black tracking-widest text-purple-700 block text-center animate-pulse">
                    {isChestOnCooldown 
                      ? `⏳ Cooldown: ${formatCooldown(cooldownRemainingMs)}`
                      : opened
                      ? "✓ ABIERTO HOY (Vuelve mañana)"
                      : "⚡ ¡TOCA PARA RECLAMAR PREMIO!"}
                  </span>
                </div>
              </Card>
            </div>
          </div>

          {/* Radial Speedometer Dial */}
          <Card className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col items-center">
            <h2 className="text-sm font-extrabold text-purple-950 mb-4 flex items-center gap-1.5 self-start">
              <Trophy className="w-4 h-4 text-purple-600" />
              Tu Nivel Deuna
            </h2>
            
            {/* 360-Degree Complete Progress Circle */}
            <div className="relative w-44 h-44 flex items-center justify-center mb-4">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                {/* Background circle */}
                <circle
                  cx="60"
                  cy="60"
                  r={radius}
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth={strokeWidth}
                />
                {/* Active Colored Progress circle */}
                <circle
                  cx="60"
                  cy="60"
                  r={radius}
                  fill="none"
                  stroke={currentTier.stroke}
                  strokeWidth={strokeWidth}
                  strokeDasharray={circumference}
                  strokeDashoffset={progressStrokeDashoffset}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>

              {/* Central Text HUD - Proportionate and Centered */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-sm font-extrabold uppercase tracking-widest ${currentTier.color} flex items-center gap-1 mb-1`}>
                  {currentTier.title === "Bronce" ? "🥉 Bronce" : currentTier.title === "Plata" ? "🥈 Plata" : "💎 Diamante"}
                </span>
                <span className="text-xs font-black text-purple-950">
                  {pulsoScore} pts
                </span>
                <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
                  Score de Nivel
                </span>
              </div>
            </div>

            {/* Educational breakdown */}
            <p className="text-xs text-gray-500 text-center px-4 leading-relaxed mb-4">
              {currentTier.desc}
            </p>

            {/* Quick Testing Toggles (Simulator Control) */}
            <div className="w-full bg-purple-50/50 rounded-xl p-3 border border-purple-100/50">
              <p className="text-[10px] font-bold text-purple-700 mb-2 uppercase text-center tracking-wider">
                Control de Simulación (Ajusta tu Score de Nivel)
              </p>
              <div className="flex gap-2 justify-center">
                <button
                  className="bg-white hover:bg-gray-100 border border-gray-200 text-xs font-bold px-2.5 py-1.5 rounded-lg text-gray-700"
                  onClick={() => updatePulsoScore(-15)}
                >
                  -15
                </button>
                <button
                  className="bg-white hover:bg-gray-100 border border-gray-200 text-xs font-bold px-2.5 py-1.5 rounded-lg text-gray-700"
                  onClick={() => updatePulsoScore(10)}
                >
                  +10
                </button>
                <button
                  className="bg-purple-700 hover:bg-purple-800 text-xs font-extrabold px-3 py-1.5 rounded-lg text-white"
                  onClick={() => updatePulsoScore(95 - pulsoScore)}
                >
                  Modo Elite (95)
                </button>
              </div>
            </div>
          </Card>

          {/* Chest Result Modal Overlay */}
          {openedChestResult && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-in fade-in">
              <Card className="bg-white rounded-3xl p-6 text-center max-w-sm w-full border border-purple-100 shadow-2xl relative animate-in zoom-in-95">
                <h3 className="text-lg font-black text-purple-950 mb-1">
                  ¡Cofre {openedChestResult.tier.toUpperCase()} abierto! 🎉
                </h3>
                <p className="text-xs text-gray-500 mb-4">Recompensas reclamadas:</p>

                <div className="space-y-2 mb-6">
                  <div className="flex justify-between items-center bg-purple-50 p-2.5 rounded-xl border border-purple-100">
                    <span className="text-xs font-bold text-purple-800">Puntos de Experiencia</span>
                    <span className="text-sm font-black text-purple-950">+{openedChestResult.xp} XP</span>
                  </div>
                  <div className="flex justify-between items-center bg-amber-50 p-2.5 rounded-xl border border-amber-100">
                    <span className="text-xs font-bold text-amber-800">Deuna Coins</span>
                    <span className="text-sm font-black text-amber-950">+{openedChestResult.coins} Coins</span>
                  </div>
                  {openedChestResult.spins > 0 && (
                    <div className="flex justify-between items-center bg-cyan-50 p-2.5 rounded-xl border border-cyan-100">
                      <span className="text-xs font-bold text-cyan-800">Boletos de Ruleta</span>
                      <span className="text-sm font-black text-cyan-950">+{openedChestResult.spins} Boleto</span>
                    </div>
                  )}
                  {openedChestResult.cosmetic && (
                    <div className="flex flex-col bg-emerald-50 p-2.5 rounded-xl border border-emerald-100">
                      <span className="text-[10px] uppercase font-bold text-emerald-800 self-start">¡NUEVO COSMÉTICO UNLOCKED!</span>
                      <span className="text-sm font-black text-emerald-950 mt-1">
                        {cosmeticLabels[openedChestResult.cosmetic] || openedChestResult.cosmetic}
                      </span>
                    </div>
                  )}
                </div>

                <Button
                  className="w-full bg-purple-700 hover:bg-purple-800 text-white rounded-xl py-3 font-extrabold text-xs"
                  onClick={() => setOpenedChestResult(null)}
                >
                  Guardar Recompensas
                </Button>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Tab 2: Tienda Deuna Coins */}
        <TabsContent value="tienda" className="px-6 py-6 space-y-6 animate-in fade-in duration-200">
          {/* Header Banner */}
          <Card className="bg-gradient-to-r from-purple-800 to-indigo-950 text-white rounded-2xl p-5 border border-purple-500/20 relative overflow-hidden shadow-lg flex flex-col items-center text-center">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full translate-x-12 -translate-y-12 blur-xl pointer-events-none" />
            <h2 className="text-base font-black text-amber-300 uppercase tracking-widest mb-1">Tienda Deuna Coins 🪙</h2>
            <p className="text-xs text-purple-200 px-4 leading-relaxed mb-3">
              Canjea tus monedas obtenidas de cofres diarios y ruletas para personalizar tu perfil o conseguir más giros.
            </p>
            <div className="bg-white/10 px-4 py-2 rounded-full border border-white/20 flex items-center gap-2 animate-bounce">
              <span className="text-xl">🪙</span>
              <span className="text-lg font-black tracking-tight tabular-nums">{coins} Coins</span>
            </div>
          </Card>

          {/* Feedback alerts */}
          {purchaseSuccessMessage && (
            <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold p-3.5 rounded-xl text-center shadow-sm animate-in fade-in duration-200">
              {purchaseSuccessMessage}
            </div>
          )}
          {purchaseErrorMessage && (
            <div className="bg-red-50 text-red-800 border border-red-200 text-xs font-bold p-3.5 rounded-xl text-center shadow-sm animate-in fade-in duration-200">
              {purchaseErrorMessage}
            </div>
          )}

          {/* Items Grid */}
          <div className="grid grid-cols-2 gap-4">
            {shopItems.map((item) => {
              const isCosmetic = item.rewardType === "cosmetic";
              const isUnlocked = isCosmetic && unlockedCosmetics.includes(item.rewardValue);
              
              let currentlyEquipped = false;
              if (isCosmetic) {
                const isBorder = item.rewardValue.startsWith("border_");
                currentlyEquipped = isBorder ? selectedBorder === item.rewardValue : selectedAccessory === item.rewardValue;
              }

              const hasEnoughCoins = coins >= item.cost;

              return (
                <Card key={item.id} className="bg-white rounded-2xl p-4 border border-gray-100 flex flex-col justify-between shadow-sm hover:shadow-md transition-all">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center text-2xl mb-2 relative shadow-inner">
                      {item.icon}
                    </div>
                    <h3 className="text-xs font-black text-purple-950 leading-tight mb-1">{item.name}</h3>
                    <p className="text-[9px] text-gray-500 leading-normal min-h-8 mb-3 px-1">{item.description}</p>
                  </div>

                  <div className="space-y-2 mt-auto">
                    {/* Cost indicator */}
                    <div className="flex items-center justify-center gap-1 bg-amber-50 border border-amber-100/50 py-1 rounded-lg">
                      <span className="text-xs">🪙</span>
                      <span className="text-[10px] font-black text-amber-800 tabular-nums">{item.cost} Coins</span>
                    </div>

                    {/* Action button based on state */}
                    {isCosmetic ? (
                      isUnlocked ? (
                        <Button
                          onClick={() => handleToggleCosmetic(item.rewardValue)}
                          className={`w-full py-2.5 rounded-xl text-[10px] font-extrabold shadow-sm transition-all ${
                            currentlyEquipped
                              ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                              : "bg-purple-700 hover:bg-purple-800 text-white"
                          }`}
                        >
                          {currentlyEquipped ? "Desequipar ✖" : "Equipar ✨"}
                        </Button>
                      ) : (
                        <Button
                          onClick={() => handleBuyItem(item)}
                          disabled={!hasEnoughCoins}
                          className="w-full py-2.5 rounded-xl text-[10px] font-extrabold shadow-sm transition-all bg-purple-700 hover:bg-purple-800 text-white disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                        >
                          {hasEnoughCoins ? "Canjear" : "Insuficiente"}
                        </Button>
                      )
                    ) : (
                      <Button
                        onClick={() => handleBuyItem(item)}
                        disabled={!hasEnoughCoins}
                        className="w-full py-2.5 rounded-xl text-[10px] font-extrabold shadow-sm transition-all bg-purple-700 hover:bg-purple-800 text-white disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                      >
                        {hasEnoughCoins ? "Canjear" : "Insuficiente"}
                      </Button>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Tab 3: Ruleta Gira y Gana */}
        <TabsContent value="ruleta" className="px-6 py-6 space-y-6 animate-in fade-in duration-200">
          <Card className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col items-center">
            <h2 className="text-sm font-extrabold text-purple-950 mb-1 flex items-center gap-1.5 self-start">
              <Sparkles className="w-4 h-4 text-purple-600 animate-pulse" />
              Ruleta de la Fortuna Deuna
            </h2>
            <p className="text-xs text-gray-500 mb-6 leading-relaxed self-start">
              Gana 1 boleto cada vez que acumules 100 XP por tus transacciones y pagos de crédito.
            </p>

            {/* Spinning Wheel Graphic */}
            <div className="relative w-52 h-52 mb-6 flex items-center justify-center">
              {/* Spinner Needle indicator */}
              <div className="absolute top-[-8px] left-1/2 -translate-x-1/2 w-6 h-6 bg-red-600 clip-path-needle filter drop-shadow-[0_2px_3px_rgba(0,0,0,0.3)] z-20 animate-bounce-short">
                <svg viewBox="0 0 24 24" fill="currentColor" className="text-red-500">
                  <path d="M12 0 L24 24 L0 24 Z" className="transform rotate-180 origin-center" />
                </svg>
              </div>

              {/* Circular segment SVG Wheel */}
              <div
                className="w-full h-full rounded-full border-4 border-purple-950 shadow-lg overflow-hidden transition-transform duration-[2500ms] ease-out-quint relative"
                style={{
                  transform: `rotate(${wheelRotation}deg)`,
                  transitionTimingFunction: "cubic-bezier(0.15, 0.88, 0.3, 1)"
                }}
              >
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  {/* Wheel partitions */}
                  <g>
                    <path d="M50,50 L50,0 A50,50 0 0,1 85.3,14.6 Z" fill="#7c3aed" />
                    <path d="M50,50 L85.3,14.6 A50,50 0 0,1 100,50 Z" fill="#f97316" />
                    <path d="M50,50 L100,50 A50,50 0 0,1 85.3,85.3 Z" fill="#10b981" />
                    <path d="M50,50 L85.3,85.3 A50,50 0 0,1 50,100 Z" fill="#3b82f6" />
                    <path d="M50,50 L50,100 A50,50 0 0,1 14.6,85.3 Z" fill="#7c3aed" />
                    <path d="M50,50 L14.6,85.3 A50,50 0 0,1 0,50 Z" fill="#eab308" />
                    <path d="M50,50 L0,50 A50,50 0 0,1 14.6,14.6 Z" fill="#ec4899" />
                    <path d="M50,50 L14.6,14.6 A50,50 0 0,1 50,0 Z" fill="#f97316" />
                  </g>
                  
                  {/* Outer circle decoration */}
                  <circle cx="50" cy="50" r="49" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
                  {/* Core hub */}
                  <circle cx="50" cy="50" r="10" fill="#2e1065" stroke="white" strokeWidth="2" />
                </svg>

                {/* Emojis superimposed over wheel slots */}
                <span className="absolute top-[18%] left-[64%] z-10 text-xs text-white origin-center transform rotate-[22deg]">🪙</span>
                <span className="absolute top-[42%] left-[78%] z-10 text-xs text-white origin-center transform rotate-[67deg]">🌈</span>
                <span className="absolute top-[68%] left-[64%] z-10 text-xs text-white origin-center transform rotate-[112deg]">👑</span>
                <span className="absolute top-[78%] left-[42%] z-10 text-xs text-white origin-center transform rotate-[157deg]">🤠</span>
                <span className="absolute top-[68%] left-[18%] z-10 text-xs text-white origin-center transform rotate-[202deg]">🪙</span>
                <span className="absolute top-[42%] left-[10%] z-10 text-xs text-white origin-center transform rotate-[247deg]">⚡</span>
                <span className="absolute top-[18%] left-[18%] z-10 text-xs text-white origin-center transform rotate-[292deg]">🔥</span>
                <span className="absolute top-[8%] left-[42%] z-10 text-xs text-white origin-center transform rotate-[337deg]">🎟️</span>
              </div>
            </div>

            {/* Launch Spin Ticket control */}
            <div className="text-center w-full">
              <p className="text-xs font-semibold text-gray-600 mb-3">
                Boletos disponibles: <span className="font-extrabold text-purple-700">{ruletaSpins}</span>
              </p>
              <Button
                disabled={ruletaSpins <= 0 || spinning}
                className="w-full bg-gradient-to-r from-purple-700 to-purple-600 hover:from-purple-800 hover:to-purple-700 text-white rounded-xl py-3.5 font-bold text-xs shadow-md transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
                onClick={handleSpinRuleta}
              >
                {spinning ? "Girando..." : "Girar Ruleta 🎟️"}
              </Button>
            </div>
          </Card>

          {/* Ruleta Result Overlay Modal */}
          {ruletaResult && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-in fade-in">
              <Card className="bg-white rounded-3xl p-6 text-center max-w-sm w-full border-2 border-purple-500 shadow-2xl relative animate-in zoom-in-95">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                  <Trophy className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-lg font-black text-purple-950 mb-1">¡Ganaste un Premio! 🎁</h3>
                <p className="text-xs text-gray-500 mb-4">La ruleta se detuvo en:</p>

                <div className="bg-purple-50 border border-purple-100 rounded-2xl p-4 mb-6">
                  <p className="text-xl font-black text-purple-900 leading-tight">
                    {ruletaResult.label}
                  </p>
                  <p className="text-[10px] text-purple-600 mt-1 uppercase font-bold tracking-wider">
                    {ruletaResult.type === "cosmetic" ? "¡Agregado a tu apariencia!" : "Acreditado a tu saldo"}
                  </p>
                </div>

                <Button
                  className="w-full bg-purple-700 hover:bg-purple-800 text-white rounded-xl py-3 font-extrabold text-xs"
                  onClick={() => setRuletaResult(null)}
                >
                  Reclamar Premio
                </Button>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
