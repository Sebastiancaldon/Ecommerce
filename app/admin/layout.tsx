"use client";

/**
 * ============================================================
 * VISTA - Layout Admin (MVC)
 * ============================================================
 * Cumplimiento: ISO 9001, ISO/IEC 25000
 * ============================================================
 */

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/context/auth-context";
import { Loader2, LayoutDashboard, Package, Tags, Boxes, ClipboardList } from "lucide-react";
import { cn } from "@/lib/utils";

const adminLinks = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Productos", icon: Package },
  { href: "/admin/categories", label: "Categorías", icon: Tags },
  { href: "/admin/inventory", label: "Inventario", icon: Boxes },
  { href: "/admin/orders", label: "Pedidos", icon: ClipboardList },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { usuario, isAdmin, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && (!usuario || !isAdmin)) {
      router.push("/login");
    }
  }, [usuario, isAdmin, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!usuario || !isAdmin) {
    return null;
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-muted/30 hidden md:block">
        <div className="p-6">
          <h2 className="font-semibold text-lg mb-1">Panel Admin</h2>
          <p className="text-sm text-muted-foreground">Gestión del sistema</p>
        </div>
        <nav className="px-4 space-y-1">
          {adminLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {link.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Navegación móvil */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 border-t bg-background z-50">
        <nav className="flex justify-around py-2">
          {adminLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex flex-col items-center gap-1 px-3 py-1 text-xs",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground"
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="hidden xs:block">{link.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Contenido */}
      <main className="flex-1 p-6 pb-20 md:pb-6">{children}</main>
    </div>
  );
}
