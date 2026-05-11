"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function PagoDiarioModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const router = useRouter();
  const [nombre, setNombre] = useState("");
  const [monto, setMonto] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const montoNum = parseFloat(monto);
    if (!nombre.trim()) {
      alert("El nombre es requerido");
      return;
    }
    if (montoNum <= 0) {
      alert("El monto debe ser mayor a 0");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/pagos/diario", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre: nombre.trim(), monto: montoNum }),
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
        <h3 className="text-lg font-bold text-black mb-4">Pase del Día</h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-black">
              Nombre
            </label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-black text-sm sm:text-base"
              placeholder="Nombre de la persona"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-black">
              Monto
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-black text-sm sm:text-base"
              placeholder="0"
              required
            />
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading || !nombre.trim() || parseFloat(monto) <= 0}
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
