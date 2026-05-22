/** Reglas de negocio: Pulso Deuna (personas) y cupo IA (Veci). */

export const CHANCE_AMOUNTS = [3.5, 7.5, 10] as const;
export type ChanceAmount = (typeof CHANCE_AMOUNTS)[number];

export type ChestTier = "bronce" | "plata" | "diamante";

export type RuletaPrize = {
  label: string;
  type: "coins" | "cosmetic" | "xp";
  value: number | string;
};

/** Premios en el mismo orden que los 8 segmentos de la ruleta (sentido horario desde arriba). */
export const RULETA_PRIZES: readonly RuletaPrize[] = [
  { label: "+$2.00 Coins", type: "coins", value: 2 },
  { label: "Borde Arcoíris 🌈", type: "cosmetic", value: "border_rainbow" },
  { label: "Corona de Elite 👑", type: "cosmetic", value: "accessory_crown" },
  { label: "Sombrero Vaquero 🤠", type: "cosmetic", value: "accessory_cowboy" },
  { label: "+$5.00 Coins", type: "coins", value: 5 },
  { label: "+20 XP", type: "xp", value: 20 },
  { label: "Borde de Fuego 🔥", type: "cosmetic", value: "border_fire" },
  { label: "+50 XP Bonus", type: "xp", value: 50 },
] as const;

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

/** Monto máximo de Dame un Chance según Pulso Deuna. */
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

/** Retención QR: 6% con buen historial o Pulso alto; si no, 8%. */
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
