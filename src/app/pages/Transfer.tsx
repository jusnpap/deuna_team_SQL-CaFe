import { useState } from "react";
import { ArrowLeft, Search, QrCode } from "lucide-react";
import { useNavigate } from "react-router";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";

export function Transfer() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState("deuna");

  const deunaContacts = [
    { id: 1, name: "O", phone: "0968904545" },
    { id: 2, name: "", phone: "0981382427" },
    { id: 3, name: "", phone: "0988289364" },
    { id: 4, name: "", phone: "0994161933" },
  ];

  const bankAccounts = [
    { id: 1, name: "NY", bank: "Banco Guayaquil", account: "******6232" },
  ];

  return (
    <div className="min-h-full bg-gray-50">
      <div className="bg-white px-6 py-4 flex items-center gap-4">
        <button onClick={() => navigate(-1)}>
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-semibold">¿A quién quieres transferir?</h1>
      </div>

      <div className="px-6 py-4">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            placeholder="Nombre, teléfono o cuenta"
            className="pl-10 bg-gray-100 border-0 rounded-xl h-12"
          />
        </div>

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveFilter("todos")}
            className={`px-4 py-2 rounded-full border ${
              activeFilter === "todos"
                ? "bg-purple-600 text-white border-purple-600"
                : "bg-white text-gray-700 border-gray-300"
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setActiveFilter("deuna")}
            className={`px-4 py-2 rounded-full border flex items-center gap-2 ${
              activeFilter === "deuna"
                ? "bg-purple-600 text-white border-purple-600"
                : "bg-white text-gray-700 border-gray-300"
            }`}
          >
            <span className="font-bold">d!</span>
            Deuna
          </button>
          <button
            onClick={() => setActiveFilter("cuentas")}
            className={`px-4 py-2 rounded-full border flex items-center gap-2 ${
              activeFilter === "cuentas"
                ? "bg-purple-600 text-white border-purple-600"
                : "bg-white text-gray-700 border-gray-300"
            }`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="8" width="18" height="12" rx="2"/>
            </svg>
            Cuentas
          </button>
        </div>

        {activeFilter !== "cuentas" && (
          <>
            <Card className="bg-white rounded-2xl p-4 flex items-center gap-3 shadow-sm mb-4">
              <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                <QrCode className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">Escanea un QR Deuna</h3>
                <p className="text-sm text-gray-600">Para pagar solo escanea y ¡listo!</p>
              </div>
            </Card>

            <Card className="bg-white rounded-2xl p-4 flex items-center gap-3 shadow-sm mb-4">
              <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0 text-2xl">
                123
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">Código único de pago</h3>
                <p className="text-sm text-gray-600">Una alternativa a nuestro código QR</p>
              </div>
              <span className="bg-teal-400 text-white text-xs font-bold px-2 py-1 rounded">Nuevo</span>
            </Card>

            <Card className="bg-white rounded-2xl p-4 flex items-center gap-3 shadow-sm mb-4">
              <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xl font-bold">d!</span>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">Nuevo número de celular</h3>
                <p className="text-sm text-gray-600">Paga a otro Deuna que no estén en tus contactos</p>
              </div>
            </Card>

            <h3 className="font-bold text-lg mb-3">Contactos Deuna</h3>

            <div className="space-y-2 mb-6">
              {deunaContacts.map((contact) => (
                <Card key={contact.id} className="bg-white rounded-2xl p-4 flex items-center gap-3 shadow-sm">
                  <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-purple-600 font-semibold">
                      {contact.name || contact.phone[0]}
                    </span>
                  </div>
                  <div className="flex-1">
                    {contact.name && <p className="font-medium">{contact.name}</p>}
                    <p className="text-sm text-gray-600">Paga Deuna - {contact.phone}</p>
                  </div>
                </Card>
              ))}
            </div>
          </>
        )}

        {(activeFilter === "todos" || activeFilter === "cuentas") && (
          <>
            <Card className="bg-white rounded-2xl p-4 flex items-center gap-3 shadow-sm mb-4">
              <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="8" width="18" height="12" rx="2"/>
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">Cuenta bancaria</h3>
                <p className="text-sm text-gray-600">Cuentas Banco Pichincha y otros bancos</p>
              </div>
              <span className="bg-teal-400 text-white text-xs font-bold px-2 py-1 rounded">Nuevo</span>
            </Card>

            <h3 className="font-bold text-lg mb-3">Mis cuentas Banco Pichincha</h3>

            <Card className="bg-white rounded-2xl p-4 flex items-center gap-3 shadow-sm mb-6">
              <div className="w-12 h-12 rounded-full bg-yellow-400 flex items-center justify-center flex-shrink-0">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="8" width="18" height="12" rx="2" fill="#1a1a1a"/>
                </svg>
              </div>
              <div className="flex-1">
                <p className="font-medium">Banco Pichincha ******9506</p>
                <p className="text-sm text-gray-600">Cuenta de ahorros</p>
              </div>
            </Card>

            <h3 className="font-bold text-lg mb-3">Cuentas bancarias</h3>

            {bankAccounts.map((account) => (
              <Card key={account.id} className="bg-white rounded-2xl p-4 flex items-center gap-3 shadow-sm mb-2">
                <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-teal-600 font-semibold">{account.name}</span>
                </div>
                <div className="flex-1">
                  <p className="font-medium">Yo</p>
                  <p className="text-sm text-gray-600">{account.bank} {account.account}</p>
                </div>
                <button className="p-2">
                  <svg width="4" height="16" viewBox="0 0 4 16" fill="currentColor" className="text-gray-400">
                    <circle cx="2" cy="2" r="2"/>
                    <circle cx="2" cy="8" r="2"/>
                    <circle cx="2" cy="14" r="2"/>
                  </svg>
                </button>
              </Card>
            ))}

            <h3 className="font-bold text-lg mb-3 mt-6">Contactos Deuna</h3>

            <Card className="bg-white rounded-2xl p-4 flex items-center gap-3 shadow-sm">
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                <span className="text-purple-600 font-semibold">O</span>
              </div>
              <div className="flex-1">
                <p className="font-medium">O</p>
                <p className="text-sm text-gray-600">Paga Deuna - 0968904545</p>
              </div>
            </Card>
          </>
        )}

        <button className="fixed bottom-24 left-6 right-6 max-w-md mx-auto">
          <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center shadow-lg">
            <span className="text-white text-xl">+</span>
          </div>
        </button>
      </div>
    </div>
  );
}
