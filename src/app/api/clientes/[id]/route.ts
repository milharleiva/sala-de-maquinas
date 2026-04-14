import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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
    const { nombreCompleto, fechaIngreso, horario, diasSemana, valorMensual } = body;

    if (!nombreCompleto || !fechaIngreso || !horario || !diasSemana || !valorMensual) {
      return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 });
    }

    await prisma.cliente.update({
      where: { id },
      data: {
        nombreCompleto,
        fechaIngreso: new Date(fechaIngreso),
        horario,
        diasSemana,
        valorMensual: parseFloat(valorMensual),
      },
    });

    revalidatePath("/clientes");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error al actualizar cliente:", error);
    return NextResponse.json({ error: "Error al actualizar" }, { status: 500 });
  }
}
