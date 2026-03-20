import { tipoAfiliacion, estadosPersonaje } from "./types";
import { IPersonaje } from "./interfaces";

/**
 * Clase que representa un personaje en el sistema, implementa la interfaz IPersonaje.
 * 
 * @param id - Identificador único del personaje
 * @param nombre - Nombre del personaje
 * @param especie - ID de la especie del personaje
 * @param dimension - ID de la dimensión de origen del personaje
 * @param estado - Estado actual del personaje
 * @param afiliacion - Afiliación del personaje
 * @param nivelInteligencia - Nivel de inteligencia (entre 1 y 10)
 * @param descripcion - Descripción adicional del personaje
 * 
 * @throws Error si el ID, nombre, especie, dimensión o descripción están vacíos;
 * o si el nivel de inteligencia no está entre 1 y 10.
 */
export class Personaje implements IPersonaje {
  constructor (
    public readonly id: string,
    public nombre: string,
    public especie: string | null, // ID de la especie
    public dimension: string | null, // ID de la dimensión de origen
    public estado: estadosPersonaje,
    public afiliacion: tipoAfiliacion,
    public nivelInteligencia: number,
    public descripcion: string
  ){
    if (id.trim() === "") throw new Error("ID vacío");
    if (nombre.trim() === "") throw new Error("Nombre vacío");
    if (typeof especie === "string")
      if (especie.trim() === "") throw new Error("Especie vacía");
    if (typeof dimension === "string")
      if (dimension.trim() === "") throw new Error("Dimensión de origen vacía");
    if (descripcion.trim() === "") throw new Error("Descripción vacía");
    if (nivelInteligencia <= 0 || nivelInteligencia > 10) throw new Error("Nivel de inteligencia inválido");     
  }
}