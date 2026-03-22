import { IDuplicable } from "../interfaces.js";
import { Especie } from "../models/especies.js";
import { tiposEspecie } from "../../utils/types.js";
import { Low } from "lowdb"
import { Data } from "../../database/db.js";
import { normalize } from "../../utils/auxFunc.js";

/**
 * clase que contiene las funciones para registrar y filtrar especies en la base de datos
 * @param _db - la base de datos
 */
export class RepositorioEspecies implements IDuplicable<Especie> {
  private _db: Low<Data>;
  constructor(database: Low<Data>) {
    this._db = database;
  }

  async add(especie: Especie): Promise<void> {    if (!/^E\d+$/.test(especie.id)) {
      throw new Error("El ID de la especie debe tener formato EXXX (ej: E001)");
    }    await this._db.read();
    if (await this.isDuplicate(especie)) {
      throw new Error("Especie duplicada");
    }
    this._db.data.especie.push(especie);
    this._db.write();
  }

  async remove(id: string): Promise<void> {
      await this._db.read();
      if (typeof await this.findById(id) === "undefined") throw new Error("El elemento no existe");
      this._db.data.especie = this._db.data.especie.filter(i => i.id !== id);
      await this._db.write();
    }
  
    async findById(id: string): Promise<Especie | undefined> {
      await this._db.read();
      return this._db.data.especie.find(e => e.id === id);
    }

  async update(id: string, cambios: { nombre?: string; origen?: string | null; tipo?: tiposEspecie; 
                                       esperanzaVida?: number; descripcion?: string }): Promise<void> {
    await this._db.read();                      
    const especie = this._db.data.especie.find(e => e.id === id);
    if (!especie) throw new Error("La especie no existe");
    const copia = { ...especie };

    if (cambios.nombre !== undefined) {
      if (cambios.nombre.trim() === "") throw new Error("El nombre no puede estar vacío");
      copia.nombre = cambios.nombre;
    }

    if (cambios.origen !== undefined) {
      if (cambios.origen === null) throw new Error("La especie debe tener un origen");
      copia.origen = cambios.origen;
    }

    if (cambios.tipo !== undefined) copia.tipo = cambios.tipo;

    if (cambios.esperanzaVida !== undefined)
      if (cambios.esperanzaVida <= 0) throw new Error("Esperanza de vida inválida");

    if (cambios.descripcion !== undefined)
      if (cambios.descripcion.trim() === "") throw new Error("La descripción no puede estar vacía");

    const duplicado = this._db.data.especie.some(e => 
      e.id !== copia.id &&
      normalize(e.nombre) === normalize(copia.nombre) &&
      e.tipo === copia.tipo &&
      e.origen === copia.origen); 
      
    if (duplicado) throw new Error("Especie duplicada");

    if (cambios.nombre !== undefined) especie.nombre = cambios.nombre;
    if (cambios.origen !== undefined) especie.origen = cambios.origen;
    if (cambios.tipo !== undefined) especie.tipo = cambios.tipo;
    if (cambios.esperanzaVida !== undefined) especie.esperanzaVida = cambios.esperanzaVida;
    if (cambios.descripcion !== undefined) especie.descripcion = cambios.descripcion;
    await this._db.write();
  }

    async getAll(): Promise<Especie[]> {
      await this._db.read();
      return this._db.data.especie;
    } 
  
  async setNullOrigen(id: string): Promise<void> {
    await this._db.read()
    this._db.data.especie.forEach(e=> {
      if (e.origen === id) e.origen = null;
    });
    await this._db.write();
  }

  async isDuplicate(other: Especie): Promise<boolean> { 
    await this._db.read();
    const duplicado = this._db.data.especie.some(e => 
      normalize(e.nombre) === normalize(other.nombre) &&
      e.tipo === other.tipo &&
      e.origen === other.origen); 

    if (await duplicado) return true; 
    return false;
  }
}