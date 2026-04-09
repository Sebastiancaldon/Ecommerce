/**
 * MODELO - Producto
 * Operaciones CRUD para productos y categorias
 */

import type { Producto, FiltrosProducto, Categoria } from './types';
import { productos, categorias, inventarios, generarId } from './database';

/**
 * Clase ProductModel - Operaciones CRUD para productos
 */
export class ProductModel {
  /**
   * Obtener todos los productos con filtros
   */
  static getAll(filtros?: FiltrosProducto): Producto[] {
    let resultado = [...productos];

    // Agregar información de categoría
    resultado = resultado.map((p) => ({
      ...p,
      categoria: categorias.find((c) => c.id_categoria === p.id_categoria),
    }));

    if (!filtros) return resultado;

    // Filtrar por categoría
    if (filtros.categoria) {
      resultado = resultado.filter(
        (p) => p.id_categoria === filtros.categoria
      );
    }

    // Filtrar por precio mínimo
    if (filtros.precio_min !== undefined) {
      resultado = resultado.filter((p) => p.precio >= filtros.precio_min!);
    }

    // Filtrar por precio máximo
    if (filtros.precio_max !== undefined) {
      resultado = resultado.filter((p) => p.precio <= filtros.precio_max!);
    }

    // Filtrar por búsqueda
    if (filtros.busqueda) {
      const busqueda = filtros.busqueda.toLowerCase();
      resultado = resultado.filter(
        (p) =>
          p.nombre.toLowerCase().includes(busqueda) ||
          p.descripcion.toLowerCase().includes(busqueda)
      );
    }

    // Ordenar
    if (filtros.orden) {
      switch (filtros.orden) {
        case 'precio_asc':
          resultado.sort((a, b) => a.precio - b.precio);
          break;
        case 'precio_desc':
          resultado.sort((a, b) => b.precio - a.precio);
          break;
        case 'nombre':
          resultado.sort((a, b) => a.nombre.localeCompare(b.nombre));
          break;
        case 'reciente':
          resultado.reverse();
          break;
      }
    }

    return resultado;
  }

  /**
   * Obtener producto por ID
   */
  static findById(id: string): Producto | undefined {
    const producto = productos.find((p) => p.id_producto === id);
    if (producto) {
      return {
        ...producto,
        categoria: categorias.find((c) => c.id_categoria === producto.id_categoria),
      };
    }
    return undefined;
  }

  /**
   * Obtener stock de un producto
   */
  static getStock(id_producto: string): number {
    const inventario = inventarios.find((i) => i.id_producto === id_producto);
    return inventario?.stock ?? 0;
  }

  /**
   * Obtener productos por categoría
   */
  static getByCategoria(id_categoria: string): Producto[] {
    return this.getAll({ categoria: id_categoria });
  }

  /**
   * Crear nuevo producto (admin)
   */
  static create(
    datos: Omit<Producto, 'id_producto'>
  ): { success: boolean; producto?: Producto; message: string } {
    // Validar categoría
    if (!categorias.find((c) => c.id_categoria === datos.id_categoria)) {
      return { success: false, message: 'Categoría no válida' };
    }

    const nuevoProducto: Producto = {
      id_producto: generarId('PRD'),
      nombre: datos.nombre,
      descripcion: datos.descripcion,
      precio: datos.precio,
      id_categoria: datos.id_categoria,
      imagen: datos.imagen || '/placeholder.jpg',
    };

    productos.push(nuevoProducto);

    // Crear entrada de inventario
    inventarios.push({
      id_inventario: generarId('INV'),
      stock: 0,
      id_producto: nuevoProducto.id_producto,
    });

    return {
      success: true,
      producto: nuevoProducto,
      message: 'Producto creado exitosamente',
    };
  }

  /**
   * Actualizar producto (admin)
   */
  static update(
    id: string,
    datos: Partial<Producto>
  ): { success: boolean; producto?: Producto; message: string } {
    const index = productos.findIndex((p) => p.id_producto === id);

    if (index === -1) {
      return { success: false, message: 'Producto no encontrado' };
    }

    if (datos.nombre) productos[index].nombre = datos.nombre;
    if (datos.descripcion) productos[index].descripcion = datos.descripcion;
    if (datos.precio !== undefined) productos[index].precio = datos.precio;
    if (datos.id_categoria) productos[index].id_categoria = datos.id_categoria;
    if (datos.imagen) productos[index].imagen = datos.imagen;

    return {
      success: true,
      producto: this.findById(id),
      message: 'Producto actualizado',
    };
  }

  /**
   * Eliminar producto (admin)
   */
  static delete(id: string): { success: boolean; message: string } {
    const index = productos.findIndex((p) => p.id_producto === id);

    if (index === -1) {
      return { success: false, message: 'Producto no encontrado' };
    }

    productos.splice(index, 1);

    // Eliminar inventario asociado
    const invIndex = inventarios.findIndex((i) => i.id_producto === id);
    if (invIndex !== -1) {
      inventarios.splice(invIndex, 1);
    }

    return { success: true, message: 'Producto eliminado' };
  }

  /**
   * Contar productos
   */
  static count(): number {
    return productos.length;
  }

  /**
   * Obtener productos destacados (deterministico para evitar errores de hidratacion)
   */
  static getFeatured(limit: number = 8): Producto[] {
    // Usar orden deterministico en lugar de aleatorio para evitar mismatch SSR/CSR
    const featured = [...productos].slice(0, limit);
    return featured.map((p) => ({
      ...p,
      categoria: categorias.find((c) => c.id_categoria === p.id_categoria),
    }));
  }
}

/**
 * Clase CategoryModel - Operaciones CRUD para categorías
 */
export class CategoryModel {
  /**
   * Obtener todas las categorías
   */
  static getAll(): Categoria[] {
    return [...categorias];
  }

  /**
   * Obtener categoría por ID
   */
  static findById(id: string): Categoria | undefined {
    return categorias.find((c) => c.id_categoria === id);
  }

  /**
   * Crear categoría (admin)
   */
  static create(
    nombre: string
  ): { success: boolean; categoria?: Categoria; message: string } {
    if (!nombre || nombre.trim().length === 0) {
      return { success: false, message: 'Nombre requerido' };
    }

    // Verificar nombre único
    if (categorias.find((c) => c.nombre.toLowerCase() === nombre.toLowerCase())) {
      return { success: false, message: 'La categoría ya existe' };
    }

    const nuevaCategoria: Categoria = {
      id_categoria: generarId('CAT'),
      nombre: nombre.trim(),
    };

    categorias.push(nuevaCategoria);

    return {
      success: true,
      categoria: nuevaCategoria,
      message: 'Categoría creada',
    };
  }

  /**
   * Actualizar categoría (admin)
   */
  static update(
    id: string,
    nombre: string
  ): { success: boolean; categoria?: Categoria; message: string } {
    const index = categorias.findIndex((c) => c.id_categoria === id);

    if (index === -1) {
      return { success: false, message: 'Categoría no encontrada' };
    }

    categorias[index].nombre = nombre.trim();

    return {
      success: true,
      categoria: categorias[index],
      message: 'Categoría actualizada',
    };
  }

  /**
   * Eliminar categoría (admin)
   */
  static delete(id: string): { success: boolean; message: string } {
    // Verificar que no haya productos en la categoría
    const productosEnCategoria = productos.filter(
      (p) => p.id_categoria === id
    );
    if (productosEnCategoria.length > 0) {
      return {
        success: false,
        message: 'No se puede eliminar: hay productos en esta categoría',
      };
    }

    const index = categorias.findIndex((c) => c.id_categoria === id);
    if (index === -1) {
      return { success: false, message: 'Categoría no encontrada' };
    }

    categorias.splice(index, 1);
    return { success: true, message: 'Categoría eliminada' };
  }

  /**
   * Contar productos por categoría
   */
  static countProducts(id_categoria: string): number {
    return productos.filter((p) => p.id_categoria === id_categoria).length;
  }
}
