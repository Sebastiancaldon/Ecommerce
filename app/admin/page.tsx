"use client";

/**
 * ============================================================
 * VISTA - Dashboard Admin (MVC)
 * ============================================================
 * Cumplimiento: ISO 9001, ISO/IEC 25000, CMMI
 * ============================================================
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  DollarSign,
  ShoppingCart,
  Package,
  Users,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";
import type { EstadisticasDashboard, Pedido } from "@/lib/models/types";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<EstadisticasDashboard | null>(null);
  const [topProductos, setTopProductos] = useState<
    { producto: string; cantidad: number }[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/dashboard")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setStats(data.data);
          setTopProductos(data.data.top_productos || []);
        }
      })
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Error cargando estadísticas</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Resumen del sistema de e-commerce
        </p>
      </div>

      {/* Estadísticas principales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Ventas</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats.total_ventas.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Ventas completadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pedidos Hoy</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pedidos_hoy}</div>
            <p className="text-xs text-muted-foreground">
              Pedidos del día
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Productos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.productos_total}</div>
            <p className="text-xs text-muted-foreground">
              En catálogo
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Usuarios</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.usuarios_registrados}</div>
            <p className="text-xs text-muted-foreground">
              Registrados
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Alertas y métricas */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Bajo stock */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Bajo Stock
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.productos_bajo_stock > 0 ? (
              <div>
                <p className="text-3xl font-bold text-yellow-600">
                  {stats.productos_bajo_stock}
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  productos con menos de 10 unidades
                </p>
                <Link
                  href="/admin/inventory?low_stock=true"
                  className="text-sm text-primary hover:underline"
                >
                  Ver productos →
                </Link>
              </div>
            ) : (
              <p className="text-muted-foreground">
                Todos los productos tienen stock suficiente
              </p>
            )}
          </CardContent>
        </Card>

        {/* Productos más vendidos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              Más Vendidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topProductos.length > 0 ? (
              <ul className="space-y-3">
                {topProductos.map((item, index) => (
                  <li
                    key={index}
                    className="flex items-center justify-between"
                  >
                    <span className="text-sm truncate max-w-[200px]">
                      {item.producto}
                    </span>
                    <Badge variant="secondary">
                      {item.cantidad} vendidos
                    </Badge>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">
                No hay ventas registradas
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Ventas por categoría */}
      <Card>
        <CardHeader>
          <CardTitle>Ventas por Categoría</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.ventas_por_categoria.map((item) => (
              <div key={item.categoria} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>{item.categoria}</span>
                  <span className="font-medium">${item.ventas.toFixed(2)}</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full"
                    style={{
                      width: `${
                        stats.total_ventas > 0
                          ? (item.ventas / stats.total_ventas) * 100
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pedidos recientes */}
      <Card>
        <CardHeader>
          <CardTitle>Pedidos Recientes</CardTitle>
        </CardHeader>
        <CardContent>
          {stats.pedidos_recientes.length > 0 ? (
            <div className="space-y-4">
              {stats.pedidos_recientes.map((pedido) => (
                <div
                  key={pedido.id_pedido}
                  className="flex items-center justify-between py-2 border-b last:border-0"
                >
                  <div>
                    <p className="font-medium">#{pedido.id_pedido}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(pedido.fecha).toLocaleDateString("es-ES")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${pedido.total?.toFixed(2)}</p>
                    <Badge
                      variant={
                        pedido.pago?.estado === "completado"
                          ? "default"
                          : "secondary"
                      }
                    >
                      {pedido.pago?.estado || "pendiente"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No hay pedidos recientes</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
