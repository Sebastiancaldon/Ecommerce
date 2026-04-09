"use client";

/**
 * ============================================================
 * VISTA - Botón Agregar al Carrito (MVC)
 * ============================================================
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Producto } from "@/lib/models/types";
import { useCart } from "@/lib/context/cart-context";
import { useAuth } from "@/lib/context/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShoppingBag, Loader2, Check, Minus, Plus } from "lucide-react";

interface AddToCartButtonProps {
  producto: Producto;
  stock: number;
}

export function AddToCartButton({ producto, stock }: AddToCartButtonProps) {
  const router = useRouter();
  const { usuario } = useAuth();
  const { addToCart } = useCart();
  const [cantidad, setCantidad] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [error, setError] = useState("");

  const incrementar = () => {
    if (cantidad < stock) {
      setCantidad(cantidad + 1);
    }
  };

  const decrementar = () => {
    if (cantidad > 1) {
      setCantidad(cantidad - 1);
    }
  };

  const handleAddToCart = async () => {
    if (!usuario) {
      router.push("/login");
      return;
    }

    setError("");
    setIsAdding(true);

    const resultado = await addToCart(producto, cantidad);

    setIsAdding(false);

    if (resultado.success) {
      setAdded(true);
      setTimeout(() => setAdded(false), 3000);
    } else {
      setError(resultado.message);
    }
  };

  return (
    <div className="space-y-4">
      {/* Selector de cantidad */}
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium">Cantidad:</span>
        <div className="flex items-center border rounded-md">
          <Button
            variant="ghost"
            size="icon"
            onClick={decrementar}
            disabled={cantidad <= 1}
            className="h-10 w-10"
          >
            <Minus className="h-4 w-4" />
          </Button>
          <Input
            type="number"
            min={1}
            max={stock}
            value={cantidad}
            onChange={(e) => {
              const val = parseInt(e.target.value);
              if (val >= 1 && val <= stock) {
                setCantidad(val);
              }
            }}
            className="w-16 text-center border-0"
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={incrementar}
            disabled={cantidad >= stock}
            className="h-10 w-10"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Botón agregar */}
      <Button
        size="lg"
        className="w-full gap-2"
        onClick={handleAddToCart}
        disabled={isAdding || added || stock === 0}
      >
        {isAdding ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Agregando...
          </>
        ) : added ? (
          <>
            <Check className="h-5 w-5" />
            Agregado al carrito
          </>
        ) : (
          <>
            <ShoppingBag className="h-5 w-5" />
            Agregar al Carrito
          </>
        )}
      </Button>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {/* Ir al carrito después de agregar */}
      {added && (
        <Button
          variant="outline"
          className="w-full"
          onClick={() => router.push("/cart")}
        >
          Ver Carrito
        </Button>
      )}
    </div>
  );
}
