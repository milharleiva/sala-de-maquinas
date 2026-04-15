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

export default function NuevoClienteForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    rut: "",
    nombreCompleto: "",
    fechaIngreso: new Date().toISOString().split("T")[0],
    horario: "",
    diasSemana: [] as string[],
    valorMensual: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/clientes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        router.push("/clientes");
      } else {
        const data = await res.json();
        alert(data.error || "Error al crear cliente");
        setLoading(false);
      }
    } catch {
      alert("Error al crear cliente");
      setLoading(false);
    }
  };

  const toggleDia = (dia: string) => {
    setFormData((prev) => ({
      ...prev,
      diasSemana: prev.diasSemana.includes(dia)
        ? prev.diasSemana.filter((d) => d !== dia)
        : [...prev.diasSemana, dia],
    }));
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4">
          <h1 className="text-lg sm:text-xl font-bold text-black">Nuevo Cliente</h1>
        </div>
      </nav>

      <div className="max-w-lg mx-auto px-4 py-4 sm:py-8">
        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-black">
                RUT
              </label>
              <input
                type="text"
                value={formData.rut}
                onChange={(e) =>
                  setFormData({ ...formData, rut: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-lg text-black text-sm sm:text-base"
                placeholder="Ej: 12345678-9"
                required
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
                value={formData.valorMensual}
                onChange={(e) =>
                  setFormData({ ...formData, valorMensual: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-lg text-black text-sm sm:text-base"
                required
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm sm:text-base"
              >
                {loading ? "Guardando..." : "Guardar Cliente"}
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 bg-gray-300 text-black py-2 rounded-lg hover:bg-gray-400 text-sm sm:text-base"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
