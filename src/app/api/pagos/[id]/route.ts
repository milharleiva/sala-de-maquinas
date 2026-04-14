import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/server";

export async function DELETE(
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
    const prisma = getPrisma();

    await prisma.pago.delete({
      where: { id },
    });

    revalidatePath("/auditoria");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error al eliminar pago:", error);
    return NextResponse.json({ error: "Error al eliminar" }, { status: 500 });
  }
}
