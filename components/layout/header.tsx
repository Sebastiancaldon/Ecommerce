"use client";

/**
 * ============================================================
 * VISTA - Header/Navegación (MVC)
 * ============================================================
 * Componente de navegación principal
 * ============================================================
 */

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/lib/context/auth-context";
import { useCart } from "@/lib/context/cart-context";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  ShoppingBag,
  User,
  Menu,
  LogOut,
  Package,
  LayoutDashboard,
  Search,
} from "lucide-react";

export function Header() {
  const { usuario, isAdmin, logout } = useAuth();
  const { itemCount } = useCart();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold tracking-tight">MODA</span>
        </Link>

        {/* Navegación Desktop */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Inicio
          </Link>
          <Link
            href="/products"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Productos
          </Link>
          <Link
            href="/categories"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Categorías
          </Link>
        </nav>

        {/* Acciones */}
        <div className="flex items-center gap-2">
          {/* Búsqueda */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className="hidden md:flex"
          >
            <Search className="h-5 w-5" />
          </Button>

          {/* Carrito */}
          <Link href="/cart">
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingBag className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Button>
          </Link>

          {/* Usuario */}
          {usuario ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">{usuario.nombreusuario}</p>
                  <p className="text-xs text-muted-foreground">
                    {usuario.emailusuario}
                  </p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/orders" className="cursor-pointer">
                    <Package className="mr-2 h-4 w-4" />
                    Mis Pedidos
                  </Link>
                </DropdownMenuItem>
                {isAdmin && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin" className="cursor-pointer">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Panel Admin
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="cursor-pointer text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Cerrar Sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Iniciar Sesión
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm">Registrarse</Button>
              </Link>
            </div>
          )}

          {/* Menú Móvil */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px]">
              <nav className="flex flex-col gap-4 mt-8">
                <Link href="/" className="text-lg font-medium">
                  Inicio
                </Link>
                <Link href="/products" className="text-lg font-medium">
                  Productos
                </Link>
                <Link href="/categories" className="text-lg font-medium">
                  Categorías
                </Link>
                {usuario ? (
                  <>
                    <hr className="my-2" />
                    <Link href="/orders" className="text-lg font-medium">
                      Mis Pedidos
                    </Link>
                    {isAdmin && (
                      <Link href="/admin" className="text-lg font-medium">
                        Panel Admin
                      </Link>
                    )}
                    <Button onClick={logout} variant="destructive" className="mt-4">
                      Cerrar Sesión
                    </Button>
                  </>
                ) : (
                  <>
                    <hr className="my-2" />
                    <Link href="/login">
                      <Button variant="outline" className="w-full">
                        Iniciar Sesión
                      </Button>
                    </Link>
                    <Link href="/register">
                      <Button className="w-full">Registrarse</Button>
                    </Link>
                  </>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Barra de búsqueda expandible */}
      {isSearchOpen && (
        <div className="border-t py-3">
          <div className="container">
            <form action="/products" method="get" className="flex gap-2">
              <input
                type="text"
                name="busqueda"
                placeholder="Buscar productos..."
                className="flex-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                autoFocus
              />
              <Button type="submit">Buscar</Button>
            </form>
          </div>
        </div>
      )}
    </header>
  );
}
