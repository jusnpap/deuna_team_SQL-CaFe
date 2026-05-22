import { ArrowLeft, Eye, EyeOff, ExternalLink, PiggyBank } from "lucide-react";
import { useNavigate } from "react-router";
import { Card } from "../components/ui/card";
import { useApp } from "../context/AppContext";
import { MIN_BALANCE_FOR_SAVINGS_COIN } from "../lib/coinLimits";

function formatCooldown(ms: number): string {
  const h = Math.floor(ms / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export function Billetera() {
  const navigate = useNavigate();
  const { balance, isBalanceHidden, setIsBalanceHidden, savingsCoinMsRemaining } = useApp();

  const formatMoney = (value: number) =>
    value.toLocaleString("es-EC", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const qualifiesForSavings = balance >= MIN_BALANCE_FOR_SAVINGS_COIN;
  const savingsReady = qualifiesForSavings && savingsCoinMsRemaining === 0;

  return (
    <div className="min-h-full bg-gray-50">
      <div className="bg-white px-6 py-4 flex items-center justify-between">
        <button onClick={() => navigate(-1)}>
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-semibold">Billetera</h1>
        <button onClick={() => setIsBalanceHidden(!isBalanceHidden)} type="button">
          {isBalanceHidden ? <EyeOff className="w-6 h-6" /> : <Eye className="w-6 h-6" />}
        </button>
      </div>

      <div className="px-6 py-6">
        <Card className="bg-gradient-to-br from-amber-50 to-purple-50 rounded-2xl p-4 border border-amber-100 mb-6 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
              <PiggyBank className="w-5 h-5 text-amber-700" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-extrabold text-purple-950 mb-1">Bono Ahorro Deuna Coins</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Mantén al menos <strong>${MIN_BALANCE_FOR_SAVINGS_COIN.toFixed(2)}</strong> en tu cuenta durante{" "}
                <strong>24 horas seguidas</strong> y recibe <strong>+1 Coin</strong> (máximo 1 por día).
              </p>
              <p className="text-[10px] font-bold mt-2 text-purple-700">
                {!qualifiesForSavings
                  ? `Te faltan $${(MIN_BALANCE_FOR_SAVINGS_COIN - balance).toFixed(2)} para iniciar el conteo.`
                  : savingsReady
                  ? "¡Listo! Tu coin se acreditará en breve si no alcanzaste el límite diario."
                  : `Progreso: faltan ${formatCooldown(savingsCoinMsRemaining)} con saldo ≥ $${MIN_BALANCE_FOR_SAVINGS_COIN}.`}
              </p>
            </div>
          </div>
        </Card>

        <h2 className="text-2xl font-bold mb-4">Cuentas</h2>

        <div className="space-y-3 mb-6">
          <Card className="bg-white rounded-2xl p-4 flex items-center gap-3 shadow-sm">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-purple-400 flex items-center justify-center">
              <span className="text-white text-xl font-bold">d!</span>
            </div>
            <div className="flex-1">
              <p className="font-medium">Deuna ******6353</p>
              <p className="text-sm text-gray-600">
                {isBalanceHidden ? "$••••" : `$${formatMoney(balance)}`}
              </p>
            </div>
          </Card>

          <Card className="bg-white rounded-2xl p-4 flex items-center gap-3 shadow-sm opacity-60">
            <div className="w-12 h-12 rounded-full bg-yellow-400 flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="8" width="18" height="12" rx="2" fill="#1a1a1a" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="font-medium">******9506</p>
              <p className="text-sm text-gray-600">Cuenta vinculada (demo)</p>
            </div>
          </Card>
        </div>

        <button className="flex items-center gap-2 text-purple-600 font-medium mb-8">
          No veo todas mis cuentas
          <ExternalLink className="w-4 h-4" />
        </button>

        <h2 className="text-2xl font-bold mb-4">Cuentas de mis hijos/as</h2>

        <Card className="bg-white rounded-2xl p-6 flex items-start gap-4 shadow-sm">
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-2">Crea una cuenta nueva para un menor de edad</h3>
            <p className="text-sm text-gray-600 mb-4">
              Si tienes hijos entre 12 y 17 años ya pueden usar Deuna
            </p>
            <button className="text-purple-600 font-medium">Crear ahora ›</button>
          </div>
          <img
            src="https://images.unsplash.com/photo-1603415526960-f7e0328c63b1?w=200&h=200&fit=crop"
            alt="Teen"
            className="w-24 h-24 object-cover rounded-lg"
          />
        </Card>
      </div>
    </div>
  );
}
