/**
 * ============================================================
 * CONTROLADOR - Dashboard Admin (MVC)
 * ============================================================
 * Endpoint: GET /api/admin/dashboard
 * Cumplimiento: ISO 9001, ISO/IEC 25000, CMMI
 * ============================================================
 */

import { NextResponse } from "next/server";
import { DashboardModelMySQL } from "@/lib/db/models/inventory.mysql";

export async function GET() {
  try {
    const stats = await DashboardModelMySQL.getStats();
    const topProducts = await DashboardModelMySQL.getTopProducts();

    return NextResponse.json({
      success: true,
      data: {
        ...stats,
        top_productos: topProducts,
      },
    });
  } catch (error) {
    console.error("[v0] Error obteniendo estadisticas:", error);
    return NextResponse.json(
      { success: false, message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
