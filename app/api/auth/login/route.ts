/**
 * ============================================================
 * CONTROLADOR - Login (MVC)
 * ============================================================
 * Endpoint: POST /api/auth/login
 * Cumplimiento: ISO 9001, IEEE 730, ISO/IEC 25000
 * ============================================================
 */

import { NextRequest, NextResponse } from "next/server";
import { UserModelMySQL } from "@/lib/db/models/user.mysql";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { emailusuario, clave } = body;

    // Validar campos requeridos
    if (!emailusuario || !clave) {
      return NextResponse.json(
        { success: false, message: "Email y contraseña son requeridos" },
        { status: 400 }
      );
    }

    // Autenticar usuario en MySQL
    const resultado = await UserModelMySQL.authenticate(emailusuario, clave);

    if (!resultado.success) {
      return NextResponse.json(
        { success: false, message: resultado.message },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      message: resultado.message,
      usuario: resultado.usuario,
    });
  } catch (error) {
    console.error("[v0] Error en login:", error);
    return NextResponse.json(
      { success: false, message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
