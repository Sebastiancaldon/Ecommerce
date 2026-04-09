"use client";

/**
 * ============================================================
 * CONTEXTO - Carrito de Compras (MVC - Vista/Controlador)
 * ============================================================
 * Cumplimiento de normas:
 * - ISO 9001: Gestión del carrito
 * - ISO/IEC 25000: Usabilidad
 * ============================================================
 */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import type { CarritoCompleto, Producto } from "@/lib/models/types";
import { useAuth } from "./auth-context";

interface CartContextType {
  carrito: CarritoCompleto | null;
  isLoading: boolean;
  addToCart: (producto: Producto, cantidad?: number) => Promise<{ success: boolean; message: string }>;
  removeFromCart: (id_producto: string) => Promise<{ success: boolean; message: string }>;
  updateQuantity: (id_producto: string, cantidad: number) => Promise<{ success: boolean; message: string }>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
  itemCount: number;
  total: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { usuario } = useAuth();
  const [carrito, setCarrito] = useState<CarritoCompleto | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const refreshCart = useCallback(async () => {
    if (!usuario) {
      setCarrito(null);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/cart?id_usuario=${usuario.id_usuario}`);
      const data = await response.json();
      if (data.success) {
        setCarrito(data.data);
      }
    } catch (error) {
      console.error("Error cargando carrito:", error);
    } finally {
      setIsLoading(false);
    }
  }, [usuario]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const addToCart = async (producto: Producto, cantidad: number = 1) => {
    if (!usuario) {
      return { success: false, message: "Debes iniciar sesión" };
    }

    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_usuario: usuario.id_usuario,
          id_producto: producto.id_producto,
          cantidad,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setCarrito(data.data);
        return { success: true, message: "Producto agregado al carrito" };
      }

      return { success: false, message: data.message };
    } catch {
      return { success: false, message: "Error de conexión" };
    }
  };

  const removeFromCart = async (id_producto: string) => {
    if (!usuario) {
      return { success: false, message: "Debes iniciar sesión" };
    }

    try {
      const response = await fetch("/api/cart", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_usuario: usuario.id_usuario,
          id_producto,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setCarrito(data.data);
        return { success: true, message: "Producto eliminado" };
      }

      return { success: false, message: data.message };
    } catch {
      return { success: false, message: "Error de conexión" };
    }
  };

  const updateQuantity = async (id_producto: string, cantidad: number) => {
    if (!usuario) {
      return { success: false, message: "Debes iniciar sesión" };
    }

    try {
      const response = await fetch("/api/cart", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_usuario: usuario.id_usuario,
          id_producto,
          cantidad,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setCarrito(data.data);
        return { success: true, message: "Cantidad actualizada" };
      }

      return { success: false, message: data.message };
    } catch {
      return { success: false, message: "Error de conexión" };
    }
  };

  const clearCart = async () => {
    if (!usuario) return;

    try {
      await fetch("/api/cart/clear", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_usuario: usuario.id_usuario }),
      });
      setCarrito(null);
      await refreshCart();
    } catch (error) {
      console.error("Error vaciando carrito:", error);
    }
  };

  const itemCount = carrito?.cantidad_items || 0;
  const total = carrito?.total || 0;

  return (
    <CartContext.Provider
      value={{
        carrito,
        isLoading,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        refreshCart,
        itemCount,
        total,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart debe usarse dentro de CartProvider");
  }
  return context;
}
