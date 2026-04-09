"use client";

/**
 * ============================================================
 * VISTA - Página del Carrito (MVC)
 * ============================================================
 * Cumplimiento: ISO 9001, ISO/IEC 25000 - Usabilidad
 * ============================================================
 */

import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/lib/context/auth-context";
import { useCart } from "@/lib/context/cart-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { useState } from "react";

export default function CartPage() {
  const { usuario, isLoading: authLoading } = useAuth();
  const { carrito, isLoading, updateQuantity, removeFromCart } = useCart();
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());

  const handleUpdateQuantity = async (id_producto: string, newQuantity: number) => {
    setUpdatingItems((prev) => new Set(prev).add(id_producto));
    await updateQuantity(id_producto, newQuantity);
    setUpdatingItems((prev) => {
      const newSet = new Set(prev);
      newSet.delete(id_producto);
      return newSet;
    });
  };

  const handleRemove = async (id_producto: string) => {
    setUpdatingItems((prev) => new Set(prev).add(id_producto));
    await removeFromCart(id_producto);
    setUpdatingItems((prev) => {
      const newSet = new Set(prev);
      newSet.delete(id_producto);
      return newSet;
    });
  };

  // Estado de carga
  if (authLoading || isLoading) {
    return (
      <main className="container py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </main>
    );
  }

  // Usuario no autenticado
  if (!usuario) {
    return (
      <main className="container py-8">
        <div className="max-w-md mx-auto text-center py-16">
          <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">Inicia sesión</h1>
          <p className="text-muted-foreground mb-6">
            Para ver tu carrito de compras, necesitas iniciar sesión.
          </p>
          <Link href="/login">
            <Button size="lg">Iniciar Sesión</Button>
          </Link>
        </div>
      </main>
    );
  }

  // Carrito vacío
  if (!carrito || carrito.items.length === 0) {
    return (
      <main className="container py-8">
        <div className="max-w-md mx-auto text-center py-16">
          <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">Tu carrito está vacío</h1>
          <p className="text-muted-foreground mb-6">
            Explora nuestra colección y agrega productos a tu carrito.
          </p>
          <Link href="/products">
            <Button size="lg">Ver Productos</Button>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Carrito de Compras</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Lista de productos */}
        <div className="lg:col-span-2 space-y-4">
          {carrito.items.map((item) => (
            <Card key={item.id_detalle} className="overflow-hidden">
              <div className="flex gap-4 p-4">
                {/* Imagen */}
                <div className="relative w-24 h-32 bg-muted rounded-md overflow-hidden flex-shrink-0">
                  <Image
                    src={item.producto?.imagen || "/placeholder.jpg"}
                    alt={item.producto?.nombre || "Producto"}
                    fill
                    className="object-cover"
                    unoptimized={item.producto?.imagen?.startsWith('http')}
                  />
                </div>

                {/* Detalles */}
                <div className="flex-1 min-w-0">
                  <Link href={`/products/${item.id_producto}`}>
                    <h3 className="font-medium hover:underline">
                      {item.producto?.nombre}
                    </h3>
                  </Link>
                  <p className="text-sm text-muted-foreground mb-2">
                    {item.producto?.categoria?.nombre}
                  </p>
                  <p className="font-semibold">
                    ${item.producto?.precio.toFixed(2)}
                  </p>
                </div>

                {/* Controles de cantidad */}
                <div className="flex flex-col items-end justify-between">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemove(item.id_producto)}
                    disabled={updatingItems.has(item.id_producto)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    {updatingItems.has(item.id_producto) ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>

                  <div className="flex items-center border rounded-md">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() =>
                        handleUpdateQuantity(item.id_producto, item.cantidad - 1)
                      }
                      disabled={
                        item.cantidad <= 1 ||
                        updatingItems.has(item.id_producto)
                      }
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-8 text-center text-sm">
                      {item.cantidad}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() =>
                        handleUpdateQuantity(item.id_producto, item.cantidad + 1)
                      }
                      disabled={updatingItems.has(item.id_producto)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>

                  <p className="font-semibold">
                    ${((item.producto?.precio || 0) * item.cantidad).toFixed(2)}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Resumen */}
        <div>
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>Resumen del Pedido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  Subtotal ({carrito.cantidad_items} items)
                </span>
                <span>${carrito.total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Envío</span>
                <span>{carrito.total >= 100 ? "Gratis" : "$10.00"}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-semibold text-lg">
                <span>Total</span>
                <span>
                  $
                  {(carrito.total >= 100
                    ? carrito.total
                    : carrito.total + 10
                  ).toFixed(2)}
                </span>
              </div>
              {carrito.total < 100 && (
                <p className="text-xs text-muted-foreground">
                  Agrega ${(100 - carrito.total).toFixed(2)} más para envío
                  gratis
                </p>
              )}
            </CardContent>
            <CardFooter>
              <Link href="/checkout" className="w-full">
                <Button className="w-full gap-2" size="lg">
                  Proceder al Pago
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    </main>
  );
}
