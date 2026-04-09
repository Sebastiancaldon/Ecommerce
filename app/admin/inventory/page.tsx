"use client";

/**
 * ============================================================
 * VISTA - Gestión de Inventario (MVC)
 * ============================================================
 * Cumplimiento: ISO 9001, ISO/IEC 25000, CMMI
 * ============================================================
 */

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Loader2,
  Pencil,
  AlertCircle,
  CheckCircle,
  AlertTriangle,
  Package,
} from "lucide-react";
import type { Inventario } from "@/lib/models/types";

export default function AdminInventoryPage() {
  const searchParams = useSearchParams();
  const [inventarios, setInventarios] = useState<Inventario[]>([]);
  const [bajoStock, setBajoStock] = useState<Inventario[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editingInventory, setEditingInventory] = useState<Inventario | null>(null);
  const [newStock, setNewStock] = useState("");

  const showLowStock = searchParams.get("low_stock") === "true";

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [allRes, lowRes] = await Promise.all([
        fetch("/api/inventory"),
        fetch("/api/inventory?low_stock=true"),
      ]);
      const [allData, lowData] = await Promise.all([
        allRes.json(),
        lowRes.json(),
      ]);

      if (allData.success) setInventarios(allData.data);
      if (lowData.success) setBajoStock(lowData.data);
    } catch {
      setError("Error cargando inventario");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleEdit = (inventario: Inventario) => {
    setEditingInventory(inventario);
    setNewStock(inventario.stock.toString());
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingInventory) return;

    setError("");
    setSuccess("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/inventory", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_producto: editingInventory.id_producto,
          stock: parseInt(newStock),
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess("Stock actualizado");
        setIsDialogOpen(false);
        loadData();
      } else {
        setError(data.message);
      }
    } catch {
      setError("Error de conexión");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStockBadge = (stock: number) => {
    if (stock === 0) {
      return <Badge variant="destructive">Agotado</Badge>;
    } else if (stock < 10) {
      return (
        <Badge className="bg-yellow-100 text-yellow-800">
          Bajo ({stock})
        </Badge>
      );
    } else {
      return (
        <Badge className="bg-green-100 text-green-800">
          OK ({stock})
        </Badge>
      );
    }
  };

  const renderTable = (items: Inventario[]) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-16">Imagen</TableHead>
          <TableHead>Producto</TableHead>
          <TableHead className="text-right">Stock</TableHead>
          <TableHead className="text-right">Estado</TableHead>
          <TableHead className="w-20">Acción</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((inventario) => (
          <TableRow key={inventario.id_inventario}>
            <TableCell>
              <div className="relative w-12 h-12 bg-muted rounded overflow-hidden">
                <Image
                  src={inventario.producto?.imagen || "/placeholder.jpg"}
                  alt={inventario.producto?.nombre || "Producto"}
                  fill
                  className="object-cover"
                  unoptimized={inventario.producto?.imagen?.startsWith('http')}
                />
              </div>
            </TableCell>
            <TableCell className="font-medium">
              {inventario.producto?.nombre}
            </TableCell>
            <TableCell className="text-right font-mono">
              {inventario.stock}
            </TableCell>
            <TableCell className="text-right">
              {getStockBadge(inventario.stock)}
            </TableCell>
            <TableCell>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleEdit(inventario)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

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
        <h1 className="text-3xl font-bold">Inventario</h1>
        <p className="text-muted-foreground">
          Control de stock de productos
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-500 bg-green-50 text-green-700">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* Resumen */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Package className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{inventarios.length}</p>
                <p className="text-sm text-muted-foreground">Total productos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{bajoStock.length}</p>
                <p className="text-sm text-muted-foreground">Bajo stock</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-destructive/10 rounded-lg">
                <AlertCircle className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {inventarios.filter((i) => i.stock === 0).length}
                </p>
                <p className="text-sm text-muted-foreground">Agotados</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue={showLowStock ? "bajo" : "todos"}>
        <TabsList>
          <TabsTrigger value="todos">Todos</TabsTrigger>
          <TabsTrigger value="bajo">Bajo Stock</TabsTrigger>
        </TabsList>
        <TabsContent value="todos">
          <Card>
            <CardContent className="p-0">{renderTable(inventarios)}</CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="bajo">
          <Card>
            <CardContent className="p-0">
              {bajoStock.length > 0 ? (
                renderTable(bajoStock)
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  No hay productos con bajo stock
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog de edición */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Actualizar Stock</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="text-center p-4 bg-muted rounded-lg">
              <p className="font-medium">{editingInventory?.producto?.nombre}</p>
              <p className="text-sm text-muted-foreground">
                Stock actual: {editingInventory?.stock}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="stock">Nuevo Stock</Label>
              <Input
                id="stock"
                type="number"
                min="0"
                value={newStock}
                onChange={(e) => setNewStock(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Actualizar Stock"
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
