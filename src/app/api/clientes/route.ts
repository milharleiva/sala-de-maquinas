import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/server";

export const dynamic = "force-dynamic";

async function getPrisma() {
  const { PrismaClient } = await import("@prisma/client");
  const { PrismaPg } = await import("@prisma/adapter-pg");
  const { Pool } = await import("pg");
  const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user || (user as any).user_metadata?.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { rut, nombreCompleto, fechaIngreso, horario, diasSemana, valorMensual, nota } = body;

    if (!nombreCompleto || !fechaIngreso || !horario || !diasSemana || !valorMensual) {
      return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 });
    }

    const prisma = await getPrisma();
    const cliente = await prisma.cliente.create({
      data: {
rut: rut || "",
        nombreCompleto,
        fechaIngreso: new Date(new Date(fechaIngreso).getTime() + 12 * 60 * 60 * 1000),
        horario,
        diasSemana,
        valorMensual: parseFloat(valorMensual),
        estado: "ACTIVO",
        ultimoPago: new Date(),
        nota: nota || null,
      },
    });

    const ingresoDate = new Date(new Date(fechaIngreso).getTime() + 12 * 60 * 60 * 1000);
    await prisma.pago.create({
      data: {
        clienteId: cliente.id,
        nombre: nombreCompleto,
        monto: parseFloat(valorMensual),
        fechaPago: ingresoDate,
        mes: ingresoDate.getMonth() + 1,
        ano: ingresoDate.getFullYear(),
      },
    });

    revalidatePath("/clientes");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error al crear cliente:", error);
    return NextResponse.json({ error: "Error al crear cliente" }, { status: 500 });
  }
}
