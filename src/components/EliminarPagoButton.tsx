"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function EliminarPagoButton({ pagoId }: { pagoId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm("¿Estás seguro de eliminar este pago?")) return;
    
    setLoading(true);
    
    try {
      const res = await fetch(`/api/pagos/${pagoId}`, {
        method: "DELETE",
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
      onClick={handleDelete}
      disabled={loading}
      className="text-red-600 hover:underline text-sm disabled:opacity-50"
    >
      {loading ? "..." : "Eliminar"}
    </button>
  );
}
