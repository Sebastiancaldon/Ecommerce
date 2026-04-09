/**
 * ============================================================
 * CONTROLADOR - Carrito (MVC)
 * ============================================================
 * Endpoints: GET, POST, PUT, DELETE /api/cart
 * Cumplimiento: ISO 9001, IEEE 730, ISO/IEC 25000
 * ============================================================
 */

import { NextRequest, NextResponse } from "next/server";
import { CartModelMySQL } from "@/lib/db/models/cart.mysql";

// GET - Obtener carrito del usuario
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id_usuario = searchParams.get("id_usuario");

    if (!id_usuario) {
      return NextResponse.json(
        { success: false, message: "ID de usuario requerido" },
        { status: 400 }
      );
    }

    const carrito = await CartModelMySQL.getCartCompleto(id_usuario);

    return NextResponse.json({
      success: true,
      data: carrito,
    });
  } catch (error) {
    console.error("[v0] Error obteniendo carrito:", error);
    return NextResponse.json(
      { success: false, message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// POST - Agregar producto al carrito
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id_usuario, id_producto, cantidad = 1 } = body;

    if (!id_usuario || !id_producto) {
      return NextResponse.json(
        { success: false, message: "ID de usuario y producto requeridos" },
        { status: 400 }
      );
    }

    const resultado = await CartModelMySQL.addItem(id_usuario, id_producto, cantidad);

    if (!resultado.success) {
      return NextResponse.json(
        { success: false, message: resultado.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: resultado.message,
      data: resultado.carrito,
    });
  } catch (error) {
    console.error("[v0] Error agregando al carrito:", error);
    return NextResponse.json(
      { success: false, message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// PUT - Actualizar cantidad
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id_usuario, id_producto, cantidad } = body;

    if (!id_usuario || !id_producto || cantidad === undefined) {
      return NextResponse.json(
        { success: false, message: "Datos incompletos" },
        { status: 400 }
      );
    }

    const resultado = await CartModelMySQL.updateQuantity(id_usuario, id_producto, cantidad);

    if (!resultado.success) {
      return NextResponse.json(
        { success: false, message: resultado.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: resultado.message,
      data: resultado.carrito,
    });
  } catch (error) {
    console.error("[v0] Error actualizando carrito:", error);
    return NextResponse.json(
      { success: false, message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar producto del carrito
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { id_usuario, id_producto } = body;

    if (!id_usuario || !id_producto) {
      return NextResponse.json(
        { success: false, message: "ID de usuario y producto requeridos" },
        { status: 400 }
      );
    }

    const resultado = await CartModelMySQL.removeItem(id_usuario, id_producto);

    if (!resultado.success) {
      return NextResponse.json(
        { success: false, message: resultado.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: resultado.message,
      data: resultado.carrito,
    });
  } catch (error) {
    console.error("[v0] Error eliminando del carrito:", error);
    return NextResponse.json(
      { success: false, message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
