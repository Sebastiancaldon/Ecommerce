/**
 * ============================================================
 * CONTROLADOR - Productos (MVC)
 * ============================================================
 * Endpoints: GET, POST, PUT, DELETE /api/products
 * Cumplimiento: ISO 9001, ISO/IEC 25000, ISO/IEC 12207
 * ============================================================
 */

import { NextRequest, NextResponse } from "next/server";
import { ProductModelMySQL } from "@/lib/db/models/product.mysql";
import type { FiltrosProducto } from "@/lib/models/types";

// GET - Obtener productos con filtros
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const filtros: FiltrosProducto = {};
    
    if (searchParams.get("categoria")) {
      filtros.categoria = searchParams.get("categoria")!;
    }
    if (searchParams.get("precio_min")) {
      filtros.precio_min = parseFloat(searchParams.get("precio_min")!);
    }
    if (searchParams.get("precio_max")) {
      filtros.precio_max = parseFloat(searchParams.get("precio_max")!);
    }
    if (searchParams.get("busqueda")) {
      filtros.busqueda = searchParams.get("busqueda")!;
    }
    if (searchParams.get("orden")) {
      filtros.orden = searchParams.get("orden") as FiltrosProducto["orden"];
    }

    // Si se solicita un producto específico por ID
    const id = searchParams.get("id");
    if (id) {
      const producto = await ProductModelMySQL.findById(id);
      if (!producto) {
        return NextResponse.json(
          { success: false, message: "Producto no encontrado" },
          { status: 404 }
        );
      }
      const stock = await ProductModelMySQL.getStock(id);
      return NextResponse.json({
        success: true,
        data: { ...producto, stock },
      });
    }

    // Si se solicitan productos destacados
    if (searchParams.get("featured") === "true") {
      const limit = parseInt(searchParams.get("limit") || "8");
      const productos = await ProductModelMySQL.getFeatured(limit);
      return NextResponse.json({
        success: true,
        data: productos,
      });
    }

    const productos = await ProductModelMySQL.getAll(filtros);
    
    return NextResponse.json({
      success: true,
      data: productos,
      total: productos.length,
    });
  } catch (error) {
    console.error("[v0] Error obteniendo productos:", error);
    return NextResponse.json(
      { success: false, message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// POST - Crear producto (admin)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nombre, descripcion, precio, id_categoria, imagen } = body;

    if (!nombre || !descripcion || precio === undefined || !id_categoria) {
      return NextResponse.json(
        { success: false, message: "Campos requeridos faltantes" },
        { status: 400 }
      );
    }

    const resultado = await ProductModelMySQL.create({
      nombre,
      descripcion,
      precio: parseFloat(precio),
      id_categoria,
      imagen,
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
      data: resultado.producto,
    });
  } catch (error) {
    console.error("[v0] Error creando producto:", error);
    return NextResponse.json(
      { success: false, message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// PUT - Actualizar producto (admin)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id_producto, ...datos } = body;

    if (!id_producto) {
      return NextResponse.json(
        { success: false, message: "ID de producto requerido" },
        { status: 400 }
      );
    }

    const resultado = await ProductModelMySQL.update(id_producto, datos);

    if (!resultado.success) {
      return NextResponse.json(
        { success: false, message: resultado.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: resultado.message,
      data: resultado.producto,
    });
  } catch (error) {
    console.error("[v0] Error actualizando producto:", error);
    return NextResponse.json(
      { success: false, message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar producto (admin)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, message: "ID de producto requerido" },
        { status: 400 }
      );
    }

    const resultado = await ProductModelMySQL.delete(id);

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
    console.error("[v0] Error eliminando producto:", error);
    return NextResponse.json(
      { success: false, message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
