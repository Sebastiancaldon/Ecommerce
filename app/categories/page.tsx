/**
 * ============================================================
 * VISTA - Página de Categorías (MVC)
 * ============================================================
 */

import Link from "next/link";
import { CategoryModel, ProductModel } from "@/lib/models/product.model";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";

export const metadata = {
  title: "Categorías - MODA E-Commerce",
  description: "Explora todas las categorías de productos",
};

export default function CategoriesPage() {
  const categorias = CategoryModel.getAll();

  return (
    <main className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Categorías</h1>
        <p className="text-muted-foreground">
          Explora nuestra colección por categorías
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categorias.map((categoria) => {
          const productosCount = CategoryModel.countProducts(categoria.id_categoria);
          const productos = ProductModel.getByCategoria(categoria.id_categoria).slice(0, 3);

          return (
            <Link
              key={categoria.id_categoria}
              href={`/products?categoria=${categoria.id_categoria}`}
            >
              <Card className="group hover:shadow-lg transition-shadow overflow-hidden">
                {/* Preview de productos */}
                <div className="grid grid-cols-3 h-40">
                  {productos.map((producto, index) => (
                    <div
                      key={producto.id_producto}
                      className="relative bg-muted overflow-hidden"
                      style={{
                        backgroundImage: `url(${producto.imagen})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }}
                    />
                  ))}
                  {productos.length < 3 &&
                    Array.from({ length: 3 - productos.length }).map((_, i) => (
                      <div key={i} className="bg-muted" />
                    ))}
                </div>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                        {categoria.nombre}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {productosCount} productos
                      </p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
