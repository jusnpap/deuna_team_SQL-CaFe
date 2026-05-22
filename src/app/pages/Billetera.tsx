import { ArrowLeft, Eye, EyeOff, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router";
import { Card } from "../components/ui/card";
import { useApp } from "../context/AppContext";

export function Billetera() {
  const navigate = useNavigate();
  const { balance, isBalanceHidden, setIsBalanceHidden } = useApp();

  const formatMoney = (value: number) =>
    value.toLocaleString("es-EC", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

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
