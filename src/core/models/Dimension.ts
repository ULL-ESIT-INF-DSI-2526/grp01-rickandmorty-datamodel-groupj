import { IDimension } from "../interfaces.js"
import { estadosDimension } from "../../utils/types.js"

/**
 * Clase que representa una dimension en el sistema, implementa la interfaz IDimension.
 * @param id - Identificador único de la dimension
 * @param nombre - Nombre de la dimension
 * @param estadoDim - Estado actual de la dimension
 * @param nivelTec - Nivel tecnologico de la dimension, debe estar entre 1 y 10
 * @param descripcion - Descripción adicional de la dimension
 * 
 * @throws Error si el ID, nombre o descripcion están vacías; o si el nivel de tecnología es menor que 0 o mayor que 10.
 */
export class Dimension implements IDimension {
  constructor(
    public readonly id: string,
    public nombre: string,
    public estadoDim: estadosDimension,
    public nivelTec: number,
    public descripcion: string,
  ) {
    if (!id || id.trim().length === 0) {
      throw new Error("La ID no puede ser vacia");
    }
    if (!nombre || nombre.trim().length === 0) {
      throw new Error(`El nombre no puede ser vacio`);
    }
      if (!descripcion || descripcion.trim().length === 0) {
      throw new Error(`La descripcion no puede estar vacia`);
    }  
    if (nivelTec < 1 || 10 < nivelTec) {
      throw new Error(`Indice fuera de rango`);
    }
  }
}
