import { IDuplicable } from "../interfaces.js";
import { Localizacion } from "../models/localizaciones.js";
import { tipoLocalizacion } from "../../utils/types.js";
import { Low } from "lowdb"
import { Data, db } from "../../database/db.js";
import { normalize } from "../../utils/auxFunc.js";

/**
 * clase que contiene las funciones para registrar y filtrar localizaciones en la base de datos
 * @param _db - la base de datos
 */
export class RepositorioLocalizaciones implements IDuplicable<Localizacion> {
  private _db: Low<Data>;
  constructor(database: Low<Data>) {
    this._db = database;
  }

  async add(localizacion: Localizacion): Promise<void>{
    if (!/^L\d+$/.test(localizacion.id)) {
      throw new Error("El ID de la localización debe tener formato LXXX (ej: L001)");
    }
    await this._db.read()
    
    if (await this.isDuplicate(localizacion)) {
      throw new Error("Localizacion duplicada");
    }
    this._db.data.localizacion.push(localizacion);
    await this._db.write();
  }
    
  async remove(id: string): Promise<void> {
    await this._db.read();
    if (typeof await this.findById(id) === "undefined") throw new Error("El elemento no existe");
    this._db.data.localizacion = this._db.data.localizacion.filter(i => i.id !== id);
    await this._db.write();
  }

  async findById(id: string): Promise<Localizacion | undefined> {
        await this._db.read();
        return this._db.data.localizacion.find(l => l.id === id);
      }

  async update(id: string, cambios: { nombre?: string; tipo?: tipoLocalizacion; poblacionAproximada?: number; 
                                dimension?: string | null; descripcion?: string }): Promise<void> {
    await this._db.read();
    const localizacion = this._db.data.localizacion.find(l => l.id === id);
    if (!localizacion) throw new Error("La localización no existe");
    const copia = { ...localizacion };

    if (cambios.nombre !== undefined) {
      if (cambios.nombre.trim() === "") throw new Error("El nombre no puede estar vacío");
      copia.nombre = cambios.nombre;
    }

    if (cambios.dimension !== undefined) {
      if (cambios.dimension === null) throw new Error("La localización debe tener una dimensión");
      copia.dimension = cambios.dimension;
    }

    if (cambios.tipo !== undefined) copia.tipo = cambios.tipo;

    if (cambios.poblacionAproximada !== undefined)
      if (cambios.poblacionAproximada < 0) throw new Error("La población no puede ser negativa");

    if (cambios.descripcion !== undefined) 
      if (cambios.descripcion.trim() === "")  throw new Error("La descripción no puede estar vacía");

    const duplicado = this._db.data.localizacion.some(l =>
      l.id !== id &&
      normalize(l.nombre) === normalize(copia.nombre) &&
      l.tipo === copia.tipo &&
      l.dimension === copia.dimension
    );
    if (duplicado) throw new Error("Localización duplicada");

    if (cambios.nombre !== undefined) localizacion.nombre = cambios.nombre;
    if (cambios.tipo !== undefined) localizacion.tipo = cambios.tipo;
    if (cambios.poblacionAproximada !== undefined) localizacion.poblacionAproximada = cambios.poblacionAproximada;
    if (cambios.dimension !== undefined) localizacion.dimension = cambios.dimension;
    if (cambios.descripcion !== undefined) localizacion.descripcion = cambios.descripcion;

    await this._db.write();
  }

  async getAll(): Promise<Localizacion[]> {
    await this._db.read();
    return this._db.data.localizacion;
  } 

  async filterByNombre(nombre: string): Promise<Localizacion[]> {
    await this._db.read();
    return this._db.data.localizacion.filter(l => l.nombre === nombre);
  } 
  
  async filterByTipo(tipo: tipoLocalizacion): Promise<Localizacion[]> {
    await this._db.read();
    return this._db.data.localizacion.filter(l => l.tipo === tipo);
  }

  async filterByDimension(id: string): Promise<Localizacion[]> {
    await this._db.read();
    return this._db.data.localizacion.filter(l => l.dimension === id);
  }

  async isDuplicate(other: Localizacion): Promise<boolean> { 
    await this._db.read();
    const duplicado = this._db.data.localizacion.some(l => 
      normalize(l.nombre) === normalize(other.nombre) &&
      l.tipo === other.tipo &&
      l.dimension === other.dimension); 

    if (duplicado) return true; 
    return false;
  }
}