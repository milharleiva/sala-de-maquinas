import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/server";

export const dynamic = "force-dynamic";

function parseTime(timeStr: string): number {
  const [horas, minutos] = timeStr.split(":").map(Number);
  return horas + minutos / 60;
}

function clienteEnHorario(horariosPorDia: any, dia: string, hora: number): boolean {
  if (!horariosPorDia || !horariosPorDia[dia]) return false;
  const { inicio, fin } = horariosPorDia[dia];
  const horaInicio = parseTime(inicio);
  const horaFin = parseTime(fin);
  return hora >= horaInicio && (hora + 1) <= horaFin;
}

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

    const currentClient = await prisma.cliente.findUnique({ where: { id } });

    const oldBlocks = new Set<string>();
    if (currentClient?.horariosPorDia && currentClient.diasSemana) {
      for (const dia of currentClient.diasSemana) {
        const horario = (currentClient.horariosPorDia as any)[dia];
        if (!horario?.inicio || !horario?.fin) continue;
        const horaInicio = parseTime(horario.inicio);
        const horaFin = parseTime(horario.fin);
        for (let h = 6; h <= 22; h++) {
          if (h >= horaInicio && (h + 1) <= horaFin) {
            oldBlocks.add(`${dia}|${h}`);
          }
        }
      }
    }

    if (horariosPorDia && diasSemana.length > 0) {
      const allClients = await prisma.cliente.findMany();

      for (const dia of diasSemana) {
        const horario = horariosPorDia[dia];
        if (!horario?.inicio || !horario?.fin) continue;

        const horaInicio = parseTime(horario.inicio);
        const horaFin = parseTime(horario.fin);

        for (let h = 6; h <= 22; h++) {
          if (h >= horaInicio && (h + 1) <= horaFin) {
            const wasAlreadyThere = oldBlocks.has(`${dia}|${h}`);

            const count = allClients.filter((c: any) => {
              if (wasAlreadyThere && c.id === id) return false;
              if (!c.diasSemana.includes(dia)) return false;
              return clienteEnHorario(c.horariosPorDia, dia, h);
            }).length;

            if (count >= 17) {
              const horaStr = `${h.toString().padStart(2, "0")}:00-${(h + 1).toString().padStart(2, "0")}:00`;
              return NextResponse.json(
                { error: `El horario ${dia} ${horaStr} ya tiene 17 personas` },
                { status: 409 }
              );
            }
          }
        }
      }
    }

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
