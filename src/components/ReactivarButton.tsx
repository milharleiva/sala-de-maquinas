"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ReactivarButton({ onSuccess }: { onSuccess?: () => void }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (!confirm("¿Reactivar todos los clientes vencidos que estén al día?")) return;

    setLoading(true);

    try {
      const res = await fetch("/api/clientes/reactivar", {
        method: "POST",
      });

      if (res.ok) {
        const data = await res.json();
        if (data.reactivados > 0) {
          alert(`Se reactivaron ${data.reactivados} cliente(s)`);
        } else {
          alert("No hay clientes vencidos con cobertura vigente");
        }
        if (onSuccess) onSuccess();
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error || "Error al reactivar");
      }
    } catch {
      alert("Error al reactivar clientes");
    }

    setLoading(false);
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="bg-yellow-500 text-white px-3 py-2 rounded-lg hover:bg-yellow-600 disabled:opacity-50 text-sm whitespace-nowrap"
    >
      {loading ? "Reactivando..." : "Reactivar automaticamente"}
    </button>
  );
}
