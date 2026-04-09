/**
 * ============================================================
 * CONTROLADOR - Pedidos (MVC)
 * ============================================================
 * Endpoints: GET, POST /api/orders
 * Cumplimiento: ISO 9001, IEEE 730, ISO/IEC 25000, ISO/IEC 20000
 * ============================================================
 */

import { NextRequest, NextResponse } from "next/server";
import { OrderModelMySQL } from "@/lib/db/models/order.mysql";
import type { DatosPago } from "@/lib/models/types";

// GET - Obtener pedidos
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id_usuario = searchParams.get("id_usuario");
    const id_pedido = searchParams.get("id");
    const admin = searchParams.get("admin") === "true";

    // Obtener pedido especifico
    if (id_pedido) {
      const pedido = await OrderModelMySQL.findById(id_pedido);
      if (!pedido) {
        return NextResponse.json(
          { success: false, message: "Pedido no encontrado" },
          { status: 404 }
        );
      }
      return NextResponse.json({
        success: true,
        data: pedido,
      });
    }

    // Obtener todos los pedidos (admin)
    if (admin) {
      const pedidos = await OrderModelMySQL.getAll();
      return NextResponse.json({
        success: true,
        data: pedidos,
        total: pedidos.length,
      });
    }

    // Obtener pedidos del usuario
    if (!id_usuario) {
      return NextResponse.json(
        { success: false, message: "ID de usuario requerido" },
        { status: 400 }
      );
    }

    const pedidos = await OrderModelMySQL.getByUsuario(id_usuario);

    return NextResponse.json({
      success: true,
      data: pedidos,
      total: pedidos.length,
    });
  } catch (error) {
    console.error("[v0] Error obteniendo pedidos:", error);
    return NextResponse.json(
      { success: false, message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// POST - Crear pedido (checkout)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id_usuario, datos_pago } = body;

    if (!id_usuario) {
      return NextResponse.json(
        { success: false, message: "ID de usuario requerido" },
        { status: 400 }
      );
    }

    if (!datos_pago || !datos_pago.metodo) {
      return NextResponse.json(
        { success: false, message: "Datos de pago requeridos" },
        { status: 400 }
      );
    }

    const datosPago: DatosPago = {
      metodo: datos_pago.metodo,
      numero_tarjeta: datos_pago.numero_tarjeta,
      nombre_titular: datos_pago.nombre_titular,
      fecha_expiracion: datos_pago.fecha_expiracion,
      cvv: datos_pago.cvv,
      email_paypal: datos_pago.email_paypal,
      banco: datos_pago.banco,
      referencia: datos_pago.referencia,
    };

    const resultado = await OrderModelMySQL.createFromCart(id_usuario, datosPago);

    if (!resultado.success) {
      return NextResponse.json(
        { success: false, message: resultado.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: resultado.message,
      data: resultado.pedido,
    });
  } catch (error) {
    console.error("[v0] Error creando pedido:", error);
    return NextResponse.json(
      { success: false, message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
