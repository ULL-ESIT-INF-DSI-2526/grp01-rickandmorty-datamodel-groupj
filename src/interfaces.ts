import { estadosDimension, estadosPersonaje, tiposEspecie, tiposInvento, tipoAfiliacion, tipoLocalizacion } from "./types";



/**
 * Interfaz que define los atributos comunes de los objetos en el sistema.
 */
export interface IAtributos {
  /** ID unico del objeto */
  id: string;

  /** Nombre del objeto */
  nombre: string;
}

/**
 * Interfaz que define los atributos específicos de una __dimensión__ en el sistema.
 */
export interface IDimension extends IAtributos {
  /** Estado actual de la dimension */
  estadoDim: estadosDimension;

  /** Nivel tecnologico de la dimension, esta entre 1 y 10 */
  nivelTec: number;

  /** Descripcion adicional de la dimension */
  descripcion: string;
}

/**
 * Interfaz que define los atributos específicos de un __personaje__ en el sistema.
 */
export interface IPersonaje extends IAtributos {
  /** Especie del personaje - referencia a la especie del personaje */
  especie: string; 
  /** Dimension de origen del personaje - referencia a la dimension del personaje */
  dimension: string;
  /** Estado del personaje */
  estado: estadosPersonaje;
  /** Afiliación del personaje */
  afiliacion: tipoAfiliacion;
  /** Nivel de inteligencia del personaje, esta entre 1 y 10 */
  nivelInteligencia: number;
  /** Descripcion adicional del personaje */
  descripcion: string;
}


/**
 * Interfaz que define los atriutos de las __especies__ en el sistema.
 */
export interface IEspecie extends IAtributos {
  /** Origen de la especie - referencia al planeta o dimensión de la especie */
  origen: string;
  /** Tipo de especie*/
  tipo: tiposEspecie;
  /** Esperanza de vida de la especie */
  esperanzaVida: number;
  /** Descripcion adicional de la especie */
  descripcion: string;
}

/**
 * Interfaz que define los atributos de los __inventos__ en el sistema.
 */
export interface IInvento extends IAtributos {
  /** Nombre del inventor del invento - referencia al personaje */
  inventor: string;
  /** Tipo de invento */
  tipo: tiposInvento;
  /** Nivel de peligro del invento, esta entre 1 y 10 */
  nivelPeligro: number;
  /** Descripcion adicional del invento */
  descripcion: string;
}
 
/**
 * Interfaz que define los atributos de las __localizaciones__ en el sistema.
 */
export interface ILocalizacion extends IAtributos {
  /** Tipo de localizacion */
  tipo: tipoLocalizacion;
  /** Dimension de origen de la localizacion - referencia a la dimension de la localizacion */
  dimension: string;
  /** Numero de habitantes */
  poblacion: number;
  /** Descripcion adicional de la localizacion */
  descripcion: string;
}
