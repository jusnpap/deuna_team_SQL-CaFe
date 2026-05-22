import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import confetti from "canvas-confetti";
import {
  CHANCE_AMOUNTS,
  type ChanceAmount,
  type ChestTier,
  type RuletaPrize,
  RULETA_PRIZES,
  CHEST_REWARDS,
  canRequestChance,
  getMaxChanceAmount,
  getChestTierForPulso,
  computeVeciCreditLimit,
  calculateVeciLoanTotals,
  getVeciRetentionRate,
  getTodayDateKey,
  isChanceAmountUnlocked,
  CHANCE_LOAN_TERM_DAYS,
  CHANCE_DEFAULT_SIMULATED_PAY_DAY,
  CHANCE_LATE_PAYMENT_DAY,
  getChanceLoanTotal,
  isEarlyChanceRepayment,
} from "../lib/creditRules";
import {
  BALANCE_HOLD_DURATION_MS,
  CHEST_COOLDOWN_MS,
  COIN_REWARD_PER_EVENT,
  MIN_BALANCE_FOR_SAVINGS_COIN,
  type CoinAwardResult,
  type CoinEarningSource,
  computeCoinAward,
  createEmptyDailyCoinEarnings,
} from "../lib/coinLimits";

export interface Transaction {
  id: string;
  type:
    | "recharge"
    | "salvavidas"
    | "autopay"
    | "chest"
    | "ruleta"
    | "qr_pay"
    | "veci_repayment"
    | "veci_loan"
    | "shop"
    | "balance_hold";
  description: string;
  amount: number;
  xpAwarded?: number;
  date: string;
}

export interface Credit {
  amount: number;
  interest: number;
  total: number;
  date: string;
  daysRemaining: number;
}

export interface VeciCredit {
  amount: number;
  interest: number;
  insurance?: number;
  total: number;
  remaining: number;
  date: string;
  retentionRate: number;
  months?: number;
}

export type RuletaSpinResult = RuletaPrize & { index: number };

export interface AppContextType {
  balance: number;
  coins: number;
  xp: number;
  chanceAvailableBalance: number;
  veciChanceAvailableBalance: number;
  pulsoScore: number;
  maxChanceAmount: number;
  canRequestChance: boolean;
  ruletaSpins: number;
  activeCredit: Credit | null;
  selectedBorder: string;
  selectedAccessory: string;
  unlockedCosmetics: string[];
  chestsOpenedToday: Record<string, boolean>;
  chestCooldownUntil: number;
  setChestCooldownUntil: (timestamp: number) => void;
  transactions: Transaction[];
  justPaidCredit: boolean;
  paymentRepaySpeed: "early" | "late" | null;
  clearJustPaidCredit: () => void;
  rechargeBalance: (amount: number, forceRepaymentDay?: number) => void;
  requestSalvavidas: (amount: number) => boolean;
  paySalvavidas: (forceRepaymentDay?: number) => void;
  openChest: (tier: ChestTier) => { xp: number; coins: number; spins: number; cosmetic?: string };
  spinRuleta: (prizeIndex?: number) => RuletaSpinResult;
  equipCosmetic: (type: "border" | "accessory", id: string) => void;
  payWithQR: (amount: number) => boolean;
  updatePulsoScore: (change: number) => void;
  isBalanceHidden: boolean;
  setIsBalanceHidden: React.Dispatch<React.SetStateAction<boolean>>;
  buyShopItem: (
    itemId: string,
    cost: number,
    rewardType: "spins" | "cosmetic",
    rewardValue: number | string
  ) => boolean;
  isChanceAmountUnlocked: (amount: ChanceAmount) => boolean;

  veciSalesAverage: number;
  veciCreditLimit: number;
  veciActiveCredit: VeciCredit | null;
  veciRetentionRate: number;
  veciConsecutiveGoodPayments: number;
  requestVeciCredit: (amount: number, months: number) => boolean;
  simulateVeciQRSale: (amount: number) => { commission: number; retentionAmt: number; netAmt: number; isPaidOff: boolean };
  payVeciCreditManual: () => void;
  setVeciSalesAverage: (amount: number) => void;
  activeProfileMode: "personal" | "veci";
  setActiveProfileMode: React.Dispatch<React.SetStateAction<"personal" | "veci">>;
  veciDailySales: number;
  setVeciDailySales: React.Dispatch<React.SetStateAction<number>>;
  tryEarnCoinsFromTransfer: () => CoinAwardResult;
  tryEarnCoinsFromRecharge: () => CoinAwardResult;
  tryEarnCoinsFromQrPay: () => CoinAwardResult;
  coinsEarnedToday: Record<CoinEarningSource, number>;
  balanceHoldSince: number | null;
  savingsCoinMsRemaining: number;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const INITIAL_VECI_SALES = 0;

export function AppContextProvider({ children }: { children: React.ReactNode }) {
  const [balance, setBalance] = useState<number>(0.0);
  const [activeProfileMode, setActiveProfileMode] = useState<"personal" | "veci">("personal");
  const [chanceAvailableBalance, setChanceAvailableBalance] = useState<number>(0.0);
  const [veciChanceAvailableBalance, setVeciChanceAvailableBalance] = useState<number>(0.0);
  const [coins, setCoins] = useState<number>(10.0);
  const [xp, setXp] = useState<number>(45);
  const [pulsoScore, setPulsoScore] = useState<number>(48);
  const [ruletaSpins, setRuletaSpins] = useState<number>(1);
  const [activeCredit, setActiveCredit] = useState<Credit | null>(null);

  const [selectedBorder, setSelectedBorder] = useState<string>("none");
  const [selectedAccessory, setSelectedAccessory] = useState<string>("none");
  const [unlockedCosmetics, setUnlockedCosmetics] = useState<string[]>([
    "border_silver",
    "accessory_star",
  ]);
  const [chestsOpenedToday, setChestsOpenedToday] = useState<Record<string, boolean>>({});
  const [chestCooldownUntil, setChestCooldownUntil] = useState<number>(0);
  const [chestResetDate, setChestResetDate] = useState<string>(getTodayDateKey());
  const [coinsEarnedToday, setCoinsEarnedToday] = useState(createEmptyDailyCoinEarnings);
  const [coinsResetDate, setCoinsResetDate] = useState<string>(getTodayDateKey());
  const [balanceHoldSince, setBalanceHoldSince] = useState<number | null>(null);
  const [lastBalanceHoldCoinAt, setLastBalanceHoldCoinAt] = useState<number>(0);
  const [savingsCoinTicker, setSavingsCoinTicker] = useState<number>(Date.now());
  const [isBalanceHidden, setIsBalanceHidden] = useState<boolean>(false);

  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: "t1",
      type: "qr_pay",
      description: "Cardenas Enriquez Sonia Mireya",
      amount: -1.0,
      date: "Hoy 07:44 am",
    },
    {
      id: "t2",
      type: "recharge",
      description: "Recarga de saldo",
      amount: 1.0,
      date: "Hoy 07:44 am",
    },
  ]);

  const [justPaidCredit, setJustPaidCredit] = useState<boolean>(false);
  const [paymentRepaySpeed, setPaymentRepaySpeed] = useState<"early" | "late" | null>(null);

  const [veciSalesAverage, setVeciSalesAverageState] = useState<number>(INITIAL_VECI_SALES);
  const [veciCreditLimit, setVeciCreditLimit] = useState<number>(
    computeVeciCreditLimit(INITIAL_VECI_SALES)
  );
  const [veciActiveCredit, setVeciActiveCredit] = useState<VeciCredit | null>(null);
  const [veciConsecutiveGoodPayments, setVeciConsecutiveGoodPayments] = useState<number>(0);
  const [veciDailySales, setVeciDailySales] = useState<number>(0);

  const maxChanceAmount = getMaxChanceAmount(pulsoScore);
  const userCanRequestChance = canRequestChance(pulsoScore);

  const veciRetentionRate = useMemo(
    () => getVeciRetentionRate(pulsoScore, veciConsecutiveGoodPayments),
    [pulsoScore, veciConsecutiveGoodPayments]
  );

  const setVeciSalesAverage = useCallback((amount: number) => {
    setVeciSalesAverageState(amount);
    setVeciCreditLimit(computeVeciCreditLimit(amount));
  }, []);

  // Reinicio diario del cofre y contadores de coins
  useEffect(() => {
    const today = getTodayDateKey();
    if (chestResetDate !== today) {
      setChestsOpenedToday({});
      setChestResetDate(today);
    }
    if (coinsResetDate !== today) {
      setCoinsEarnedToday(createEmptyDailyCoinEarnings());
      setCoinsResetDate(today);
    }
  }, [chestResetDate, coinsResetDate]);

  const applyCoinReward = useCallback(
    (source: CoinEarningSource, requested: number): CoinAwardResult => {
      let award: CoinAwardResult = {
        granted: 0,
        requested,
        source,
        limited: requested > 0,
        reason: requested > 0 ? "Sin cupo disponible." : undefined,
      };

      setCoinsEarnedToday((prev) => {
        const total = (Object.keys(prev) as CoinEarningSource[]).reduce(
          (sum, key) => sum + prev[key],
          0
        );
        award = computeCoinAward(source, requested, prev, total);
        if (award.granted <= 0) return prev;
        return { ...prev, [source]: prev[source] + award.granted };
      });

      if (award.granted > 0) {
        setCoins((c) => c + award.granted);
      }
      return award;
    },
    []
  );

  const tryEarnCoinsFromTransfer = useCallback(
    () => applyCoinReward("transfer", COIN_REWARD_PER_EVENT.transfer),
    [applyCoinReward]
  );

  const tryEarnCoinsFromRecharge = useCallback(
    () => applyCoinReward("recharge", COIN_REWARD_PER_EVENT.recharge),
    [applyCoinReward]
  );

  const tryEarnCoinsFromQrPay = useCallback(
    () => applyCoinReward("qr_pay", COIN_REWARD_PER_EVENT.qr_pay),
    [applyCoinReward]
  );

  const savingsCoinMsRemaining = useMemo(() => {
    if (balance < MIN_BALANCE_FOR_SAVINGS_COIN || !balanceHoldSince) {
      return BALANCE_HOLD_DURATION_MS;
    }
    const heldMs = savingsCoinTicker - balanceHoldSince;
    const cooldownOk =
      lastBalanceHoldCoinAt === 0 ||
      savingsCoinTicker - lastBalanceHoldCoinAt >= BALANCE_HOLD_DURATION_MS;
    if (!cooldownOk) {
      return Math.max(
        0,
        BALANCE_HOLD_DURATION_MS - (savingsCoinTicker - lastBalanceHoldCoinAt)
      );
    }
    return Math.max(0, BALANCE_HOLD_DURATION_MS - heldMs);
  }, [balance, balanceHoldSince, lastBalanceHoldCoinAt, savingsCoinTicker]);

  // Saldo ≥ $5: inicia/reinicia conteo; < $5: pierde progreso
  useEffect(() => {
    if (balance >= MIN_BALANCE_FOR_SAVINGS_COIN) {
      setBalanceHoldSince((prev) => prev ?? Date.now());
    } else {
      setBalanceHoldSince(null);
    }
  }, [balance]);

  // Revisa cada 30s si cumplió 24 h continuas con ≥ $5
  useEffect(() => {
    const interval = setInterval(() => setSavingsCoinTicker(Date.now()), 30_000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (balance < MIN_BALANCE_FOR_SAVINGS_COIN || !balanceHoldSince) return;

    const heldMs = Date.now() - balanceHoldSince;
    if (heldMs < BALANCE_HOLD_DURATION_MS) return;

    const sinceLastCoin = Date.now() - lastBalanceHoldCoinAt;
    if (lastBalanceHoldCoinAt > 0 && sinceLastCoin < BALANCE_HOLD_DURATION_MS) return;

    const award = applyCoinReward("balance_hold", 1);
    if (award.granted > 0) {
      setLastBalanceHoldCoinAt(Date.now());
      setBalanceHoldSince(Date.now());
      const now = new Date().toLocaleTimeString("es-EC", {
        hour: "2-digit",
        minute: "2-digit",
      });
      const savingsTx: Transaction = {
        id: `tx_savings_${Date.now()}`,
        type: "balance_hold",
        description: "Bono Ahorro: $5+ en cuenta por 24 h",
        amount: award.granted,
        date: `Hoy | ${now}`,
      };
      setTransactions((prev) => [savingsTx, ...prev]);
    }
  }, [
    balance,
    balanceHoldSince,
    lastBalanceHoldCoinAt,
    savingsCoinTicker,
    applyCoinReward,
  ]);

  // Cosméticos por nivel deuna
  useEffect(() => {
    setUnlockedCosmetics((prev) => {
      const next = new Set(prev);
      if (pulsoScore >= 91) next.add("border_gold_pulse");
      if (pulsoScore >= 100) next.add("accessory_diamond");
      return Array.from(next);
    });
  }, [pulsoScore]);

  useEffect(() => {
    if (xp >= 100) {
      setXp((prev) => prev - 100);
      setRuletaSpins((prev) => prev + 1);
    }
  }, [xp]);

  const clearJustPaidCredit = () => {
    setJustPaidCredit(false);
    setPaymentRepaySpeed(null);
  };

  const updatePulsoScore = (change: number) => {
    setPulsoScore((prev) => Math.min(100, Math.max(10, prev + change)));
  };

  const earnXP = (amount: number) => {
    setXp((prev) => prev + amount);
  };

  const checkChanceUnlocked = (amount: ChanceAmount) =>
    isChanceAmountUnlocked(amount, pulsoScore);

  const rechargeBalance = (amount: number, forceRepaymentDay?: number) => {
    const now = new Date().toLocaleTimeString("es-EC", { hour: "2-digit", minute: "2-digit" });

    if (activeCredit) {
      const totalDue = activeCredit.total;
      const repayDay =
        forceRepaymentDay !== undefined ? forceRepaymentDay : CHANCE_DEFAULT_SIMULATED_PAY_DAY;
      const isEarly = isEarlyChanceRepayment(repayDay);
      setPaymentRepaySpeed(isEarly ? "early" : "late");

      if (amount >= totalDue) {
        const remainingRecharge = amount - totalDue;
        setBalance((prev) => prev + remainingRecharge);
        setActiveCredit(null);
        setChanceAvailableBalance(0.0);
        setJustPaidCredit(true);
        earnXP(35);
        updatePulsoScore(isEarly ? 15 : 8);

        const repaymentTx: Transaction = {
          id: `tx_rep_${Date.now()}`,
          type: "autopay",
          description: `Cobro Auto. Dame un Chance (Simulado Día ${repayDay})`,
          amount: -totalDue,
          xpAwarded: 35,
          date: `Hoy | ${now}`,
        };
        const rechargeTx: Transaction = {
          id: `tx_rec_${Date.now()}`,
          type: "recharge",
          description: `Recarga exitosa (+ $${amount.toFixed(2)} d!)`,
          amount: amount,
          date: `Hoy | ${now}`,
        };
        setTransactions((prev) => [rechargeTx, repaymentTx, ...prev]);
      } else {
        const updatedTotal = totalDue - amount;
        setActiveCredit((prev) => (prev ? { ...prev, total: updatedTotal } : null));

        const partialTx: Transaction = {
          id: `tx_part_${Date.now()}`,
          type: "autopay",
          description: `Cobro Auto. Parcial (Simulado Día ${repayDay})`,
          amount: -amount,
          date: `Hoy | ${now}`,
        };
        const rechargeTx: Transaction = {
          id: `tx_rec_${Date.now()}`,
          type: "recharge",
          description: `Recarga exitosa (+ $${amount.toFixed(2)} d!)`,
          amount: amount,
          date: `Hoy | ${now}`,
        };
        setTransactions((prev) => [rechargeTx, partialTx, ...prev]);
      }
    } else if (veciActiveCredit) {
      const totalDue = veciActiveCredit.remaining;
      if (amount >= totalDue) {
        const remainingRecharge = amount - totalDue;
        setBalance((prev) => prev + remainingRecharge);
        setVeciActiveCredit(null);
        setVeciChanceAvailableBalance(0.0);
        setVeciConsecutiveGoodPayments((prev) => prev + 1);
        setJustPaidCredit(true);
        earnXP(50);
        updatePulsoScore(20);

        const repaymentTx: Transaction = {
          id: `tx_vrep_${Date.now()}`,
          type: "autopay",
          description: "Cobro Auto. Crédito Veci (Recarga)",
          amount: -totalDue,
          xpAwarded: 50,
          date: `Hoy | ${now}`,
        };
        const rechargeTx: Transaction = {
          id: `tx_rec_${Date.now()}`,
          type: "recharge",
          description: `Recarga exitosa (+ $${amount.toFixed(2)} d!)`,
          amount: amount,
          date: `Hoy | ${now}`,
        };
        setTransactions((prev) => [rechargeTx, repaymentTx, ...prev]);
      } else {
        const updatedTotal = totalDue - amount;
        setVeciActiveCredit((prev) => (prev ? { ...prev, remaining: updatedTotal } : null));

        const partialTx: Transaction = {
          id: `tx_vpart_${Date.now()}`,
          type: "autopay",
          description: "Cobro Auto. Parcial Veci (Recarga)",
          amount: -amount,
          date: `Hoy | ${now}`,
        };
        const rechargeTx: Transaction = {
          id: `tx_rec_${Date.now()}`,
          type: "recharge",
          description: `Recarga exitosa (+ $${amount.toFixed(2)} d!)`,
          amount: amount,
          date: `Hoy | ${now}`,
        };
        setTransactions((prev) => [rechargeTx, partialTx, ...prev]);
      }
    } else {
      setBalance((prev) => prev + amount);
      earnXP(5);
      const rechargeTx: Transaction = {
        id: `tx_rec_${Date.now()}`,
        type: "recharge",
        description: `Recarga exitosa (+ $${amount.toFixed(2)} d!)`,
        amount: amount,
        xpAwarded: 5,
        date: `Hoy | ${now}`,
      };
      setTransactions((prev) => [rechargeTx, ...prev]);
    }
    tryEarnCoinsFromRecharge();
  };

  const requestSalvavidas = (amount: number): boolean => {
    if (activeCredit) return false;
    if (!userCanRequestChance) return false;

    const allowed = CHANCE_AMOUNTS.find((a) => a === amount);
    if (!allowed || !checkChanceUnlocked(allowed)) return false;

    const { platformFee, total } = getChanceLoanTotal(amount);
    const now = new Date().toLocaleTimeString("es-EC", { hour: "2-digit", minute: "2-digit" });

    setActiveCredit({
      amount,
      interest: platformFee,
      total,
      date: `Hoy | ${now}`,
      daysRemaining: CHANCE_LOAN_TERM_DAYS,
    });
    setChanceAvailableBalance(amount);
    updatePulsoScore(-3);
    earnXP(10);

    const loanTx: Transaction = {
      id: `tx_loan_${Date.now()}`,
      type: "salvavidas",
      description: `Dame un Chance Recibido ($${amount.toFixed(2)})`,
      amount: amount,
      xpAwarded: 10,
      date: `Hoy | ${now}`,
    };
    setTransactions((prev) => [loanTx, ...prev]);
    return true;
  };

  const paySalvavidas = (forceRepaymentDay?: number) => {
    if (!activeCredit) return;
    if (balance < activeCredit.total) return;

    const now = new Date().toLocaleTimeString("es-EC", { hour: "2-digit", minute: "2-digit" });
    const totalDue = activeCredit.total;
    const repayDay =
      forceRepaymentDay !== undefined ? forceRepaymentDay : CHANCE_DEFAULT_SIMULATED_PAY_DAY;
    const isEarly = isEarlyChanceRepayment(repayDay);
    setPaymentRepaySpeed(isEarly ? "early" : "late");

    setBalance((prev) => prev - totalDue);
    setActiveCredit(null);
    setChanceAvailableBalance(0.0);
    setJustPaidCredit(true);
    earnXP(35);
    updatePulsoScore(isEarly ? 15 : 5);

    const payTx: Transaction = {
      id: `tx_manual_pay_${Date.now()}`,
      type: "autopay",
      description: `Pago Manual Dame un Chance (Día ${repayDay})`,
      amount: -totalDue,
      xpAwarded: 35,
      date: `Hoy | ${now}`,
    };
    setTransactions((prev) => [payTx, ...prev]);
  };

  const openChest = (tier: ChestTier) => {
    if (Date.now() < chestCooldownUntil) {
      return { xp: 0, coins: 0, spins: 0 };
    }

    const allowedTier = getChestTierForPulso(pulsoScore);
    const effectiveTier = tier === allowedTier ? tier : allowedTier;
    const rewards = CHEST_REWARDS[effectiveTier];

    setChestsOpenedToday((prev) => ({ ...prev, [effectiveTier]: true }));
    setChestCooldownUntil(Date.now() + CHEST_COOLDOWN_MS);
    const now = new Date().toLocaleTimeString("es-EC", { hour: "2-digit", minute: "2-digit" });

    let cosmeticReward: string | undefined;
    if (effectiveTier === "plata") {
      if (!unlockedCosmetics.includes("border_green") && Math.random() < rewards.cosmeticChance) {
        cosmeticReward = "border_green";
      }
    } else if (effectiveTier === "diamante") {
      const possibleCosmetics = ["border_fire", "accessory_crown", "accessory_chef"].filter(
        (c) => !unlockedCosmetics.includes(c)
      );
      if (possibleCosmetics.length > 0 && Math.random() < rewards.cosmeticChance) {
        cosmeticReward = possibleCosmetics[Math.floor(Math.random() * possibleCosmetics.length)];
      }
    }

    const coinAward = applyCoinReward("chest", rewards.coins);
    const coinGain = coinAward.granted;

    earnXP(rewards.xp);
    if (rewards.spins > 0) setRuletaSpins((prev) => prev + rewards.spins);
    if (cosmeticReward) {
      setUnlockedCosmetics((prev) => [...prev, cosmeticReward!]);
    }

    const chestTx: Transaction = {
      id: `tx_chest_${Date.now()}`,
      type: "chest",
      description: `Cofre ${effectiveTier.charAt(0).toUpperCase() + effectiveTier.slice(1)} abierto!`,
      amount: coinGain,
      xpAwarded: rewards.xp,
      date: `Hoy | ${now}`,
    };
    setTransactions((prev) => [chestTx, ...prev]);

    return {
      xp: rewards.xp,
      coins: coinGain,
      spins: rewards.spins,
      cosmetic: cosmeticReward,
    };
  };

  const spinRuleta = (forcedPrizeIndex?: number): RuletaSpinResult => {
    if (ruletaSpins <= 0) {
      return { label: "Sin giros", type: "empty", value: 0, index: 0 };
    }

    setRuletaSpins((prev) => prev - 1);
    const now = new Date().toLocaleTimeString("es-EC", { hour: "2-digit", minute: "2-digit" });
    const prizeIndex =
      forcedPrizeIndex !== undefined
        ? Math.max(0, Math.min(RULETA_PRIZES.length - 1, forcedPrizeIndex))
        : Math.floor(Math.random() * RULETA_PRIZES.length);
    const prize = RULETA_PRIZES[prizeIndex];

    let coinsGranted = 0;
    if (prize.type === "coins") {
      const award = applyCoinReward("ruleta", prize.value as number);
      coinsGranted = award.granted;
    }

    const ruletaTx: Transaction = {
      id: `tx_ruleta_${Date.now()}`,
      type: "ruleta",
      description: `Giro de Ruleta: ${prize.label}`,
      amount: coinsGranted,
      date: `Hoy | ${now}`,
    };
    setTransactions((prev) => [ruletaTx, ...prev]);

    return { ...prize, index: prizeIndex };
  };

  const equipCosmetic = (type: "border" | "accessory", id: string) => {
    if (id !== "none" && !unlockedCosmetics.includes(id)) return;
    if (type === "border") setSelectedBorder(id);
    else setSelectedAccessory(id);
  };

  const payWithQR = (amount: number) => {
    const totalAvailable = balance + chanceAvailableBalance;
    if (totalAvailable < amount) return false;

    const now = new Date().toLocaleTimeString("es-EC", { hour: "2-digit", minute: "2-digit" });
    
    // Deduct from chanceAvailableBalance first
    let remainingAmount = amount;
    if (chanceAvailableBalance >= remainingAmount) {
      setChanceAvailableBalance((prev) => prev - remainingAmount);
      remainingAmount = 0;
    } else {
      remainingAmount -= chanceAvailableBalance;
      setChanceAvailableBalance(0.0);
    }
    
    // Deduct remainder from balance
    if (remainingAmount > 0) {
      setBalance((prev) => prev - remainingAmount);
    }

    earnXP(3);
    updatePulsoScore(2);

    const qrTx: Transaction = {
      id: `tx_qr_${Date.now()}`,
      type: "qr_pay",
      description: "Pago QR en Comercio Afiliado",
      amount: -amount,
      xpAwarded: 3,
      date: `Hoy | ${now}`,
    };
    setTransactions((prev) => [qrTx, ...prev]);
    tryEarnCoinsFromQrPay();
    return true;
  };

  const requestVeciCredit = (amount: number, months: number): boolean => {
    if (veciActiveCredit) return false;
    if (amount < 1 || amount > veciCreditLimit) return false;

    const { interest, insurance, total } = calculateVeciLoanTotals(amount, months);
    const now = new Date().toLocaleTimeString("es-EC", { hour: "2-digit", minute: "2-digit" });
    const retention = getVeciRetentionRate(pulsoScore, veciConsecutiveGoodPayments);

    setVeciActiveCredit({
      amount,
      interest,
      insurance,
      total,
      remaining: total,
      date: `Hoy | ${now}`,
      retentionRate: retention,
      months,
    });
    setVeciChanceAvailableBalance(amount);
    earnXP(20);
    updatePulsoScore(5);

    const vLoanTx: Transaction = {
      id: `tx_vloan_${Date.now()}`,
      type: "veci_loan",
      description: `Crédito Veci recibido ($${amount.toFixed(2)} - ${months} ${months === 1 ? "mes" : "meses"})`,
      amount: amount,
      xpAwarded: 20,
      date: `Hoy | ${now}`,
    };
    setTransactions((prev) => [vLoanTx, ...prev]);
    return true;
  };

  const simulateVeciQRSale = (amount: number) => {
    const now = new Date().toLocaleTimeString("es-EC", { hour: "2-digit", minute: "2-digit" });

    const commission = 0;
    let retentionAmt = 0;
    let actualCredited = amount;
    let isPaidOff = false;

    // Increment simulated daily sales in context
    setVeciDailySales((prev) => prev + amount);
    earnXP(5); // QR sales award XP to the merchant!

    if (veciActiveCredit) {
      retentionAmt = amount * veciActiveCredit.retentionRate;
      actualCredited = amount - retentionAmt;
      const newRemaining = Math.max(0, veciActiveCredit.remaining - retentionAmt);
      isPaidOff = newRemaining === 0;

      setBalance((prev) => prev + actualCredited);

      if (isPaidOff) {
        setVeciActiveCredit(null);
        setVeciChanceAvailableBalance(0.0);
        setVeciConsecutiveGoodPayments((prev) => prev + 1);
        earnXP(50);
        updatePulsoScore(20);
        confetti({
          particleCount: 120,
          colors: ["#7c3aed", "#eab308", "#10b981"],
        });
      } else {
        setVeciActiveCredit((prev) => (prev ? { ...prev, remaining: newRemaining } : null));
        // Business credit spent decreases proportionally
        setVeciChanceAvailableBalance((prev) => Math.max(0, prev - retentionAmt));
      }

      const retentionTx: Transaction = {
        id: `tx_vret_${Date.now()}`,
        type: "veci_repayment",
        description: `Retención Automática QR Ventas (${(veciActiveCredit.retentionRate * 100).toFixed(0)}%)`,
        amount: -retentionAmt,
        date: `Hoy | ${now}`,
      };
      const saleTx: Transaction = {
        id: `tx_vsale_${Date.now()}`,
        type: "recharge",
        description: `Venta QR Recibida`,
        amount: amount,
        date: `Hoy | ${now}`,
      };
      setTransactions((prev) => [saleTx, retentionTx, ...prev]);
    } else {
      setBalance((prev) => prev + actualCredited);
      earnXP(2);
      const saleTx: Transaction = {
        id: `tx_vsale_${Date.now()}`,
        type: "recharge",
        description: `Venta QR Recibida`,
        amount: actualCredited,
        date: `Hoy | ${now}`,
      };
      setTransactions((prev) => [saleTx, ...prev]);
    }

    return { commission, retentionAmt, netAmt: actualCredited, isPaidOff };
  };

  const payVeciCreditManual = () => {
    if (!veciActiveCredit) return;
    if (balance < veciActiveCredit.remaining) return;

    const now = new Date().toLocaleTimeString("es-EC", { hour: "2-digit", minute: "2-digit" });
    const amountPaid = veciActiveCredit.remaining;

    setBalance((prev) => prev - amountPaid);
    setVeciActiveCredit(null);
    setVeciChanceAvailableBalance(0.0);
    setVeciConsecutiveGoodPayments((prev) => prev + 1);
    earnXP(50);
    updatePulsoScore(20);
    setJustPaidCredit(true);

    const manualPayTx: Transaction = {
      id: `tx_vmanual_${Date.now()}`,
      type: "veci_repayment",
      description: "Pago Manual Crédito Veci",
      amount: -amountPaid,
      xpAwarded: 50,
      date: `Hoy | ${now}`,
    };
    setTransactions((prev) => [manualPayTx, ...prev]);
  };

  const buyShopItem = (
    itemId: string,
    cost: number,
    rewardType: "spins" | "cosmetic",
    rewardValue: number | string
  ): boolean => {
    if (coins < cost) return false;
    setCoins((prev) => prev - cost);
    if (rewardType === "spins") {
      setRuletaSpins((prev) => prev + (rewardValue as number));
    } else if (rewardType === "cosmetic") {
      const id = rewardValue as string;
      if (!unlockedCosmetics.includes(id)) {
        setUnlockedCosmetics((prev) => [...prev, id]);
      }
    }

    const now = new Date().toLocaleTimeString("es-EC", { hour: "2-digit", minute: "2-digit" });
    const shopTx: Transaction = {
      id: `tx_shop_${Date.now()}`,
      type: "shop",
      description: `Canje de Tienda: ${itemId}`,
      amount: -cost,
      date: `Hoy | ${now}`,
    };
    setTransactions((prev) => [shopTx, ...prev]);
    return true;
  };

  return (
    <AppContext.Provider
      value={{
        balance,
        coins,
        xp,
        chanceAvailableBalance,
        veciChanceAvailableBalance,
        pulsoScore,
        maxChanceAmount,
        canRequestChance: userCanRequestChance,
        ruletaSpins,
        activeCredit,
        selectedBorder,
        selectedAccessory,
        unlockedCosmetics,
        chestsOpenedToday,
        chestCooldownUntil,
        setChestCooldownUntil,
        transactions,
        justPaidCredit,
        paymentRepaySpeed,
        clearJustPaidCredit,
        rechargeBalance,
        requestSalvavidas,
        paySalvavidas,
        openChest,
        spinRuleta,
        equipCosmetic,
        payWithQR,
        updatePulsoScore,
        isBalanceHidden,
        setIsBalanceHidden,
        buyShopItem,
        isChanceAmountUnlocked: checkChanceUnlocked,

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
        setVeciDailySales,
        tryEarnCoinsFromTransfer,
        tryEarnCoinsFromRecharge,
        tryEarnCoinsFromQrPay,
        coinsEarnedToday,
        balanceHoldSince,
        savingsCoinMsRemaining,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppContextProvider");
  }
  return context;
}
