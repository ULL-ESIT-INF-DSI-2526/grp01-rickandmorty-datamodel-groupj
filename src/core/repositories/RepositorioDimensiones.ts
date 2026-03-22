import { Dimension } from "../models/Dimension.js";
import { IDuplicable, IRepositorio } from "../interfaces.js";
import { estadosDimension } from "../../utils/types.js";
import { Low } from "lowdb"
import { Data } from "../../database/db.js";
import { normalize } from "../../utils/auxFunc.js";

/**
 * clase que contiene las funciones para registrar y filtrar dimensiones en la base de datos
 * @param _db - la base de datos
 */
export class RepositorioDimensiones implements IDuplicable<Dimension>, IRepositorio<Dimension> {
  private _db: Low<Data>;
  constructor(database: Low<Data>) {
    this._db = database;
  }

  async add(dimension: Dimension): Promise<void>{
    if (!/^D-\d+$/.test(dimension.id)) {
      throw new Error("El ID de dimensión debe tener formato D-XXX (ej: D-001)");
    }
    await this._db.read();

    if (await this.isDuplicate(dimension)) {
       throw new Error("Dimensión duplicada");
    }
    this._db.data.dimension.push(dimension);
    await this._db.write();
  }

  async remove(id: string): Promise<void> {
    await this._db.read();
    if (typeof await this.findById(id) === "undefined") throw new Error("El elemento no existe");
    this._db.data.dimension = this._db.data.dimension.filter(i => i.id !== id);
    await this._db.write();
  }

  async findById(id: string): Promise<Dimension | undefined> {
    await this._db.read();
    return this._db.data.dimension.find(d => d.id === id);
  }

  async update(id: string, cambios: Partial<Dimension>): Promise<boolean> {
    await this._db.read();
    const dimension = await this.findById(id);
    if (!dimension) throw new Error("La dimensión no existe");

    if (cambios.nombre !== undefined) {
      if (cambios.nombre.trim() === "") throw new Error("El nombre no puede estar vacío");
      else if (this._db.data.dimension.some(d => normalize(d.nombre) === normalize(cambios.nombre) && d.id !== id)) 
      throw new Error("El nombre de la dimensión ya existe");
    }
    
    if (cambios.nivelTec !== undefined) {
      if (cambios.nivelTec < 1 || cambios.nivelTec > 10) {
        throw new Error("El nivel tecnológico debe estar entre 1 y 10");
      }
    }
    
    if (cambios.descripcion !== undefined) {
      if (cambios.descripcion.trim() === "") {
        throw new Error("La descripción no puede estar vacía");
      }
    }
    
    if (cambios.nombre !== undefined) {dimension.nombre = cambios.nombre;}
    if (cambios.estadoDim !== undefined) {dimension.estadoDim = cambios.estadoDim;}
    if (cambios.nivelTec !== undefined) {dimension.nivelTec = cambios.nivelTec;}
    if (cambios.descripcion !== undefined) {dimension.descripcion = cambios.descripcion;}

    await this._db.write();
    return true;
  }

  async getAll(): Promise<Dimension[]> {
    await this._db.read();
    return this._db.data.dimension;
  } 

  async filterByEstado(estado: estadosDimension): Promise<Dimension[]> {
    await this._db.read();
    return this._db.data.dimension.filter(d => d.estadoDim === estado);
  }

  async isDuplicate(other: Dimension): Promise<boolean> { 
    await this._db.read();
    const duplicadoPorId = this._db.data.dimension.some(d => d.id === other.id);
    const duplicadoPorNombre = this._db.data.dimension.some(d => normalize(d.nombre) === normalize(other.nombre));
    if (duplicadoPorId || duplicadoPorNombre) return true; 
    return false;
  }
}