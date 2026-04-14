"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function MarcarAlDiaButton({ clienteId }: { clienteId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    
    try {
      const res = await fetch(`/api/clientes/${clienteId}/toggle-status`, {
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
      className="mt-3 text-sm px-3 py-1 rounded bg-green-100 text-green-700 hover:bg-green-200 disabled:opacity-50"
    >
      {loading ? "Guardando..." : "Marcar como al dia"}
    </button>
  );
}
