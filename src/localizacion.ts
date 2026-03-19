import { ILocalizacion } from "./interfaces";
import { tipoLocalizacion } from "./types";

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
    this.id = id;
    this.nombre = nombre;
    this.tipo = tipo;
    this.dimension = dimension;
    this.poblacion = poblacion;
    this.descripcion = descripcion;
  }
}
