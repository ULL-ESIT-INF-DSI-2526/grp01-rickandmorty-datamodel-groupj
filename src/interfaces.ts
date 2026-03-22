import { estadosDimension, estadosPersonaje, tiposEspecie, tiposInvento, tipoAfiliacion, tipoLocalizacion, tipoEventoMultiversal, accionEventoDimension, accionEventoInvento } from "./types.js";
import { Low } from "lowdb"
import { Data } from "./Database/db.js";

/**
 * Interfaz que define los atributos comunes de los objetos en el sistema.
 */
export interface IAtributos {
  /** ID unico del objeto */
  id: string;
  /** Nombre del objeto */
  nombre: string;
  /** Descripcion adicional del objeto */
  descripcion: string;
}

/**
 * Interfaz que define los atributos específicos de una __dimensión__ en el sistema.
 */
export interface IDimension extends IAtributos {
  /** Estado actual de la dimension */
  estadoDim: estadosDimension;
  /** Nivel tecnologico de la dimension, esta entre 1 y 10 */
  nivelTec: number;
}

/**
 * Interfaz que define los atributos específicos de un __personaje__ en el sistema.
 */
export interface IPersonaje extends IAtributos {
  /** Especie del personaje - referencia a la especie del personaje */
  especie: string | null; 
  /** Dimension de origen del personaje - referencia a la dimension del personaje */
  dimension: string | null;
  /** Estado del personaje */
  estado: estadosPersonaje;
  /** Afiliación del personaje */
  afiliacion: tipoAfiliacion;
  /** Nivel de inteligencia del personaje, esta entre 1 y 10 */
  nivelInteligencia: number;
}


/**
 * Interfaz que define los atriutos de las __especies__ en el sistema.
 */
export interface IEspecie extends IAtributos {
  /** Origen de la especie - referencia al planeta o dimensión de la especie */
  origen: string | null;
  /** Tipo de especie*/
  tipo: tiposEspecie;
  /** Esperanza de vida de la especie */
  esperanzaVida: number;
}

/**
 * Interfaz que define los atributos de los __inventos__ en el sistema.
 */
export interface IInvento extends IAtributos {
  /** Nombre del inventor del invento - referencia al personaje */
  inventor: string | null;
  /** Tipo de invento */
  tipo: tiposInvento;
  /** Nivel de peligro del invento, esta entre 1 y 10 */
  nivelPeligro: number;
}
 

/**
 * Interfaz que define los atriutos de las __localizaciones__ en el sistema.
 */
export interface ILocalizacion extends IAtributos {
  /** Tipo de localizacion */
  tipo: tipoLocalizacion;
  /** Dimension de la localizacion - referencia a la dimension */
  dimension: string | null;
  /**Población aproximada de habitantes*/
  poblacionAproximada: number;
}

/**
 * Interfaz base para registrar eventos del multiverso.
 */
export interface IEventoBase {
  /** ID unico del evento */
  id: string;
  /** Tipo general del evento */
  tipoEvento: tipoEventoMultiversal;
  /** Fecha y hora en formato ISO */
  fecha: string;
  /** Motivo o descripcion breve del evento */
  motivo: string;
}

/**
 * Evento de viaje interdimensional de un personaje.
 */
export interface IEventoViaje extends IEventoBase {
  tipoEvento: "viaje";
  personajeId: string;
  dimensionOrigenId: string;
  dimensionDestinoId: string;
}

/**
 * Evento de creacion o destruccion de una dimension.
 */
export interface IEventoDimension extends IEventoBase {
  tipoEvento: "dimension";
  accion: accionEventoDimension;
  dimensionId: string;
}

/**
 * Evento de despliegue o neutralizacion de un invento.
 */
export interface IEventoInvento extends IEventoBase {
  tipoEvento: "invento";
  accion: accionEventoInvento;
  inventoId: string;
  localizacionId: string;
}

/**
 * Union de eventos soportados por el sistema.
 */
export type EventoMultiversal = IEventoViaje | IEventoDimension | IEventoInvento;

/**
 * Interfaz que define los métodos para un contenedor 
 */
export interface IRepositorio<T> {
  add(item: T): Promise<void>;
  remove(id: string): Promise<void>;
  findById(id: string): Promise<T | undefined>;
  getAll(): Promise<T[]>;
}

/**
 * Interfaz que defina un método para comprar dos objetos
 */
export interface IDuplicable<T> {
  isDuplicate(other: T): Promise<boolean>;
}