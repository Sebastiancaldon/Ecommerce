"use client";

/**
 * ============================================================
 * VISTA - Tarjeta de Producto (MVC)
 * ============================================================
 */

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { Producto } from "@/lib/models/types";
import { useCart } from "@/lib/context/cart-context";
import { useAuth } from "@/lib/context/auth-context";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Check, Loader2, Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/utils";

interface ProductCardProps {
  producto: Producto;
  showAddToCart?: boolean;
}

export function ProductCard({ producto, showAddToCart = true }: ProductCardProps) {
  const router = useRouter();
  const { usuario } = useAuth();
  const { addToCart } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!usuario) {
      router.push("/login");
      return;
    }

    setIsAdding(true);
    const resultado = await addToCart(producto);
    setIsAdding(false);

    if (resultado.success) {
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    }
  };

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLiked(!isLiked);
  };

  const imageSrc = imageError ? "/placeholder.jpg" : (producto.imagen || "/placeholder.jpg");

  return (
    <Link href={`/products/${producto.id_producto}`} className="group block">
      <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-muted mb-4">
        <Image
          src={imageSrc}
          alt={producto.nombre}
          fill
          className="object-cover transition-all duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          unoptimized={imageSrc.startsWith('http')}
          onError={() => setImageError(true)}
        />
        
        {/* Overlay con acciones */}
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Botón de favoritos */}
        <button
          onClick={handleLike}
          className="absolute top-3 right-3 p-2 rounded-full bg-background/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-background hover:scale-110"
        >
          <Heart 
            className={`h-4 w-4 transition-colors ${isLiked ? "fill-red-500 text-red-500" : "text-foreground"}`} 
          />
        </button>

        {/* Botón de agregar al carrito */}
        {showAddToCart && (
          <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
            <Button
              onClick={handleAddToCart}
              disabled={isAdding || added}
              className="w-full gap-2 bg-background/90 backdrop-blur-sm text-foreground hover:bg-background"
              variant="outline"
            >
              {isAdding ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Agregando...
                </>
              ) : added ? (
                <>
                  <Check className="h-4 w-4" />
                  Agregado
                </>
              ) : (
                <>
                  <ShoppingBag className="h-4 w-4" />
                  Agregar al carrito
                </>
              )}
            </Button>
          </div>
        )}
      </div>

      {/* Información del producto */}
      <div className="space-y-1">
        <p className="text-xs text-muted-foreground uppercase tracking-wider">
          {producto.categoria?.nombre || "Sin categoria"}
        </p>
        <h3 className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors">
          {producto.nombre}
        </h3>
        <p className="font-semibold">
          {formatPrice(producto.precio)}
        </p>
      </div>
    </Link>
  );
}
