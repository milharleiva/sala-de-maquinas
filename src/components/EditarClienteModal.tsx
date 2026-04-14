"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const DIAS_SEMANA = [
  "Lunes",
  "Martes",
  "Miercoles",
  "Jueves",
  "Viernes",
  "Sabado",
  "Domingo",
];

export default function EditarClienteModal({
  cliente,
  onClose,
  onSuccess
}: {
  cliente: any;
  onClose: () => void;
  onSuccess?: () => void;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombreCompleto: cliente.nombreCompleto,
    fechaIngreso: new Date(cliente.fechaIngreso).toISOString().split("T")[0],
    horario: cliente.horario,
    diasSemana: cliente.diasSemana,
    valorMensual: cliente.valorMensual.toString(),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`/api/clientes/${cliente.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        if (onSuccess) {
          onSuccess();
        }
        router.refresh();
        onClose();
      } else {
        const data = await res.json();
        alert(data.error || "Error al actualizar cliente");
      }
    } catch {
      alert("Error al actualizar cliente");
    }

    setLoading(false);
  };

  const toggleDia = (dia: string) => {
    setFormData((prev) => ({
      ...prev,
      diasSemana: prev.diasSemana.includes(dia)
        ? prev.diasSemana.filter((d: string) => d !== dia)
        : [...prev.diasSemana, dia],
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-xl">
        <h3 className="text-lg font-bold text-black mb-4">Editar Cliente</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-black">
              Nombre Completo
            </label>
            <input
              type="text"
              value={formData.nombreCompleto}
              onChange={(e) =>
                setFormData({ ...formData, nombreCompleto: e.target.value })
              }
              className="w-full px-3 py-2 border rounded-lg text-black text-sm sm:text-base"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-black">
              Fecha de Ingreso
            </label>
            <input
              type="date"
              value={formData.fechaIngreso}
              onChange={(e) =>
                setFormData({ ...formData, fechaIngreso: e.target.value })
              }
              className="w-full px-3 py-2 border rounded-lg text-black text-sm sm:text-base"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-black">Horario</label>
            <input
              type="text"
              placeholder="Ej: 6:00 - 22:00"
              value={formData.horario}
              onChange={(e) =>
                setFormData({ ...formData, horario: e.target.value })
              }
              className="w-full px-3 py-2 border rounded-lg text-black text-sm sm:text-base"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-black">
              Dias de la Semana
            </label>
            <div className="flex flex-wrap gap-2">
              {DIAS_SEMANA.map((dia) => (
                <button
                  key={dia}
                  type="button"
                  onClick={() => toggleDia(dia)}
                  className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm ${
                    formData.diasSemana.includes(dia)
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-black"
                  }`}
                >
                  {dia}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-black">
              Valor Mensual
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.valorMensual}
              onChange={(e) =>
                setFormData({ ...formData, valorMensual: e.target.value })
              }
              className="w-full px-3 py-2 border rounded-lg text-black text-sm sm:text-base"
              required
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm sm:text-base"
            >
              {loading ? "Guardando..." : "Guardar Cambios"}
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
