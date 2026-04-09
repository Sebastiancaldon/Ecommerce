/**
 * ============================================================
 * VISTA - Detalle de Producto (MVC)
 * ============================================================
 */

import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductModel } from "@/lib/models/product.model";
import { AddToCartButton } from "@/components/products/add-to-cart-button";
import { ProductGrid } from "@/components/products/product-grid";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Package, Truck, Shield } from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface ProductDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: ProductDetailPageProps) {
  const { id } = await params;
  const producto = ProductModel.findById(id);

  if (!producto) {
    return { title: "Producto no encontrado" };
  }

  return {
    title: `${producto.nombre} - MODA E-Commerce`,
    description: producto.descripcion,
  };
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { id } = await params;
  const producto = ProductModel.findById(id);

  if (!producto) {
    notFound();
  }

  const stock = ProductModel.getStock(id);
  const productosRelacionados = ProductModel.getByCategoria(producto.id_categoria)
    .filter((p) => p.id_producto !== id)
    .slice(0, 4);

  return (
    <main className="container py-8">
      {/* Navegación */}
      <Link href="/products">
        <Button variant="ghost" className="mb-6 gap-2">
          <ArrowLeft className="h-4 w-4" />
          Volver a productos
        </Button>
      </Link>

      {/* Detalle del producto */}
      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        {/* Imagen */}
        <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-muted">
          <Image
            src={producto.imagen || "/placeholder.jpg"}
            alt={producto.nombre}
            fill
            className="object-cover"
            priority
            unoptimized={producto.imagen?.startsWith('http')}
          />
        </div>

        {/* Información */}
        <div className="flex flex-col">
          <div className="mb-4">
            <Link
              href={`/products?categoria=${producto.id_categoria}`}
              className="text-sm text-muted-foreground uppercase tracking-wide hover:text-foreground"
            >
              {producto.categoria?.nombre}
            </Link>
          </div>

          <h1 className="text-3xl font-bold mb-4">{producto.nombre}</h1>

          <p className="text-2xl font-semibold mb-6">
            {formatPrice(producto.precio)}
          </p>

          {/* Stock */}
          <div className="mb-6">
            {stock > 10 ? (
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                En Stock ({stock} disponibles)
              </Badge>
            ) : stock > 0 ? (
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                Pocas unidades ({stock} disponibles)
              </Badge>
            ) : (
              <Badge variant="destructive">Agotado</Badge>
            )}
          </div>

          {/* Descripción */}
          <p className="text-muted-foreground mb-8 leading-relaxed">
            {producto.descripcion}
          </p>

          {/* Botón agregar al carrito */}
          {stock > 0 && (
            <div className="mb-8">
              <AddToCartButton producto={producto} stock={stock} />
            </div>
          )}

          {/* Beneficios */}
          <div className="border-t pt-6 space-y-4">
            <div className="flex items-center gap-3">
              <Truck className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium text-sm">Envío Gratis</p>
                <p className="text-xs text-muted-foreground">
                  En compras mayores a $200.000
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Package className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium text-sm">Devolución Fácil</p>
                <p className="text-xs text-muted-foreground">
                  30 días para devoluciones
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium text-sm">Pago Seguro</p>
                <p className="text-xs text-muted-foreground">
                  Tarjeta, PayPal o Transferencia
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Productos relacionados */}
      {productosRelacionados.length > 0 && (
        <section className="mt-16">
          <h2 className="text-2xl font-bold mb-6">Productos Relacionados</h2>
          <ProductGrid productos={productosRelacionados} />
        </section>
      )}
    </main>
  );
}
