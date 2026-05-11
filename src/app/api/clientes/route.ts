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

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user || (user as any).user_metadata?.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { rut, nombreCompleto, fechaIngreso, horariosPorDia, diasSemana, valorMensual, nota } = body;

    if (!nombreCompleto || !fechaIngreso || !diasSemana || diasSemana.length === 0 || !valorMensual) {
      return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 });
    }

    const prisma = await getPrisma();

    if (horariosPorDia && diasSemana.length > 0) {
      const allClients = await prisma.cliente.findMany();

      for (const dia of diasSemana) {
        const horario = horariosPorDia[dia];
        if (!horario?.inicio || !horario?.fin) continue;

        const horaInicio = parseTime(horario.inicio);
        const horaFin = parseTime(horario.fin);

        for (let h = 6; h <= 22; h++) {
          if (h >= horaInicio && (h + 1) <= horaFin) {
            const count = allClients.filter((c: any) =>
              c.diasSemana.includes(dia) &&
              clienteEnHorario(c.horariosPorDia, dia, h)
            ).length;

            if (count >= 16) {
              const horaStr = `${h.toString().padStart(2, "0")}:00-${(h + 1).toString().padStart(2, "0")}:00`;
              return NextResponse.json(
                { error: `El horario ${dia} ${horaStr} ya tiene 16 personas` },
                { status: 409 }
              );
            }
          }
        }
      }
    }

    const cliente = await prisma.cliente.create({
      data: {
        rut: rut || "",
        nombreCompleto,
        fechaIngreso: new Date(new Date(fechaIngreso).getTime() + 12 * 60 * 60 * 1000),
        horario: "",
        horariosPorDia: horariosPorDia || {},
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
