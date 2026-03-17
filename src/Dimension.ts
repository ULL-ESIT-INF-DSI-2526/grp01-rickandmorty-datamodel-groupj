import { IDimension } from "./interfaces";
import { estadosDimension } from "./types";

const ESTADOS_VALIDOS: estadosDimension[] = ["activa", "destruida", "en cuarentena"];

export class Dimension implements IDimension {
  public readonly id: string;
  public nombre: string;
  public estadoDim: estadosDimension;
  public descripcion: string;
  public nivelTec: number;

  constructor(data: IDimension) {
    this.id = data.id;
    this.nombre = data.nombre;
    this.descripcion = data.descripcion;
    this.estadoDim = data.estadoDim;
    this.nivelTec = data.nivelTec;
  }
}
