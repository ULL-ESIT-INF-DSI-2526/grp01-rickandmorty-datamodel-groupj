import { ILocalizacion } from "./interfaces";
import { Dimension } from "./Dimension";
import {tipoLocalizacion} from "./types"

export class Localizacion implements ILocalizacion {


  constructor(
    public id: string,
    public nombre: string,
    public tipo: tipoLocalizacion,
    public dimension: string,
    public poblacion: number,
    public descripcion: string,
  ) {
    if (!id) {
      throw new Error(`Id no puede ser vacia`);
    }
    if (!nombre) {
      throw new Error(`nombre no puede ser vacio`);
    }
    if (poblacion < 0) {
      throw new Error(`poblacion invalida`);
    }
    if (!descripcion) {
      throw new Error(`descripcion no puede ser vacia`);
    }
  }

  get IdLocal(): string {
      return this.id;
    }
  
    get Nombre(): string {
      return this.nombre;
    }
  
    get Tipo(): tipoLocalizacion {
      return this.tipo;
    }

    get Dimension(): string {
      return this.dimension;
    }
  
    get Poblacion(): number {
      return this.poblacion;
    }
  
    get Descripcion(): string {
      return this.descripcion;
    }
}