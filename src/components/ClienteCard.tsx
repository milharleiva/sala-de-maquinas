"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import EditarClienteModal from "./EditarClienteModal";
import EliminarClienteButton from "./EliminarClienteButton";
import RegistrarPagoModal from "./RegistrarPagoModal";
import { es } from "date-fns/locale";

function ClienteCard({ 
  cliente, 
  isAdmin,
  onActualizar 
}: { 
  cliente: any; 
  isAdmin: boolean;
  onActualizar?: () => void;
}) {
  const [showPagoModal, setShowPagoModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  
  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      year: "numeric",
      locale: es,
    });
  };

  const handlePagoExitoso = () => {
    if (onActualizar) {
      onActualizar();
    }
  };

  return (
    <>
      <div className={`p-3 sm:p-4 rounded-lg border ${cliente.estado === "VENCIDO" ? "border-red-200 bg-red-50" : "border-black"}`}>
        <div className="flex flex-col sm:flex-row justify-between gap-2">
          <div className="flex-1">
            <h4 className="font-semibold text-black text-sm sm:text-base">{cliente.nombreCompleto}</h4>
            <p className="text-xs sm:text-sm text-black">
              Ingreso: {formatDate(cliente.fechaIngreso)}
            </p>
            <p className="text-xs sm:text-sm text-black">Horario: {cliente.horario}</p>
            <p className="text-xs sm:text-sm text-black">
              Dias: {cliente.diasSemana.join(", ")}
            </p>
          </div>
          <div className="text-left sm:text-right">
            <p className="font-bold text-base sm:text-lg text-black">${Number(cliente.valorMensual)}</p>
            {cliente.ultimoPago && (
              <p className="text-xs sm:text-sm text-black">
                Ultimo pago: {formatDate(cliente.ultimoPago)}
              </p>
            )}
          </div>
        </div>
        {isAdmin && (
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              onClick={() => setShowEditModal(true)}
              className="text-xs sm:text-sm px-2 sm:px-3 py-1 rounded bg-blue-100 text-blue-700 hover:bg-blue-200"
            >
              Editar
            </button>
            <EliminarClienteButton clienteId={cliente.id} onDelete={handlePagoExitoso} />
            {cliente.estado === "VENCIDO" && (
              <button
                onClick={() => setShowPagoModal(true)}
                className="text-xs sm:text-sm px-2 sm:px-3 py-1 rounded bg-green-100 text-green-700 hover:bg-green-200"
              >
                Registrar Pago
              </button>
            )}
          </div>
        )}
      </div>
      
      {showPagoModal && (
        <RegistrarPagoModal
          clienteId={cliente.id}
          clienteNombre={cliente.nombreCompleto}
          valorMensual={cliente.valorMensual}
          onClose={() => setShowPagoModal(false)}
          onSuccess={handlePagoExitoso}
        />
      )}
      
      {showEditModal && (
        <EditarClienteModal
          cliente={cliente}
          onClose={() => setShowEditModal(false)}
          onSuccess={handlePagoExitoso}
        />
      )}
    </>
  );
}

export default ClienteCard;
