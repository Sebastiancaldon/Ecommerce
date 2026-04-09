"use client";

/**
 * ============================================================
 * VISTA - Página de Pedidos del Usuario (MVC)
 * ============================================================
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/context/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Package, Eye, ShoppingBag } from "lucide-react";
import type { Pedido } from "@/lib/models/types";

export default function OrdersPage() {
  const { usuario, isLoading: authLoading } = useAuth();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (usuario) {
      fetch(`/api/orders?id_usuario=${usuario.id_usuario}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setPedidos(data.data);
          }
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [usuario]);

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
            Para ver tus pedidos, necesitas iniciar sesión.
          </p>
          <Link href="/login">
            <Button size="lg">Iniciar Sesión</Button>
          </Link>
        </div>
      </main>
    );
  }

  // Sin pedidos
  if (pedidos.length === 0) {
    return (
      <main className="container py-8">
        <div className="max-w-md mx-auto text-center py-16">
          <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">No tienes pedidos</h1>
          <p className="text-muted-foreground mb-6">
            Aún no has realizado ninguna compra.
          </p>
          <Link href="/products">
            <Button size="lg">Explorar Productos</Button>
          </Link>
        </div>
      </main>
    );
  }

  const getEstadoBadge = (estado?: string) => {
    switch (estado) {
      case "completado":
        return <Badge className="bg-green-100 text-green-800">Completado</Badge>;
      case "pendiente":
        return <Badge variant="secondary">Pendiente</Badge>;
      case "fallido":
        return <Badge variant="destructive">Fallido</Badge>;
      default:
        return <Badge variant="outline">Desconocido</Badge>;
    }
  };

  return (
    <main className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Mis Pedidos</h1>

      <div className="space-y-4">
        {pedidos.map((pedido) => (
          <Card key={pedido.id_pedido}>
            <CardHeader className="pb-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <CardTitle className="text-base">
                  Pedido #{pedido.id_pedido}
                </CardTitle>
                {getEstadoBadge(pedido.pago?.estado)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    {new Date(pedido.fecha).toLocaleDateString("es-ES", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                  <p className="text-sm">
                    {pedido.detalles?.length || 0} productos
                  </p>
                  <p className="font-semibold">
                    Total: ${pedido.total?.toFixed(2)}
                  </p>
                </div>
                <Link href={`/orders/${pedido.id_pedido}`}>
                  <Button variant="outline" className="gap-2">
                    <Eye className="h-4 w-4" />
                    Ver Detalle
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}
