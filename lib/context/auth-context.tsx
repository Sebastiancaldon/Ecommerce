"use client";

/**
 * ============================================================
 * CONTEXTO - Autenticación (MVC - Vista/Controlador)
 * ============================================================
 * Cumplimiento de normas:
 * - ISO 9001: Gestión de sesiones
 * - IEEE 730: Seguridad de autenticación
 * - ISO/IEC 25000: Usabilidad y seguridad
 * ============================================================
 */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import type { UsuarioSeguro } from "@/lib/models/types";

interface AuthContextType {
  usuario: UsuarioSeguro | null;
  isLoading: boolean;
  isAdmin: boolean;
  login: (email: string, clave: string) => Promise<{ success: boolean; message: string }>;
  register: (datos: {
    nombreusuario: string;
    emailusuario: string;
    telefono: string;
    clave: string;
  }) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<UsuarioSeguro | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Cargar sesión al iniciar
  useEffect(() => {
    const storedUser = localStorage.getItem("usuario");
    if (storedUser) {
      try {
        setUsuario(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem("usuario");
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, clave: string) => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailusuario: email, clave }),
      });

      const data = await response.json();

      if (data.success && data.usuario) {
        setUsuario(data.usuario);
        localStorage.setItem("usuario", JSON.stringify(data.usuario));
        return { success: true, message: data.message };
      }

      return { success: false, message: data.message || "Error al iniciar sesión" };
    } catch {
      return { success: false, message: "Error de conexión" };
    }
  };

  const register = async (datos: {
    nombreusuario: string;
    emailusuario: string;
    telefono: string;
    clave: string;
  }) => {
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datos),
      });

      const data = await response.json();

      if (data.success && data.usuario) {
        setUsuario(data.usuario);
        localStorage.setItem("usuario", JSON.stringify(data.usuario));
        return { success: true, message: data.message };
      }

      return { success: false, message: data.message || "Error al registrarse" };
    } catch {
      return { success: false, message: "Error de conexión" };
    }
  };

  const logout = () => {
    setUsuario(null);
    localStorage.removeItem("usuario");
  };

  const isAdmin = usuario?.id_rol === "ROL002";

  return (
    <AuthContext.Provider
      value={{ usuario, isLoading, isAdmin, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }
  return context;
}
