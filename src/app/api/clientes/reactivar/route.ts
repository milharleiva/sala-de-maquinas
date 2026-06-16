import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/server";
import { isAfter, startOfDay, getDate, setDate, addMonths } from "date-fns";

export const dynamic = "force-dynamic";

async function getPrisma() {
  const { PrismaClient } = await import("@prisma/client");
  const { PrismaPg } = await import("@prisma/adapter-pg");
  const { Pool } = await import("pg");
  const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

export async function POST() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || (user as any)?.user_metadata?.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const prisma = await getPrisma();

    const clientesVencidos = await prisma.cliente.findMany({
      where: { estado: "VENCIDO" },
    });

    const hoy = startOfDay(new Date());
    let reactivados = 0;

    for (const cliente of clientesVencidos) {
      if (!cliente.fechaIngreso || !cliente.ultimoPago) continue;

      const diaVencimiento = getDate(cliente.fechaIngreso);
      const mesSiguiente = addMonths(startOfDay(cliente.ultimoPago), 1);
      const finCobertura = setDate(mesSiguiente, diaVencimiento);

      if (!isAfter(hoy, finCobertura)) {
        await prisma.cliente.update({
          where: { id: cliente.id },
          data: { estado: "ACTIVO" },
        });
        reactivados++;
      }
    }

    revalidatePath("/clientes");
    return NextResponse.json({ success: true, reactivados });
  } catch (error) {
    console.error("Error al reactivar:", error);
    return NextResponse.json({ error: "Error al reactivar clientes" }, { status: 500 });
  }
}
