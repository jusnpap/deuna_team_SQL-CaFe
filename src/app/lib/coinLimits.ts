/** Límites diarios de Deuna Coins por fuente para evitar sobreexplotación. */

export type CoinEarningSource =
  | "transfer"
  | "recharge"
  | "qr_pay"
  | "chest"
  | "ruleta"
  | "balance_hold";

/** Saldo mínimo en billetera para iniciar el conteo de ahorro. */
export const MIN_BALANCE_FOR_SAVINGS_COIN = 5;
/** Tiempo continuo con saldo ≥ mínimo para obtener 1 coin. */
export const BALANCE_HOLD_DURATION_MS = 24 * 60 * 60 * 1000;

export const COIN_LIMITS: Record<CoinEarningSource, number> = {
  transfer: 6,
  recharge: 8,
  qr_pay: 10,
  chest: 4,
  ruleta: 12,
  balance_hold: 1,
};

export const COIN_DAILY_TOTAL_CAP = 30;

/** Recompensa por evento (antes de aplicar límites). */
export const COIN_REWARD_PER_EVENT: Record<
  Exclude<CoinEarningSource, "chest" | "ruleta">,
  number
> = {
  transfer: 1,
  recharge: 1,
  qr_pay: 1,
};

export const CHEST_COOLDOWN_MS = 12 * 60 * 60 * 1000;

export type CoinAwardResult = {
  granted: number;
  requested: number;
  source: CoinEarningSource;
  limited: boolean;
  reason?: string;
};

export function createEmptyDailyCoinEarnings(): Record<CoinEarningSource, number> {
  return {
    transfer: 0,
    recharge: 0,
    qr_pay: 0,
    chest: 0,
    ruleta: 0,
    balance_hold: 0,
  };
}

export function computeCoinAward(
  source: CoinEarningSource,
  requested: number,
  earnedBySource: Record<CoinEarningSource, number>,
  earnedTotal: number
): CoinAwardResult {
  if (requested <= 0) {
    return { granted: 0, requested: 0, source, limited: false };
  }

  const sourceCap = COIN_LIMITS[source];
  const sourceRemaining = Math.max(0, sourceCap - earnedBySource[source]);
  const totalRemaining = Math.max(0, COIN_DAILY_TOTAL_CAP - earnedTotal);
  const granted = Math.min(requested, sourceRemaining, totalRemaining);

  let reason: string | undefined;
  if (granted < requested) {
    if (totalRemaining <= 0) {
      reason = `Límite diario total de ${COIN_DAILY_TOTAL_CAP} coins alcanzado.`;
    } else if (sourceRemaining <= 0) {
      reason = `Límite diario de ${source} (${sourceCap} coins) alcanzado.`;
    } else {
      reason = "Límite parcial aplicado por cupo diario.";
    }
  }

  return {
    granted,
    requested,
    source,
    limited: granted < requested,
    reason,
  };
}
