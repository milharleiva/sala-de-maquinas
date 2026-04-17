"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import LogoutButton from "@/components/LogoutButton";
import { createClient } from "@/lib/supabase";

const DIAS = ["Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado", "Domingo"];
const HORARIOS_POSIBLES = [8, 9, 10, 11, 12, 14, 15, 16, 17, 18, 19, 20, 21];

function extraerHoraInicio(horario: string): number {
  const match = horario.trim().match(/^(\d{1,2})/);
  if (!match) return 0;
  const hora = parseInt(match[1]);
  return hora >= 8 && hora <= 22 ? hora : 0;
}

function formatearRango(hora: number): string {
  return `${hora.toString().padStart(2, '0')}:00-${(hora + 1).toString().padStart(2, '0')}:00`;
}

export default function HorariosPage() {
  const [clientes, setClientes] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [selectedDia, setSelectedDia] = useState<string>("");
  const [selectedHora, setSelectedHora] = useState<number | "">("");
  const [horariosDisponibles, setHorariosDisponibles] = useState<number[]>([]);
  const [clientesFiltrados, setClientesFiltrados] = useState<any[]>([]);

  useEffect(() => {
    async function fetchData() {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      const res = await fetch("/api/clientes/list");
      const data = await res.json();
      setClientes(data.clientes);
    }
    fetchData();
  }, []);

  useEffect(() => {
    if (!selectedDia) {
      setHorariosDisponibles([]);
      setClientesFiltrados([]);
      return;
    }

    const clientesDelDia = clientes.filter((c) =>
      c.diasSemana.includes(selectedDia)
    );

    const horas = HORARIOS_POSIBLES;
    setHorariosDisponibles(horas);
    setSelectedHora("");
    setClientesFiltrados([]);
  }, [selectedDia, clientes]);

  useEffect(() => {
    if (!selectedDia || selectedHora === "") {
      setClientesFiltrados([]);
      return;
    }

    const filtrados = clientes.filter((c) =>
      c.diasSemana.includes(selectedDia) &&
      extraerHoraInicio(c.horario) === selectedHora
    );

    setClientesFiltrados(filtrados);
  }, [selectedDia, selectedHora, clientes]);

  const getCantidadPorHorario = (dia: string, hora: number): number => {
    return clientes.filter((c) =>
      c.diasSemana.includes(dia) &&
      extraerHoraInicio(c.horario) === hora
    ).length;
  };

  const clientesActivos = clientes.filter((c) => c.estado === "ACTIVO");

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div className="flex items-center gap-4">
              <Link href="/clientes" className="text-black hover:underline text-sm sm:text-base">
                ← Volver
              </Link>
              <h1 className="text-lg sm:text-xl font-bold text-black">Horarios por Día</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-black hidden sm:inline">{user?.email}</span>
              <LogoutButton />
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-4 sm:py-8">
        <div className="bg-white rounded-lg shadow p-4 sm:p-6 mb-6">
          <h2 className="text-base sm:text-lg font-bold text-black mb-4">Filtros</h2>
          
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[150px]">
              <label className="block text-sm font-medium mb-1 text-black">Día</label>
              <select
                value={selectedDia}
                onChange={(e) => {
                  setSelectedDia(e.target.value);
                  setSelectedHora("");
                }}
                className="w-full px-3 py-2 border rounded-lg text-black text-sm"
              >
                <option value="">Seleccionar día</option>
                {DIAS.map((dia) => (
                  <option key={dia} value={dia}>{dia}</option>
                ))}
              </select>
            </div>

            {selectedDia && (
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-medium mb-1 text-black">Horario</label>
                <select
                  value={selectedHora}
                  onChange={(e) => setSelectedHora(e.target.value ? parseInt(e.target.value) : "")}
                  className="w-full px-3 py-2 border rounded-lg text-black text-sm"
                >
                  <option value="">Seleccionar horario</option>
                  {horariosDisponibles.map((hora) => (
                    <option key={hora} value={hora}>{formatearRango(hora)}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {selectedDia && selectedHora !== "" && (
          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <h3 className="text-lg font-bold text-black mb-4">
              {selectedDia} - {formatearRango(selectedHora)}
            </h3>
            <p className="text-black text-base mb-4">
              <strong>Cantidad:</strong> {clientesFiltrados.length}
            </p>
            
            {clientesFiltrados.length > 0 ? (
              <div className="space-y-2">
                {clientesFiltrados.map((cliente) => (
                  <div key={cliente.id} className="p-3 border rounded-lg">
                    <p className="font-medium text-black">{cliente.nombreCompleto}</p>
                    <p className="text-sm text-gray-600">Horario: {cliente.horario}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No hay clientes en este horario</p>
            )}
          </div>
        )}

        {selectedDia && selectedHora === "" && (
          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <h3 className="text-lg font-bold text-black mb-4">Resumen - {selectedDia}</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 text-black">Horario</th>
                    <th className="text-right py-2 text-black">Cantidad</th>
                  </tr>
                </thead>
                <tbody>
                  {horariosDisponibles.map((hora) => (
                    <tr 
                      key={hora} 
                      className="border-b hover:bg-gray-50 cursor-pointer"
                      onClick={() => setSelectedHora(hora)}
                    >
                      <td className="py-2 text-black">{formatearRango(hora)}</td>
                      <td className="text-right text-black">{getCantidadPorHorario(selectedDia, hora)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}