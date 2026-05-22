/** Reglas de negocio: Tu nivel deuna (personas) y cupo IA (Veci). */

export const CHANCE_AMOUNTS = [3.5, 7.5, 10] as const;
export type ChanceAmount = (typeof CHANCE_AMOUNTS)[number];

/** Plazo de liquidación del nanocrédito personal (Dame un Chance). */
export const CHANCE_LOAN_TERM_DAYS = 7;
export const CHANCE_PLATFORM_FEE_USD = 0.25;
/** Pago simulado temprano (días 1–5) vs. al vencimiento (día 7). */
export const CHANCE_EARLY_PAYMENT_MAX_DAY = 5;
export const CHANCE_LATE_PAYMENT_DAY = CHANCE_LOAN_TERM_DAYS;
export const CHANCE_DEFAULT_SIMULATED_PAY_DAY = 5;

export function isEarlyChanceRepayment(repayDay: number): boolean {
  return repayDay <= CHANCE_EARLY_PAYMENT_MAX_DAY;
}

export function getChanceLoanTotal(amount: number): {
  platformFee: number;
  total: number;
} {
  return {
    platformFee: CHANCE_PLATFORM_FEE_USD,
    total: amount + CHANCE_PLATFORM_FEE_USD,
  };
}

export type ChestTier = "bronce" | "plata" | "diamante";

export type RuletaPrize = {
  label: string;
  type: "coins" | "cosmetic" | "xp" | "empty";
  value: number | string;
};

/** 8 segmentos: solo 1 y 3 coins + espacios vacíos (sentido horario desde arriba). */
export const RULETA_PRIZES: readonly RuletaPrize[] = [
  { label: "+1 Coin", type: "coins", value: 1 },
  { label: "Sin premio", type: "empty", value: 0 },
  { label: "+3 Coins", type: "coins", value: 3 },
  { label: "Sin premio", type: "empty", value: 0 },
  { label: "+1 Coin", type: "coins", value: 1 },
  { label: "+3 Coins", type: "coins", value: 3 },
  { label: "Sin premio", type: "empty", value: 0 },
  { label: "+1 Coin", type: "coins", value: 1 },
] as const;

/** Recompensas base del cofre (monedas sujetas a límites diarios en AppContext). */
export const CHEST_REWARDS: Record<
  ChestTier,
  { xp: number; coins: number; spins: number; cosmeticChance: number }
> = {
  bronce: { xp: 10, coins: 1, spins: 0, cosmeticChance: 0 },
  plata: { xp: 20, coins: 1, spins: 0, cosmeticChance: 0.12 },
  diamante: { xp: 35, coins: 2, spins: 0, cosmeticChance: 0.18 },
};

export const RULETA_SEGMENT_DEG = 360 / RULETA_PRIZES.length;

export function getRotationForPrizeIndex(
  prizeIndex: number,
  currentRotation: number
): number {
  const segmentCenter = prizeIndex * RULETA_SEGMENT_DEG + RULETA_SEGMENT_DEG / 2;
  const alignUnderPointer = 360 - segmentCenter;
  return currentRotation + 5 * 360 + alignUnderPointer;
}

export function getPulsoTierLabel(score: number): string {
  if (score <= 55) return "Bronce";
  if (score <= 75) return "Plata";
  return "Diamante";
}

export function canRequestChance(pulsoScore: number): boolean {
  return pulsoScore > 30;
}

/** Monto máximo de Dame un Chance según Tu nivel deuna. */
export function getMaxChanceAmount(pulsoScore: number): ChanceAmount | 0 {
  if (pulsoScore <= 30) return 0;
  if (pulsoScore <= 55) return 3.5;
  if (pulsoScore <= 75) return 7.5;
  return 10;
}

export function isChanceAmountUnlocked(
  amount: ChanceAmount,
  pulsoScore: number
): boolean {
  const max = getMaxChanceAmount(pulsoScore);
  if (max === 0) return false;
  return amount <= max;
}

export function getChestTierForPulso(pulsoScore: number): ChestTier {
  if (pulsoScore < 56) return "bronce";
  if (pulsoScore < 76) return "plata";
  return "diamante";
}

/** Cupo Veci según ventas mensuales promedio (IA), entre $50 y $300. */
export function computeVeciCreditLimit(monthlySalesAverage: number): number {
  const raw = Math.round((monthlySalesAverage * 0.5) / 5) * 5;
  return Math.min(300, Math.max(50, raw));
}

/** Simula promedio de ventas QR de los últimos 3 meses (demo determinística con variación). */
export function simulateThreeMonthSalesAverage(seedBase = 520): number {
  const jitter = () => 0.88 + Math.random() * 0.22;
  const m1 = Math.round(seedBase * jitter());
  const m2 = Math.round(seedBase * jitter());
  const m3 = Math.round(seedBase * jitter());
  return Math.round((m1 + m2 + m3) / 3);
}

export function calculateVeciLoanTotals(
  amount: number,
  months: number
): { interest: number; insurance: number; total: number } {
  const interest = amount * 0.28 * ((months * 30) / 360);
  const insurance = amount * 0.001 * months;
  return { interest, insurance, total: amount + interest + insurance };
}

/** Retención QR: 6% con buen historial o nivel deuna alto; si no, 8%. */
export function getVeciRetentionRate(
  pulsoScore: number,
  consecutiveGoodPayments: number
): number {
  if (consecutiveGoodPayments >= 1 || pulsoScore >= 76) return 0.06;
  return 0.08;
}

export function getTodayDateKey(): string {
  return new Date().toISOString().slice(0, 10);
}
