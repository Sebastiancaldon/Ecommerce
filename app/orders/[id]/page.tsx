"use client";

/**
 * ============================================================
 * VISTA - Detalle de Pedido (MVC)
 * ============================================================
 */

import { useEffect, useState, use } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/lib/context/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Loader2,
  Package,
  ArrowLeft,
  CheckCircle,
  Clock,
  XCircle,
  CreditCard,
  Building,
} from "lucide-react";
import type { Pedido } from "@/lib/models/types";

interface OrderDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { id } = use(params);
  const { usuario, isLoading: authLoading } = useAuth();
  const [pedido, setPedido] = useState<Pedido | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/orders?id=${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setPedido(data.data);
        }
      })
      .finally(() => setIsLoading(false));
  }, [id]);

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
          <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">Inicia sesión</h1>
          <p className="text-muted-foreground mb-6">
            Para ver el detalle del pedido, necesitas iniciar sesión.
          </p>
          <Link href="/login">
            <Button size="lg">Iniciar Sesión</Button>
          </Link>
        </div>
      </main>
    );
  }

  // Pedido no encontrado
  if (!pedido) {
    return (
      <main className="container py-8">
        <div className="max-w-md mx-auto text-center py-16">
          <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">Pedido no encontrado</h1>
          <p className="text-muted-foreground mb-6">
            El pedido que buscas no existe o no tienes acceso a él.
          </p>
          <Link href="/orders">
            <Button size="lg">Ver Mis Pedidos</Button>
          </Link>
        </div>
      </main>
    );
  }

  const getEstadoIcon = () => {
    switch (pedido.pago?.estado) {
      case "completado":
        return <CheckCircle className="h-6 w-6 text-green-600" />;
      case "pendiente":
        return <Clock className="h-6 w-6 text-yellow-600" />;
      case "fallido":
        return <XCircle className="h-6 w-6 text-red-600" />;
      default:
        return <Clock className="h-6 w-6 text-gray-600" />;
    }
  };

  const getEstadoText = () => {
    switch (pedido.pago?.estado) {
      case "completado":
        return "Pago Completado";
      case "pendiente":
        return "Pago Pendiente";
      case "fallido":
        return "Pago Fallido";
      default:
        return "Estado Desconocido";
    }
  };

  const getMetodoPagoIcon = () => {
    switch (pedido.pago?.metodo) {
      case "tarjeta":
        return <CreditCard className="h-5 w-5" />;
      case "paypal":
        return <span className="font-bold text-blue-600 text-sm">PayPal</span>;
      case "transferencia":
        return <Building className="h-5 w-5" />;
      default:
        return null;
    }
  };

  const subtotal = pedido.total || 0;
  const envio = subtotal >= 100 ? 0 : 10;
  const total = subtotal + envio;

  return (
    <main className="container py-8">
      <Link href="/orders">
        <Button variant="ghost" className="mb-6 gap-2">
          <ArrowLeft className="h-4 w-4" />
          Volver a mis pedidos
        </Button>
      </Link>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Información del pedido */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-2xl font-bold mb-2">
                    Pedido #{pedido.id_pedido}
                  </h1>
                  <p className="text-muted-foreground">
                    Realizado el{" "}
                    {new Date(pedido.fecha).toLocaleDateString("es-ES", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {getEstadoIcon()}
                  <span className="font-medium">{getEstadoText()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Productos */}
          <Card>
            <CardHeader>
              <CardTitle>Productos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pedido.detalles?.map((detalle) => (
                  <div
                    key={detalle.id_detalle}
                    className="flex gap-4 py-3 border-b last:border-0"
                  >
                    <div className="relative w-20 h-24 bg-muted rounded overflow-hidden flex-shrink-0">
                      <Image
                        src={detalle.producto?.imagen || "/placeholder.jpg"}
                        alt={detalle.producto?.nombre || "Producto"}
                        fill
                        className="object-cover"
                        unoptimized={detalle.producto?.imagen?.startsWith('http')}
                      />
                    </div>
                    <div className="flex-1">
                      <Link href={`/products/${detalle.id_producto}`}>
                        <h3 className="font-medium hover:underline">
                          {detalle.producto?.nombre}
                        </h3>
                      </Link>
                      <p className="text-sm text-muted-foreground">
                        Cantidad: {detalle.cantidad}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Precio unitario: ${detalle.precio.toFixed(2)}
                      </p>
                    </div>
                    <p className="font-semibold">
                      ${(detalle.precio * detalle.cantidad).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Resumen */}
        <div className="space-y-6">
          {/* Resumen de pago */}
          <Card>
            <CardHeader>
              <CardTitle>Resumen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Envío</span>
                <span>{envio === 0 ? "Gratis" : `$${envio.toFixed(2)}`}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-semibold text-lg">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Método de pago */}
          <Card>
            <CardHeader>
              <CardTitle>Método de Pago</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                {getMetodoPagoIcon()}
                <span className="capitalize">{pedido.pago?.metodo}</span>
              </div>
            </CardContent>
          </Card>

          {/* Acciones */}
          <div className="space-y-3">
            <Link href="/products" className="block">
              <Button variant="outline" className="w-full">
                Seguir Comprando
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
