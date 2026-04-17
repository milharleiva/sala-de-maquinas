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

    const { id } = await params;
    const prisma = await getPrisma();

    const cliente = await prisma.cliente.findUnique({ where: { id } });

    if (!cliente) {
      return NextResponse.json({ error: "Cliente no encontrado" }, { status: 404 });
    }

    await prisma.cliente.update({
      where: { id },
      data: {
        estado: "VENCIDO",
      },
    });

    revalidatePath("/clientes");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error al marcar cliente como vencido:", error);
    return NextResponse.json({ error: "Error al actualizar" }, { status: 500 });
  }
}
