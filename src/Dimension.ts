import { estadosDimension } from "./types";
import { IDimension } from "./interfaces";

export class Dimension implements IDimension {
  /**
   * @param id - ID de la dimension
   * @param nombre - Nombre de la dimension
   * @param estadoDim - Estado de la dimension
   * @param nivelTec - Nivel tecnologico de la dimension
   * @param descripcion - Descripcion de la dimension
   * @throws error si alguno de los strings esta vacio o si el nivel de
   * tecnologia no esta entre el rango
   */
  constructor(
    public id: string,
    public nombre: string,
    public estadoDim: estadosDimension,
    public nivelTec: number,
    public descripcion: string,
  ) {
    if (!id) {
      throw new Error(`Id no puede ser vacia`);
    }
    if (!nombre) {
      throw new Error(`nombre no puede ser vacio`);
    }
    if (nivelTec < 1 || 10 < nivelTec) {
      throw new Error(`nivel de tecnologia fuera del rango`);
    }
    if (!descripcion) {
      throw new Error(`descripcion no puede ser vacia`);
    }
  }

  get IdDim(): string {
    return this.id;
  }

  get Nombre(): string {
    return this.nombre;
  }

  get Estado(): estadosDimension {
    return this.estadoDim;
  }

  get NivelTec(): number {
    return this.nivelTec;
  }

  get Descripcion(): string {
    return this.descripcion;
  }
}
