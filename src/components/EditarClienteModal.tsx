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

const HORAS_DISPONIBLES = [
  { value: "6:00", label: "6:00" },
  { value: "6:30", label: "6:30" },
  { value: "7:00", label: "7:00" },
  { value: "7:30", label: "7:30" },
  { value: "8:00", label: "8:00" },
  { value: "8:30", label: "8:30" },
  { value: "9:00", label: "9:00" },
  { value: "9:30", label: "9:30" },
  { value: "10:00", label: "10:00" },
  { value: "10:30", label: "10:30" },
  { value: "11:00", label: "11:00" },
  { value: "11:30", label: "11:30" },
  { value: "12:00", label: "12:00" },
  { value: "12:30", label: "12:30" },
  { value: "13:00", label: "13:00" },
  { value: "13:30", label: "13:30" },
  { value: "14:00", label: "14:00" },
  { value: "14:30", label: "14:30" },
  { value: "15:00", label: "15:00" },
  { value: "15:30", label: "15:30" },
  { value: "16:00", label: "16:00" },
  { value: "16:30", label: "16:30" },
  { value: "17:00", label: "17:00" },
  { value: "17:30", label: "17:30" },
  { value: "18:00", label: "18:00" },
  { value: "18:30", label: "18:30" },
  { value: "19:00", label: "19:00" },
  { value: "19:30", label: "19:30" },
  { value: "20:00", label: "20:00" },
  { value: "20:30", label: "20:30" },
  { value: "21:00", label: "21:00" },
  { value: "21:30", label: "21:30" },
  { value: "22:00", label: "22:00" },
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
    rut: cliente.rut || "",
    nombreCompleto: cliente.nombreCompleto,
    fechaIngreso: new Date(cliente.fechaIngreso).toISOString().split("T")[0],
    horariosPorDia: cliente.horariosPorDia || {},
    diasSemana: cliente.diasSemana,
    valorMensual: cliente.valorMensual.toString(),
    nota: cliente.nota || "",
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
    setFormData((prev) => {
      const newDias = prev.diasSemana.includes(dia)
        ? prev.diasSemana.filter((d: string) => d !== dia)
        : [...prev.diasSemana, dia];

      const newHorarios = { ...prev.horariosPorDia };
      if (!prev.diasSemana.includes(dia)) {
        newHorarios[dia] = { inicio: "17:00", fin: "18:00" };
      } else {
        delete newHorarios[dia];
      }

      return {
        ...prev,
        diasSemana: newDias,
        horariosPorDia: newHorarios,
      };
    });
  };

  const updateHorarioDia = (dia: string, campo: "inicio" | "fin", valor: string) => {
    setFormData((prev) => ({
      ...prev,
      horariosPorDia: {
        ...prev.horariosPorDia,
        [dia]: {
          ...prev.horariosPorDia[dia],
          [campo]: valor,
        },
      },
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-xl">
        <h3 className="text-lg font-bold text-black mb-4">Editar Cliente</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-black">
              RUT <span className="font-normal text-gray-500">(Opcional)</span>
            </label>
            <input
              type="text"
              value={formData.rut}
              onChange={(e) =>
                setFormData({ ...formData, rut: e.target.value })
              }
              className="w-full px-3 py-2 border rounded-lg text-black text-sm sm:text-base"
              placeholder="Ej: 12345678-9"
            />
          </div>

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

          {formData.diasSemana.length > 0 && (
            <div className="bg-gray-50 p-3 rounded-lg border">
              <label className="block text-sm font-medium mb-3 text-black">
                Horario por Día
              </label>
              <div className="space-y-3">
                {formData.diasSemana.map((dia) => (
                  <div key={dia} className="flex items-center gap-2">
                    <span className="w-20 text-sm text-black font-medium">{dia}:</span>
                    <select
                      value={formData.horariosPorDia[dia]?.inicio || "17:00"}
                      onChange={(e) => updateHorarioDia(dia, "inicio", e.target.value)}
                      className="flex-1 px-2 py-1.5 border rounded text-black text-sm"
                    >
                      {HORAS_DISPONIBLES.map((h) => (
                        <option key={h.value} value={h.value}>
                          {h.label}
                        </option>
                      ))}
                    </select>
                    <span className="text-sm text-black">a</span>
                    <select
                      value={formData.horariosPorDia[dia]?.fin || "18:00"}
                      onChange={(e) => updateHorarioDia(dia, "fin", e.target.value)}
                      className="flex-1 px-2 py-1.5 border rounded text-black text-sm"
                    >
                      {HORAS_DISPONIBLES.map((h) => (
                        <option key={h.value} value={h.value}>
                          {h.label}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          )}

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

          <div>
            <label className="block text-sm font-medium mb-1 text-black">
              Nota <span className="font-normal text-gray-500">(Opcional)</span>
            </label>
            <textarea
              value={formData.nota}
              onChange={(e) =>
                setFormData({ ...formData, nota: e.target.value })
              }
              className="w-full px-3 py-2 border rounded-lg text-black text-sm sm:text-base"
              rows={3}
              placeholder="Notas especiales del cliente..."
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