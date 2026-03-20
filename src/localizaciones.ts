import { ILocalizacion } from "./interfaces";
import { tipoLocalizacion } from "./types";

/**
 * Clase que representa una localización en el sistema, implementa la interfaz ILocalizacion.
 * 
 * @param id - Identificador único de la localización
 * @param nombre - Nombre de la localización
 * @param tipo - Tipo de localización
 * @param poblacionAproximada - Número aproximado de habitantes (no puede ser negativo)
 * @param dimension - ID de la dimensión donde se encuentra la localización
 * @param descripcion - Descripción adicional de la localización
 * 
 * @throws Error si el ID, nombre, dimensión o descripción están vacíos;
 * o si la población aproximada es negativa.
 */
export class Localizacion implements ILocalizacion {
  constructor(
    public readonly id: string,
    public nombre: string,
    public tipo: tipoLocalizacion,
    public poblacionAproximada: number,
    public dimension: string | null, // ID de la dimensión
    public descripcion: string
  ) {
    if (id.trim() === "") throw new Error("ID vacío");
    if (nombre.trim() === "") throw new Error("Nombre vacío");
    if (dimension.trim() === "") throw new Error("Dimensión vacía");
    if (descripcion.trim() === "") throw new Error("Descripción vacía");  
    if (poblacionAproximada < 0) throw new Error("La población no puede ser negativa");  
  }
}