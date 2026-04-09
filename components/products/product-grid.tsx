/**
 * ============================================================
 * VISTA - Grid de Productos (MVC)
 * ============================================================
 */

import type { Producto } from "@/lib/models/types";
import { ProductCard } from "./product-card";

interface ProductGridProps {
  productos: Producto[];
  showAddToCart?: boolean;
}

export function ProductGrid({ productos, showAddToCart = true }: ProductGridProps) {
  if (productos.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No se encontraron productos</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
      {productos.map((producto) => (
        <ProductCard
          key={producto.id_producto}
          producto={producto}
          showAddToCart={showAddToCart}
        />
      ))}
    </div>
  );
}
