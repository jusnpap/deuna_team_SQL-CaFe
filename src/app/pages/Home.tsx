import { useState, useEffect, useRef } from "react";
import { Bell, Headphones, ArrowUpDown, Building2, Wallet as WalletIcon, CreditCard, Phone, FileText, Bus, Users, Gift as GiftIcon, QrCode, Sparkles, ShieldAlert, CheckCircle2, ChevronRight, RefreshCw, Smartphone, MapPin, BadgePercent, TrendingUp, AlertTriangle, Lock, Eye, EyeOff, ChevronLeft, Share2, Download, SlidersHorizontal, ArrowLeft, Settings, Search, Store, Menu, Plus, X } from "lucide-react";
import { Link } from "react-router";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { useApp } from "../context/AppContext";
import { AvatarCustomizer } from "../components/AvatarCustomizer";
import {
  simulateThreeMonthSalesAverage,
  computeVeciCreditLimit,
  getPulsoTierLabel,
  calculateVeciLoanTotals,
  getVeciRetentionRate,
  CHANCE_LOAN_TERM_DAYS,
  CHANCE_PLATFORM_FEE_USD,
  CHANCE_EARLY_PAYMENT_MAX_DAY,
  CHANCE_LATE_PAYMENT_DAY,
  getChanceLoanTotal,
} from "../lib/creditRules";
// @ts-ignore
import confetti from "canvas-confetti";

export function Home() {
  const {
    balance,
    coins,
    xp,
    chanceAvailableBalance,
    veciChanceAvailableBalance,
    pulsoScore,
    maxChanceAmount,
    canRequestChance,
    isChanceAmountUnlocked,
    activeCredit,
    justPaidCredit,
    paymentRepaySpeed,
    clearJustPaidCredit,
    rechargeBalance,
    tryEarnCoinsFromTransfer,
    requestSalvavidas,
    paySalvavidas,
    payWithQR,
    updatePulsoScore,
    isBalanceHidden,
    setIsBalanceHidden,
    transactions,
    
    // Veci states
    veciSalesAverage,
    veciCreditLimit,
    veciActiveCredit,
    veciRetentionRate,
    veciConsecutiveGoodPayments,
    requestVeciCredit,
    simulateVeciQRSale,
    payVeciCreditManual,
    setVeciSalesAverage,
    activeProfileMode,
    setActiveProfileMode,
    veciDailySales,
    setVeciDailySales
  } = useApp();

  const [selectedLoanAmount, setSelectedLoanAmount] = useState<number>(3.50);
  
  // Veci credit input amount
  const [selectedVeciLoan, setSelectedVeciLoan] = useState<number>(100);
  const [selectedVeciMonths, setSelectedVeciMonths] = useState<number>(1); // 1, 2, or 3 months

  // New Veci profile states
  const [veciTab, setVeciTab] = useState<"inicio" | "caja" | "vecino" | "menu">("inicio");
  const [inicioSubTab, setInicioSubTab] = useState<"cobrar" | "gestionar">("cobrar");
  const [keypadAmount, setKeypadAmount] = useState<string>("0");
  const [cobrarMotivo, setCobrarMotivo] = useState<string>("Venta de frutas");
  const [cobrarMethod, setCobrarMethod] = useState<"QR" | "Tarjeta" | "Manual">("QR");
  const [showVeciQRModal, setShowVeciQRModal] = useState<boolean>(false);
  const [veciCajaTotal, setVeciCajaTotal] = useState<number>(0.00);
  const [veciSalesList, setVeciSalesList] = useState<any[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showManualSaleModal, setShowManualSaleModal] = useState<boolean>(false);
  const [manualSaleAmount, setManualSaleAmount] = useState<string>("");
  const [manualSaleMotivo, setManualSaleMotivo] = useState<string>("");
  const [showVeciComisionesModal, setShowVeciComisionesModal] = useState<boolean>(false);

  // Veci Gamification states
  const veciRank = veciDailySales >= 200 ? "Oro" : veciDailySales >= 100 ? "Plata" : "Bronce";
  const veciRankEmoji = veciRank === "Oro" ? "🥇" : veciRank === "Plata" ? "🥈" : "🥉";
  const veciNextRankTarget = veciRank === "Bronce" ? 100 : veciRank === "Plata" ? 200 : 200;
  const veciRankProgress = Math.min((veciDailySales / veciNextRankTarget) * 100, 100);
  const veciRemainingForNextRank = Math.max(veciNextRankTarget - veciDailySales, 0);

  // In-app Nudge Push notification simulation
  const [pushNotification, setPushNotification] = useState<{
    title: string;
    body: string;
  } | null>(null);

  // QR Modal Simulation
  const [showQRModal, setShowQRModal] = useState<boolean>(false);
  const [qrAmount, setQrAmount] = useState<string>("3.50");
  const [qrSuccess, setQrSuccess] = useState<boolean>(false);
  const [qrError, setQrError] = useState<string>("");

  // Terms and conditions state for microcredits
  const [showTermsModal, setShowTermsModal] = useState<boolean>(false);
  const [acceptedTerms, setAcceptedTerms] = useState<boolean>(false);
  const [showFullTerms, setShowFullTerms] = useState<boolean>(false);

  // Wallet screen sub-view (Cuenta Deuna details overlay)
  const [showWalletScreen, setShowWalletScreen] = useState<boolean>(false);
  const [showChanceModal, setShowChanceModal] = useState<boolean>(false);
  const [showVeciChanceModal, setShowVeciChanceModal] = useState<boolean>(false);

  // Veci terms and conditions state
  const [showVeciTermsModal, setShowVeciTermsModal] = useState<boolean>(false);
  const [acceptedVeciTerms, setAcceptedVeciTerms] = useState<boolean>(false);
  const [showFullVeciTerms, setShowFullVeciTerms] = useState<boolean>(false);
  const [signatureCanvasVeciDrawed, setSignatureCanvasVeciDrawed] = useState<boolean>(false);
  const canvasVeciRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawingVeci, setIsDrawingVeci] = useState<boolean>(false);

  // Advanced Terms screen states
  const [readingProgress, setReadingProgress] = useState<number>(0);
  const [hasReadToBottom, setHasReadToBottom] = useState<boolean>(false);
  const [signatureCanvasDrawed, setSignatureCanvasDrawed] = useState<boolean>(false);
  const [swipeOffset, setSwipeOffset] = useState<number>(0);
  const [isSwiping, setIsSwiping] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Signature Drawing Logic
  const [isDrawing, setIsDrawing] = useState<boolean>(false);

  const startDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.setPointerCapture(e.pointerId);

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#4c1d95"; // Dark purple stroke
    setIsDrawing(true);
  };

  const draw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
    setSignatureCanvasDrawed(true);
  };

  const stopDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.releasePointerCapture(e.pointerId);
    }
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSignatureCanvasDrawed(false);
  };

  // Signature Drawing Logic (Veci)
  const startDrawingVeci = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasVeciRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.setPointerCapture(e.pointerId);

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#7c3aed"; // Vibrant purple stroke matching the brand color!
    setIsDrawingVeci(true);
  };

  const drawVeci = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingVeci) return;
    const canvas = canvasVeciRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
    setSignatureCanvasVeciDrawed(true);
  };

  const stopDrawingVeci = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingVeci) return;
    const canvas = canvasVeciRef.current;
    if (canvas) {
      canvas.releasePointerCapture(e.pointerId);
    }
    setIsDrawingVeci(false);
  };

  const clearSignatureVeci = () => {
    const canvas = canvasVeciRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSignatureCanvasVeciDrawed(false);
  };

  const handleScrollTerms = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const scrolled = target.scrollTop;
    const maxScroll = target.scrollHeight - target.clientHeight;
    
    if (maxScroll <= 0) return;
    
    const progress = Math.min(100, Math.round((scrolled / maxScroll) * 100));
    setReadingProgress(progress);
    
    if (progress >= 95) {
      setHasReadToBottom(true);
    }
  };

  const sliderWidth = 260; // drag area width
  const maxSwipeOffset = sliderWidth - 54; // account for knob width

  const startSwipe = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsSwiping(true);
  };

  const swipeMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isSwiping) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - 27; // center
    const newOffset = Math.max(0, Math.min(maxSwipeOffset, x));
    setSwipeOffset(newOffset);
  };

  const swipeEnd = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isSwiping) return;
    e.currentTarget.releasePointerCapture(e.pointerId);
    setIsSwiping(false);
    
    if (swipeOffset >= maxSwipeOffset * 0.85) {
      setSwipeOffset(maxSwipeOffset);
      setTimeout(() => {
        handleConfirmTermsAndRequest();
        setSwipeOffset(0);
      }, 250);
    } else {
      setSwipeOffset(0);
    }
  };

  // Veci AI Prediction states
  const [isAiAnalyzing, setIsAiAnalyzing] = useState<boolean>(false);
  const [aiPredictionResult, setAiPredictionResult] = useState<{
    modelUsed: string;
    forecastedSales: number;
    riskScore: string;
    riskPercent: number;
    recommendedLimit: number;
    seasonalityAdjustment: string;
    repaymentProb: number;
  } | null>(null);

  const runVeciAiAnalysis = () => {
    setIsAiAnalyzing(true);
    setAiPredictionResult(null);
    
    setTimeout(() => {
      setIsAiAnalyzing(false);

      const forecasted = simulateThreeMonthSalesAverage(veciSalesAverage || 520);
      const limit = computeVeciCreditLimit(forecasted);
      const riskP = parseFloat(
        (Math.max(0.8, 3.5 - (forecasted / 400))).toFixed(1)
      );

      setVeciSalesAverage(forecasted);

      setAiPredictionResult({
        modelUsed: "Prophet Time-Series & Gradient Boosting Regressor",
        forecastedSales: forecasted,
        riskScore: riskP > 2.5 ? "Moderado-Bajo" : "Bajo",
        riskPercent: riskP,
        recommendedLimit: limit,
        seasonalityAdjustment:
          "Promedio de ventas QR de los últimos 3 meses. El cupo máximo es 50% de ese flujo, hasta $300.",
        repaymentProb: parseFloat((100 - riskP).toFixed(1)),
      });

      confetti({
        particleCount: 50,
        spread: 50,
        colors: ["#7c3aed", "#10b981"]
      });
    }, 1500);
  };

  useEffect(() => {
    if (activeProfileMode === "veci" && !aiPredictionResult && !isAiAnalyzing) {
      runVeciAiAnalysis();
    }
  }, [activeProfileMode]);

  useEffect(() => {
    if (maxChanceAmount >= 10) setSelectedLoanAmount(10);
    else if (maxChanceAmount >= 7.5) setSelectedLoanAmount(7.5);
    else if (maxChanceAmount >= 3.5) setSelectedLoanAmount(3.5);
  }, [maxChanceAmount]);

  // Trigger confetti on successful loan payback
  useEffect(() => {
    if (justPaidCredit) {
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 }
      });
    }
  }, [justPaidCredit]);

  // Reset QR simulation error and success states when the QR modal is opened
  useEffect(() => {
    if (showQRModal) {
      setQrError("");
      setQrSuccess(false);
    }
  }, [showQRModal]);

  const handleRecarga = (repayDay: number) => {
    rechargeBalance(20, repayDay);
  };

  const handleRequestSalvavidas = () => {
    setShowTermsModal(true);
    setAcceptedTerms(false);
  };

  const handleConfirmTermsAndRequest = () => {
    setShowTermsModal(false);
    const ok = requestSalvavidas(selectedLoanAmount);
    if (!ok) return;
    
    // Reset terms states
    setAcceptedTerms(false);
    setHasReadToBottom(false);
    setReadingProgress(0);
    setSignatureCanvasDrawed(false);
    setShowChanceModal(false);
    
    confetti({
      particleCount: 150,
      spread: 90,
      colors: ["#7c3aed", "#f97316", "#ffffff", "#10b981"],
      origin: { y: 0.5 }
    });
  };

  const triggerTimingNudge = () => {
    setPushNotification({
      title: "Deuna Nudge (IA) 🔔",
      body: "Hola Juan, vemos que mañana es tu día de recargas. ¿Quieres liquidar tu Dame un Chance hoy y ganar +35 XP y subir de Nivel?",
    });
    // Auto clear notification after 6 seconds
    setTimeout(() => {
      setPushNotification(null);
    }, 6000);
  };

  const handleQRTestPay = () => {
    const amt = parseFloat(qrAmount);
    if (isNaN(amt) || amt <= 0) {
      setQrError("Monto inválido");
      return;
    }
    const success = payWithQR(amt);
    if (success) {
      setQrSuccess(true);
      setQrError("");
      confetti({
        particleCount: 30,
        spread: 40,
        colors: ["#10b981", "#ffffff"]
      });
      setTimeout(() => {
        setQrSuccess(false);
        setShowQRModal(false);
      }, 2000);
    } else {
      setQrError("Saldo insuficiente en billetera");
    }
  };

  const handleScrollToChance = () => {
    setShowChanceModal(true);
  };

  const handlePaySalvavidas = (day: number) => {
    paySalvavidas(day);
    setShowChanceModal(false);
  };

  const handleKeypadPress = (key: string) => {
    setKeypadAmount((prev) => {
      if (prev === "0") return key;
      // Don't allow typing more than 2 decimal digits after comma
      if (prev.includes(",")) {
        const parts = prev.split(",");
        if (parts[1].length >= 2) return prev;
      }
      return prev + key;
    });
  };

  const handleKeypadComma = () => {
    setKeypadAmount((prev) => {
      if (!prev.includes(",")) {
        return prev + ",";
      }
      return prev;
    });
  };

  const handleKeypadDelete = () => {
    setKeypadAmount((prev) => {
      if (prev.length <= 1) return "0";
      return prev.slice(0, -1);
    });
  };

  const registerQRSale = (amt: number) => {
    // 1. Trigger simulated payment
    const { retentionAmt, netAmt } = simulateVeciQRSale(amt);

    // 2. Digital payment goes directly to the bank balance (avoid double count in veciCajaTotal)

    // 3. Add to sales list
    const now = new Date();
    const timeStr = now.toLocaleDateString("es-EC", { day: "numeric", month: "short" }) + " " + now.toLocaleTimeString("es-EC", { hour: "2-digit", minute: "2-digit", hour12: true });
    
    const names = ["Juan Pérez", "Carlos Ortega", "Maribel Cueva", "Diana Falconi"];
    const randomName = names[Math.floor(Math.random() * names.length)];
    const initials = randomName.split(" ").map(n => n[0]).join("");

    const newSale = {
      id: `s_${Date.now()}`,
      name: randomName,
      time: timeStr,
      amount: amt,
      method: "QR",
      initials: initials,
    };
    setVeciSalesList((prev) => [newSale, ...prev]);

    // 4. Launch toast with detailed breakdown
    setToastMessage(
      `✔️ Venta de $${amt.toFixed(2)} registrada${retentionAmt > 0 ? `. Retención crédito: -$${retentionAmt.toFixed(2)}` : ""}. Neto acreditado: +$${netAmt.toFixed(2)}`
    );

    // Success confetti
    confetti({
      particleCount: 60,
      spread: 45,
      colors: ["#007a78", "#4c1d95", "#10b981"]
    });

    setTimeout(() => {
      setToastMessage(null);
    }, 6000);
  };

  const handleVerifyPayment = () => {
    const amt = parseFloat(keypadAmount.replace(",", ".")) || 0;
    if (amt <= 0) return;

    registerQRSale(amt);

    // Close QR modal
    setShowVeciQRModal(false);

    // Reset keypad
    setKeypadAmount("0");
  };

  const handleAddManualSale = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(manualSaleAmount.replace(",", ".")) || 0;
    if (amt <= 0) return;

    // 1. Increment caja total
    setVeciCajaTotal((prev) => prev + amt);

    // 2. Add manual sale to list
    const now = new Date();
    const timeStr = now.toLocaleDateString("es-EC", { day: "numeric", month: "short" }) + " " + now.toLocaleTimeString("es-EC", { hour: "2-digit", minute: "2-digit", hour12: true });

    const newSale = {
      id: `s_${Date.now()}`,
      name: manualSaleMotivo || "Venta manual - Efectivo",
      time: timeStr,
      amount: amt,
      method: "Efectivo",
      initials: "$",
    };
    setVeciSalesList((prev) => [newSale, ...prev]);

    // 3. Reset states & close modal
    setManualSaleAmount("");
    setManualSaleMotivo("");
    setShowManualSaleModal(false);

    // 4. Launch toast
    setToastMessage(`✔️ Venta registrada. Agregaste una venta en efectivo de $${amt.toFixed(2)}.`);

    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleCashoutComisiones = () => {
    rechargeBalance(15.40);
    setShowVeciComisionesModal(false);

    setToastMessage("✔️ Comisiones acreditadas. Se transfirieron $15,40 a tu saldo.");
    confetti({
      particleCount: 50,
      colors: ["#eab308", "#10b981"]
    });

    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleCerrarCaja = () => {
    const totalCaja = veciCajaTotal;
    if (totalCaja <= 0) {
      setToastMessage("ℹ️ La caja está vacía.");
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }

    // Transfer cash register funds to actual main sandbox balance
    rechargeBalance(totalCaja);
    setVeciCajaTotal(0);

    const now = new Date();
    const timeStr = now.toLocaleDateString("es-EC", { day: "numeric", month: "short" }) + " " + now.toLocaleTimeString("es-EC", { hour: "2-digit", minute: "2-digit", hour12: true });

    const newSale = {
      id: `s_${Date.now()}`,
      name: "Cierre de caja - Acreditación a cuenta",
      time: timeStr,
      amount: -totalCaja,
      method: "Efectivo",
      initials: "🔐",
    };
    setVeciSalesList((prev) => [newSale, ...prev]);

    setToastMessage(`✔️ Caja cerrada. Total arqueado: $${totalCaja.toFixed(2)} depositado a tu cuenta.`);
    confetti({
      particleCount: 40,
      spread: 35,
      colors: ["#10b981", "#ffffff"]
    });

    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  const renderVeciNegocios = () => {
    // Tab 1: Inicio
    if (veciTab === "inicio") {
      return (
        <div className="flex flex-col flex-1 bg-gray-50 h-full">
          {/* Header */}
          <div className="bg-white px-6 py-4 flex items-center justify-between border-b border-gray-100 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-teal-50 border border-teal-150 flex items-center justify-center font-black text-[#007a78] text-sm shadow-sm select-none">
                FR
              </div>
              <div className="text-left">
                <h1 className="text-sm font-black text-purple-950 leading-none flex items-center gap-1.5">
                  ¡Hola! Rosa
                  <span className="text-[9px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded font-black tracking-wide">
                    Administrador
                  </span>
                </h1>
                <p className="text-[10px] text-gray-400 font-bold mt-0.5">Florería Rosangela</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => {
                  setToastMessage("🔔 Tienes 2 notificaciones nuevas de ventas");
                  setTimeout(() => setToastMessage(null), 3000);
                }}
                className="relative p-1.5 hover:bg-gray-50 rounded-full transition-colors active:scale-95"
              >
                <Bell className="w-5 h-5 text-gray-700" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
              </button>
              <button 
                onClick={() => {
                  setToastMessage("📞 Soporte Deuna Negocios activo 24/7");
                  setTimeout(() => setToastMessage(null), 3000);
                }}
                className="p-1.5 hover:bg-gray-50 rounded-full transition-colors active:scale-95"
              >
                <Headphones className="w-5 h-5 text-gray-700" />
              </button>
            </div>
          </div>

          {/* Sub-tabs: Cobrar / Gestionar */}
          <div className="bg-white px-6 flex border-b border-gray-100 shrink-0 shadow-sm">
            <button
              onClick={() => setInicioSubTab("cobrar")}
              className={`flex-1 py-3 text-xs font-black text-center border-b-2 transition-all relative ${
                inicioSubTab === "cobrar"
                  ? "border-purple-700 text-purple-950 font-black"
                  : "border-transparent text-gray-400 hover:text-gray-900"
              }`}
            >
              Cobrar
              {inicioSubTab === "cobrar" && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-purple-700 rounded-full" />}
            </button>
            <button
              onClick={() => setInicioSubTab("gestionar")}
              className={`flex-1 py-3 text-xs font-black text-center border-b-2 transition-all relative ${
                inicioSubTab === "gestionar"
                  ? "border-purple-700 text-purple-950 font-black"
                  : "border-transparent text-gray-400 hover:text-gray-900"
              }`}
            >
              Gestionar
              {inicioSubTab === "gestionar" && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-purple-700 rounded-full" />}
            </button>
          </div>

          {/* Sub-tab Content */}
          <div className="flex-1 overflow-y-auto px-6 py-5">
            {inicioSubTab === "cobrar" ? (
              <div className="flex flex-col justify-between h-full space-y-6">
                
                {/* Monto Display */}
                <div className="text-center py-2 space-y-1">
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider font-extrabold">Monto</p>
                  <h2 className="text-4xl font-extrabold text-purple-950 font-mono tracking-tight flex items-center justify-center gap-1 select-none">
                    <span className="text-purple-650 opacity-80">$</span>
                    {keypadAmount}
                  </h2>
                  
                  {/* Active Method pills */}
                  <div className="flex justify-center gap-1.5 pt-4">
                    {["QR", "Tarjeta", "Manual"].map((method) => (
                      <button
                        key={method}
                        onClick={() => setCobrarMethod(method as any)}
                        className={`px-5 py-1.5 rounded-full text-xs font-black transition-all border active:scale-95 ${
                          cobrarMethod === method
                            ? "bg-purple-900 text-white border-purple-900 shadow-sm"
                            : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        {method}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Motivos Pill Dropdown */}
                <div className="border border-gray-150 bg-white rounded-2xl p-4 flex items-center justify-between shadow-sm cursor-pointer hover:bg-gray-50 active:scale-[0.99] transition-all">
                  <div className="flex-1 text-left">
                    <p className="text-[9px] text-gray-400 font-extrabold uppercase tracking-wider">Categoría / Motivo de cobro</p>
                    <select
                      className="text-xs font-black text-purple-950 bg-transparent border-none outline-none p-0 focus:ring-0 w-full cursor-pointer mt-0.5"
                      value={cobrarMotivo}
                      onChange={(e) => setCobrarMotivo(e.target.value)}
                    >
                      <option value="Venta de frutas">Venta de frutas 🍇</option>
                      <option value="Venta de víveres">Venta de víveres 🥫</option>
                      <option value="Servicio a domicilio">Servicio a domicilio 🛵</option>
                      <option value="Venta de flores">Venta de flores 🌸</option>
                      <option value="Otros conceptos">Otros conceptos 🏪</option>
                    </select>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-450 shrink-0" />
                </div>

                {/* Circular Numeric Keypad (Tactile layout matching screenshots) */}
                <div className="grid grid-cols-3 gap-y-4 gap-x-8 max-w-[280px] mx-auto pt-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                    <button
                      key={num}
                      onClick={() => handleKeypadPress(num.toString())}
                      className="w-14 h-14 rounded-full bg-white border border-gray-150 shadow-sm flex items-center justify-center text-xl font-black text-purple-950 hover:border-purple-300 hover:bg-purple-50/20 active:bg-purple-50 active:scale-90 transition-all select-none"
                    >
                      {num}
                    </button>
                  ))}
                  <button
                    onClick={handleKeypadComma}
                    className="w-14 h-14 rounded-full bg-white border border-gray-150 shadow-sm flex items-center justify-center text-xl font-black text-purple-950 hover:border-purple-300 hover:bg-purple-50/20 active:bg-purple-50 active:scale-90 transition-all select-none"
                  >
                    ,
                  </button>
                  <button
                    onClick={() => handleKeypadPress("0")}
                    className="w-14 h-14 rounded-full bg-white border border-gray-150 shadow-sm flex items-center justify-center text-xl font-black text-purple-950 hover:border-purple-300 hover:bg-purple-50/20 active:bg-purple-50 active:scale-90 transition-all select-none"
                  >
                    0
                  </button>
                  <button
                    onClick={handleKeypadDelete}
                    className="w-14 h-14 rounded-full bg-purple-50 border border-purple-100 shadow-sm flex items-center justify-center text-lg font-bold text-purple-700 hover:bg-purple-100 hover:border-purple-200 active:scale-90 transition-all select-none"
                  >
                    ⌫
                  </button>
                </div>

                {/* Continue button */}
                <div className="pt-4">
                  <Button
                    disabled={parseFloat(keypadAmount.replace(",", ".")) <= 0}
                    onClick={() => {
                      if (cobrarMethod === "QR") {
                        setShowVeciQRModal(true);
                      } else {
                        // Card or manual offline billing immediately processes
                        const amt = parseFloat(keypadAmount.replace(",", ".")) || 0;
                        setVeciCajaTotal((prev) => prev + amt);
                        const now = new Date();
                        const timeStr = now.toLocaleDateString("es-EC", { day: "numeric", month: "short" }) + " " + now.toLocaleTimeString("es-EC", { hour: "2-digit", minute: "2-digit", hour12: true });
                        setVeciSalesList((prev) => [
                          {
                            id: `s_${Date.now()}`,
                            name: `Venta ${cobrarMethod === "Tarjeta" ? "con Tarjeta" : "Manual Directa"}`,
                            time: timeStr,
                            amount: amt,
                            method: cobrarMethod,
                            initials: cobrarMethod === "Tarjeta" ? "💳" : "✍️",
                          },
                          ...prev
                        ]);
                        setKeypadAmount("0");
                        setToastMessage(`✔️ Venta registrada (${cobrarMethod}). Agregaste $${amt.toFixed(2)}.`);
                        setTimeout(() => setToastMessage(null), 3000);
                      }
                    }}
                    className="w-full bg-purple-900 hover:bg-purple-950 text-white rounded-2xl py-4 flex items-center justify-center gap-2 font-black text-xs shadow-md transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed border-none uppercase tracking-wider"
                  >
                    {cobrarMethod === "QR" ? "Continuar para Cobrar con QR" : `Registrar Cobro ${cobrarMethod}`}
                  </Button>
                </div>

              </div>
            ) : (
              // Gestionar sub-tab (Mi Saldo & Quick Actions)
              <div className="space-y-6 text-left">
                
                {/* Mi Saldo Card (Teal style from screenshots) */}
                <Card className="bg-[#007a78] text-white rounded-3xl p-6 shadow-md relative overflow-hidden border-none flex flex-col justify-between">
                  <div className="absolute -right-8 -top-8 w-24 h-24 bg-white/10 rounded-full opacity-60 pointer-events-none" />
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <p className="text-[10px] uppercase tracking-wider font-extrabold text-teal-100">Mi Saldo</p>
                      <button
                        onClick={() => setIsBalanceHidden(!isBalanceHidden)}
                        className="text-teal-200 hover:text-white transition-colors p-1"
                      >
                        {isBalanceHidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    <h2 className="text-3xl font-extrabold font-mono tracking-tight leading-none mb-4 select-none">
                      {isBalanceHidden 
                        ? "$ ••,••" 
                        : `$${balance.toLocaleString("es-EC", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                      }
                    </h2>
                  </div>

                  <div className="border-t border-teal-600/40 my-3" />

                  <div className="flex justify-between items-center text-xs">
                    <div>
                      <p className="text-[9px] text-teal-200">Por recibir</p>
                      <p className="font-extrabold font-mono text-sm leading-tight">$481,03</p>
                    </div>
                    {veciActiveCredit ? (
                      <div className="text-right">
                        <p className="text-[9px] text-teal-200 font-extrabold">Saldo dame chance activo</p>
                        <p className="font-extrabold font-mono text-sm text-amber-300 leading-tight">
                          -${veciActiveCredit.remaining.toFixed(2)}
                        </p>
                      </div>
                    ) : (
                      <div className="text-right opacity-70">
                        <p className="text-[9px] text-teal-200">Dame Chance</p>
                        <p className="font-bold text-teal-100 text-xs">Sin cupo activo</p>
                      </div>
                    )}
                  </div>
                </Card>

                {/* Quick Actions Grid (4 columns) */}
                <div className="space-y-3">
                  <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-wider px-1">Accesos rápidos</h3>
                  <div className="grid grid-cols-4 gap-2">
                    
                    <button 
                      onClick={() => {
                        rechargeBalance(20);
                        setToastMessage("✔️ Recarga exitosa. Se agregaron $20,00 a tu cuenta desde el banco.");
                        confetti({ particleCount: 30, colors: ["#10b981", "#ffffff"] });
                        setTimeout(() => setToastMessage(null), 3000);
                      }}
                      className="flex flex-col items-center gap-1.5 group"
                    >
                      <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center border border-gray-150 transition-all group-hover:scale-105 active:scale-95">
                        <ArrowUpDown className="w-5 h-5 text-[#007a78] rotate-180" />
                      </div>
                      <span className="text-[9px] text-center text-gray-500 font-extrabold leading-tight">Recargar saldo</span>
                    </button>

                    <button 
                      onClick={() => {
                        const award = tryEarnCoinsFromTransfer();
                        let msg = "✔️ Transferencia exitosa. Se enviaron $15,00 a tu vendedor.";
                        if (award.granted > 0) {
                          msg += ` +${award.granted} Deuna Coin.`;
                        } else if (award.limited) {
                          msg += " Límite diario de coins por transferencias alcanzado.";
                        }
                        setToastMessage(msg);
                        setTimeout(() => setToastMessage(null), 3500);
                      }}
                      className="flex flex-col items-center gap-1.5 group"
                    >
                      <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center border border-gray-150 transition-all group-hover:scale-105 active:scale-95">
                        <ArrowUpDown className="w-5 h-5 text-[#007a78]" />
                      </div>
                      <span className="text-[9px] text-center text-gray-500 font-extrabold leading-tight">Transferir saldo</span>
                    </button>

                    <button 
                      onClick={() => {
                        setToastMessage("✔️ Módulo para agregar vendedor activado.");
                        setTimeout(() => setToastMessage(null), 3000);
                      }}
                      className="flex flex-col items-center gap-1.5 group"
                    >
                      <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center border border-gray-150 transition-all group-hover:scale-105 active:scale-95">
                        <Users className="w-5 h-5 text-[#007a78]" />
                      </div>
                      <span className="text-[9px] text-center text-gray-500 font-extrabold leading-tight">Agregar vendedor</span>
                    </button>

                    <button
                      onClick={() => setShowVeciChanceModal(true)}
                      className="flex flex-col items-center gap-1.5 group"
                    >
                      <div className="w-14 h-14 bg-gradient-to-br from-[#007a78] to-[#005f5e] rounded-2xl shadow-sm flex items-center justify-center border border-[#005f5e] transition-all group-hover:scale-105 active:scale-95 relative overflow-hidden">
                        <div className="absolute inset-0 bg-[#eab308]/15 animate-pulse" />
                        <Sparkles className="w-5 h-5 text-amber-300 animate-bounce relative z-10" />
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[6px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider scale-90 border border-white z-20">
                          Cupo
                        </span>
                      </div>
                      <span className="text-[9px] text-center text-purple-950 font-black leading-tight">dame chance</span>
                    </button>

                  </div>
                </div>

                {/* Novedades Section */}
                <div className="space-y-3 pt-2">
                  <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-wider px-1">Novedades Deuna Negocio</h3>
                  <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none snap-x">
                    <Card 
                      onClick={() => setVeciTab("vecino")}
                      className="min-w-[180px] bg-gradient-to-br from-teal-50 to-teal-100/20 p-4 border border-teal-100 rounded-2xl shrink-0 snap-start space-y-2 text-left cursor-pointer hover:bg-teal-100/10 transition-all active:scale-98 shadow-sm"
                    >
                      <div className="w-8 h-8 rounded-full bg-teal-600/10 flex items-center justify-center text-xs text-teal-700">
                        ⚡
                      </div>
                      <div>
                        <h4 className="text-[10px] font-black text-teal-950 leading-tight">¡Paga servicios con Mi Vecino!</h4>
                        <p className="text-[9px] text-teal-700 font-bold mt-1 leading-snug">Gana comisiones al instante por recaudar pagos de luz, agua y más.</p>
                      </div>
                    </Card>

                    <Card 
                      onClick={() => setShowVeciChanceModal(true)}
                      className="min-w-[180px] bg-gradient-to-br from-purple-50 to-purple-100/20 p-4 border border-purple-100 rounded-2xl shrink-0 snap-start space-y-2 text-left cursor-pointer hover:bg-purple-100/10 transition-all active:scale-98 shadow-sm"
                    >
                      <div className="w-8 h-8 rounded-full bg-purple-600/10 flex items-center justify-center text-xs text-purple-700 animate-pulse">
                        🤝
                      </div>
                      <div>
                        <h4 className="text-[10px] font-black text-purple-950 leading-tight">Abre tu cupo Capital Deuna</h4>
                        <p className="text-[9px] text-purple-700 font-bold mt-1 leading-snug">Pide financiamiento flexible hasta 3 meses a tasa regulada del 28%.</p>
                      </div>
                    </Card>
                  </div>
                </div>

                {/* ===== GAMIFICACIÓN: Rango Veci & Cofres ===== */}
                <div className="space-y-3 pt-2">
                  <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-wider px-1">Tu Rango Veci</h3>
                  
                  {/* Rank Card */}
                  <Card className="bg-gradient-to-br from-purple-900 via-purple-950 to-indigo-950 text-white rounded-2xl p-4 shadow-md relative overflow-hidden border-none">
                    <div className="absolute -right-6 -top-6 w-20 h-20 bg-amber-400/10 rounded-full blur-xl pointer-events-none" />
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{veciRankEmoji}</span>
                        <div>
                          <h4 className="text-sm font-black text-white">Rango {veciRank}</h4>
                          <p className="text-[9px] text-purple-300 font-bold">Ventas hoy: ${veciDailySales.toFixed(0)}</p>
                        </div>
                      </div>
                      <div className="bg-white/10 rounded-xl px-3 py-1.5 border border-white/20">
                        <p className="text-[8px] text-purple-200 font-extrabold uppercase tracking-wider">Nivel</p>
                        <p className="text-sm font-black text-amber-300 text-center">{veciRank === "Bronce" ? "1" : veciRank === "Plata" ? "2" : "3"}</p>
                      </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-[8px]">
                        <span className="text-purple-300 font-extrabold">${veciDailySales.toFixed(0)} / ${veciNextRankTarget}</span>
                        {veciRemainingForNextRank > 0 && (
                          <span className="text-amber-300 font-black">¡Faltan ${veciRemainingForNextRank.toFixed(0)}!</span>
                        )}
                      </div>
                      <div className="w-full h-2 bg-purple-800/60 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-200 rounded-full transition-all duration-700 ease-out"
                          style={{ width: `${veciRankProgress}%` }}
                        />
                      </div>
                    </div>
                  </Card>

                  {/* Cofres Preview */}
                  <div className="flex gap-2">
                    <button 
                      onClick={() => {
                        setToastMessage("🎁 ¡Cofre Bronce desbloqueado! Ganaste 5 Deuna Coins.");
                        confetti({ particleCount: 30, colors: ["#cd7f32", "#ffd700"] });
                        setTimeout(() => setToastMessage(null), 3000);
                      }}
                      className="flex-1 bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200 rounded-2xl p-3 text-center hover:scale-[1.02] transition-all active:scale-[0.98]"
                    >
                      <span className="text-xl block mb-1">🥉</span>
                      <p className="text-[9px] font-black text-orange-800">Bronce</p>
                      <p className="text-[8px] text-orange-600 font-bold">hasta 1 coin</p>
                    </button>
                    <button 
                      onClick={() => {
                        if (veciRank === "Bronce") {
                          setToastMessage("🔒 Alcanza Rango Plata para desbloquear este cofre.");
                          setTimeout(() => setToastMessage(null), 3000);
                        } else {
                          setToastMessage("🎁 ¡Cofre Plata desbloqueado! Ganaste 15 Deuna Coins.");
                          confetti({ particleCount: 50, colors: ["#c0c0c0", "#e2e8f0"] });
                          setTimeout(() => setToastMessage(null), 3000);
                        }
                      }}
                      className={`flex-1 border rounded-2xl p-3 text-center transition-all active:scale-[0.98] ${
                        veciRank !== "Bronce"
                          ? "bg-gradient-to-br from-slate-50 to-gray-100 border-slate-300 hover:scale-[1.02]"
                          : "bg-gray-50 border-gray-200 opacity-50"
                      }`}
                    >
                      <span className="text-xl block mb-1">{veciRank !== "Bronce" ? "🥈" : "🔒"}</span>
                      <p className="text-[9px] font-black text-slate-700">Plata</p>
                      <p className="text-[8px] text-slate-500 font-bold">hasta 1 coin</p>
                    </button>
                    <button 
                      onClick={() => {
                        if (veciRank !== "Oro") {
                          setToastMessage("🔒 Alcanza Rango Oro para desbloquear este cofre.");
                          setTimeout(() => setToastMessage(null), 3000);
                        } else {
                          setToastMessage("🎁 ¡Cofre Oro desbloqueado! Ganaste 50 Deuna Coins + Spin Ruleta.");
                          confetti({ particleCount: 100, spread: 70, colors: ["#ffd700", "#eab308", "#fbbf24"] });
                          setTimeout(() => setToastMessage(null), 3000);
                        }
                      }}
                      className={`flex-1 border rounded-2xl p-3 text-center transition-all active:scale-[0.98] ${
                        veciRank === "Oro"
                          ? "bg-gradient-to-br from-amber-50 to-yellow-100 border-amber-300 hover:scale-[1.02]"
                          : "bg-gray-50 border-gray-200 opacity-50"
                      }`}
                    >
                      <span className="text-xl block mb-1">{veciRank === "Oro" ? "🥇" : "🔒"}</span>
                      <p className="text-[9px] font-black text-amber-800">Oro</p>
                      <p className="text-[8px] text-amber-600 font-bold">hasta 2 coins</p>
                    </button>
                  </div>

                  {/* Daily Challenge */}
                  <Card className="bg-white rounded-2xl p-4 border border-gray-150 shadow-sm flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-lg border border-emerald-100 shrink-0">
                      🎯
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-black text-gray-900 leading-tight">Reto diario</h4>
                      <p className="text-[9px] text-gray-500 font-bold mt-0.5 truncate">
                        Cobra ${veciRemainingForNextRank > 0 ? veciRemainingForNextRank.toFixed(0) : "0"} más con QR para subir de rango
                      </p>
                    </div>
                    <div className="bg-purple-100 text-purple-700 text-[8px] font-black px-2 py-1 rounded-full shrink-0 uppercase tracking-wider">
                      +25 XP
                    </div>
                  </Card>
                </div>

              </div>
            )}
          </div>
        </div>
      );
    }
    
    // Tab 2: Mi Caja (Register tracking, Screen 4)
    if (veciTab === "caja") {
      return (
        <div className="flex flex-col flex-1 bg-gray-50 h-full">
          {/* Header */}
          <div className="bg-white px-6 py-4 flex items-center justify-between border-b border-gray-100 shrink-0">
            <h1 className="text-sm font-black text-gray-900">Mi Caja</h1>
            <div className="flex gap-2">
              <span className="text-[9px] bg-emerald-50 text-emerald-800 px-2.5 py-0.5 rounded-full font-black flex items-center gap-1 border border-emerald-100 shadow-sm animate-pulse">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                Caja Activa
              </span>
            </div>
          </div>

          {/* Sub-tabs: Caja Activa / Historial */}
          <div className="bg-white px-6 flex border-b border-gray-100 shrink-0 shadow-sm">
            <button className="flex-1 py-3 text-xs font-black text-center border-b-2 border-purple-755 text-purple-950 relative">
              Caja activa
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-purple-700 rounded-full" />
            </button>
            <button 
              onClick={() => {
                setToastMessage("ℹ️ Historial comercial consolidándose.");
                setTimeout(() => setToastMessage(null), 2500);
              }}
              className="flex-1 py-3 text-xs font-black text-center border-b-2 border-transparent text-gray-400 hover:text-gray-700 transition-colors"
            >
              Historial
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
            {/* Cash Total Card */}
            <Card className="bg-white rounded-3xl p-5 border border-gray-150 shadow-[0_4px_16px_rgba(0,0,0,0.02)] text-center relative overflow-hidden flex flex-col items-center">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-purple-500 to-[#007a78]" />
              <p className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider mb-1">Mi caja</p>
              <h2 className="text-3xl font-black font-mono text-gray-950 mb-1 select-none">
                $ {veciCajaTotal.toFixed(2).replace(".", ",")}
              </h2>
              <p className="text-[9px] text-gray-450 font-bold uppercase tracking-tight bg-gray-50 border border-gray-100 rounded px-2.5 py-0.5">
                Total al {new Date().toLocaleDateString("es-EC")}
              </p>
              
              {/* Add Manual Sale Button */}
              <div className="pt-4 w-full">
                <Button
                  onClick={() => setShowManualSaleModal(true)}
                  className="bg-purple-50 hover:bg-purple-100 text-purple-755 border border-purple-150 rounded-2xl py-3 px-4 text-xs font-black w-full shadow-sm transition-all active:scale-[0.98] border-none"
                >
                  + Agregar venta manual
                </Button>
              </div>
            </Card>

            {/* List of recorded sales */}
            <div className="space-y-3.5 text-left pb-6">
              <h3 className="text-xs font-black text-purple-950 uppercase tracking-wider px-1">Ventas</h3>
              <div className="space-y-3 bg-white p-4 rounded-2xl border border-gray-150 shadow-sm">
                {veciSalesList.length === 0 ? (
                  <p className="text-xs text-gray-450 text-center py-4 font-semibold">No se han registrado ventas hoy.</p>
                ) : (
                  veciSalesList.map((sale) => {
                    const isNegative = sale.amount < 0;
                    return (
                      <div key={sale.id} className="flex items-center justify-between border-b border-gray-50 pb-3 last:border-0 last:pb-0">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full ${isNegative ? "bg-purple-50 border-purple-100 text-purple-700" : "bg-teal-50 border-teal-100 text-teal-700"} border flex items-center justify-center text-xs font-black select-none`}>
                            {sale.initials}
                          </div>
                          <div>
                            <h4 className="text-xs font-black text-gray-900 leading-tight flex items-center gap-1.5">
                              {sale.name}
                              {sale.approved && (
                                <span className="text-[8px] bg-emerald-50 text-emerald-800 px-1 py-0.2 rounded font-black border border-emerald-100">
                                  Aprobado
                                </span>
                              )}
                            </h4>
                            <p className="text-[9px] text-gray-400 font-bold mt-0.5">{sale.time} • {sale.method}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`text-xs font-black font-mono ${isNegative ? "text-red-600" : "text-emerald-700"}`}>
                            {isNegative ? "-" : "+"}${Math.abs(sale.amount).toFixed(2).replace(".", ",")}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Bottom Cerrar Caja Button */}
            <div className="pt-2">
              <Button 
                onClick={handleCerrarCaja}
                disabled={veciCajaTotal <= 0}
                className="w-full bg-purple-900 hover:bg-purple-950 text-white rounded-2xl py-3.5 text-xs font-black flex items-center justify-center gap-1.5 border-none shadow-md disabled:opacity-40 uppercase tracking-wider"
              >
                💼 Arquear y Cerrar Caja Activa
              </Button>
            </div>
          </div>
        </div>
      );
    }
    
    // Tab 3: Mi Vecino (Corresponsal no bancario Pichincha, Screen 2)
    if (veciTab === "vecino") {
      return (
        <div className="flex flex-col flex-1 bg-gray-50 h-full">
          {/* Header */}
          <div className="bg-white px-6 py-4 flex items-center justify-between border-b border-gray-100 shrink-0">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setVeciTab("inicio")}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors active:scale-90"
              >
                <ChevronLeft className="w-6 h-6 text-gray-800" strokeWidth={2.5} />
              </button>
              <h1 className="text-sm font-black text-gray-900">Mi Vecino</h1>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4 text-left">
            
            {/* Top Pichincha Promo banner */}
            <Card className="bg-gradient-to-br from-purple-900 to-indigo-950 text-white rounded-3xl p-5 shadow-md relative overflow-hidden border-none text-left flex flex-col justify-between min-h-[140px]">
              <div className="absolute right-0 bottom-0 w-32 h-32 bg-[#eab308]/10 rounded-full blur-2xl pointer-events-none" />
              <div>
                <div className="flex justify-between items-start mb-1">
                  <span className="text-[8px] bg-amber-400 text-purple-950 font-black px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-0.5">
                    ⭐ PRÓXIMAMENTE
                  </span>
                </div>
                <h3 className="text-sm font-black text-white leading-tight mt-2.5">
                  Gana comisiones en tu negocio como Corresponsal no Bancario de Pichincha
                </h3>
              </div>
              <p className="text-[10px] text-purple-200 mt-2 leading-relaxed font-semibold">
                Ayuda a tus vecinos a depositar, retirar y pagar planillas de servicios sin salir del barrio y acumula ganancias de $0,20 a $0,50 por cada movimiento.
              </p>
            </Card>

            {/* CNB Action cards */}
            <div className="space-y-3.5">
              
              {/* Retirar */}
              <div 
                onClick={() => {
                  setToastMessage("💵 Simulación de Retiro CNB: Escanea el QR del cliente");
                  setTimeout(() => setToastMessage(null), 3000);
                }}
                className="bg-white border border-gray-150 rounded-2xl p-4 flex items-center justify-between shadow-sm cursor-pointer hover:bg-purple-50/20 active:scale-[0.99] border-l-4 border-l-emerald-500 transition-all"
              >
                <div className="flex-1 pr-4">
                  <h3 className="text-xs font-black text-gray-900 mb-0.5 flex items-center gap-1.5">
                    Retirar
                    <span className="text-[7px] bg-emerald-100 text-emerald-800 px-1 py-0.2 rounded font-black uppercase">Activo</span>
                  </h3>
                  <p className="text-[10px] text-gray-450 leading-normal font-semibold">
                    Usa tu QR Deuna y ayuda a clientes a sacar efectivo sin ir al banco
                  </p>
                </div>
                <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center font-bold text-[#007a78] shrink-0 border border-emerald-100 text-lg shadow-inner">
                  💵
                </div>
              </div>

              {/* Depositar */}
              <div 
                onClick={() => {
                  setToastMessage("👛 Simulación de Depósito CNB: Ingresa número de cuenta Pichincha");
                  setTimeout(() => setToastMessage(null), 3000);
                }}
                className="bg-white border border-gray-150 rounded-2xl p-4 flex items-center justify-between shadow-sm cursor-pointer hover:bg-purple-50/20 active:scale-[0.99] border-l-4 border-l-purple-500 transition-all"
              >
                <div className="flex-1 pr-4">
                  <h3 className="text-xs font-black text-gray-900 mb-0.5 flex items-center gap-1.5">
                    Depositar
                    <span className="text-[7px] bg-purple-100 text-purple-800 px-1 py-0.2 rounded font-black uppercase">Activo</span>
                  </h3>
                  <p className="text-[10px] text-gray-450 leading-normal font-semibold">
                    Facilita depósitos sin filas bancarias, tan solo pide el número de cuenta
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center font-bold text-purple-755 shrink-0 border border-purple-100 text-lg shadow-inner">
                  👛
                </div>
              </div>

              {/* Pagar servicios */}
              <div 
                onClick={() => {
                  setToastMessage("🏛️ Simulación de Pago de Servicios CNB activada");
                  setTimeout(() => setToastMessage(null), 3000);
                }}
                className="bg-white border border-gray-150 rounded-2xl p-4 flex items-center justify-between shadow-sm cursor-pointer hover:bg-purple-50/20 active:scale-[0.99] border-l-4 border-l-blue-500 transition-all"
              >
                <div className="flex-1 pr-4">
                  <h3 className="text-xs font-black text-gray-900 mb-0.5 flex items-center gap-1.5">
                    Pagar servicios
                    <span className="text-[7px] bg-blue-100 text-blue-800 px-1 py-0.2 rounded font-black uppercase">Activo</span>
                  </h3>
                  <p className="text-[10px] text-gray-450 leading-normal font-semibold">
                    Luz, agua, teléfono y 200 servicios más desde aquí
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center font-bold text-blue-600 shrink-0 border border-blue-100 text-lg shadow-inner">
                  🏛️
                </div>
              </div>

            </div>

            {/* Bottom Commission report Button */}
            <div className="pt-4">
              <Button 
                onClick={() => setShowVeciComisionesModal(true)}
                className="w-full bg-purple-900 hover:bg-purple-950 text-white rounded-2xl py-3.5 text-xs font-black shadow-md border-none uppercase tracking-wider"
              >
                Ver Comisiones Acumuladas
              </Button>
            </div>

          </div>
        </div>
      );
    }
    
    // Tab 4: Menú / Perfil Negocio
    if (veciTab === "menu") {
      return (
        <div className="flex flex-col flex-1 bg-gray-50 h-full">
          {/* Header */}
          <div className="bg-white px-6 py-4 flex items-center justify-between border-b border-gray-100 shrink-0">
            <h1 className="text-sm font-black text-gray-950">Menú Comercial</h1>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6 text-left pb-24">
            
            {/* Store Card info */}
            <Card className="bg-white rounded-3xl p-5 border border-gray-150 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 bg-teal-50 text-[#007a78] font-black text-base rounded-2xl flex items-center justify-center border border-teal-150 shadow-inner">
                FR
              </div>
              <div className="text-left">
                <h3 className="text-xs font-black text-purple-950">Florería Rosangela</h3>
                <p className="text-[9px] text-gray-400 font-bold uppercase mt-0.5">RUC: 1724567890001</p>
                <span className="text-[8px] bg-teal-50 border border-teal-150 text-[#007a78] px-2 py-0.5 rounded font-black mt-1.5 inline-block uppercase">
                  Rosa Administrador
                </span>
              </div>
            </Card>

            {/* Operations list */}
            <div className="space-y-2 bg-white rounded-2xl border border-gray-150 p-4 shadow-sm">
              <button
                onClick={() => {
                  setActiveProfileMode("personal");
                  setToastMessage("🔄 Cambiado a perfil Usuario (Juan) correctamente");
                  setTimeout(() => setToastMessage(null), 3000);
                }}
                className="w-full text-left py-3 text-xs font-black text-purple-700 flex items-center justify-between border-b border-gray-100 hover:bg-purple-50/20 px-1 rounded transition-colors active:scale-98"
              >
                <span className="flex items-center gap-2">🔄 Cambiar a perfil Usuario (Juan)</span>
                <ChevronRight className="w-4 h-4 text-purple-400" />
              </button>
              
              <button
                onClick={() => setShowVeciChanceModal(true)}
                className="w-full text-left py-3 text-xs font-black text-gray-700 flex items-center justify-between border-b border-gray-100 hover:bg-gray-50/50 px-1 rounded transition-colors active:scale-98"
              >
                <span className="flex items-center gap-2">⚡ Cupo dame chance Negocio</span>
                <ChevronRight className="w-4 h-4 text-gray-450" />
              </button>

              <button
                onClick={() => setVeciTab("caja")}
                className="w-full text-left py-3 text-xs font-black text-gray-700 flex items-center justify-between hover:bg-gray-50/50 px-1 rounded transition-colors active:scale-98"
              >
                <span className="flex items-center gap-2">💼 Mi Caja Registradora</span>
                <ChevronRight className="w-4 h-4 text-gray-450" />
              </button>
            </div>

            {/* Application info */}
            <div className="text-center text-[10px] text-gray-400 space-y-1 py-4">
              <p className="font-extrabold text-purple-950/40 uppercase tracking-widest">deuna! negocios sandbox</p>
              <p className="font-medium">Versión v4.82.0 • Banco Pichincha CA</p>
            </div>

          </div>
        </div>
      );
    }

    return null;
  };

  const previewFee = CHANCE_PLATFORM_FEE_USD;
  const previewTotal = getChanceLoanTotal(selectedLoanAmount).total;

  return (
    <div className="min-h-full bg-gray-50 relative">
      
      {/* Dynamic Push Notification Simulator in-app alert banner */}
      {pushNotification && (
        <div className="fixed top-4 inset-x-6 z-50 animate-in slide-in-from-top duration-300">
          <Card className="bg-white text-gray-900 p-4 rounded-2xl border-2 border-purple-200 shadow-2xl flex items-start gap-3 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-purple-700 animate-pulse" />
            <div className="flex-1">
              <h4 className="text-xs font-black text-purple-700 mb-0.5">{pushNotification.title}</h4>
              <p className="text-[11px] text-purple-950 font-bold leading-tight">{pushNotification.body}</p>
            </div>
            <button
              className="text-xs font-black text-purple-400 hover:text-purple-700 transition-colors"
              onClick={() => setPushNotification(null)}
            >
              ✕
            </button>
          </Card>
        </div>
      )}

      {/* Global Toast Overlay */}
      {toastMessage && (
        <div className="fixed top-4 inset-x-4 z-[60] animate-in slide-in-from-top duration-300">
          <div className="bg-white text-gray-900 px-4 py-3 rounded-2xl border border-gray-200 shadow-2xl flex items-center gap-3 max-w-md mx-auto">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center shrink-0">
              <span className="text-sm font-black text-purple-700">d!</span>
            </div>
            <p className="text-xs font-bold text-gray-800 leading-snug flex-1">{toastMessage}</p>
            <button onClick={() => setToastMessage(null)} className="text-gray-400 hover:text-gray-600 text-xs font-black shrink-0">✕</button>
          </div>
        </div>
      )}

      {/* Profile Mode Toggle Header */}
      <div className="bg-purple-900 px-6 py-2 flex items-center justify-between text-white text-[11px] font-black border-b border-purple-800">
        <span className="uppercase text-purple-300 tracking-wider">Perfil Activo</span>
        <div className="flex gap-1.5 bg-purple-950/80 p-0.5 rounded-lg border border-purple-800">
          <button
            onClick={() => setActiveProfileMode("personal")}
            className={`px-3 py-1 rounded-md transition-all ${
              activeProfileMode === "personal"
                ? "bg-purple-700 text-white font-extrabold shadow-sm"
                : "text-purple-300 hover:text-white"
            }`}
          >
            Juan (Usuario)
          </button>
          <button
            onClick={() => setActiveProfileMode("veci")}
            className={`px-3 py-1 rounded-md transition-all ${
              activeProfileMode === "veci"
                ? "bg-purple-700 text-white font-extrabold shadow-sm"
                : "text-purple-300 hover:text-white"
            }`}
          >
            Veci (Negocio)
          </button>
        </div>
      </div>

      {/* ============================================================= */}
      {/* ==================== VECI NEGOCIOS VIEW ===================== */}
      {/* ============================================================= */}
      {activeProfileMode === "veci" ? (
        <div className="flex flex-col" style={{ height: "calc(100vh - 40px)" }}>
          {/* Main Content Area */}
          <div className="flex-1 overflow-y-auto">
            {renderVeciNegocios()}
          </div>

          {/* Veci Bottom Navbar */}
          <div className="bg-white border-t border-gray-200 px-2 py-2 flex justify-around items-center shrink-0 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
            <button
              onClick={() => setVeciTab("inicio")}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all ${
                veciTab === "inicio" ? "text-purple-700" : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={veciTab === "inicio" ? 2.5 : 2}>
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              <span className={`text-[9px] font-black ${veciTab === "inicio" ? "text-purple-700" : "text-gray-400"}`}>Inicio</span>
            </button>
            <button
              onClick={() => setVeciTab("caja")}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all ${
                veciTab === "caja" ? "text-purple-700" : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={veciTab === "caja" ? 2.5 : 2}>
                <rect x="2" y="7" width="20" height="14" rx="2" />
                <path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16" />
              </svg>
              <span className={`text-[9px] font-black ${veciTab === "caja" ? "text-purple-700" : "text-gray-400"}`}>Mi Caja</span>
            </button>
            <button
              onClick={() => setVeciTab("vecino")}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all ${
                veciTab === "vecino" ? "text-purple-700" : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <Store className={`w-5 h-5`} strokeWidth={veciTab === "vecino" ? 2.5 : 2} />
              <span className={`text-[9px] font-black ${veciTab === "vecino" ? "text-purple-700" : "text-gray-400"}`}>Mi vecino</span>
            </button>
            <button
              onClick={() => setVeciTab("menu")}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all ${
                veciTab === "menu" ? "text-purple-700" : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <Menu className={`w-5 h-5`} strokeWidth={veciTab === "menu" ? 2.5 : 2} />
              <span className={`text-[9px] font-black ${veciTab === "menu" ? "text-purple-700" : "text-gray-400"}`}>Menú</span>
            </button>
          </div>

          {/* ===== VECI QR COBRAR MODAL (fullscreen overlay) ===== */}
          {showVeciQRModal && (
            <div className="fixed inset-0 max-w-md mx-auto z-50 bg-white flex flex-col animate-in slide-in-from-right duration-300">
              {/* Header */}
              <div className="bg-white px-4 py-3 flex items-center gap-3 border-b border-gray-100 shrink-0">
                <button
                  onClick={() => setShowVeciQRModal(false)}
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors active:scale-90"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-800" strokeWidth={2.5} />
                </button>
                <h2 className="text-sm font-black text-gray-900 flex-1">Cobrar con QR</h2>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col items-center">
                {/* Amount */}
                <p className="text-[10px] text-gray-400 uppercase tracking-wider font-extrabold mb-1">Monto</p>
                <h2 className="text-3xl font-black text-gray-900 mb-3 font-mono">
                  ${keypadAmount.replace(",", ".")}
                </h2>

                {/* Motivo tag */}
                <div className="bg-purple-50 border border-purple-200 rounded-full px-3 py-1 flex items-center gap-1.5 mb-5">
                  <span className="text-xs font-bold text-purple-800">{cobrarMotivo}</span>
                  <button onClick={() => setCobrarMotivo("Otros conceptos")} className="text-purple-400 hover:text-purple-700 text-sm leading-none">×</button>
                </div>

                {/* QR */}
                <p className="text-[10px] text-gray-400 uppercase tracking-wider font-extrabold mb-3">Usa este QR para cobrar</p>
                <div className="w-48 h-48 border-4 border-purple-700 rounded-2xl p-3 flex items-center justify-center bg-white shadow-lg relative mb-4">
                  <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center relative">
                    <QrCode className="w-24 h-24 text-gray-800" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-10 h-10 bg-purple-700 rounded-lg flex items-center justify-center shadow-md">
                        <span className="text-white text-xs font-black">d!</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Verify Payment Button */}
                <Button
                  onClick={handleVerifyPayment}
                  className="w-full max-w-xs bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-2xl py-3.5 text-xs font-black border border-purple-200 transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-sm"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Verificar pago
                </Button>

                {/* Otras opciones */}
                <div className="w-full max-w-xs mt-6 space-y-2">
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider font-extrabold">Otras opciones</p>
                  <button
                    onClick={() => { setShowVeciQRModal(false); setShowManualSaleModal(true); }}
                    className="w-full bg-white border border-gray-150 rounded-2xl p-3 flex items-center justify-between hover:bg-gray-50 transition-all active:scale-[0.99]"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                        <FileText className="w-4 h-4 text-gray-600" />
                      </div>
                      <div className="text-left">
                        <p className="text-xs font-black text-gray-800">Venta Manual</p>
                        <p className="text-[9px] text-gray-400 font-semibold">Registra efectivo u otros métodos</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300" />
                  </button>
                  <button className="w-full bg-white border border-gray-150 rounded-2xl p-3 flex items-center justify-between hover:bg-gray-50 transition-all active:scale-[0.99]">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Share2 className="w-4 h-4 text-gray-600" />
                      </div>
                      <div className="text-left">
                        <p className="text-xs font-black text-gray-800">Enlace de cobro</p>
                        <p className="text-[9px] text-gray-400 font-semibold">Aplica para usuarios Deuna y BP</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ===== MANUAL SALE MODAL ===== */}
          {showManualSaleModal && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end justify-center animate-in fade-in">
              <div className="bg-white rounded-t-3xl w-full max-w-md p-6 space-y-4 animate-in slide-in-from-bottom duration-300">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-black text-gray-900">Agregar venta manual</h3>
                  <button onClick={() => setShowManualSaleModal(false)} className="text-gray-400 hover:text-gray-600 text-lg">✕</button>
                </div>
                <form onSubmit={handleAddManualSale} className="space-y-4">
                  <div>
                    <label className="text-[10px] text-gray-500 font-black uppercase tracking-wider block mb-1">Monto ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={manualSaleAmount}
                      onChange={(e) => setManualSaleAmount(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="0.00"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-500 font-black uppercase tracking-wider block mb-1">Motivo</label>
                    <input
                      type="text"
                      value={manualSaleMotivo}
                      onChange={(e) => setManualSaleMotivo(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Ej: Venta de víveres"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-purple-700 hover:bg-purple-800 text-white rounded-2xl py-3.5 text-xs font-black border-none shadow-md uppercase tracking-wider"
                  >
                    Agregar venta
                  </Button>
                </form>
              </div>
            </div>
          )}

          {/* ===== COMISIONES MODAL ===== */}
          {showVeciComisionesModal && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-in fade-in">
              <Card className="bg-white rounded-3xl p-6 max-w-sm w-full border border-gray-100 shadow-2xl animate-in zoom-in-95">
                <h3 className="text-sm font-black text-purple-950 mb-4">Ganancias Mi Vecino CNB</h3>
                <div className="space-y-3 mb-5">
                  <div className="flex items-center justify-between bg-emerald-50 rounded-xl p-3 border border-emerald-100">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">💵</span>
                      <div>
                        <p className="text-xs font-black text-gray-800">Retiros de efectivo</p>
                        <p className="text-[9px] text-gray-500 font-bold">12 operaciones</p>
                      </div>
                    </div>
                    <span className="text-sm font-black text-emerald-700">$6,00</span>
                  </div>
                  <div className="flex items-center justify-between bg-purple-50 rounded-xl p-3 border border-purple-100">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">👛</span>
                      <div>
                        <p className="text-xs font-black text-gray-800">Depósitos</p>
                        <p className="text-[9px] text-gray-500 font-bold">8 operaciones</p>
                      </div>
                    </div>
                    <span className="text-sm font-black text-purple-700">$4,00</span>
                  </div>
                  <div className="flex items-center justify-between bg-blue-50 rounded-xl p-3 border border-blue-100">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🏛️</span>
                      <div>
                        <p className="text-xs font-black text-gray-800">Pago de servicios</p>
                        <p className="text-[9px] text-gray-500 font-bold">11 operaciones</p>
                      </div>
                    </div>
                    <span className="text-sm font-black text-blue-700">$5,40</span>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-2xl p-3 flex items-center justify-between mb-4 border border-gray-100">
                  <span className="text-xs font-black text-gray-500 uppercase tracking-wider">Total acumulado</span>
                  <span className="text-lg font-black text-purple-950 font-mono">$15,40</span>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => setShowVeciComisionesModal(false)}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl py-3 text-xs font-black border-none"
                  >
                    Cerrar
                  </Button>
                  <Button
                    onClick={handleCashoutComisiones}
                    className="flex-1 bg-purple-700 hover:bg-purple-800 text-white rounded-xl py-3 text-xs font-black border-none shadow-sm"
                  >
                    Cobrar comisiones
                  </Button>
                </div>
              </Card>
            </div>
          )}

          {/* VeciChanceModal and VeciTermsModal are rendered below in the shared modals section */}
        </div>
      ) : (
      <>
      {/* ============================================================= */}
      {/* ================== PERSONAL USER VIEW ======================== */}
      {/* ============================================================= */}

      {/* Top Header */}
      <div className="bg-white px-6 py-4 flex items-center justify-between border-b border-gray-100">
        <div className="flex items-center gap-3">
          <AvatarCustomizer size="sm" />
          <div>
            <h1 className="text-base font-bold text-purple-900 leading-tight">
              {activeProfileMode === "personal" ? "Hola Juan 👋" : "MiniMarket Veci 🏪"}
            </h1>
            {activeProfileMode === "personal" ? (
              <div className="mt-1.5 space-y-1.5 w-52 sm:w-56 min-w-0">
                {/* Level badge & Coins */}
                <div className="flex items-center gap-2">
                  {pulsoScore <= 55 ? (
                    <span className="text-[9px] font-black bg-orange-100 text-orange-700 border border-orange-200 px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-0.5">
                      🥉 Bronce
                    </span>
                  ) : pulsoScore <= 75 ? (
                    <span className="text-[9px] font-black bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-0.5">
                      🥈 Plata
                    </span>
                  ) : (
                    <span className="text-[9px] font-black bg-cyan-100 text-cyan-700 border border-cyan-200 px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-0.5 animate-pulse">
                      💎 Diamante
                    </span>
                  )}
                  <span className="text-[9px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold flex items-center gap-0.5 border border-amber-200/50">
                    🪙 {coins}
                  </span>
                </div>
                {/* XP Progress Bar */}
                <div className="space-y-0.5">
                  <div className="flex justify-between items-center text-[8px] text-gray-500 font-extrabold">
                    <span className="text-purple-600">XP: {xp}/100</span>
                    <span>Tu nivel deuna: {pulsoScore}</span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-150 rounded-full overflow-hidden border border-gray-200/50">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-amber-400 rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${xp}%` }}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-bold flex items-center gap-0.5">
                  📈 Nivel: {getPulsoTierLabel(pulsoScore)} ({pulsoScore} pts)
                </span>
                <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold flex items-center gap-0.5">
                  🪙 Coins: {coins}
                </span>
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-3">
          <button className="relative p-1.5 hover:bg-gray-50 rounded-full transition-colors">
            <Bell className="w-5 h-5 text-gray-700" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
          </button>
          <button className="p-1.5 hover:bg-gray-50 rounded-full transition-colors">
            <Headphones className="w-5 h-5 text-gray-700" />
          </button>
        </div>
      </div>

      {/* Repayment Success Notification Modal Overlay */}
      {justPaidCredit && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-in fade-in">
          <Card className="bg-white rounded-3xl p-6 text-center max-w-sm w-full border-2 border-purple-500 shadow-2xl relative overflow-hidden animate-in zoom-in-95">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-purple-500 via-orange-500 to-amber-400" />
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
              <Sparkles className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-bold text-purple-900 mb-1">¡Crédito Liquidado!</h3>
            
            {paymentRepaySpeed === "early" ? (
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  ¡Excelente! Pagaste de forma **temprana** (día {CHANCE_EARLY_PAYMENT_MAX_DAY} o antes). Esto demuestra un flujo estable y compromiso real.
                </p>
                <div className="bg-emerald-50 text-emerald-800 p-2.5 rounded-xl text-xs font-black border border-emerald-150 inline-block">
                  🚀 ¡Tu Cupo de Crédito ha crecido al siguiente nivel!
                </div>
              </div>
            ) : (
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  Liquidado con éxito (día {CHANCE_LATE_PAYMENT_DAY}). Saldo saldado correctamente pero **pago tardío**. Tu límite se mantiene igual.
                </p>
                <div className="bg-amber-50 text-amber-800 p-2.5 rounded-xl text-xs font-black border border-amber-150 inline-block">
                  ℹ️ Paga antes del Día 10 para aumentar tu límite
                </div>
              </div>
            )}

            <div className="bg-purple-50 rounded-2xl p-3 flex justify-around mb-4 border border-purple-100">
              <div>
                <p className="text-xs text-gray-500">Recompensa</p>
                <p className="text-base font-bold text-purple-700">+35 XP</p>
              </div>
              <div className="border-r border-purple-200" />
              <div>
                <p className="text-xs text-gray-500">Tu nivel deuna</p>
                <p className="text-base font-bold text-emerald-600">+15 Puntos</p>
              </div>
            </div>
            <Button
              className="w-full bg-purple-700 hover:bg-purple-800 text-white rounded-xl py-3 font-semibold"
              onClick={clearJustPaidCredit}
            >
              ¡Entendido, genial!
            </Button>
          </Card>
        </div>
      )}

      {/* Balance HUD Card */}
      <div className="px-6 py-4">
        <Card className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 relative overflow-hidden">
          <div className="absolute -right-8 -top-8 w-24 h-24 bg-purple-50 rounded-full opacity-60 pointer-events-none" />
          <div className="flex items-center justify-between mb-4">
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 w-full">
              {/* Main Balance */}
              <div 
                className="cursor-pointer hover:opacity-90 transition-opacity active:scale-[0.99] select-none flex-1 min-w-0"
                onClick={() => setShowWalletScreen(true)}
              >
                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1 truncate">
                  {activeProfileMode === "personal" ? "Saldo disponible" : "Saldo de Ventas de Veci"}
                </p>
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-purple-950 tabular-nums truncate">
                    {isBalanceHidden 
                      ? "$ ••,••" 
                      : `$${balance.toLocaleString("es-EC", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                    }
                  </h2>
                  <button 
                    className="text-gray-400 hover:text-gray-600 transition-colors p-1 shrink-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsBalanceHidden(!isBalanceHidden);
                    }}
                  >
                    {isBalanceHidden ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Side-by-side "saldo de Una dame chance" */}
              {activeProfileMode === "personal" ? (
                <div 
                  className="cursor-pointer hover:opacity-90 transition-all active:scale-[0.99] select-none border-t sm:border-t-0 sm:border-l border-gray-200 pt-4 sm:pt-0 sm:pl-6 flex-1 min-w-0"
                  onClick={() => setShowChanceModal(true)}
                >
                  <p className="text-xs text-purple-650 uppercase tracking-wider font-bold mb-1 flex items-center gap-1.5 truncate">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse shrink-0" />
                    SALDO DAME CHANCE
                  </p>
                  <h2 className="text-xl sm:text-2xl font-black text-purple-950 tabular-nums truncate">
                    {isBalanceHidden 
                      ? "$ ••,••" 
                      : activeCredit 
                        ? `$${chanceAvailableBalance.toLocaleString("es-EC", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                        : "$0.00"
                    }
                  </h2>
                  <p className="text-[10px] text-gray-400 mt-0.5 truncate">
                    {activeCredit 
                      ? `Cupo total inicial: $${activeCredit.amount.toFixed(2)}` 
                      : "Sin cupo activo · Solicitar"
                    }
                  </p>
                </div>
              ) : activeProfileMode === "veci" ? (
                <div 
                  className="cursor-pointer hover:opacity-90 transition-all active:scale-[0.99] select-none border-t sm:border-t-0 sm:border-l border-gray-200 pt-4 sm:pt-0 sm:pl-6 flex-1 min-w-0"
                  onClick={() => setShowVeciChanceModal(true)}
                >
                  <p className="text-xs text-purple-650 uppercase tracking-wider font-bold mb-1 flex items-center gap-1.5 truncate">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse shrink-0" />
                    SALDO DAME CHANCE
                  </p>
                  <h2 className="text-xl sm:text-2xl font-black text-purple-950 tabular-nums truncate">
                    {isBalanceHidden 
                      ? "$ ••,••" 
                      : veciActiveCredit 
                        ? `$${veciChanceAvailableBalance.toLocaleString("es-EC", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                        : "$0.00"
                    }
                  </h2>
                  <p className="text-[10px] text-gray-400 mt-0.5 truncate">
                    {veciActiveCredit 
                      ? `Cupo total inicial: $${veciActiveCredit.amount.toFixed(2)}` 
                      : "Sin cupo activo · Solicitar"
                    }
                  </p>
                </div>
              ) : null}
            </div>
          </div>

          <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3 border border-gray-100">
            <div className="flex-1">
              <p className="text-xs text-gray-500">Recargar desde banco</p>
              <p className="text-xs font-semibold text-gray-700">Principal ******9506</p>
            </div>
            {activeProfileMode === "personal" ? (
              <Button
                className="bg-purple-700 hover:bg-purple-800 text-white rounded-lg px-4 py-2 font-bold flex items-center gap-1"
                onClick={() => handleRecarga(CHANCE_EARLY_PAYMENT_MAX_DAY)}
              >
                + $20
              </Button>
            ) : (
              // Simple recharge button for Veci merchant balance
              <Button
                className="bg-purple-600 hover:bg-purple-700 text-white rounded-lg px-4 py-2 font-bold flex items-center gap-1"
                onClick={() => rechargeBalance(20)}
              >
                + $20
              </Button>
            )}
          </div>
        </Card>
      </div>

      {activeProfileMode === "personal" && (
        <>
          {/* AI TIMING RECORDATORIO PUSH SIMULATOR BUTTON */}
          <div className="px-6 pb-4">
            <button
              onClick={triggerTimingNudge}
              className="w-full bg-purple-50 hover:bg-purple-100 text-purple-700 p-3 rounded-xl border border-purple-200 flex items-center justify-center gap-2 font-bold text-xs shadow-sm transition-transform active:scale-[0.99]"
            >
              <Smartphone className="w-4 h-4 text-purple-650 animate-bounce" />
              Simular Nudge Inteligente de IA (Notificación)
            </button>
          </div>
        </>
      )}


      {/* Grid Quick Actions */}
      <div className="px-6 py-2">
        <div className="grid grid-cols-6 gap-2">
          <Link to="/transferir" className="flex flex-col items-center gap-1.5 group">
            <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center border border-gray-100 transition-all group-hover:scale-105">
              <ArrowUpDown className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-[10px] text-center text-gray-600 font-semibold">Transferir</span>
          </Link>

          <button
              onClick={() => setShowChanceModal(true)}
              className="flex flex-col items-center gap-1.5 group"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-purple-700 to-indigo-900 rounded-2xl shadow-sm flex items-center justify-center border border-purple-600 transition-all group-hover:scale-105 relative">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[7px] font-black px-1.5 py-0.5 rounded-full animate-pulse shadow-sm">
                  Adelanto
                </span>
              </div>
              <span className="text-[10px] text-center text-purple-950 font-black leading-tight">dame chance</span>
            </button>

          <button className="flex flex-col items-center gap-1.5 group">
            <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center border border-gray-100 transition-all group-hover:scale-105">
              <Building2 className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-[10px] text-center text-gray-600 font-semibold leading-tight">Otro banco</span>
          </button>

          <button className="flex flex-col items-center gap-1.5 group" onClick={() => handleRecarga(CHANCE_EARLY_PAYMENT_MAX_DAY)}>
            <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center border border-gray-100 transition-all group-hover:scale-105">
              <WalletIcon className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-[10px] text-center text-gray-600 font-semibold">Recargar</span>
          </button>

          <button className="flex flex-col items-center gap-1.5 group">
            <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center border border-gray-100 transition-all group-hover:scale-105">
              <CreditCard className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-[10px] text-center text-gray-600 font-semibold">Cobrar</span>
          </button>

          <button className="flex flex-col items-center gap-1.5 group">
            <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center border border-gray-100 transition-all group-hover:scale-105">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-purple-600">
                <rect x="3" y="8" width="18" height="12" rx="2" strokeWidth="2"/>
                <path d="M7 8V6a2 2 0 012-2h6a2 2 0 012 2v2" strokeWidth="2"/>
              </svg>
            </div>
            <span className="text-[10px] text-center text-gray-600 font-semibold">Retirar</span>
          </button>
        </div>
      </div>

      {/* Grid Utilities */}
      <div className="px-6 py-4">
        <div className="grid grid-cols-5 gap-3">
          <button className="flex flex-col items-center gap-1.5 group">
            <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center border border-gray-100 transition-all group-hover:scale-105">
              <Phone className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-[10px] text-center text-gray-600 font-semibold leading-tight">Celular</span>
          </button>

          <button className="flex flex-col items-center gap-1.5 group">
            <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center border border-gray-100 transition-all group-hover:scale-105">
              <FileText className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-[10px] text-center text-gray-600 font-semibold leading-tight">Pagar serv.</span>
          </button>

          <button className="flex flex-col items-center gap-1.5 group">
            <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center border border-gray-100 transition-all group-hover:scale-105">
              <Bus className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-[10px] text-center text-gray-600 font-semibold leading-tight">Metro</span>
          </button>

          <button className="flex flex-col items-center gap-1.5 group">
            <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center border border-gray-100 transition-all group-hover:scale-105">
              <Users className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-[10px] text-center text-gray-600 font-semibold leading-tight">Jóvenes</span>
          </button>

          <button className="flex flex-col items-center gap-1.5 group">
            <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center border border-gray-100 transition-all group-hover:scale-105">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-purple-600">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" strokeWidth="2"/>
                <line x1="3" y1="6" x2="21" y2="6" strokeWidth="2"/>
              </svg>
            </div>
            <span className="text-[10px] text-center text-gray-600 font-semibold leading-tight">Tienda</span>
          </button>
        </div>
      </div>

      {/* Referals */}
      <div className="px-6 py-2 flex justify-center items-center gap-12">
        <div className="flex flex-col items-center">
          <Link to="/beneficios" className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center border border-gray-100 hover:scale-105 transition-all">
            <GiftIcon className="w-5 h-5 text-purple-600" />
          </Link>
          <p className="text-[10px] text-center text-gray-600 font-semibold mt-1">Invita y Gana</p>
        </div>

        {/* Simulate QR client payment scanner */}
        <div className="flex flex-col items-center">
          <button
            className="w-14 h-14 bg-orange-100 rounded-2xl shadow-sm flex items-center justify-center border border-orange-200 hover:scale-105 transition-all"
            onClick={() => setShowQRModal(true)}
          >
            <QrCode className="w-5 h-5 text-orange-600" />
          </button>
          <p className="text-[10px] text-center text-gray-600 font-semibold mt-1">Simular Pago QR</p>
        </div>
      </div>

      {/* Main scanning button */}
      <div className="px-6 py-6">
        <Button className="w-full bg-purple-700 hover:bg-purple-800 text-white rounded-2xl py-6 flex items-center justify-center gap-2 font-bold text-sm shadow-md transition-all active:scale-[0.98]">
          <QrCode className="w-5 h-5" />
          Escanear QR Deuna
        </Button>
      </div>

      {/* QR scanner modal simulation */}
      {showQRModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-in fade-in">
          <Card className="bg-white rounded-3xl p-6 max-w-sm w-full border border-gray-100 shadow-2xl relative animate-in zoom-in-95">
            <h3 className="text-lg font-bold text-purple-900 mb-2">Simular Compra con QR Deuna</h3>
            <p className="text-xs text-gray-600 mb-4">
              Simula que escaneas un código QR de un comercio para pagar. Esto descontará saldo, te dará **+3 XP**, y aumentará tu **nivel deuna**!
            </p>

            <div className="space-y-4 mb-4">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Monto de la compra ($)</label>
                <input
                  type="number"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm font-semibold text-gray-800 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  value={qrAmount}
                  onChange={(e) => setQrAmount(e.target.value)}
                  placeholder="3.50"
                  step="0.01"
                />
              </div>

              {qrError && (
                <div className="space-y-2">
                  <div className="bg-red-50 text-red-600 p-2.5 rounded-xl text-xs font-semibold border border-red-150">
                    ❌ {qrError}
                  </div>
                  {qrError.includes("insuficiente") && (
                    <div className="bg-gradient-to-br from-purple-900 via-purple-950 to-indigo-950 text-white rounded-2xl p-4 text-center space-y-3 border border-purple-500/30 shadow-xl animate-in fade-in zoom-in-95 duration-200 mt-2 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full translate-x-8 -translate-y-8 blur-xl pointer-events-none" />
                      <div className="absolute -left-6 -bottom-6 w-16 h-16 bg-orange-500/10 rounded-full blur-lg pointer-events-none" />
                      
                      <div className="flex items-center justify-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                        <h4 className="text-[10px] font-black text-amber-300 uppercase tracking-wider">¡Te damos la mano al instante!</h4>
                      </div>
                      
                      <p className="text-sm font-black text-white leading-tight">
                        💸 ¿Quieres un Chance?
                      </p>
                      
                      <p className="text-[10px] text-purple-200 leading-normal max-w-[240px] mx-auto">
                        Obtén un adelanto al instante sin papeleo para completar tu pago y seguir subiendo de Nivel.
                      </p>

                      <Button
                        className="w-full bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white text-[11px] font-black rounded-xl py-2 h-auto transition-all active:scale-[0.98] shadow-md border-b-2 border-purple-800"
                        onClick={() => {
                          setShowQRModal(false);
                          setActiveProfileMode("personal");
                          setTimeout(() => {
                            setShowChanceModal(true);
                          }, 100);
                        }}
                      >
                        Deuna, ¡Dame un Chance! ⚡
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {qrSuccess && (
                <div className="bg-emerald-50 text-emerald-600 p-3 rounded-xl text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  ¡Pago QR completado! +3 XP | +2 Puntos de Nivel
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1 rounded-xl text-xs"
                onClick={() => setShowQRModal(false)}
                disabled={qrSuccess}
              >
                Cancelar
              </Button>
              <Button
                className="flex-1 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold"
                onClick={handleQRTestPay}
                disabled={qrSuccess}
              >
                Pagar con QR
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* ==================== SCREEN: TÉRMINOS Y CONDICIONES (FULL SCREEN) ==================== */}
      {showTermsModal && (
        <div className="fixed inset-0 max-w-md mx-auto z-[60] bg-white flex flex-col animate-in slide-in-from-bottom duration-300">
          
          {/* Header */}
          <div className="bg-white px-6 py-4 flex items-center justify-between border-b border-gray-100 shrink-0">
            <button 
              onClick={() => {
                setShowTermsModal(false);
                setAcceptedTerms(false);
                setShowFullTerms(false);
              }}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ChevronLeft className="w-6 h-6 text-gray-700" />
            </button>
            <div className="text-center">
              <h3 className="text-sm font-black text-purple-950">Contrato dame chance</h3>
              <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Línea de Crédito Digital</p>
            </div>
            <div className="w-8" />
          </div>

          {/* Scrollable Terms Content */}
          <div 
            className="flex-1 overflow-y-auto px-6 py-5 space-y-5 text-gray-600"
          >
            {/* Applicant GPS Verify Badge */}
            <Card className="bg-gradient-to-r from-purple-900 to-indigo-950 text-white rounded-2xl p-4 border border-purple-500/20 relative overflow-hidden shadow-md">
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full translate-x-8 -translate-y-8 blur-lg pointer-events-none" />
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-lg select-none">
                  👤
                </div>
                <div>
                  <h4 className="text-xs font-black text-amber-300 uppercase tracking-widest leading-none mb-1">Solicitante Autorizado</h4>
                  <p className="text-xs font-bold leading-tight">Juan Carlos Pérez</p>
                  <p className="text-[9px] text-purple-200">C.I: 172456789-0 | Quito, EC</p>
                </div>
              </div>
              <div className="border-t border-white/10 mt-3 pt-2 flex items-center justify-between text-[8px] text-purple-200 font-mono">
                <span>GPS: 0.2202° S, 78.5089° W</span>
                <span>SHA-256: 8f9a2c...b129</span>
              </div>
            </Card>

            {/* Financial Summary */}
            <div className="bg-purple-50 rounded-2xl p-4 border border-purple-100 space-y-2 shadow-sm">
              <p className="font-extrabold text-[10px] text-purple-950 uppercase tracking-wide">Resumen del Adelanto:</p>
              <div className="flex justify-between text-xs text-gray-600">
                <span>Monto solicitado:</span>
                <span className="font-extrabold text-purple-950">${selectedLoanAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs text-gray-600">
                <span>Gastos Aplicativos:</span>
                <span className="font-extrabold text-purple-950">${previewFee.toFixed(2)}</span>
              </div>
              <div className="border-t border-purple-200/50 my-1" />
              <div className="flex justify-between text-purple-950 font-black text-sm">
                <span>Monto total a pagar (cash-in):</span>
                <span>${previewTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Interactive Collapsible terms and conditions */}
            <div className="space-y-3 font-sans text-xs leading-relaxed text-gray-700">
              <div className="flex justify-between items-center border-b border-gray-100 pb-1">
                <h3 className="font-black text-purple-950 text-xs uppercase tracking-wider">Términos y Condiciones</h3>
                <button
                  onClick={() => setShowFullTerms(!showFullTerms)}
                  className="text-[11px] font-black text-purple-700 hover:text-purple-900 transition-colors uppercase tracking-wider flex items-center gap-1 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-100"
                >
                  {showFullTerms ? "🔽 Leer menos" : "▶️ Leer más"}
                </button>
              </div>

              <p className="text-[11px] text-gray-500 leading-normal">
                Su microcrédito "dame chance" se rige por políticas de débito automático del saldo y comportamiento crediticio.
              </p>

              {showFullTerms && (
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-150 space-y-4 font-mono text-[10px] leading-relaxed animate-in fade-in duration-200">
                  <p>
                    <strong className="text-purple-950">CLÁUSULA PRIMERA (Cobro Automático al Cash-in):</strong> El solicitante acepta de manera irrevocable que Deuna debitará automáticamente el monto total adeudado ($${previewTotal.toFixed(2)}) en el momento preciso en que se registre cualquier ingreso de dinero, depósito o transferencia en su billetera digital.
                  </p>
                  
                  <p>
                    <strong className="text-purple-950">CLÁUSULA SEGUNDA (Plazo incondicional de {CHANCE_LOAN_TERM_DAYS} días):</strong> El plazo total para la liquidación del préstamo es de {CHANCE_LOAN_TERM_DAYS} días calendario. Al no existir cobros manuales agresivos de parte de Deuna, el solicitante asume la total responsabilidad de mantener saldo suficiente para su débito.
                  </p>
                  
                  <p>
                    <strong className="text-purple-950">CLÁUSULA TERCERA (Salud y conducta financiera):</strong> El impago oportuno tendrá un impacto de <span className="font-bold text-red-600">penalización de -20 puntos en tu nivel deuna</span>, la congelación inmediata de su límite de crédito, y la pérdida incondicional de su racha de actividad y cosméticos de perfil.
                  </p>

                  <p>
                    <strong className="text-purple-950">CLÁUSULA CUARTA (Destinatario del Bolsillo Productivo):</strong> El dinero se acreditará exclusivamente en el Bolsillo de Gasto Tokenizado para su uso en la red Deuna Negocios y pago de servicios básicos dentro del ecosistema, no siendo apto para retiros físicos directos.
                  </p>
                </div>
              )}
            </div>

          </div>

          {/* Fixed Footer Consent & Accept Controls */}
          <div className="p-6 border-t border-gray-100 bg-white shrink-0 space-y-4 shadow-[0_-4px_16px_rgba(0,0,0,0.03)]">
            
            {/* Checkbox */}
            <label className="flex items-start gap-3 cursor-pointer select-none transition-all duration-200 bg-purple-50/50 p-3.5 rounded-2xl border border-purple-100/50 hover:bg-purple-50">
              <input
                type="checkbox"
                id="terms-checkbox"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="mt-0.5 rounded text-purple-700 focus:ring-purple-500 cursor-pointer w-4 h-4 border-gray-300"
              />
              <span className="text-[10px] text-gray-700 font-bold leading-tight">
                Doy mi consentimiento y acepto expresamente todas las cláusulas de cobro automático y políticas conductuales asociadas al microcrédito.
              </span>
            </label>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1 rounded-xl text-xs font-bold py-3 hover:bg-gray-100"
                onClick={() => {
                  setShowTermsModal(false);
                  setAcceptedTerms(false);
                  setShowFullTerms(false);
                }}
              >
                Cancelar
              </Button>
              <Button
                id="btn-accept-request"
                disabled={!acceptedTerms}
                className={`flex-1 rounded-xl text-xs font-extrabold py-3 shadow-md transition-all ${
                  acceptedTerms
                    ? "bg-purple-700 hover:bg-purple-800 text-white cursor-pointer active:scale-[0.98]"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none border-none"
                }`}
                onClick={handleConfirmTermsAndRequest}
              >
                Aceptar y Solicitar ${selectedLoanAmount.toFixed(2)}
              </Button>
            </div>

          </div>

        </div>
      )}

      {/* ============ END PERSONAL/VECI CONDITIONAL ============ */}
      </>
      )}

      {/* ==================== SHARED MODALS (accessible from both profiles) ==================== */}

      {/* ==================== SCREEN: CONTRATO DE NEGOCIO (FULL SCREEN VECI) ==================== */}
      {showVeciTermsModal && (
        <div className="fixed inset-0 max-w-md mx-auto z-[60] bg-white text-gray-900 flex flex-col animate-in slide-in-from-bottom duration-300">
          
          {/* Header */}
          <div className="bg-white px-6 py-4 flex items-center justify-between border-b border-gray-100 shrink-0">
            <button 
              onClick={() => {
                setShowVeciTermsModal(false);
                setAcceptedVeciTerms(false);
                setShowFullVeciTerms(false);
                clearSignatureVeci();
              }}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ChevronLeft className="w-6 h-6 text-gray-800" />
            </button>
            <div className="text-center">
              <h3 className="text-sm font-black text-purple-950">Contrato Capital de Trabajo</h3>
              <p className="text-[9px] text-purple-650 font-bold uppercase tracking-wider">Línea de Crédito Comercial</p>
            </div>
            <div className="w-8" />
          </div>

          {/* Scrollable Terms Content */}
          <div 
            className="flex-1 overflow-y-auto px-6 py-5 space-y-5 text-gray-700"
          >
            {/* Applicant GPS Verify Badge */}
            <Card className="bg-gradient-to-r from-purple-50 to-indigo-50/50 text-gray-900 rounded-2xl p-4 border border-purple-100 relative overflow-hidden shadow-sm">
              <div className="absolute top-0 right-0 w-24 h-24 bg-purple-200/20 rounded-full translate-x-8 -translate-y-8 blur-lg pointer-events-none" />
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-lg select-none">
                  🏪
                </div>
                <div>
                  <h4 className="text-xs font-black text-purple-900 uppercase tracking-widest leading-none mb-1">Comercio Autorizado</h4>
                  <p className="text-xs font-bold leading-tight">MiniMarket Veci</p>
                  <p className="text-[9px] text-gray-500">RUC: 1724567890001 | Quito, EC</p>
                </div>
              </div>
              <div className="border-t border-purple-100 mt-3 pt-2 flex items-center justify-between text-[8px] text-gray-400 font-mono">
                <span>GPS: 0.2202° S, 78.5089° W</span>
                <span>SHA-256: Veci9a...2b77</span>
              </div>
            </Card>

            {(() => {
              const { interest, insurance, total } = calculateVeciLoanTotals(selectedVeciLoan, selectedVeciMonths);
              return (
                <>
                  {/* Financial Summary */}
                  <div className="bg-purple-50 rounded-2xl p-4 border border-purple-100 space-y-2 shadow-sm">
                    <p className="font-extrabold text-[10px] text-purple-900 uppercase tracking-wide">Resumen del Financiamiento Comercial:</p>
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>Capital Solicitado:</span>
                      <span className="font-extrabold text-purple-950">${selectedVeciLoan.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>Interés (máx. 28% anual):</span>
                      <span className="font-extrabold text-purple-950">${interest.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>Seguro de Desgravamen:</span>
                      <span className="font-extrabold text-purple-950">${insurance.toFixed(2)}</span>
                    </div>
                    <div className="border-t border-purple-200 my-1" />
                    <div className="flex justify-between text-purple-950 font-black text-sm">
                      <span>Monto Total a Liquidar:</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-[10px] text-gray-500">
                      <span>Amortización sugerida por venta QR:</span>
                      <span className="font-extrabold text-emerald-700">{(veciRetentionRate * 100).toFixed(0)}% de cada cobro</span>
                    </div>
                  </div>

                  {/* Interactive Collapsible terms and conditions */}
                  <div className="space-y-3 font-sans text-xs leading-relaxed text-gray-600">
                    <div className="flex justify-between items-center border-b border-gray-150 pb-1">
                      <h3 className="font-black text-purple-950 text-xs uppercase tracking-wider">Políticas de Capital de Trabajo</h3>
                      <button
                        onClick={() => setShowFullVeciTerms(!showFullVeciTerms)}
                        className="text-[11px] font-black text-purple-700 hover:text-purple-800 transition-colors uppercase tracking-wider flex items-center gap-1 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-150"
                      >
                        {showFullVeciTerms ? "🔽 Leer menos" : "▶️ Leer más"}
                      </button>
                    </div>

                    <p className="text-[11px] text-gray-500 leading-normal">
                      Este financiamiento se amortiza mediante retenciones automáticas de sus cobros QR de clientes.
                    </p>

                    {showFullVeciTerms && (
                      <div className="bg-purple-50/50 p-4 rounded-2xl border border-purple-100 space-y-4 font-mono text-[10px] leading-relaxed text-gray-600 animate-in fade-in duration-200">
                        <p>
                          <strong className="text-purple-900">CLÁUSULA PRIMERA (Retención en Ventas QR):</strong> El Comercio autoriza y acepta de manera irrevocable que Deuna retenga de forma automática el <span className="font-bold text-emerald-700">{(veciRetentionRate * 100).toFixed(0)}%</span> de todas sus ventas cobradas mediante código QR Deuna para amortizar el Capital de Trabajo adeudado al instante.
                        </p>
                        
                        <p>
                          <strong className="text-purple-900">CLÁUSULA SEGUNDA (Plazo incondicional de pago):</strong> El plazo total para la liquidación del préstamo es de <span className="font-bold text-purple-950">{selectedVeciMonths} {selectedVeciMonths === 1 ? "mes" : "meses"}</span>. Si las retenciones por ventas no cubren el saldo completo al vencimiento, el Comercio se obliga a liquidar la diferencia manualmente.
                        </p>
                        
                        <p>
                          <strong className="text-purple-900">CLÁUSULA TERCERA (Comportamiento y Cupos Comerciales):</strong> El cumplimiento y amortización oportuna incrementará tu nivel deuna del comercio, permitiéndole expandir su cupo comercial hasta <span className="font-bold text-emerald-700">$300</span>. El impago congelará de inmediato la línea.
                        </p>

                        <p>
                          <strong className="text-purple-900">CLÁUSULA CUARTA (Destinatario del Capital de Trabajo):</strong> El monto acreditado de ${selectedVeciLoan.toFixed(2)} se depositará exclusivamente en el saldo de ventas de su perfil comercial Deuna para su utilización en compras operativas y abastecimiento de mercaderías.
                        </p>
                      </div>
                    )}
                  </div>
                </>
              );
            })()}

            {/* Signature Area */}
            <div className="space-y-2">
              <div className="flex justify-between items-center border-b border-gray-150 pb-1">
                <h3 className="font-black text-purple-950 text-xs uppercase tracking-wider">Firma Digital del Comercio</h3>
                {signatureCanvasVeciDrawed && (
                  <button
                    onClick={clearSignatureVeci}
                    className="text-[10px] font-bold text-red-650 hover:text-red-755 transition-colors bg-red-50 px-2 py-0.5 rounded border border-red-200"
                  >
                    Limpiar
                  </button>
                )}
              </div>
              
              <p className="text-[11px] text-gray-500 leading-normal">
                Firme dentro del recuadro usando su dedo o mouse para formalizar el pagaré comercial.
              </p>

              <div className="bg-purple-50/50 border-2 border-dashed border-purple-200 rounded-2xl p-2 relative overflow-hidden">
                <canvas
                  ref={canvasVeciRef}
                  width={340}
                  height={120}
                  className="w-full h-[120px] cursor-crosshair touch-none bg-white rounded-xl"
                  onPointerDown={startDrawingVeci}
                  onPointerMove={drawVeci}
                  onPointerUp={stopDrawingVeci}
                />
                {!signatureCanvasVeciDrawed && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-purple-300/50 text-[10px] font-bold uppercase tracking-wider">
                    ✍️ Firme aquí para continuar
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Fixed Footer Consent & Accept Controls */}
          <div className="p-6 border-t border-gray-100 bg-purple-50/20 shrink-0 space-y-4 shadow-[0_-4px_16px_rgba(0,0,0,0.03)]">
            
            {/* Checkbox */}
            <label className="flex items-start gap-3 cursor-pointer select-none transition-all duration-200 bg-white p-3.5 rounded-2xl border border-gray-150 hover:bg-gray-50/50">
              <input
                type="checkbox"
                id="veci-terms-checkbox"
                checked={acceptedVeciTerms}
                onChange={(e) => setAcceptedVeciTerms(e.target.checked)}
                className="mt-0.5 rounded text-purple-600 focus:ring-purple-500 cursor-pointer w-4 h-4 border-purple-300 bg-white"
              />
              <span className="text-[10px] text-gray-600 font-bold leading-tight">
                Doy mi consentimiento y acepto expresamente todas las cláusulas de retención por ventas QR y políticas del préstamo.
              </span>
            </label>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1 rounded-xl text-xs font-bold py-3 bg-white hover:bg-gray-50 border-gray-200 text-gray-700"
                onClick={() => {
                  setShowVeciTermsModal(false);
                  setAcceptedVeciTerms(false);
                  setShowFullVeciTerms(false);
                  clearSignatureVeci();
                }}
              >
                Cancelar
              </Button>
              <Button
                disabled={!acceptedVeciTerms || !signatureCanvasVeciDrawed}
                className={`flex-1 rounded-xl text-xs font-extrabold py-3 shadow-sm transition-all ${
                  acceptedVeciTerms && signatureCanvasVeciDrawed
                    ? "bg-purple-700 hover:bg-purple-800 text-white cursor-pointer active:scale-[0.98]"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed shadow-none border-none"
                }`}
                onClick={() => {
                  const ok = requestVeciCredit(selectedVeciLoan, selectedVeciMonths);
                  if (ok) {
                    setShowVeciTermsModal(false);
                    setShowVeciChanceModal(false);
                    setAcceptedVeciTerms(false);
                    setShowFullVeciTerms(false);
                    clearSignatureVeci();
                    confetti({
                      particleCount: 150,
                      spread: 80,
                      colors: ["#7c3aed", "#eab308", "#10b981"]
                    });
                  }
                }}
              >
                Firmar y Solicitar ${selectedVeciLoan}
              </Button>
            </div>

          </div>

        </div>
      )}

      {/* ==================== SCREEN: MODAL DAME UN CHANCE (BOTTOM-SHEET / DRAWER) ==================== */}
      {showChanceModal && (
        <div className="fixed inset-0 max-w-md mx-auto z-50 bg-white flex flex-col animate-in slide-in-from-right duration-300">
          
          {/* Header */}
          <div className="bg-white px-6 py-4 flex items-center justify-between border-b border-gray-100 shrink-0">
            <button 
              onClick={() => setShowChanceModal(false)}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ChevronLeft className="w-6 h-6 text-gray-800" strokeWidth={2.5} />
            </button>
            <div className="text-center">
              <h3 className="text-sm font-black text-purple-950">Deuna dame chance</h3>
              <p className="text-[9px] text-purple-650 font-bold uppercase tracking-wider">Adelanto de Saldo Digital</p>
            </div>
            <div className="w-8" />
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
            {activeCredit ? (
              // Active debt display
              <Card className="bg-gradient-to-r from-red-50 via-amber-50 to-orange-50 border-2 border-red-200 rounded-2xl p-4 flex flex-col gap-3 relative shadow-md overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-red-100 rounded-full translate-x-12 -translate-y-8 opacity-30" />
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0 mt-0.5">
                    <ShieldAlert className="w-5 h-5 text-red-600 animate-bounce" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-black text-purple-950 mb-0.5">Línea dame chance Activa ⚡</h3>
                    <p className="text-xs text-gray-755">
                      Total a pagar: <span className="font-extrabold text-red-600 font-mono">${activeCredit.total.toFixed(2)}</span>
                    </p>
                    <p className="text-[10px] text-gray-500 mt-1 font-semibold">
                      Plazo: {CHANCE_LOAN_TERM_DAYS} días | Se descuenta automáticamente en tu próxima recarga.
                    </p>
                  </div>
                </div>

                {/* Remaining Balance specific to active credit within the modal */}
                <div className="bg-gradient-to-br from-purple-950 to-indigo-900 text-white rounded-2xl p-4 border border-purple-800 shadow-lg flex items-center justify-between">
                  <div>
                    <span className="text-[8px] uppercase tracking-wider text-purple-300 font-black block">Saldo de Adelanto Disponible</span>
                    <span className="text-2xl font-black text-white leading-none">${chanceAvailableBalance.toFixed(2)}</span>
                  </div>
                  <span className="text-[9px] bg-purple-900/80 px-2.5 py-1.5 rounded-xl border border-purple-800 font-bold">🏪 Solo QR Deuna</span>
                </div>

                {/* ECONOMÍA CONDUCTUAL WARNINGS */}
                <div className="bg-white/80 rounded-xl p-3 border border-orange-200 text-[10px] text-gray-600 space-y-1.5">
                  <p className="font-extrabold text-purple-900 uppercase tracking-wider flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    Advertencia de Impago (Costo conductual)
                  </p>
                  <p className="leading-tight text-red-750 font-bold">
                    ⚠️ Si no pagas en 3 días perderás tu Cofre Diamante del jueves, tu racha de 12 días y tu borde plateado equipado.
                  </p>
                  <p className="text-emerald-700 font-bold">
                    💡 ¡Paga hoy y asegura tu Cofre Diamante diario +35 XP +15 en tu nivel deuna!
                  </p>
                </div>

                {/* Fast simulated manual payments */}
                <div className="flex gap-2">
                  <Button
                    disabled={balance < activeCredit.total}
                    className="flex-1 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-[10px] font-extrabold py-2.5 shadow-sm disabled:opacity-40"
                    onClick={() => handlePaySalvavidas(CHANCE_EARLY_PAYMENT_MAX_DAY)}
                  >
                    Pagar hoy (Día {CHANCE_EARLY_PAYMENT_MAX_DAY} - ¡Sube Cupo!)
                  </Button>
                  <Button
                    disabled={balance < activeCredit.total}
                    variant="outline"
                    className="flex-1 rounded-xl text-[10px] font-bold text-gray-700 bg-white"
                    onClick={() => handlePaySalvavidas(CHANCE_LATE_PAYMENT_DAY)}
                  >
                    Pagar tarde (Día {CHANCE_LATE_PAYMENT_DAY})
                  </Button>
                </div>
              </Card>
            ) : (
              // Loan Request interface
              <Card className="bg-white border border-gray-150 rounded-2xl p-5 shadow-sm relative overflow-hidden">
                <div className="flex items-center justify-between mb-3 border-b border-gray-100 pb-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-600" />
                    <h3 className="text-sm font-extrabold text-purple-950">Solicitar Adelanto 💸</h3>
                  </div>
                  <span className="text-[10px] font-bold bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                    Nivel {getPulsoTierLabel(pulsoScore)} · Máx ${maxChanceAmount.toFixed(2)}
                  </span>
                </div>

                {/* ANTI-FRAUD AND PRE-REQUISITES (Filtros de Seguridad & Confianza) */}
                <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 text-[10px] text-gray-600 mb-4 space-y-1.5">
                  <p className="font-extrabold text-purple-950 uppercase tracking-wider">Seguridad y Confianza IA</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-emerald-500">✅</span>
                      <span>Saldo de Confianza ($2.50)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-emerald-500">✅</span>
                      <span>Actividad Real (8+ trans.)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-emerald-500">✅</span>
                      <span>Identidad ARCOTEL Cédula</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-emerald-500">✅</span>
                      <span>Geocerca de seguridad activa</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Selector showing only three credit limits exactly: $3.50, $7.50, $10.00 */}
                  <div className="flex justify-between items-center gap-2 bg-gray-50 p-1.5 rounded-xl border border-gray-100">
                    {[3.5, 7.5, 10].map((amt) => {
                      const locked = !isChanceAmountUnlocked(amt as 3.5 | 7.5 | 10);
                      const selected = selectedLoanAmount === amt;
                      return (
                        <button
                          key={amt}
                          disabled={locked}
                          title={
                            locked
                              ? amt === 7.5
                                ? "Requiere Nivel Plata (56+)"
                                : amt === 10
                                ? "Requiere Nivel Diamante (76+)"
                                : "Requiere Nivel Bronce (31+)"
                              : undefined
                          }
                          className={`flex-1 py-2 text-xs font-black rounded-lg transition-all flex items-center justify-center gap-0.5 ${
                            locked
                              ? "opacity-40 bg-transparent text-gray-400 cursor-not-allowed"
                              : selected
                              ? "bg-purple-700 text-white shadow-sm scale-105"
                              : "bg-white text-gray-700 hover:bg-gray-100"
                          }`}
                          onClick={() => setSelectedLoanAmount(amt)}
                        >
                          ${amt.toFixed(2)}
                          {locked && <Lock className="w-2.5 h-2.5" />}
                        </button>
                      );
                    })}
                  </div>

                  {/* Dynamic cost calculations */}
                  <div className="bg-purple-50/50 rounded-xl p-3 text-xs space-y-1.5 border border-purple-100/50">
                    <div className="flex justify-between text-gray-600">
                      <span>Monto de adelanto:</span>
                      <span className="font-bold text-purple-950">${selectedLoanAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Comisión Base:</span>
                      <span className="font-bold text-purple-950">$0.25</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>IVA Comisión (15%):</span>
                      <span className="font-bold text-purple-950">$0.04</span>
                    </div>
                    <div className="border-t border-purple-200/50 my-1" />
                    <div className="flex justify-between font-bold text-purple-900">
                      <span>Monto a pagar (cash-in):</span>
                      <span>${previewTotal.toFixed(2)}</span>
                    </div>
                  </div>

                  {!canRequestChance && (
                    <p className="text-[10px] text-red-600 font-bold text-center">
                      Sube tu Nivel por encima de 30 puntos para solicitar tu primer Chance.
                    </p>
                  )}

                  <Button
                    className="w-full bg-gradient-to-r from-purple-700 to-purple-600 hover:from-purple-800 hover:to-purple-700 text-white rounded-xl py-3 text-xs font-extrabold shadow-sm transition-all disabled:opacity-40"
                    onClick={handleRequestSalvavidas}
                    disabled={
                      !canRequestChance ||
                      !isChanceAmountUnlocked(selectedLoanAmount as 3.5 | 7.5 | 10)
                    }
                  >
                    Deuna, ¡dame chance! (${selectedLoanAmount.toFixed(2)})
                  </Button>
                </div>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* ==================== SCREEN: MODAL DAME CHANCE VECI (BOTTOM-SHEET / DRAWER) ==================== */}
      {showVeciChanceModal && (
        <div className="fixed inset-0 max-w-md mx-auto z-50 bg-white text-gray-900 flex flex-col animate-in slide-in-from-right duration-300">
          
          {/* Header */}
          <div className="bg-white px-6 py-4 flex items-center justify-between border-b border-gray-100 shrink-0">
            <button 
              onClick={() => setShowVeciChanceModal(false)}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ChevronLeft className="w-6 h-6 text-gray-800" strokeWidth={2.5} />
            </button>
            <div className="text-center">
              <h3 className="text-sm font-black text-purple-950">Deuna dame chance Negocio</h3>
              <p className="text-[9px] text-purple-650 font-bold uppercase tracking-wider">Capital de Trabajo Veci</p>
            </div>
            <div className="w-8" />
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
            {veciActiveCredit ? (
              // Active merchant credit layout
              <Card className="bg-gradient-to-br from-white to-purple-50/20 border-2 border-purple-200 rounded-3xl p-5 flex flex-col gap-4 relative shadow-sm overflow-hidden text-gray-900">
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-200/10 rounded-full translate-x-12 -translate-y-12 blur-xl pointer-events-none" />
                
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-purple-100 border border-purple-200 flex items-center justify-center shrink-0">
                    <TrendingUp className="w-6 h-6 text-purple-700 animate-pulse" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-black text-purple-950 mb-0.5">Financiamiento Activo ⚡</h3>
                    <p className="text-xs text-gray-650">
                      Cupo total solicitado: <span className="font-extrabold text-purple-950 font-mono">${veciActiveCredit.amount.toFixed(2)}</span>
                    </p>
                    <p className="text-[10px] text-gray-500 mt-1 font-semibold leading-tight">
                      Plazo: {veciActiveCredit.months} {veciActiveCredit.months === 1 ? "mes" : "meses"} | Comisión base + seguro aplicado
                    </p>
                  </div>
                </div>

                {/* Remaining active balance to repay */}
                <div className="bg-purple-50 rounded-2xl p-4 border border-purple-100 flex items-center justify-between">
                  <div>
                    <span className="text-[8px] uppercase tracking-wider text-purple-700 font-black block">Deuda Pendiente Actual</span>
                    <span className="text-3xl font-black text-purple-950 leading-none">${veciActiveCredit.remaining.toFixed(2)}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[8px] uppercase tracking-wider text-purple-700 font-black block">Retención en Ventas</span>
                    <span className="text-xs font-bold text-purple-950">{(veciActiveCredit.retentionRate * 100).toFixed(0)}% de cada QR</span>
                  </div>
                </div>

                {/* Repayment mechanics explanation */}
                <div className="bg-purple-50/50 rounded-xl p-3.5 border border-purple-100 text-[10px] text-gray-650 space-y-2 leading-relaxed">
                  <p className="font-extrabold text-purple-900 uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-purple-600 shrink-0 animate-pulse" />
                    ¿Cómo funciona el pago automático?
                  </p>
                  <p>
                    Cada vez que un cliente te pague con QR Deuna, descontaremos el <strong className="text-purple-950 font-bold">{(veciActiveCredit.retentionRate * 100).toFixed(0)}%</strong> para abonar a esta deuda al instante. ¡Sin que tengas que mover un dedo!
                  </p>
                  <p className="text-emerald-700 font-semibold">
                    💡 ¡Paga tu cuota restante manualmente o simula ventas QR abajo para ver crecer tu nivel deuna!
                  </p>
                </div>

                {/* Simulation actions */}
                <div className="space-y-3 pt-2">
                  <div className="flex flex-col gap-2">
                    <Button
                      className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10px] font-extrabold py-3 shadow-sm border-none"
                      onClick={() => {
                        registerQRSale(40);
                      }}
                    >
                      Simular Venta QR de $40 (Retiene ${(40 * veciRetentionRate).toFixed(2)})
                    </Button>
                    <Button
                      className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-[10px] font-extrabold py-3 shadow-sm border-none"
                      onClick={() => {
                        registerQRSale(100);
                      }}
                    >
                      Simular Venta QR de $100 (Retiene ${(100 * veciRetentionRate).toFixed(2)})
                    </Button>
                  </div>
                  
                  <Button
                    disabled={balance < veciActiveCredit.remaining}
                    className="w-full bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-[11px] font-black py-3.5 shadow-sm disabled:opacity-40"
                    onClick={() => {
                      payVeciCreditManual();
                      setShowVeciChanceModal(false);
                    }}
                  >
                    {balance < veciActiveCredit.remaining 
                      ? `Saldo insuficiente en ventas ($${balance.toFixed(2)}) para liquidar` 
                      : `Liquidar deuda total de $${veciActiveCredit.remaining.toFixed(2)} ahora mismo`
                    }
                  </Button>
                </div>
              </Card>
            ) : (
              // Simulator / request view
              <div className="space-y-6">
                <Card className="bg-white border border-gray-150 rounded-3xl p-5 shadow-sm relative overflow-hidden text-gray-900">
                  <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-3">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-purple-700" />
                      <h3 className="text-sm font-extrabold text-purple-950">Solicitar Capital de Trabajo 🏪</h3>
                    </div>
                    <span className="text-[10px] font-bold bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full border border-purple-250">
                      Máx ${veciCreditLimit.toFixed(2)}
                    </span>
                  </div>

                  {/* AI Prediction block */}
                  <div className="bg-purple-50 rounded-2xl p-4 border border-purple-100 mb-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <p className="font-extrabold text-[10px] text-purple-900 uppercase tracking-widest flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-purple-600 animate-pulse shrink-0" />
                        Diagnóstico Predictivo de IA
                      </p>
                      {isAiAnalyzing && <RefreshCw className="w-3.5 h-3.5 text-purple-700 animate-spin" />}
                    </div>

                    {isAiAnalyzing ? (
                      <div className="text-center py-4 space-y-2">
                        <p className="text-[11px] text-gray-500">Nuestra Inteligencia Artificial está analizando tus ventas promedio de los últimos 3 meses...</p>
                        <div className="w-full bg-purple-100 rounded-full h-1.5 overflow-hidden">
                          <div className="bg-purple-650 h-full animate-[loading_1.5s_ease-in-out_infinite]" style={{ width: "60%" }} />
                        </div>
                      </div>
                    ) : aiPredictionResult ? (
                      <div className="text-xs space-y-2 text-gray-600">
                        <div className="flex justify-between">
                          <span>Ventas Proyectadas:</span>
                          <span className="font-bold text-purple-950">${aiPredictionResult.forecastedSales.toFixed(2)}/mes</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Límite Estimado:</span>
                          <span className="font-bold text-purple-950">${aiPredictionResult.recommendedLimit.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Nivel de Riesgo IA:</span>
                          <span className="font-extrabold text-emerald-700">{aiPredictionResult.riskScore}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Probabilidad de Pago:</span>
                          <span className="font-bold text-purple-950">{aiPredictionResult.repaymentProb}%</span>
                        </div>
                        <p className="text-[9px] text-gray-500 italic pt-1 leading-normal border-t border-purple-100">
                          {aiPredictionResult.seasonalityAdjustment}
                        </p>
                      </div>
                    ) : (
                      <div className="text-center py-2">
                        <Button
                          className="bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold w-full"
                          onClick={runVeciAiAnalysis}
                        >
                          Calcular Línea de Crédito con IA Deuna
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Manual Amount Input (No slider) */}
                  <div className="space-y-5">
                    <div>
                      <div className="flex justify-between items-center text-xs font-bold text-gray-700 mb-2">
                        <span>¿Cuánto necesitas? (Ingreso Manual)</span>
                        {selectedVeciLoan > 0 && selectedVeciLoan <= veciCreditLimit && (
                          <span className="text-base text-purple-700 font-mono font-black">${selectedVeciLoan.toFixed(2)}</span>
                        )}
                      </div>
                      
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-purple-900 font-black text-sm select-none">$</span>
                        <input
                          type="number"
                          min="1"
                          max={veciCreditLimit}
                          placeholder="Ingresa el monto deseado..."
                          className={`w-full pl-7 pr-3 py-3 bg-purple-50/30 border ${
                            selectedVeciLoan > veciCreditLimit || selectedVeciLoan <= 0
                              ? "border-red-300 focus:ring-red-400"
                              : "border-purple-200 focus:ring-purple-650"
                          } rounded-2xl text-sm font-black text-purple-950 focus:outline-none focus:ring-2 transition-all`}
                          value={selectedVeciLoan || ""}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value);
                            setSelectedVeciLoan(isNaN(val) ? 0 : val);
                          }}
                        />
                      </div>
                      
                      <div className="flex justify-between items-center text-[9px] text-gray-500 mt-1.5 font-bold px-1">
                        <span>Min recomendado: $1.00</span>
                        <span>Cupo máximo disponible: <strong className="text-purple-700">${veciCreditLimit}</strong></span>
                      </div>

                      {/* Warnings / Inline Validation Messages */}
                      {selectedVeciLoan > veciCreditLimit && (
                        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-xl flex items-center gap-1.5 text-[10px] text-red-650 font-bold animate-in fade-in duration-200">
                          <span>⚠️ El monto excede tu cupo disponible de ${veciCreditLimit}.</span>
                        </div>
                      )}
                      {selectedVeciLoan <= 0 && (
                        <div className="mt-2 p-2 bg-purple-50 border border-purple-100 rounded-xl flex items-center gap-1.5 text-[10px] text-purple-750 font-bold">
                          <span>💡 Ingresa un monto válido para calcular el interés.</span>
                        </div>
                      )}
                    </div>

                    <div>
                      <div className="flex justify-between items-center text-xs font-bold text-gray-700 mb-2">
                        <span>Plazo de pago:</span>
                        <span className="text-purple-750 font-black">{selectedVeciMonths} {selectedVeciMonths === 1 ? "Mes" : "Meses"}</span>
                      </div>
                      <div className="flex gap-2 bg-gray-50 p-1 rounded-xl border border-gray-150">
                        {[1, 2, 3].map((m) => (
                          <button
                            key={m}
                            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                              selectedVeciMonths === m
                                ? "bg-purple-700 text-white shadow-sm"
                                : "text-gray-600 hover:bg-gray-100"
                            }`}
                            onClick={() => setSelectedVeciMonths(m)}
                          >
                            {m} {m === 1 ? "Mes" : "Meses"}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Loan summary */}
                    {(() => {
                      const { interest, insurance, total } = calculateVeciLoanTotals(selectedVeciLoan, selectedVeciMonths);
                      return (
                        <div className="bg-purple-50 rounded-2xl p-4 border border-purple-100 text-xs space-y-2 text-gray-650">
                          <div className="flex justify-between">
                            <span>Monto Solicitado:</span>
                            <span className="font-bold text-purple-950">${selectedVeciLoan.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Interés (máx. 28% anual):</span>
                            <span className="font-bold text-purple-950">${interest.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Seguro de Desgravamen:</span>
                            <span className="font-bold text-purple-950">${insurance.toFixed(2)}</span>
                          </div>
                          <div className="border-t border-purple-200 my-1" />
                          <div className="flex justify-between text-purple-950 font-extrabold text-sm">
                            <span>Total a pagar:</span>
                            <span>${total.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-[10px] text-gray-500">
                            <span>Retención automática por venta QR:</span>
                            <span className="font-extrabold text-emerald-700">{(veciRetentionRate * 100).toFixed(0)}%</span>
                          </div>
                        </div>
                      );
                    })()}

                    <Button
                      disabled={selectedVeciLoan <= 0 || selectedVeciLoan > veciCreditLimit}
                      className={`w-full font-black rounded-xl py-3.5 text-xs shadow-sm transition-all ${
                        selectedVeciLoan > 0 && selectedVeciLoan <= veciCreditLimit
                          ? "bg-purple-700 hover:bg-purple-800 text-white cursor-pointer active:scale-[0.98]"
                          : "bg-gray-100 text-gray-400 cursor-not-allowed shadow-none border-none"
                      }`}
                      onClick={() => {
                        setShowVeciTermsModal(true);
                        setAcceptedVeciTerms(false);
                        setShowFullVeciTerms(false);
                        clearSignatureVeci();
                      }}
                    >
                      Deuna, ¡Dame Chance Negocio! ⚡
                    </Button>
                  </div>
                </Card>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================== SCREEN: CUENTA DEUNA ==================== */}
      {showWalletScreen && (
        <div className="fixed inset-0 max-w-md mx-auto z-50 bg-white flex flex-col animate-in slide-in-from-right duration-300">
          
          {/* Header */}
          <div className="bg-white px-6 py-4 flex items-center justify-between border-b border-gray-100 shrink-0">
            <button 
              onClick={() => setShowWalletScreen(false)}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ChevronLeft className="w-6 h-6 text-gray-800" strokeWidth={2.5} />
            </button>
            <h2 className="text-base font-semibold text-[#1e1b4b]">Cuenta Deuna</h2>
            <button 
              onClick={() => setShowWalletScreen(false)}
              className="text-sm font-bold text-purple-700 hover:text-purple-900 transition-colors"
            >
              Salir
            </button>
          </div>

          {/* Scrollable Container */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
            
            {/* Main Card Cuenta Deuna */}
            <Card className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.03)] border border-gray-150 relative overflow-hidden">
              <div className="flex justify-between items-start mb-1">
                <div>
                  <h3 className="text-2xl font-black italic text-purple-700 tracking-tight leading-none mb-2">
                    deuna!
                  </h3>
                  <p className="text-sm font-bold text-gray-900 leading-tight">N° 7700166353</p>
                  <p className="text-xs text-gray-500 font-medium mt-0.5">Cuenta de ahorro digital</p>
                </div>
                <button className="text-gray-900 hover:text-purple-900 p-1.5 hover:bg-purple-50 rounded-full transition-all">
                  <Share2 className="w-5 h-5" strokeWidth={2} />
                </button>
              </div>

              {/* Horizontal Separator */}
              <div className="border-t border-gray-100 my-4" />

              <div className="flex items-end justify-between">
                <div>
                  <p className="text-xs text-gray-500 font-medium mb-1">Saldo disponible</p>
                  <div className="flex items-center gap-2">
                    <span className="text-3xl font-extrabold text-[#1e1b4b] tabular-nums">
                      {isBalanceHidden 
                        ? "$ ••,••" 
                        : `$${balance.toLocaleString("es-EC", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                      }
                    </span>
                    <button 
                      onClick={() => setIsBalanceHidden(!isBalanceHidden)}
                      className="text-gray-800 hover:text-purple-900 transition-colors p-1"
                    >
                      {isBalanceHidden ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <Button 
                  onClick={() => {
                    rechargeBalance(20);
                    confetti({
                      particleCount: 50,
                      spread: 40,
                      colors: ["#7c3aed", "#10b981"]
                    });
                  }}
                  className="bg-[#f3e8ff] hover:bg-[#ebd9ff] text-[#6d28d9] px-4 py-2 h-auto text-xs font-bold rounded-xl shadow-none border-none transition-all active:scale-[0.97]"
                >
                  + Recargar
                </Button>
              </div>
            </Card>

            {/* Circular action buttons grid */}
            <div className="grid grid-cols-4 gap-3">
              <button className="flex flex-col items-center gap-2 group">
                <div className="w-16 h-16 bg-white rounded-3xl border border-gray-150 flex flex-col items-center justify-center shadow-sm transition-all group-hover:scale-105 group-active:scale-[0.98]">
                  {/* Custom 3D cash-stack with arrow SVG */}
                  <svg className="w-9 h-9" viewBox="0 0 36 36" fill="none">
                    <g transform="translate(2, 6)">
                      {/* Cash stack */}
                      <rect x="2" y="10" width="22" height="8" rx="1.5" fill="#10B981" />
                      <rect x="2" y="10" width="22" height="8" rx="1.5" stroke="#047857" strokeWidth="1" />
                      <circle cx="13" cy="14" r="2.5" fill="#34D399" />
                      
                      <rect x="4" y="7" width="22" height="8" rx="1.5" fill="#34D399" />
                      <rect x="4" y="7" width="22" height="8" rx="1.5" stroke="#059669" strokeWidth="1" />
                      <circle cx="15" cy="11" r="2.5" fill="#6EE7B7" />

                      <rect x="6" y="4" width="22" height="8" rx="1.5" fill="#6EE7B7" />
                      <rect x="6" y="4" width="22" height="8" rx="1.5" stroke="#10B981" strokeWidth="1" />
                      <circle cx="17" cy="8" r="2.5" fill="#A7F3D0" />
                      
                      {/* Purple up arrow */}
                      <path d="M22 6 L28 0 M28 0 L24 0 M28 0 L28 4" stroke="#7C3AED" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </g>
                  </svg>
                </div>
                <span className="text-xs text-gray-700 font-semibold text-center leading-none mt-1">
                  Transferir
                </span>
              </button>

              <button className="flex flex-col items-center gap-2 group">
                <div className="w-16 h-16 bg-white rounded-3xl border border-gray-150 flex items-center justify-center shadow-sm transition-all group-hover:scale-105 group-active:scale-[0.98]">
                  {/* Purple QR SVG */}
                  <svg className="w-7 h-7 text-purple-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <rect x="2" y="2" width="7" height="7" rx="1.5" />
                    <rect x="15" y="2" width="7" height="7" rx="1.5" />
                    <rect x="2" y="15" width="7" height="7" rx="1.5" />
                    <path d="M19 15 L22 15 M15 19 L15 22 M19 19 L22 22" strokeLinecap="round" />
                    <rect x="5" y="5" width="1" height="1" fill="currentColor" />
                    <rect x="18" y="5" width="1" height="1" fill="currentColor" />
                    <rect x="5" y="18" width="1" height="1" fill="currentColor" />
                  </svg>
                </div>
                <span className="text-xs text-gray-700 font-semibold text-center leading-none mt-1">
                  Mi QR
                </span>
              </button>

              <button className="flex flex-col items-center gap-2 group">
                <div className="w-16 h-16 bg-white rounded-3xl border border-gray-150 flex items-center justify-center shadow-sm transition-all group-hover:scale-105 group-active:scale-[0.98]">
                  {/* Custom Share Account SVG: Hand holding paper plane */}
                  <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none">
                    <path d="M4 14 L28 4 L18 26 L14 18 Z" fill="#DDD6FE" stroke="#7C3AED" strokeWidth="2" strokeLinejoin="round" />
                    <path d="M14 18 L28 4" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </div>
                <span className="text-xs text-gray-700 font-semibold text-center leading-tight mt-1 max-w-[70px]">
                  Compartir cuenta
                </span>
              </button>

              <button className="flex flex-col items-center gap-2 group">
                <div className="w-16 h-16 bg-white rounded-3xl border border-gray-150 flex items-center justify-center shadow-sm transition-all group-hover:scale-105 group-active:scale-[0.98]">
                  {/* Purple and Green gears custom SVG */}
                  <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none">
                    {/* Big purple gear */}
                    <circle cx="14" cy="18" r="6" stroke="#7C3AED" strokeWidth="2.5" />
                    <path d="M14 10 L14 12 M14 24 L14 26 M6 18 L8 18 M20 18 L22 18 M8.5 12.5 L10 14 M18 22 L19.5 23.5 M8.5 23.5 L10 22 M18 14 L19.5 12.5" stroke="#7C3AED" strokeWidth="2.5" strokeLinecap="round" />
                    <circle cx="14" cy="18" r="2.5" fill="#7C3AED" />
                    
                    {/* Small green gear */}
                    <circle cx="23" cy="11" r="4" stroke="#10B981" strokeWidth="2" />
                    <path d="M23 6 L23 7 M23 15 L23 16 M18 11 L19 11 M27 11 L28 11" stroke="#10B981" strokeWidth="2" strokeLinecap="round" />
                    <circle cx="23" cy="11" r="1.5" fill="#10B981" />
                  </svg>
                </div>
                <span className="text-xs text-gray-700 font-semibold text-center leading-none mt-1">
                  Ajustes
                </span>
              </button>
            </div>

            {/* Discover Pill */}
            <div className="bg-[#f3f0ff] hover:bg-[#ebe6ff] rounded-2xl px-4 py-3 flex items-center gap-2.5 cursor-pointer transition-all active:scale-[0.99] shadow-none">
              <Search className="w-4 h-4 text-purple-700" strokeWidth={2.5} />
              <span className="text-xs text-purple-950 font-bold">
                Descubre cómo usas tu dinero
              </span>
            </div>

            {/* Mis movimientos Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-extrabold text-purple-950">Mis movimientos</h3>
                <div className="flex gap-3">
                  <button className="text-purple-950 hover:text-purple-700 transition-colors p-1">
                    <Download className="w-5 h-5" strokeWidth={2} />
                  </button>
                  <button className="text-purple-950 hover:text-purple-700 transition-colors p-1">
                    <SlidersHorizontal className="w-5 h-5" strokeWidth={2} />
                  </button>
                </div>
              </div>

              {/* Month Header */}
              <div>
                <p className="text-[12px] font-bold text-gray-400 uppercase tracking-wider mb-3">Mayo</p>
                <div className="space-y-4">
                  {(() => {
                    // Compute running balance backward mathematically perfectly!
                    let currentRunning = balance;
                    const txsWithRunningBalance = transactions.map((tx) => {
                      const res = { ...tx, runningBalance: currentRunning };
                      currentRunning = currentRunning - tx.amount;
                      return res;
                    });

                    return txsWithRunningBalance.map((tx) => {
                      const isNegative = tx.amount < 0;
                      // Display settings based on type
                      let iconBg = "bg-purple-100 text-purple-700";
                      let iconContent: React.ReactNode = "💸";
                      
                      if (tx.description === "Recarga de saldo") {
                        iconBg = "bg-[#e9d5ff]";
                        iconContent = <span className="text-lg select-none">🤑</span>;
                      } else if (tx.description === "Cardenas Enriquez Sonia Mireya") {
                        iconBg = "bg-[#bbf7d0] text-[#065f46] font-bold text-xs";
                        iconContent = "CE";
                      } else if (tx.type === "recharge") {
                        iconBg = "bg-[#e9d5ff]";
                        iconContent = <span className="text-lg select-none">🤑</span>;
                      }

                      return (
                        <div key={tx.id} className="flex items-center justify-between py-1 bg-white">
                          <div className="flex items-center gap-3.5">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${iconBg}`}>
                              {iconContent}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-gray-900 leading-tight">
                                {tx.description}
                              </p>
                              <p className="text-xs text-gray-400 mt-0.5 font-medium">
                                {tx.date}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`text-sm font-extrabold tabular-nums ${isNegative ? "text-gray-900" : "text-emerald-600"}`}>
                              {isNegative ? `-$${Math.abs(tx.amount).toFixed(2).replace(".", ",")}` : `+$${Math.abs(tx.amount).toFixed(2).replace(".", ",")}`}
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5 tabular-nums">
                              {isBalanceHidden 
                                ? "$ ••,••" 
                                : `$${tx.runningBalance.toFixed(2)}`
                              }
                            </p>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>

              {/* End of list */}
              <div className="text-center py-6">
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">
                  Llegaste al final de la lista
                </p>
              </div>
            </div>

          </div>

        </div>
      )}
    </div>
  );
}
