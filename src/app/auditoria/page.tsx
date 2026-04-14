import { createClient } from "@/lib/server";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import LogoutButton from "@/components/LogoutButton";

const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

function serializePago(pago: any) {
  return {
    ...pago,
    monto: Number(pago.monto),
    fechaPago: pago.fechaPago.toISOString(),
    createdAt: pago.createdAt.toISOString(),
    cliente: {
      ...pago.cliente,
      valorMensual: Number(pago.cliente.valorMensual),
      fechaIngreso: pago.cliente.fechaIngreso.toISOString(),
      ultimoPago: pago.cliente.ultimoPago?.toISOString(),
      createdAt: pago.cliente.createdAt.toISOString(),
      updatedAt: pago.cliente.updatedAt.toISOString(),
    },
  };
}

export default async function AuditoriaPage({
  searchParams,
}: {
  searchParams: Promise<{ mes?: string; ano?: string; search?: string }>;
}) {
  const params = await searchParams;
  const now = new Date();
  const mesActual = params.mes ? parseInt(params.mes) : now.getMonth() + 1;
  const anoActual = params.ano ? parseInt(params.ano) : now.getFullYear();
  const searchTerm = params.search || "";

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const pagosRaw = await prisma.pago.findMany({
    where: {
      mes: mesActual,
      ano: anoActual,
    },
    include: {
      cliente: true,
    },
    orderBy: { fechaPago: "desc" },
  });

  let pagos = pagosRaw.map(serializePago);
  
  if (searchTerm) {
    pagos = pagos.filter((p: any) =>
      p.cliente.nombreCompleto.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  const totalMes = pagos.reduce((sum: number, pago: any) => sum + Number(pago.monto), 0);
  const cantidadPagos = pagos.length;

  const mesesAnteriores = MESES.map((nombre, index) => ({
    numero: index + 1,
    nombre,
  }));

  const anosDisponibles = Array.from(
    { length: 5 },
    (_, i) => now.getFullYear() - i
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div className="flex items-center gap-4">
              <Link href="/clientes" className="text-black hover:underline text-sm sm:text-base">
                ← Volver
              </Link>
              <h1 className="text-lg sm:text-xl font-bold text-black">Auditoria</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-black hidden sm:inline">{user?.email}</span>
              <LogoutButton />
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-4 sm:py-8">
        <div className="bg-white rounded-lg shadow p-4 sm:p-6 mb-4 sm:mb-6">
          <h2 className="text-base sm:text-lg font-bold text-black mb-4">Seleccionar Periodo</h2>
          <form className="flex flex-wrap gap-2 sm:gap-4 items-start sm:items-center">
            <input
              type="text"
              name="search"
              defaultValue={searchTerm}
              placeholder="Buscar..."
              className="px-3 py-2 border rounded-lg text-black text-sm w-full sm:w-auto flex-1 min-w-[120px]"
            />
            <select
              name="mes"
              defaultValue={mesActual}
              className="px-3 py-2 border rounded-lg text-black text-sm"
            >
              {mesesAnteriores.map((m) => (
                <option key={m.numero} value={m.numero}>
                  {m.nombre}
                </option>
              ))}
            </select>
            <select
              name="ano"
              defaultValue={anoActual}
              className="px-3 py-2 border rounded-lg text-black text-sm"
            >
              {anosDisponibles.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm whitespace-nowrap"
            >
              Filtrar
            </button>
          </form>
        </div>

        <div className="bg-white rounded-lg shadow p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
              <h2 className="text-lg sm:text-2xl font-bold text-black">
                {MESES[mesActual - 1]} {anoActual}
              </h2>
              <p className="text-black text-sm">Total de pagos: {cantidadPagos}</p>
              {searchTerm && (
                <p className="text-sm text-black">Buscando: {searchTerm}</p>
              )}
            </div>
            <div className="text-left sm:text-right">
              <p className="text-sm text-black">Total del mes</p>
              <p className="text-2xl sm:text-3xl font-bold text-green-600">${Math.round(totalMes)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-black mb-4">Detalle de Pagos</h3>
          {pagos.length === 0 ? (
            <p className="text-black text-sm">No hay pagos registrados este mes</p>
          ) : (
            <div className="space-y-3">
              {pagos.map((pago) => (
                <div
                  key={pago.id}
                  className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 sm:p-4 border rounded-lg border-black gap-2"
                >
                  <div>
                    <p className="font-semibold text-black text-sm sm:text-base">{pago.cliente.nombreCompleto}</p>
                    <p className="text-xs sm:text-sm text-black">
                      Fecha: {new Date(pago.fechaPago).toLocaleDateString("es-ES")}
                    </p>
                  </div>
                  <div className="text-left sm:text-right w-full sm:w-auto">
                    <p className="font-bold text-lg text-black">${Math.round(Number(pago.monto))}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
