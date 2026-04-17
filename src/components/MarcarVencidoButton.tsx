"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function MarcarVencidoButton({ clienteId }: { clienteId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (!confirm("¿Marcar este cliente como vencido?")) return;
    
    setLoading(true);
    
    try {
      const res = await fetch(`/api/clientes/${clienteId}/marcar-vencido`, {
        method: "POST",
      });

      if (res.ok) {
        router.refresh();
      }
    } catch (error) {
      console.error("Error:", error);
    }
    
    setLoading(false);
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="text-xs sm:text-sm px-2 sm:px-3 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200 disabled:opacity-50"
    >
      {loading ? "Guardando..." : "Marcar como vencido"}
    </button>
  );
}
