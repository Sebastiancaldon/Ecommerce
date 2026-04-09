/**
 * ============================================================
 * VISTA - Página de Productos (MVC)
 * ============================================================
 */

import { ProductModel, CategoryModel } from "@/lib/models/product.model";
import { ProductGrid } from "@/components/products/product-grid";
import { CategoryFilter } from "@/components/products/category-filter";
import type { FiltrosProducto } from "@/lib/models/types";

export const metadata = {
  title: "Productos - MODA E-Commerce",
  description: "Explora nuestra colección completa de ropa y accesorios",
};

interface ProductsPageProps {
  searchParams: Promise<{
    categoria?: string;
    busqueda?: string;
    orden?: string;
    precio_min?: string;
    precio_max?: string;
  }>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  
  // Construir filtros
  const filtros: FiltrosProducto = {};

  if (params.categoria) {
    filtros.categoria = params.categoria;
  }
  if (params.busqueda) {
    filtros.busqueda = params.busqueda;
  }
  if (params.orden) {
    filtros.orden = params.orden as FiltrosProducto["orden"];
  }
  if (params.precio_min) {
    filtros.precio_min = parseFloat(params.precio_min);
  }
  if (params.precio_max) {
    filtros.precio_max = parseFloat(params.precio_max);
  }

  // Obtener datos
  const productos = ProductModel.getAll(filtros);
  const categorias = CategoryModel.getAll();

  return (
    <main className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Productos</h1>
        {params.busqueda && (
          <p className="text-muted-foreground">
            Resultados para: &quot;{params.busqueda}&quot;
          </p>
        )}
        <p className="text-sm text-muted-foreground">
          {productos.length} productos encontrados
        </p>
      </div>

      <CategoryFilter
        categorias={categorias}
        categoriaActual={params.categoria}
      />

      <ProductGrid productos={productos} />
    </main>
  );
}
