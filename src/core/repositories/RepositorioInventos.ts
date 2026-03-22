
import { IDuplicable } from "../interfaces.js";
import { Invento } from "../models/inventos.js";
import { tiposInvento } from "../../utils/types.js";
import { Low } from "lowdb"
import { Data, db } from "../../database/db.js";
import { normalize } from "../../utils/auxFunc.js";

/**
 * clase que contiene las funciones para registrar y filtrar inventos en la base de datos
 * @param _db - la base de datos
 */
export class RepositorioInventos implements IDuplicable<Invento> {
  private _db: Low<Data>;
  constructor(database: Low<Data>) {
    this._db = database;
  }

  async add(invento: Invento): Promise<void>{
    if (!/^I\d+$/.test(invento.id)) {
      throw new Error("El ID del invento debe tener formato IXXX (ej: I001)");
    }
  
      if (await this.isDuplicate(invento)) {
        throw new Error("Invento duplicado");
      }
      this._db.data.invento.push(invento);
      await this._db.write();
    }
  
    async remove(id: string): Promise<void> {
      await this._db.read();
      if (typeof await this.findById(id) === "undefined") throw new Error("El elemento no existe");
      this._db.data.invento = this._db.data.invento.filter(i => i.id !== id);
      await this._db.write();
    }
  
    async findById(id: string): Promise<Invento | undefined> {
      await this._db.read();
      return this._db.data.invento.find(i => i.id === id);
    }

  async update(id: string, cambios: { nombre?: string; inventor?: string | null; tipo?: tiposInvento; 
                                nivelPeligro?: number; descripcion?: string }): Promise<void> {
    await this._db.read();
    const invento = this._db.data.invento.find(i => i.id === id);
    if (await !invento) throw new Error("El invento no existe");
    const copia = { ...invento };

    if (cambios.nombre !== undefined) {
      if (cambios.nombre.trim() === "") throw new Error("El nombre no puede estar vacío");
      copia.nombre = cambios.nombre;
    }

    if (cambios.inventor !== undefined) {
      if (cambios.inventor === null) throw new Error("El invento debe tener un inventor");
      copia.inventor = cambios.inventor;
    }

    if (cambios.tipo !== undefined)copia.tipo = cambios.tipo;

    if (cambios.nivelPeligro !== undefined)
      if (cambios.nivelPeligro < 1 || cambios.nivelPeligro > 10) throw new Error("El nivel de peligro debe estar entre 1 y 10");

    if (cambios.descripcion !== undefined) 
      if (cambios.descripcion.trim() === "") throw new Error("La descripción no puede estar vacía");

    const duplicado = await this._db.data.invento.some(i =>
      i.id !== id &&
      normalize(i.nombre) === normalize(copia.nombre) &&
      i.tipo === copia.tipo &&
      i.inventor === copia.inventor
    );

    if (duplicado) throw new Error("Invento duplicado");

    if (cambios.nombre !== undefined) invento.nombre = cambios.nombre;
    if (cambios.inventor !== undefined) invento.inventor = cambios.inventor;
    if (cambios.tipo !== undefined) invento.tipo = cambios.tipo;
    if (cambios.nivelPeligro !== undefined) invento.nivelPeligro = cambios.nivelPeligro;
    if (cambios.descripcion !== undefined) invento.descripcion = cambios.descripcion;

    await this._db.write();
  }

    async getAll(): Promise<Invento[]> {
      await this._db.read();
      return this._db.data.invento;
    } 

  async filterByNombre(nombre: string): Promise<Invento[]> {
    this._db.read();
    return this._db.data.invento.filter(i => i.nombre === nombre);
  } 
  
  async filterByTipo(tipo: tiposInvento): Promise<Invento[]> {
    this._db.read();
    return this._db.data.invento.filter(i => i.tipo === tipo);
  }

  async filterByInventor(inventor: string): Promise<Invento[]> {
    this._db.read();
    return this._db.data.invento.filter(i => i.inventor !== null && i.inventor === inventor);
  }

  async filterByPeligrosidad(peligro: number): Promise<Invento[]> {
    this._db.read();
    return this._db.data.invento.filter(i => i.nivelPeligro === peligro);
  }  

  async setNullInventor(id: string): Promise<void> {
    this._db.read();
    this._db.data.invento.forEach(i => {
      if (i.inventor === id) i.inventor = null;
    });
    this._db.write();
  }

  async isDuplicate(other: Invento): Promise<boolean> { 
    await this._db.read();
    return this._db.data.invento.some(i => 
      normalize(i.nombre) === normalize(other.nombre) &&
      i.tipo === other.tipo &&
      i.inventor === other.inventor
    );
  }
}