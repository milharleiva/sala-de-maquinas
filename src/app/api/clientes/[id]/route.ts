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

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const prisma = await getPrisma();
    const cliente = await prisma.cliente.findUnique({ where: { id } });

    if (!cliente) {
      return NextResponse.json({ error: "Cliente no encontrado" }, { status: 404 });
    }

    return NextResponse.json({
      ...cliente,
      valorMensual: Number(cliente.valorMensual),
    });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Error al obtener cliente" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user || (user as any).user_metadata?.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { rut, nombreCompleto, fechaIngreso, horariosPorDia, diasSemana, valorMensual, nota } = body;

    if (!nombreCompleto || !fechaIngreso || !diasSemana || diasSemana.length === 0 || !valorMensual) {
      return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 });
    }

    const prisma = await getPrisma();
    await prisma.cliente.update({
      where: { id },
      data: {
        rut: rut || "",
        nombreCompleto,
        fechaIngreso: new Date(new Date(fechaIngreso).getTime() + 12 * 60 * 60 * 1000),
        horariosPorDia: horariosPorDia || {},
        diasSemana,
        valorMensual: parseFloat(valorMensual),
        nota: nota || null,
      },
    });

    revalidatePath("/clientes");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error al actualizar cliente:", error);
    return NextResponse.json({ error: "Error al actualizar" }, { status: 500 });
  }
}
