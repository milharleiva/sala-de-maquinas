import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/server";
import { isAfter, addMonths, startOfDay } from "date-fns";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const isAdmin = (user as any)?.user_metadata?.role === "ADMIN";

    const clientesRaw = await prisma.cliente.findMany({
      orderBy: { nombreCompleto: "asc" },
    });

    for (const cliente of clientesRaw) {
      if (cliente.ultimoPago) {
        const proximoVencimiento = addMonths(cliente.ultimoPago, 1);
        if (isAfter(startOfDay(new Date()), startOfDay(proximoVencimiento))) {
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
