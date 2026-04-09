"use client";

/**
 * ============================================================
 * VISTA - Filtro de Categorías (MVC)
 * ============================================================
 */

import { useRouter, useSearchParams } from "next/navigation";
import type { Categoria } from "@/lib/models/types";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CategoryFilterProps {
  categorias: Categoria[];
  categoriaActual?: string;
}

export function CategoryFilter({ categorias, categoriaActual }: CategoryFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleCategoryChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") {
      params.delete("categoria");
    } else {
      params.set("categoria", value);
    }
    router.push(`/products?${params.toString()}`);
  };

  const handleOrderChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "default") {
      params.delete("orden");
    } else {
      params.set("orden", value);
    }
    router.push(`/products?${params.toString()}`);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      {/* Filtro por categoría */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={!categoriaActual ? "default" : "outline"}
          size="sm"
          onClick={() => handleCategoryChange("all")}
        >
          Todos
        </Button>
        {categorias.map((categoria) => (
          <Button
            key={categoria.id_categoria}
            variant={categoriaActual === categoria.id_categoria ? "default" : "outline"}
            size="sm"
            onClick={() => handleCategoryChange(categoria.id_categoria)}
          >
            {categoria.nombre}
          </Button>
        ))}
      </div>

      {/* Ordenar */}
      <div className="ml-auto">
        <Select
          defaultValue={searchParams.get("orden") || "default"}
          onValueChange={handleOrderChange}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Ordenar por" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="default">Más recientes</SelectItem>
            <SelectItem value="precio_asc">Precio: Menor a Mayor</SelectItem>
            <SelectItem value="precio_desc">Precio: Mayor a Menor</SelectItem>
            <SelectItem value="nombre">Nombre A-Z</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
