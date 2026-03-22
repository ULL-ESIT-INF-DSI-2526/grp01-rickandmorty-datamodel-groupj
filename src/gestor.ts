import { RepositorioDimensiones } from "./RepositorioDimensiones.js";
import { RepositorioEspecies } from "./RepositorioEspecies.js";
import { RepositorioPersonajes } from "./RepositorioPersonajes.js";
import { RepositorioLocalizaciones } from "./RepositorioLocalizaciones.js";
import { RepositorioInventos } from "./RepositorioInventos.js";
import { Dimension } from "./Dimension.js";
import { Especie } from "./especies.js";
import { Personaje } from "./personajes.js";
import { Localizacion } from "./localizaciones.js";
import { Invento } from "./inventos.js";
import { estadosDimension } from "./types.js";
import { estadosPersonaje } from "./types.js";
import { tipoAfiliacion } from "./types.js";
import { tiposEspecie } from "./types.js";
import { tipoLocalizacion } from "./types.js";
import { tiposInvento } from "./types.js";
import { Low } from "lowdb";
import { Data } from "./Database/db.js";
import { normalize } from "./auxFunc.js";

/**
 * clase que contiene las funciones para registrar y filtrar personajes en la base de datos
 * @param _db - la base de datos
 * @param dimensionesRepo - referencia al repositorio de dimensiones
 * @param personajesRepo - referencia al repositorio de personajes
 * @param especiesRepo - referencia al repositorio de especies
 * @param localizacionesRepo - referencia al repositorio de localizaciones
 * @param inventosRepo - referencia al repositorio de inventos
 */
export class GestorMultiversal {
  private _db: Low<Data>;
  public dimensionesRepo: RepositorioDimensiones;
  public personajesRepo: RepositorioPersonajes;
  public especiesRepo: RepositorioEspecies;
  public localizacionesRepo: RepositorioLocalizaciones;
  public inventosRepo: RepositorioInventos;

  constructor(database: Low<Data>) {
    this._db = database;
    this.dimensionesRepo = new RepositorioDimensiones(this._db);
    this.personajesRepo = new RepositorioPersonajes(this._db);
    this.especiesRepo = new RepositorioEspecies(this._db);
    this.localizacionesRepo = new RepositorioLocalizaciones(this._db);
    this.inventosRepo = new RepositorioInventos(this._db);
  }
  //métodos de inserción

  async addDimension(dimension: Dimension): Promise<void> {
    await this.dimensionesRepo.add(dimension);
  }

  async addPersonaje(personaje: Personaje): Promise<void> {
    if (personaje.dimension === null || personaje.especie === null) 
      throw new Error("El personaje debe tener una dimensión y especie");

    const especie = await this.especiesRepo.findById(personaje.especie);
    const dimension = await this.dimensionesRepo.findById(personaje.dimension);
    if (especie === undefined || dimension === undefined)
      throw new Error("Especie o dimensión inexistentes");

    await this.personajesRepo.add(personaje);
  }

  async addEspecie(especie: Especie): Promise<void> {
    if (especie.origen === null) throw new Error("La especie debe tener un origen");

    const dimension = await this.dimensionesRepo.findById(especie.origen);
    const localizacion = await this.localizacionesRepo.findById(especie.origen);
    if (dimension === undefined && localizacion === undefined)
      throw new Error("Origen de la especie desconocido");

    await this.especiesRepo.add(especie);
  }

  async addLocalizacion(localizacion: Localizacion): Promise<void> {
    if (localizacion.dimension === null) throw new Error("La localización debe tener una dimensión");

    const dimension = await this.dimensionesRepo.findById(localizacion.dimension);
    if (dimension === undefined) throw new Error("Origen de la localización desconocida");

    await this.localizacionesRepo.add(localizacion);
  }

  async addInvento(invento: Invento): Promise<void> {
    if (invento.inventor === null) throw new Error("El invento debe tener un inventor");

    const inventor = await this.personajesRepo.findById(invento.inventor);
    if (inventor === undefined) throw new Error("Inventor desconocido");

    await this.inventosRepo.add(invento);
  }

  //métodos de eliminación

  async removeDimension(id: string): Promise<void> {
    await this.dimensionesRepo.remove(id);

    const aux = await this.localizacionesRepo.filterByDimension(id);
    for (const objeto of aux) {
      await this.removeLocalizacion(objeto.id);
    }

    await this.personajesRepo.setNullDimension(id);
    await this.especiesRepo.setNullOrigen(id);
  }

  async removePersonaje(id: string): Promise<void> {
    await this.personajesRepo.remove(id);
    await this.inventosRepo.setNullInventor(id);
  }

  async removeEspecie(id: string): Promise<void> {
    await this.especiesRepo.remove(id);
    await this.personajesRepo.setNullEspecie(id);
  }

  async removeLocalizacion(id: string): Promise<void> {
    await this.localizacionesRepo.remove(id);
    await this.especiesRepo.setNullOrigen(id);
  }

  async removeInvento(id: string): Promise<void> {
    await this.inventosRepo.remove(id);
  }

  //métodos de modificación

  async updateDimension(id: string, cambios: { nombre?: string; estadoDim?: estadosDimension;
                                  nivelTec?: number; descripcion?: string;}): Promise<void> {
    await this.dimensionesRepo.update(id, cambios);
  }

  async updatePersonaje(id: string, cambios: { nombre?: string; especie?: string | null; dimension?: string | null;
                                         estado?: estadosPersonaje; afiliacion?: tipoAfiliacion; 
                                         nivelInteligencia?: number; descripcion?: string }): Promise<void> {

    if (cambios.especie !== undefined && cambios.especie !== null) {
      const especie = await this.especiesRepo.findById(cambios.especie);
      if (!especie) throw new Error("La especie no existe");
    }

    if (cambios.dimension !== undefined && cambios.dimension !== null) {
      const dimension = await this.dimensionesRepo.findById(cambios.dimension);
      if (!dimension) throw new Error("La dimensión no existe");
    }

    await this.personajesRepo.update(id, cambios);
  }

  async updateEspecie(id: string, cambios: { nombre?: string; origen?: string | null; tipo?: tiposEspecie; 
                                       esperanzaVida?: number; descripcion?: string }): Promise<void> {
    
    if (cambios.origen !== undefined && cambios.origen !== null) { 
      const dimension = await this.dimensionesRepo.findById(cambios.origen);
      const localizacion = await this.localizacionesRepo.findById(cambios.origen);
      if (!dimension && !localizacion)
        throw new Error("Origen de la especie desconocido"); 
    }

    await this.especiesRepo.update(id, cambios);
  }

  async updateLocalizacion(id: string, cambios: { nombre?: string; tipo?: tipoLocalizacion; poblacionAproximada?: number; 
                                dimension?: string | null; descripcion?: string }): Promise<void> {

    if (cambios.dimension !== undefined && cambios.dimension !== null) {
      const dimension = await this.dimensionesRepo.findById(cambios.dimension);
      if (!dimension) throw new Error("Origen de la localización desconocida");
    }

    await this.localizacionesRepo.update(id, cambios);
  }

  async updateInvento(id: string, cambios: { nombre?: string; inventor?: string | null; tipo?: tiposInvento; 
                                nivelPeligro?: number; descripcion?: string }): Promise<void> {
    
    if (cambios.inventor !== undefined && cambios.inventor !== null) {
      const inventor = await this.personajesRepo.findById(cambios.inventor);
      if (!inventor) throw new Error("Inventor desconocido");
    }

    await this.inventosRepo.update(id, cambios);
  }

  //métodos para filtrar

  // ---------------- PERSONAJES ----------------

  async filterPersonajesByNombre(nombre: string): Promise<Personaje[]> {
    await this._db.read();
    return this.personajesRepo.filterByNombre(nombre);
  }

  async filterPersonajesByEspecie(especie: string): Promise<Personaje[]> {
    await this._db.read();
    return this.personajesRepo.filterByEspecie(especie);
  }

  async filterPersonajesByAfiliacion(afiliacion: tipoAfiliacion): Promise<Personaje[]> {
    await this._db.read();
    return this.personajesRepo.filterByAfiliacion(afiliacion);
  }

  async filterPersonajesByEstado(estado: estadosPersonaje): Promise<Personaje[]> {
    await this._db.read();
    return this.personajesRepo.filterByEstado(estado);
  }

  async filterPersonajesByDimension(dimension: string): Promise<Personaje[]> {
    await this._db.read();
    return this.personajesRepo.filterByDimension(dimension);
  }

  // ---------------- LOCALIZACIONES ----------------

  async filterLocalizacionesByNombre(nombre: string): Promise<Localizacion[]> {
    await this._db.read();
    return this.localizacionesRepo.filterByNombre(nombre);
  }

  async filterLocalizacionesByTipo(tipo: tipoLocalizacion): Promise<Localizacion[]> {
    await this._db.read();
    return this.localizacionesRepo.filterByTipo(tipo);
  }

  async filterLocalizacionesByDimension(id: string): Promise<Localizacion[]> {
    await this._db.read();
    return this.localizacionesRepo.filterByDimension(id);
  }

  // ---------------- INVENTOS ----------------

  async filterInventosByNombre(nombre: string): Promise<Invento[]> {
    await this._db.read();
    return this.inventosRepo.filterByNombre(nombre);
  }

  async filterInventosByTipo(tipo: tiposInvento): Promise<Invento[]> {
    await this._db.read();
    return this.inventosRepo.filterByTipo(tipo);
  }

  async filterInventosByInventor(inventor: string): Promise<Invento[]> {
    await this._db.read();
    return this.inventosRepo.filterByInventor(inventor);
  }

  async filterInventosByPeligrosidad(peligro: number): Promise<Invento[]> {
    await this._db.read();
    return this.inventosRepo.filterByPeligrosidad(peligro);
  }

  // métodos de ordenacion de personajes

  orderPersonajesByNombre(personajes: Personaje[], tipoOrdenacion: boolean): Personaje[] {
    const copia = [...personajes];
    if (tipoOrdenacion) copia.sort((a, b) => a.nombre.localeCompare(b.nombre)); //ascendente
    else copia.sort((a, b) => b.nombre.localeCompare(a.nombre)); //descendente
    return copia;
  }

  orderPersonajesByInteligencia(personajes: Personaje[], tipoOrdenacion: boolean): Personaje[] {
    const copia = [...personajes];
    if (tipoOrdenacion) copia.sort((a, b) => a.nivelInteligencia - b.nivelInteligencia); // ascendente
    else copia.sort((a, b) => b.nivelInteligencia - a.nivelInteligencia); // descendente
    return copia;
  }

  //método para las variantes

  async getVariantesPersonaje(nombre: string): Promise<Personaje[]> {
    const personajes = await this.personajesRepo.getAll();

    return personajes.filter(p =>
      p.nombre &&
      normalize(p.nombre) === normalize(nombre)
    );
  }

  //métodos de control del estado global del multiverso

  async getDimensionesDestruidas(): Promise<Dimension[]> {
    return await this.dimensionesRepo.filterByEstado("destruida");
  }

  async getPersonajesDimDestruida(): Promise<Personaje[]> {
    const dimension = await this.getDimensionesDestruidas();
    const idsDestruidas = dimension.map(d => d.id);
    const personajes = await this.personajesRepo.getAll();
    return personajes.filter(p =>
      p.dimension !== null && idsDestruidas.includes(p.dimension)
    );
  }

  async getPersonajesDimEliminada(): Promise<Personaje[]> {
    return await this.personajesRepo.getNullDimension();
  }

}