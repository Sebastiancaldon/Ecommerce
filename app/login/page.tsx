/**
 * ============================================================
 * VISTA - Página de Login (MVC)
 * ============================================================
 */

import { LoginForm } from "@/components/auth/login-form";

export const metadata = {
  title: "Iniciar Sesión - MODA E-Commerce",
  description: "Inicia sesión en tu cuenta de MODA",
};

export default function LoginPage() {
  return (
    <main className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4">
      <LoginForm />
    </main>
  );
}
