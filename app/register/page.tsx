/**
 * ============================================================
 * VISTA - Página de Registro (MVC)
 * ============================================================
 */

import { RegisterForm } from "@/components/auth/register-form";

export const metadata = {
  title: "Registrarse - MODA E-Commerce",
  description: "Crea tu cuenta en MODA",
};

export default function RegisterPage() {
  return (
    <main className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4">
      <RegisterForm />
    </main>
  );
}
