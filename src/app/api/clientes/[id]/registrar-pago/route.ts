import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user || (user as any).user_metadata?.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id: clienteId } = await params;
    const body = await request.json();
    const { monto } = body;

    const cliente = await prisma.cliente.findUnique({ where: { id: clienteId } });
    
    if (!cliente) {
      return NextResponse.json({ error: "Cliente no encontrado" }, { status: 404 });
    }

    const valorMensual = Number(cliente.valorMensual);

    if (!monto || monto < valorMensual) {
      return NextResponse.json({ 
        error: `El monto debe ser al menos $${valorMensual}` 
      }, { status: 400 });
    }

    const now = new Date();

    await prisma.pago.create({
      data: {
        clienteId,
        monto,
        fechaPago: now,
        mes: now.getMonth() + 1,
        ano: now.getFullYear(),
      },
    });

    await prisma.cliente.update({
      where: { id: clienteId },
      data: {
        estado: "ACTIVO",
        ultimoPago: now,
      },
    });

    revalidatePath("/clientes");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error al registrar pago:", error);
    return NextResponse.json({ error: "Error al registrar pago" }, { status: 500 });
  }
}
