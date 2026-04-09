/**
 * ============================================================
 * VISTA - Página Principal (MVC)
 * ============================================================
 */

import Link from "next/link";
import Image from "next/image";
import { ProductModel, CategoryModel } from "@/lib/models/product.model";
import { ProductGrid } from "@/components/products/product-grid";
import { Button } from "@/components/ui/button";
import { ArrowRight, Package, Shield, RefreshCw, Truck } from "lucide-react";

export default function HomePage() {
  const productosDestacados = ProductModel.getFeatured(8);
  const categorias = CategoryModel.getAll();

  return (
    <main>
      {/* Hero Section - Elegante y Minimalista */}
      <section className="relative min-h-[85vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1920&h=1080&fit=crop"
            alt="Fashion Store"
            fill
            className="object-cover"
            priority
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/70 to-transparent" />
        </div>
        <div className="container relative z-10">
          <div className="max-w-xl">
            <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground mb-4">
              Nueva Coleccion 2026
            </p>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 text-balance leading-[1.1]">
              Elegancia en cada detalle
            </h1>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              Descubre piezas unicas que definen tu estilo personal. 
              Calidad premium, diseno atemporal.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/products">
                <Button size="lg" className="gap-2 px-8 h-12 text-base">
                  Explorar Coleccion
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/categories">
                <Button size="lg" variant="outline" className="px-8 h-12 text-base border-foreground/20">
                  Ver Categorias
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Barra de beneficios */}
      <section className="border-y border-border bg-card">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-border">
            <div className="flex items-center gap-3 py-6 px-4 md:px-6">
              <Truck className="h-5 w-5 text-muted-foreground shrink-0" />
              <span className="text-sm">Envio gratis +$200.000</span>
            </div>
            <div className="flex items-center gap-3 py-6 px-4 md:px-6">
              <RefreshCw className="h-5 w-5 text-muted-foreground shrink-0" />
              <span className="text-sm">15 dias devoluciones</span>
            </div>
            <div className="flex items-center gap-3 py-6 px-4 md:px-6">
              <Shield className="h-5 w-5 text-muted-foreground shrink-0" />
              <span className="text-sm">Pago seguro</span>
            </div>
            <div className="flex items-center gap-3 py-6 px-4 md:px-6">
              <Package className="h-5 w-5 text-muted-foreground shrink-0" />
              <span className="text-sm">Calidad garantizada</span>
            </div>
          </div>
        </div>
      </section>

      {/* Categorías con imágenes */}
      <section className="py-20">
        <div className="container">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground mb-2">
                Explora
              </p>
              <h2 className="text-3xl md:text-4xl font-bold">Categorias</h2>
            </div>
            <Link href="/categories">
              <Button variant="ghost" className="gap-2">
                Ver todas <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {categorias.slice(0, 4).map((categoria, index) => (
              <Link
                key={categoria.id_categoria}
                href={`/products?categoria=${categoria.id_categoria}`}
                className={`group relative overflow-hidden rounded-lg ${
                  index === 0 ? "md:col-span-2 md:row-span-2" : ""
                }`}
              >
                <div className={`relative ${index === 0 ? "aspect-square" : "aspect-[3/4]"}`}>
                  <Image
                    src={categoria.imagen || "/placeholder.jpg"}
                    alt={categoria.nombre}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/20 to-transparent" />
                  <div className="absolute inset-0 flex flex-col justify-end p-6">
                    <h3 className="text-primary-foreground font-semibold text-lg md:text-xl mb-1">
                      {categoria.nombre}
                    </h3>
                    <span className="text-primary-foreground/80 text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                      Ver productos <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          {/* Segunda fila de categorías */}
          <div className="grid grid-cols-3 gap-4 mt-4">
            {categorias.slice(4, 7).map((categoria) => (
              <Link
                key={categoria.id_categoria}
                href={`/products?categoria=${categoria.id_categoria}`}
                className="group relative overflow-hidden rounded-lg"
              >
                <div className="relative aspect-[4/3]">
                  <Image
                    src={categoria.imagen || "/placeholder.jpg"}
                    alt={categoria.nombre}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/20 to-transparent" />
                  <div className="absolute inset-0 flex flex-col justify-end p-5">
                    <h3 className="text-primary-foreground font-semibold text-lg">
                      {categoria.nombre}
                    </h3>
                    <span className="text-primary-foreground/80 text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                      Ver productos <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Productos Destacados */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground mb-2">
                Seleccion Curada
              </p>
              <h2 className="text-3xl md:text-4xl font-bold">Productos Destacados</h2>
            </div>
            <Link href="/products">
              <Button variant="ghost" className="gap-2">
                Ver catalogo completo <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          <ProductGrid productos={productosDestacados} />
        </div>
      </section>

      {/* Banner Promocional */}
      <section className="py-20">
        <div className="container">
          <div className="relative rounded-2xl overflow-hidden">
            <div className="absolute inset-0">
              <Image
                src="https://images.unsplash.com/photo-1445205170230-053b83016050?w=1600&h=600&fit=crop"
                alt="Nueva Coleccion"
                fill
                className="object-cover"
                unoptimized
              />
              <div className="absolute inset-0 bg-foreground/60" />
            </div>
            <div className="relative z-10 p-10 md:p-20 text-center">
              <p className="text-sm uppercase tracking-[0.3em] text-primary-foreground/80 mb-4">
                Oferta Especial
              </p>
              <h2 className="text-3xl md:text-5xl font-bold text-primary-foreground mb-4 max-w-2xl mx-auto text-balance">
                Hasta 40% de descuento en temporada
              </h2>
              <p className="text-lg text-primary-foreground/80 mb-8 max-w-lg mx-auto">
                Aprovecha nuestras ofertas exclusivas en piezas seleccionadas de la coleccion.
              </p>
              <Link href="/products">
                <Button size="lg" variant="secondary" className="px-8 h-12">
                  Comprar Ahora
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-20 bg-muted/50">
        <div className="container max-w-2xl text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Unete a nuestra comunidad
          </h2>
          <p className="text-muted-foreground mb-8">
            Recibe las ultimas novedades, ofertas exclusivas y consejos de estilo directamente en tu correo.
          </p>
          <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Tu correo electronico"
              className="flex-1 h-12 px-4 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <Button type="submit" className="h-12 px-6">
              Suscribirse
            </Button>
          </form>
          <p className="text-xs text-muted-foreground mt-4">
            Al suscribirte, aceptas recibir comunicaciones de marketing.
          </p>
        </div>
      </section>
    </main>
  );
}
