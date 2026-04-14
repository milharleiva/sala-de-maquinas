"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegistrarPagoModal({ 
  clienteId, 
  clienteNombre, 
  valorMensual,
  onClose,
  onSuccess 
}: { 
  clienteId: string; 
  clienteNombre: string; 
  valorMensual: number;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const router = useRouter();
  const [monto, setMonto] = useState(valorMensual.toString());
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const montoNum = parseFloat(monto);
    if (montoNum < valorMensual) {
      alert(`El monto no puede ser menor a $${valorMensual}`);
      return;
    }
    
    setLoading(true);

    try {
      const res = await fetch(`/api/clientes/${clienteId}/registrar-pago`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ monto: montoNum }),
      });

      if (res.ok) {
        onSuccess();
        onClose();
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error || "Error al registrar pago");
      }
    } catch {
      alert("Error al registrar pago");
    }

    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-sm sm:max-w-md shadow-xl">
        <h3 className="text-lg font-bold text-black mb-2">Registrar Pago</h3>
        <p className="text-black mb-1 text-sm sm:text-base">Cliente: {clienteNombre}</p>
        <p className="text-black mb-4 text-sm sm:text-base">Valor mensual: ${valorMensual}</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-black">
              Monto Pagado
            </label>
            <input
              type="number"
              step="0.01"
              min={valorMensual}
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-black text-sm sm:text-base"
              required
            />
            <p className="text-sm text-black mt-1">
              Minimo: ${valorMensual}
            </p>
          </div>
          
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading || parseFloat(monto) < valorMensual}
              className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm sm:text-base"
            >
              {loading ? "Guardando..." : "Confirmar Pago"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 text-black py-2 rounded-lg hover:bg-gray-400 text-sm sm:text-base"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
