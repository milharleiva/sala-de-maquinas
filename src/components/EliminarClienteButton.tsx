"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function EliminarClienteButton({ 
  clienteId, 
  onDelete 
}: { 
  clienteId: string;
  onDelete?: () => void;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm("¿Estás seguro de eliminar este cliente?")) return;
    
    setLoading(true);
    
    try {
      const res = await fetch(`/api/clientes/${clienteId}/delete`, {
        method: "DELETE",
      });

      if (res.ok) {
        if (onDelete) {
          onDelete();
        }
        router.refresh();
      }
    } catch (error) {
      console.error("Error:", error);
    }
    
    setLoading(false);
  };

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="text-sm px-3 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200 disabled:opacity-50"
    >
      {loading ? "..." : "Eliminar"}
    </button>
  );
}
