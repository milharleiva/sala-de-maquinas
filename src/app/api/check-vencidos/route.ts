import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAfter, addMonths, startOfDay } from "date-fns";

export async function GET() {
  try {
    const clientes = await prisma.cliente.findMany();

    let actualizados = 0;

    for (const cliente of clientes) {
      if (cliente.ultimoPago) {
        const proximoVencimiento = addMonths(cliente.ultimoPago, 1);
        if (isAfter(startOfDay(new Date()), startOfDay(proximoVencimiento))) {
          if (cliente.estado !== "VENCIDO") {
            await prisma.cliente.update({
              where: { id: cliente.id },
              data: { estado: "VENCIDO" },
            });
            actualizados++;
          }
        } else {
          if (cliente.estado === "VENCIDO") {
            await prisma.cliente.update({
              where: { id: cliente.id },
              data: { estado: "ACTIVO" },
            });
          }
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `Verificacion completada. ${actualizados} clientes actualizados.` 
    });
  } catch (error) {
    console.error("Error en verificacion de vencidos:", error);
    return NextResponse.json({ 
      success: false, 
      error: "Error en la verificacion" 
    }, { status: 500 });
  }
}
