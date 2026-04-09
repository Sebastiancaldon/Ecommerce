/**
 * ============================================================
 * MODELO - Usuario (MVC)
 * ============================================================
 * Cumplimiento de normas:
 * - ISO 9001: Gestión de usuarios documentada
 * - IEEE 730: Validación de datos
 * - ISO/IEC 25000: Seguridad y funcionalidad
 * - ISO/IEC 15504 SPICE: Proceso definido
 * ============================================================
 */

import type { Usuario, UsuarioSeguro, RegistroUsuario, Rol } from './types';
import { usuarios, roles, carritos, generarId } from './database';

/**
 * Clase UserModel - Operaciones CRUD para usuarios
 * Implementa el patrón Modelo de MVC
 */
export class UserModel {
  /**
   * Buscar usuario por email
   */
  static findByEmail(email: string): Usuario | undefined {
    return usuarios.find(
      (u) => u.emailusuario.toLowerCase() === email.toLowerCase()
    );
  }

  /**
   * Buscar usuario por ID
   */
  static findById(id: string): Usuario | undefined {
    return usuarios.find((u) => u.id_usuario === id);
  }

  /**
   * Obtener usuario seguro (sin clave)
   */
  static toSafeUser(usuario: Usuario): UsuarioSeguro {
    const rol = roles.find((r) => r.id_rol === usuario.id_rol);
    return {
      id_usuario: usuario.id_usuario,
      nombreusuario: usuario.nombreusuario,
      emailusuario: usuario.emailusuario,
      telefono: usuario.telefono,
      id_rol: usuario.id_rol,
      rol: rol,
    };
  }

  /**
   * Autenticar usuario
   */
  static authenticate(
    email: string,
    clave: string
  ): { success: boolean; usuario?: UsuarioSeguro; message: string } {
    const usuario = this.findByEmail(email);

    if (!usuario) {
      return { success: false, message: 'Usuario no encontrado' };
    }

    // En producción usar bcrypt.compare
    if (usuario.clave !== clave) {
      return { success: false, message: 'Contraseña incorrecta' };
    }

    return {
      success: true,
      usuario: this.toSafeUser(usuario),
      message: 'Autenticación exitosa',
    };
  }

  /**
   * Registrar nuevo usuario
   */
  static register(
    datos: RegistroUsuario
  ): { success: boolean; usuario?: UsuarioSeguro; message: string } {
    // Validar email único
    if (this.findByEmail(datos.emailusuario)) {
      return { success: false, message: 'El email ya está registrado' };
    }

    // Validar campos requeridos
    if (
      !datos.nombreusuario ||
      !datos.emailusuario ||
      !datos.telefono ||
      !datos.clave
    ) {
      return { success: false, message: 'Todos los campos son requeridos' };
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(datos.emailusuario)) {
      return { success: false, message: 'Formato de email inválido' };
    }

    // Validar longitud de contraseña
    if (datos.clave.length < 6) {
      return {
        success: false,
        message: 'La contraseña debe tener al menos 6 caracteres',
      };
    }

    // Crear nuevo usuario
    const nuevoUsuario: Usuario = {
      id_usuario: generarId('USR'),
      nombreusuario: datos.nombreusuario,
      emailusuario: datos.emailusuario,
      telefono: datos.telefono,
      clave: datos.clave, // En producción usar bcrypt.hash
      id_rol: 'ROL001', // Cliente por defecto
    };

    // Agregar a la base de datos
    usuarios.push(nuevoUsuario);

    // Crear carrito para el usuario
    carritos.push({
      id_carrito: generarId('CRT'),
      id_usuario: nuevoUsuario.id_usuario,
    });

    return {
      success: true,
      usuario: this.toSafeUser(nuevoUsuario),
      message: 'Usuario registrado exitosamente',
    };
  }

  /**
   * Obtener todos los usuarios (admin)
   */
  static getAll(): UsuarioSeguro[] {
    return usuarios.map((u) => this.toSafeUser(u));
  }

  /**
   * Contar usuarios
   */
  static count(): number {
    return usuarios.length;
  }

  /**
   * Verificar si es administrador
   */
  static isAdmin(usuario: UsuarioSeguro): boolean {
    return usuario.id_rol === 'ROL002';
  }

  /**
   * Obtener rol de usuario
   */
  static getRol(id_rol: string): Rol | undefined {
    return roles.find((r) => r.id_rol === id_rol);
  }

  /**
   * Actualizar usuario
   */
  static update(
    id: string,
    datos: Partial<Usuario>
  ): { success: boolean; usuario?: UsuarioSeguro; message: string } {
    const index = usuarios.findIndex((u) => u.id_usuario === id);

    if (index === -1) {
      return { success: false, message: 'Usuario no encontrado' };
    }

    // Actualizar campos permitidos
    if (datos.nombreusuario)
      usuarios[index].nombreusuario = datos.nombreusuario;
    if (datos.telefono) usuarios[index].telefono = datos.telefono;

    return {
      success: true,
      usuario: this.toSafeUser(usuarios[index]),
      message: 'Usuario actualizado',
    };
  }
}
