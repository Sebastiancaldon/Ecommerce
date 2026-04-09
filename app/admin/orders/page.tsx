"use client";

/**
 * ============================================================
 * VISTA - Gestión de Pedidos Admin (MVC)
 * ============================================================
 * Cumplimiento: ISO 9001, ISO/IEC 25000, ISO/IEC 20000
 * ============================================================
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Loader2,
  Eye,
  Package,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import type { Pedido } from "@/lib/models/types";

export default function AdminOrdersPage() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/orders?admin=true")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setPedidos(data.data);
        }
      })
      .finally(() => setIsLoading(false));
  }, []);

  const getEstadoBadge = (estado?: string) => {
    switch (estado) {
      case "completado":
        return (
          <Badge className="bg-green-100 text-green-800 gap-1">
            <CheckCircle className="h-3 w-3" />
            Completado
          </Badge>
        );
      case "pendiente":
        return (
          <Badge variant="secondary" className="gap-1">
            <Clock className="h-3 w-3" />
            Pendiente
          </Badge>
        );
      case "fallido":
        return (
          <Badge variant="destructive" className="gap-1">
            <XCircle className="h-3 w-3" />
            Fallido
          </Badge>
        );
      default:
        return <Badge variant="outline">Desconocido</Badge>;
    }
  };

  const getMetodoPago = (metodo?: string) => {
    switch (metodo) {
      case "tarjeta":
        return "Tarjeta";
      case "paypal":
        return "PayPal";
      case "transferencia":
        return "Transferencia";
      default:
        return "-";
    }
  };

  // Estadísticas
  const totalPedidos = pedidos.length;
  const pedidosCompletados = pedidos.filter(
    (p) => p.pago?.estado === "completado"
  ).length;
  const pedidosPendientes = pedidos.filter(
    (p) => p.pago?.estado === "pendiente"
  ).length;
  const totalVentas = pedidos
    .filter((p) => p.pago?.estado === "completado")
    .reduce((sum, p) => sum + (p.total || 0), 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Pedidos</h1>
        <p className="text-muted-foreground">
          Gestión de todos los pedidos del sistema
        </p>
      </div>

      {/* Estadísticas */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Package className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalPedidos}</p>
                <p className="text-sm text-muted-foreground">Total pedidos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pedidosCompletados}</p>
                <p className="text-sm text-muted-foreground">Completados</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pedidosPendientes}</p>
                <p className="text-sm text-muted-foreground">Pendientes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div>
              <p className="text-2xl font-bold">${totalVentas.toFixed(2)}</p>
              <p className="text-sm text-muted-foreground">Total ventas</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabla de pedidos */}
      <Card>
        <CardHeader>
          <CardTitle>Todos los Pedidos</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {pedidos.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID Pedido</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Método</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="w-20">Ver</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pedidos.map((pedido) => (
                  <TableRow key={pedido.id_pedido}>
                    <TableCell className="font-mono text-sm">
                      {pedido.id_pedido}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {pedido.usuario?.nombreusuario || "-"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {pedido.usuario?.emailusuario}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(pedido.fecha).toLocaleDateString("es-ES", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </TableCell>
                    <TableCell>{getMetodoPago(pedido.pago?.metodo)}</TableCell>
                    <TableCell className="text-right font-medium">
                      ${pedido.total?.toFixed(2)}
                    </TableCell>
                    <TableCell>{getEstadoBadge(pedido.pago?.estado)}</TableCell>
                    <TableCell>
                      <Link href={`/orders/${pedido.id_pedido}`}>
                        <Button variant="ghost" size="icon">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="p-8 text-center text-muted-foreground">
              No hay pedidos registrados
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
