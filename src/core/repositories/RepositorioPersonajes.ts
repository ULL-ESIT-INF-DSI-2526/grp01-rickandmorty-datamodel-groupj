import { IDuplicable } from "../interfaces.js";
import { Personaje } from "../models/personajes.js";
import { estadosPersonaje } from "../../utils/types.js";
import { tipoAfiliacion } from "../../utils/types.js";
import { Low } from "lowdb"
import { Data } from "../../database/db.js";
import { normalize } from "../../utils/auxFunc.js";

/**
 * clase que contiene las funciones para registrar y filtrar personajes en la base de datos
 * @param _db - la base de datos
 */
export class RepositorioPersonajes implements IDuplicable<Personaje> {
  private _db: Low<Data>;
    constructor(database: Low<Data>) {
      this._db = database;
    }
  
    async add(personaje: Personaje): Promise<void>{
      if (!/^P\d+$/.test(personaje.id)) {
        throw new Error("El ID del personaje debe tener formato PXXX (ej: P001)");
      }
      await this._db.read()
  
      if (await this.isDuplicate(personaje)) {
        throw new Error("Personaje duplicado");
      }
      this._db.data.personaje.push(personaje);
      await this._db.write();
    }
  
    async remove(id: string): Promise<void> {
      await this._db.read();
      if (typeof await this.findById(id) === "undefined") throw new Error("El elemento no existe");
      this._db.data.personaje = this._db.data.personaje.filter(p => p.id !== id);
      await this._db.write();
    }
  
    async findById(id: string): Promise<Personaje | undefined> {
      await this._db.read();
      return this._db.data.personaje.find(i => i.id === id);
    }

  async update(id: string, cambios: { nombre?: string; especie?: string | null; dimension?: string | null;
                                estado?: estadosPersonaje; afiliacion?: tipoAfiliacion; 
                                nivelInteligencia?: number; descripcion?: string }): Promise<void> {
    await this._db.read();                              
    const personaje = await this._db.data.personaje.find(p => p.id === id);
    if (!personaje) throw new Error("El personaje no existe");
    const copia = { ...personaje };

    if (cambios.nombre !== undefined) {
      if (cambios.nombre.trim() === "")  throw new Error("El nombre no puede estar vacío");
      copia.nombre = cambios.nombre;
    }

    if (cambios.especie !== undefined) {
      if (cambios.especie === null)
        throw new Error("La especie no puede ser null");
      copia.especie = cambios.especie;
    }

    if (cambios.dimension !== undefined) {
      if (cambios.dimension === null)
        throw new Error("La dimensión no puede ser null");
      copia.dimension = cambios.dimension;
    }

    if (cambios.nivelInteligencia !== undefined)
      if (cambios.nivelInteligencia <= 0 || cambios.nivelInteligencia > 10)
        throw new Error("El nivel de inteligencia debe estar entre 1 y 10");

    if (cambios.descripcion !== undefined)
      if (cambios.descripcion.trim() === "") throw new Error("La descripción no puede estar vacía");

    const duplicado = await this._db.data.personaje.some(p => 
      p.id !== copia.id &&
      normalize(p.nombre) === normalize(copia.nombre) &&
      p.especie === copia.especie &&
      p.dimension === copia.dimension); 

    if (duplicado) throw new Error("Personaje duplicado");

    if (cambios.nombre !== undefined) personaje.nombre = cambios.nombre;
    if (cambios.especie !== undefined) personaje.especie = cambios.especie;
    if (cambios.dimension !== undefined) personaje.dimension = cambios.dimension;
    if (cambios.estado !== undefined) personaje.estado = cambios.estado;
    if (cambios.afiliacion !== undefined) personaje.afiliacion = cambios.afiliacion;
    if (cambios.nivelInteligencia !== undefined) personaje.nivelInteligencia = cambios.nivelInteligencia;
    if (cambios.descripcion !== undefined) personaje.descripcion = cambios.descripcion;
    await this._db.write();
  }

  async getAll(): Promise<Personaje[]> {
      await this._db.read();
      return this._db.data.personaje;
    } 

  async filterByNombre(nombre: string): Promise<Personaje[]> {
    this._db.read();
    return this._db.data.personaje.filter(p => normalize(p.nombre) === normalize(nombre));
  }

  async filterByEspecie(especie: string): Promise<Personaje[]> {
    this._db.read();
    return this._db.data.personaje.filter(p => p.especie !== null && normalize(p.especie) === normalize(especie));
  }

  async filterByAfiliacion(afiliacion: tipoAfiliacion): Promise<Personaje[]> {
    this._db.read();
    return this._db.data.personaje.filter(p => p.afiliacion === afiliacion);
  }

  async filterByEstado(estado: estadosPersonaje): Promise<Personaje[]> {
    this._db.read();
    return this._db.data.personaje.filter(p => p.estado === estado);
  }

  async filterByDimension(dimension: string): Promise<Personaje[]> {
    this._db.read();
    return this._db.data.personaje.filter(p => p.dimension !== null && p.dimension === dimension);
  }

  async setNullDimension(id: string): Promise<void> {
    this._db.read();
    this._db.data.personaje.forEach(e => {
      if (e.dimension === id) e.dimension = null;
    });
  }

  async setNullEspecie(id: string): Promise<void> {
    this._db.read();
    this._db.data.personaje.forEach(e => {
      if (e.especie === id) e.especie = null;
    });
  }

  async getNullDimension(): Promise<Personaje[]> {
    this._db.read();
    return this._db.data.personaje.filter(e => e.dimension === null);
  }

  async isDuplicate(other: Personaje): Promise<boolean> {
    await this._db.read(); 
    const duplicado = await this._db.data.personaje.some(p => 
      normalize(p.nombre) === normalize(other.nombre) &&
      p.especie === other.especie &&
      p.dimension === other.dimension); 

    if (duplicado) return true; 
    return false;
  }
}