/**
 * ============================================================
 * CONTROLADOR - Vaciar Carrito (MVC)
 * ============================================================
 * Endpoint: POST /api/cart/clear
 * ============================================================
 */

import { NextRequest, NextResponse } from "next/server";
import { CartModelMySQL } from "@/lib/db/models/cart.mysql";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id_usuario } = body;

    if (!id_usuario) {
      return NextResponse.json(
        { success: false, message: "ID de usuario requerido" },
        { status: 400 }
      );
    }

    const resultado = await CartModelMySQL.clearCart(id_usuario);

    return NextResponse.json({
      success: true,
      message: resultado.message,
    });
  } catch (error) {
    console.error("[v0] Error vaciando carrito:", error);
    return NextResponse.json(
      { success: false, message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
