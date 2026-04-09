/**
 * ============================================================
 * CONTROLADOR - Registro (MVC)
 * ============================================================
 * Endpoint: POST /api/auth/register
 * Cumplimiento: ISO 9001, IEEE 730, ISO/IEC 25000
 * ============================================================
 */

import { NextRequest, NextResponse } from "next/server";
import { UserModelMySQL } from "@/lib/db/models/user.mysql";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nombreusuario, emailusuario, telefono, clave } = body;

    // Validar campos requeridos
    if (!nombreusuario || !emailusuario || !telefono || !clave) {
      return NextResponse.json(
        { success: false, message: "Todos los campos son requeridos" },
        { status: 400 }
      );
    }

    // Registrar usuario en MySQL
    const resultado = await UserModelMySQL.register({
      nombreusuario,
      emailusuario,
      telefono,
      clave,
    });

    if (!resultado.success) {
      return NextResponse.json(
        { success: false, message: resultado.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: resultado.message,
      usuario: resultado.usuario,
    });
  } catch (error) {
    console.error("[v0] Error en registro:", error);
    return NextResponse.json(
      { success: false, message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
