/**
 * ============================================================
 * CONTROLADOR - Categorias (MVC)
 * ============================================================
 * Endpoints: GET, POST, PUT, DELETE /api/categories
 * Cumplimiento: ISO 9001, ISO/IEC 25000
 * ============================================================
 */

import { NextRequest, NextResponse } from "next/server";
import { CategoryModelMySQL } from "@/lib/db/models/product.mysql";

// GET - Obtener categorias
export async function GET() {
  try {
    const categorias = await CategoryModelMySQL.getAll();
    const categoriasConConteo = await Promise.all(
      categorias.map(async (cat) => ({
        ...cat,
        productos_count: await CategoryModelMySQL.countProducts(cat.id_categoria),
      }))
    );

    return NextResponse.json({
      success: true,
      data: categoriasConConteo,
    });
  } catch (error) {
    console.error("[v0] Error obteniendo categorias:", error);
    return NextResponse.json(
      { success: false, message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// POST - Crear categoria (admin)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nombre } = body;

    if (!nombre) {
      return NextResponse.json(
        { success: false, message: "Nombre requerido" },
        { status: 400 }
      );
    }

    const resultado = await CategoryModelMySQL.create(nombre);

    if (!resultado.success) {
      return NextResponse.json(
        { success: false, message: resultado.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: resultado.message,
      data: resultado.categoria,
    });
  } catch (error) {
    console.error("[v0] Error creando categoria:", error);
    return NextResponse.json(
      { success: false, message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// PUT - Actualizar categoria (admin)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id_categoria, nombre } = body;

    if (!id_categoria || !nombre) {
      return NextResponse.json(
        { success: false, message: "ID y nombre requeridos" },
        { status: 400 }
      );
    }

    const resultado = await CategoryModelMySQL.update(id_categoria, nombre);

    if (!resultado.success) {
      return NextResponse.json(
        { success: false, message: resultado.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: resultado.message,
      data: resultado.categoria,
    });
  } catch (error) {
    console.error("[v0] Error actualizando categoria:", error);
    return NextResponse.json(
      { success: false, message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar categoria (admin)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, message: "ID de categoria requerido" },
        { status: 400 }
      );
    }

    const resultado = await CategoryModelMySQL.delete(id);

    if (!resultado.success) {
      return NextResponse.json(
        { success: false, message: resultado.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: resultado.message,
    });
  } catch (error) {
    console.error("[v0] Error eliminando categoria:", error);
    return NextResponse.json(
      { success: false, message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
