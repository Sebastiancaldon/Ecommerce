"use client";

/**
 * ============================================================
 * VISTA - Página de Checkout (MVC)
 * ============================================================
 * Cumplimiento: ISO 9001, IEEE 730, ISO/IEC 25000, ISO/IEC 20000
 * ============================================================
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/lib/context/auth-context";
import { useCart } from "@/lib/context/cart-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CreditCard,
  Loader2,
  ShoppingBag,
  ArrowLeft,
  AlertCircle,
  CheckCircle,
  Building,
} from "lucide-react";
import type { MetodoPago } from "@/lib/models/types";

export default function CheckoutPage() {
  const router = useRouter();
  const { usuario, isLoading: authLoading } = useAuth();
  const { carrito, isLoading, refreshCart } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [metodoPago, setMetodoPago] = useState<MetodoPago>("tarjeta");

  // Datos de tarjeta
  const [datosCard, setDatosCard] = useState({
    numero_tarjeta: "",
    nombre_titular: "",
    fecha_expiracion: "",
    cvv: "",
  });

  // Datos de PayPal
  const [emailPaypal, setEmailPaypal] = useState("");

  // Datos de transferencia
  const [banco, setBanco] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsProcessing(true);

    try {
      // Construir datos de pago según el método
      const datos_pago: Record<string, string> = { metodo: metodoPago };

      if (metodoPago === "tarjeta") {
        datos_pago.numero_tarjeta = datosCard.numero_tarjeta.replace(/\s/g, "");
        datos_pago.nombre_titular = datosCard.nombre_titular;
        datos_pago.fecha_expiracion = datosCard.fecha_expiracion;
        datos_pago.cvv = datosCard.cvv;
      } else if (metodoPago === "paypal") {
        datos_pago.email_paypal = emailPaypal;
      } else if (metodoPago === "transferencia") {
        datos_pago.banco = banco;
      }

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_usuario: usuario?.id_usuario,
          datos_pago,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        await refreshCart();
        setTimeout(() => {
          router.push(`/orders/${data.data.id_pedido}`);
        }, 2000);
      } else {
        setError(data.message || "Error al procesar el pago");
      }
    } catch {
      setError("Error de conexión. Intente nuevamente.");
    } finally {
      setIsProcessing(false);
    }
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
            Para completar tu compra, necesitas iniciar sesión.
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
            Agrega productos antes de proceder al checkout.
          </p>
          <Link href="/products">
            <Button size="lg">Ver Productos</Button>
          </Link>
        </div>
      </main>
    );
  }

  // Éxito
  if (success) {
    return (
      <main className="container py-8">
        <div className="max-w-md mx-auto text-center py-16">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Compra Exitosa</h1>
          <p className="text-muted-foreground mb-6">
            Tu pedido ha sido procesado correctamente. Redirigiendo...
          </p>
          <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
        </div>
      </main>
    );
  }

  const totalConEnvio = carrito.total >= 100 ? carrito.total : carrito.total + 10;

  return (
    <main className="container py-8">
      <Link href="/cart">
        <Button variant="ghost" className="mb-6 gap-2">
          <ArrowLeft className="h-4 w-4" />
          Volver al carrito
        </Button>
      </Link>

      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      <form onSubmit={handleSubmit}>
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Formulario de pago */}
          <div className="lg:col-span-2 space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Método de pago */}
            <Card>
              <CardHeader>
                <CardTitle>Método de Pago</CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={metodoPago}
                  onValueChange={(v) => setMetodoPago(v as MetodoPago)}
                  className="space-y-4"
                >
                  <div className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-muted/50">
                    <RadioGroupItem value="tarjeta" id="tarjeta" />
                    <Label htmlFor="tarjeta" className="flex-1 cursor-pointer">
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5" />
                        <span>Tarjeta de Crédito/Débito</span>
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-muted/50">
                    <RadioGroupItem value="paypal" id="paypal" />
                    <Label htmlFor="paypal" className="flex-1 cursor-pointer">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-blue-600">Pay</span>
                        <span className="font-bold text-blue-400">Pal</span>
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-muted/50">
                    <RadioGroupItem value="transferencia" id="transferencia" />
                    <Label htmlFor="transferencia" className="flex-1 cursor-pointer">
                      <div className="flex items-center gap-2">
                        <Building className="h-5 w-5" />
                        <span>Transferencia Bancaria</span>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Datos según método */}
            <Card>
              <CardHeader>
                <CardTitle>Datos del Pago</CardTitle>
              </CardHeader>
              <CardContent>
                {metodoPago === "tarjeta" && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="numero_tarjeta">Número de Tarjeta</Label>
                      <Input
                        id="numero_tarjeta"
                        placeholder="1234 5678 9012 3456"
                        value={datosCard.numero_tarjeta}
                        onChange={(e) =>
                          setDatosCard({
                            ...datosCard,
                            numero_tarjeta: e.target.value,
                          })
                        }
                        required
                        maxLength={19}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="nombre_titular">Nombre del Titular</Label>
                      <Input
                        id="nombre_titular"
                        placeholder="JUAN PEREZ"
                        value={datosCard.nombre_titular}
                        onChange={(e) =>
                          setDatosCard({
                            ...datosCard,
                            nombre_titular: e.target.value.toUpperCase(),
                          })
                        }
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="fecha_expiracion">Fecha de Expiración</Label>
                        <Input
                          id="fecha_expiracion"
                          placeholder="MM/YY"
                          value={datosCard.fecha_expiracion}
                          onChange={(e) =>
                            setDatosCard({
                              ...datosCard,
                              fecha_expiracion: e.target.value,
                            })
                          }
                          required
                          maxLength={5}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cvv">CVV</Label>
                        <Input
                          id="cvv"
                          placeholder="123"
                          type="password"
                          value={datosCard.cvv}
                          onChange={(e) =>
                            setDatosCard({ ...datosCard, cvv: e.target.value })
                          }
                          required
                          maxLength={4}
                        />
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Para pruebas: usa cualquier número de 16 dígitos
                    </p>
                  </div>
                )}

                {metodoPago === "paypal" && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email_paypal">Email de PayPal</Label>
                      <Input
                        id="email_paypal"
                        type="email"
                        placeholder="tu@email.com"
                        value={emailPaypal}
                        onChange={(e) => setEmailPaypal(e.target.value)}
                        required
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Serás redirigido a PayPal para completar el pago (simulado)
                    </p>
                  </div>
                )}

                {metodoPago === "transferencia" && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="banco">Selecciona tu Banco</Label>
                      <Select value={banco} onValueChange={setBanco} required>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar banco" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bancolombia">Bancolombia</SelectItem>
                          <SelectItem value="davivienda">Davivienda</SelectItem>
                          <SelectItem value="bogota">Banco de Bogotá</SelectItem>
                          <SelectItem value="bbva">BBVA</SelectItem>
                          <SelectItem value="nequi">Nequi</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="bg-muted p-4 rounded-lg text-sm">
                      <p className="font-medium mb-2">Instrucciones:</p>
                      <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                        <li>Selecciona tu banco</li>
                        <li>Recibirás un código de referencia</li>
                        <li>Realiza la transferencia a nuestra cuenta</li>
                        <li>Tu pedido será procesado al confirmar el pago</li>
                      </ol>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Resumen del pedido */}
          <div>
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Resumen del Pedido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Lista de productos */}
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {carrito.items.map((item) => (
                    <div key={item.id_detalle} className="flex gap-3">
                      <div className="relative w-12 h-16 bg-muted rounded overflow-hidden flex-shrink-0">
                        <Image
                          src={item.producto?.imagen || "/placeholder.jpg"}
                          alt={item.producto?.nombre || ""}
                          fill
                          className="object-cover"
                          unoptimized={item.producto?.imagen?.startsWith('http')}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {item.producto?.nombre}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Cant: {item.cantidad}
                        </p>
                      </div>
                      <p className="text-sm font-medium">
                        ${((item.producto?.precio || 0) * item.cantidad).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>${carrito.total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Envío</span>
                    <span>{carrito.total >= 100 ? "Gratis" : "$10.00"}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span>${totalConEnvio.toFixed(2)}</span>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    `Pagar $${totalConEnvio.toFixed(2)}`
                  )}
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  Al hacer clic en Pagar, aceptas nuestros términos y condiciones
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </main>
  );
}
