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
    const { nombre, monto } = body;

    if (!nombre || !monto) {
      return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 });
    }

    const montoNum = parseFloat(monto);
    if (montoNum <= 0) {
      return NextResponse.json({ error: "El monto debe ser mayor a 0" }, { status: 400 });
    }

    const now = new Date();

    const prisma = await getPrisma();
    await prisma.pago.create({
      data: {
        clienteId: "",
        nombre,
        monto: montoNum,
        fechaPago: now,
        mes: now.getMonth() + 1,
        ano: now.getFullYear(),
      },
    });

    revalidatePath("/auditoria");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error al registrar pago del día:", error);
    return NextResponse.json({ error: "Error al registrar pago" }, { status: 500 });
  }
}
