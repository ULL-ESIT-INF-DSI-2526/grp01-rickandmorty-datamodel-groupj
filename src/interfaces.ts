import { estadosDimension } from "./types";

export interface IAtributos {
  /** ID unico del objeto */
  id: string;

  /** Nombre del objeto */
  nombre: string;
}

export interface IDimension extends IAtributos {
  /** Estado actual de la dimension */
  estadoDim: estadosDimension;

  /** Nivel tecnologico de la dimension, esta entre 1 y 10 */
  nivelTec: number;

  /** Descripcion adicional de la dimension */
  descripcion: string;
}
