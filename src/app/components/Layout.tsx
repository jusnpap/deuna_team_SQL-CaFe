import { Outlet, Link, useLocation } from "react-router";
import { Home, Gift, Wallet, User } from "lucide-react";
import { useApp } from "../context/AppContext";

export function Layout() {
  const location = useLocation();
  const { activeProfileMode } = useApp();

  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50 max-w-md mx-auto">
      <div className="flex-1 overflow-y-auto">
        <Outlet />
      </div>

      {activeProfileMode === "personal" && (
        <nav className="bg-white border-t border-gray-200 px-6 py-3">
        <div className="flex justify-around items-center">
          <Link to="/" className="flex flex-col items-center gap-1">
            <Home className={`w-6 h-6 ${isActive("/") ? "text-purple-600" : "text-gray-400"}`} />
            <span className={`text-xs ${isActive("/") ? "text-purple-600" : "text-gray-600"}`}>
              Inicio
            </span>
          </Link>

          <Link to="/beneficios" className="flex flex-col items-center gap-1">
            <Gift className={`w-6 h-6 ${isActive("/beneficios") ? "text-purple-600" : "text-gray-400"}`} />
            <span className={`text-xs ${isActive("/beneficios") ? "text-purple-600" : "text-gray-600"}`}>
              Beneficios
            </span>
          </Link>

          <Link to="/billetera" className="flex flex-col items-center gap-1">
            <Wallet className={`w-6 h-6 ${isActive("/billetera") ? "text-purple-600" : "text-gray-400"}`} />
            <span className={`text-xs ${isActive("/billetera") ? "text-purple-600" : "text-gray-600"}`}>
              Billetera
            </span>
          </Link>

          <Link to="/tu" className="flex flex-col items-center gap-1">
            <User className={`w-6 h-6 ${isActive("/tu") ? "text-purple-600" : "text-gray-400"}`} />
            <span className={`text-xs ${isActive("/tu") ? "text-purple-600" : "text-gray-600"}`}>
              Tú
            </span>
          </Link>
        </div>
      </nav>
      )}
    </div>
  );
}
