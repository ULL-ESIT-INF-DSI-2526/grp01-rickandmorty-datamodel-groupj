import { IDimension } from "./interfaces";
import { estadosDimension } from "./types";

export class Dimension implements IDimension {
  constructor(
    public readonly id: string,
    public nombre: string,
    public estadoDim: estadosDimension,
    public descripcion: string,
    public nivelTec: number,
  ) {
    if (!id || id.trim().length === 0) {
      throw new Error("La ID no puede ser vacia");
    }
    if (!nombre || nombre.trim().length === 0) {
      throw new Error(`El nombre no puede ser vacio`);
    }
    if (nivelTec < 1 || 10 < nivelTec) {
      throw new Error(`Indice fuera de rango`);
    }

    this.id = id;
    this.nombre = nombre;
    this.descripcion = descripcion;
    this.estadoDim = estadoDim;
    this.nivelTec = nivelTec;
  }
}
