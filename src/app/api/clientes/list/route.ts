import { NextResponse } from "next/server";
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

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const isAdmin = (user as any)?.user_metadata?.role === "ADMIN";
    const prisma = await getPrisma();

    const clientesRaw = await prisma.cliente.findMany({
      orderBy: { nombreCompleto: "asc" },
    });

    for (const cliente of clientesRaw) {
      if (cliente.fechaIngreso) {
        const diaVencimiento = getDate(cliente.fechaIngreso);
        const hoy = startOfDay(new Date());
        let proximoVencimiento = setDate(hoy, diaVencimiento);
        if (isAfter(hoy, proximoVencimiento)) {
          proximoVencimiento = addMonths(proximoVencimiento, 1);
        }
        if (isAfter(hoy, startOfDay(proximoVencimiento))) {
          if (cliente.estado !== "VENCIDO") {
            await prisma.cliente.update({
              where: { id: cliente.id },
              data: { estado: "VENCIDO" },
            });
          }
        }
      }
    }

    const clientesActualizados = await prisma.cliente.findMany({
      orderBy: { nombreCompleto: "asc" },
    });

    const clientes = clientesActualizados.map((c: any) => ({
      ...c,
      valorMensual: Number(c.valorMensual),
      fechaIngreso: c.fechaIngreso.toISOString(),
      ultimoPago: c.ultimoPago?.toISOString(),
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString(),
    }));

    return NextResponse.json({
      clientes,
      isAdmin,
      email: user.email,
    });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Error al obtener clientes" }, { status: 500 });
  }
}
