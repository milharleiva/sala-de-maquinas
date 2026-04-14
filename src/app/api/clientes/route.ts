import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user || (user as any).user_metadata?.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { nombreCompleto, fechaIngreso, horario, diasSemana, valorMensual } = body;

    if (!nombreCompleto || !fechaIngreso || !horario || !diasSemana || !valorMensual) {
      return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 });
    }

    const prisma = await getPrisma();
    await prisma.cliente.create({
      data: {
        nombreCompleto,
        fechaIngreso: new Date(fechaIngreso),
        horario,
        diasSemana,
        valorMensual: parseFloat(valorMensual),
        estado: "ACTIVO",
        ultimoPago: new Date(),
      },
    });

    revalidatePath("/clientes");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error al crear cliente:", error);
    return NextResponse.json({ error: "Error al crear cliente" }, { status: 500 });
  }
}
