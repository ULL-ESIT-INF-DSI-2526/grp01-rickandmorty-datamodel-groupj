import { IDimension } from "./interfaces";
import { estadosDimension } from "./types";

const ESTADOS_VALIDOS: estadosDimension[] = [
  "activa",
  "destruida",
  "en cuarentena",
];

export class Dimension implements IDimension {
  public readonly id: string;
  public nombre: string;
  public estadoDim: estadosDimension;
  public descripcion: string;
  public nivelTec: number;

  constructor(data: IDimension) {
    if (!data.id || data.id.trim().length === 0) {
      throw new Error("La ID no puede ser vacia");
    }
    if (!data.nombre || data.nombre.trim().length === 0) {
      throw new Error(`El nombre no puede ser vacio`);
    }
    if (
      !data.estadoDim ||
      data.estadoDim.trim().length === 0 ||
      !ESTADOS_VALIDOS.includes(data.estadoDim)
    ) {
      throw new Error(
        `El estado de la dimension no puede ser vacia o es invalida`,
      );
    }
    if (data.nivelTec < 1 || 10 < data.nivelTec) {
      throw new Error(`Indice fuera de rango`);
    }

    this.id = data.id;
    this.nombre = data.nombre;
    this.descripcion = data.descripcion;
    this.estadoDim = data.estadoDim;
    this.nivelTec = data.nivelTec;
  }
}
