"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import LogoutButton from "@/components/LogoutButton";
import ClienteCard from "@/components/ClienteCard";

const ITEMS_PER_PAGE = 6;

export default function ClientesPageClient() {
  const [clientes, setClientes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [pageActivos, setPageActivos] = useState(1);
  const [pageVencidos, setPageVencidos] = useState(1);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    fetchClientes();
  }, []);

  const fetchClientes = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/clientes/list");
      if (res.ok) {
        const data = await res.json();
        setClientes(data.clientes);
        setIsAdmin(data.isAdmin);
        setUserEmail(data.email);
      }
    } catch (error) {
      console.error("Error:", error);
    }
    setLoading(false);
  };

  const filteredClientes = clientes.filter((cliente) =>
    cliente.nombreCompleto.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const clientesActivos = filteredClientes.filter((c) => c.estado === "ACTIVO");
  const clientesVencidos = filteredClientes.filter((c) => c.estado === "VENCIDO");

  const totalPagesActivos = Math.ceil(clientesActivos.length / ITEMS_PER_PAGE);
  const totalPagesVencidos = Math.ceil(clientesVencidos.length / ITEMS_PER_PAGE);

  const startIndexActivos = (pageActivos - 1) * ITEMS_PER_PAGE;
  const startIndexVencidos = (pageVencidos - 1) * ITEMS_PER_PAGE;

  const activosPaginados = clientesActivos.slice(startIndexActivos, startIndexActivos + ITEMS_PER_PAGE);
  const vencidosPaginados = clientesVencidos.slice(startIndexVencidos, startIndexVencidos + ITEMS_PER_PAGE);

  const Pagination = ({ 
    currentPage, 
    totalPages, 
    onPageChange 
  }: { 
    currentPage: number; 
    totalPages: number; 
    onPageChange: (page: number) => void;
  }) => {
    if (totalPages <= 1) return null;

    return (
      <div className="flex justify-center gap-2 mt-4 flex-wrap">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`px-3 py-1 rounded text-sm min-w-[40px] ${
              page === currentPage
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-black hover:bg-gray-300"
            }`}
          >
            {page}
          </button>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
        <div className="relative w-16 h-16 mb-4">
          <div className="absolute top-0 left-0 w-full h-full border-4 border-gray-300 rounded-full"></div>
          <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
        </div>
        <p className="text-black text-lg">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <h1 className="text-lg sm:text-xl font-bold text-black">Sala de Maquinas</h1>
            <button 
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 text-black"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className={`${menuOpen ? 'flex' : 'hidden'} md:flex flex-col md:flex-row absolute md:relative top-full left-0 md:top-auto w-full md:w-auto bg-white md:bg-transparent shadow-md md:shadow-none z-50 gap-2 p-4 md:p-0 items-start md:items-center`}>
              <span className="text-sm text-black truncate max-w-[150px] md:max-w-none">{userEmail}</span>
              {isAdmin && <span className="text-xs text-black bg-blue-100 px-2 py-1 rounded">Admin</span>}
              <LogoutButton />
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-4 sm:py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-4">
          <h2 className="text-xl sm:text-2xl font-bold text-black">Clientes</h2>
          <div className="flex flex-wrap gap-2 items-center w-full sm:w-auto">
            <input
              type="text"
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPageActivos(1);
                setPageVencidos(1);
              }}
              className="px-3 py-2 border rounded-lg text-black w-full sm:w-48 text-sm"
            />
            <Link
                href="/auditoria"
                className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 text-sm whitespace-nowrap"
              >
                Auditoria
              </Link>
            {isAdmin && (
              <Link
                href="/clientes/nuevo"
                className="bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 text-sm whitespace-nowrap"
              >
                + Nuevo
              </Link>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
          <section className="bg-white rounded-lg shadow p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-green-600">
              Al dia ({clientesActivos.length})
            </h3>
            {clientesActivos.length === 0 ? (
              <p className="text-black text-sm">No hay clientes al dia</p>
            ) : (
              <>
                <div className="space-y-3">
                  {activosPaginados.map((cliente) => (
                    <ClienteCard key={cliente.id} cliente={cliente} isAdmin={isAdmin} onActualizar={fetchClientes} />
                  ))}
                </div>
                <Pagination 
                  currentPage={pageActivos} 
                  totalPages={totalPagesActivos} 
                  onPageChange={setPageActivos} 
                />
              </>
            )}
          </section>

          <section className="bg-white rounded-lg shadow p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-red-600">
              Vencidos ({clientesVencidos.length})
            </h3>
            {clientesVencidos.length === 0 ? (
              <p className="text-black text-sm">No hay clientes vencidos</p>
            ) : (
              <>
                <div className="space-y-3">
                  {vencidosPaginados.map((cliente) => (
                    <ClienteCard key={cliente.id} cliente={cliente} isAdmin={isAdmin} onActualizar={fetchClientes} />
                  ))}
                </div>
                <Pagination 
                  currentPage={pageVencidos} 
                  totalPages={totalPagesVencidos} 
                  onPageChange={setPageVencidos} 
                />
              </>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
