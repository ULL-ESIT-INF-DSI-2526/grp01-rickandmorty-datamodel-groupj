import { Dimension } from "./Dimension";
import { estadosDimension, tipoLocalizacion } from "./types";

export interface IAtributos {
  /** ID unico del objeto */
  id: string;

  /** Nombre del objeto */
  nombre: string;

  /** Descripcion del objeto */
  descripcion: string;
}

export interface IDimension extends IAtributos {
  /** Estado actual de la dimension */
  estadoDim: estadosDimension;

  /** Nivel tecnologico de la dimension, esta entre 1 y 10 */
  nivelTec: number;
  
}

export interface ILocalizacion extends IAtributos {
  /** Tipo de localizacion */
  tipo: tipoLocalizacion;

  /** ID de dimension en la que se encuentra */
  dimension: string;

  /** Poblacion aproximada */
  poblacion: number;
}
