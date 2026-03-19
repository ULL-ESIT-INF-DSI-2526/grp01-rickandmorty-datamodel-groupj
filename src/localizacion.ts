import { ILocalizacion } from "./interfaces";
import { tipoLocalizacion } from "./types";

/**
 * Clase que representa una localizacion en el sistema, implementa la interfaz ILocalizacion.
 * @param id - Identificador único de la localizacion
 * @param nombre - Nombre de la localizacion
 * @param tipo - Tipo de localizacion
 * @param dimension - ID de la dimension origen
 * @param poblacion - Poblacion aproximada
 * @param descripcion - Descripción adicional de la localizacion
 */
export class Localizacion implements ILocalizacion {
  constructor(
    public readonly id: string,
    public nombre: string,
    public tipo: tipoLocalizacion,
    public dimension: string,
    public poblacion: number,
    public descripcion: string,
  ) {
    if (!id || id.trim().length === 0) {
      throw new Error("La ID no puede ser vacia");
    }
    if (!nombre || nombre.trim().length === 0) {
      throw new Error("El nombre no puede ser vacio");
    }
    if (!dimension || dimension.trim().length === 0) {
      throw new Error("El ID de referencia a dimension no puede ser vacio");
    }
    if (poblacion < 1) {
      throw new Error("Cantidad de poblacion invalida");
    }
    this.id = id;
    this.nombre = nombre;
    this.tipo = tipo;
    this.dimension = dimension;
    this.poblacion = poblacion;
    this.descripcion = descripcion;
  }
}
