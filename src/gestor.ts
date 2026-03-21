import { RepositorioDimensiones } from "./RepositorioDimensiones";
import { RepositorioEspecies } from "./RepositorioEspecies";
import { RepositorioPersonajes } from "./RepositorioPersonajes";
import { RepositorioLocalizaciones } from "./RepositorioLocalizaciones";
import { RepositorioInventos } from "./RepositorioInventos";
import { Dimension } from "./Dimension";
import { Especie } from "./especies";
import { Personaje } from "./personajes";
import { Localizacion } from "./localizaciones";
import { Invento } from "./inventos";
import { estadosDimension } from "./types";
import { estadosPersonaje } from "./types";
import { tipoAfiliacion } from "./types";
import { tiposEspecie } from "./types";
import { tipoLocalizacion } from "./types";
import { tiposInvento } from "./types";

export class GestorMultiversal {
  private dimensionesRepo = new RepositorioDimensiones(this.normalize);
  private personajesRepo = new RepositorioPersonajes(this.normalize);
  private especiesRepo = new RepositorioEspecies(this.normalize);
  private localizacionesRepo = new RepositorioLocalizaciones(this.normalize);
  private inventosRepo = new RepositorioInventos(this.normalize);

  //métodos de inserción

  addDimension(dimension: Dimension): void {
    this.dimensionesRepo.add(dimension);
  }

  addPersonaje(personaje: Personaje): void {
    if (personaje.dimension === null || personaje.especie === null) 
      throw new Error("El personaje debe tener una dimensión y especie");

    const especie = this.especiesRepo.findById(personaje.especie);
    const dimension = this.dimensionesRepo.findById(personaje.dimension);
    if (especie === undefined || dimension === undefined)
      throw new Error("Especie o dimensión inexistentes");

    this.personajesRepo.add(personaje);
  }

  addEspecie(especie: Especie): void {
    if (especie.origen === null) throw new Error("La especie debe tener un origen");

    const dimension = this.dimensionesRepo.findById(especie.origen);
    const localizacion = this.localizacionesRepo.findById(especie.origen);
    if (dimension === undefined && localizacion === undefined)
      throw new Error("Origen de la especie desconocido");

    this.especiesRepo.add(especie);
  }

  addLocalizacion(localizacion: Localizacion): void {
    if (localizacion.dimension === null) throw new Error("La localización debe tener una dimensión");

    const dimension = this.dimensionesRepo.findById(localizacion.dimension);
    if (dimension === undefined) throw new Error("Origen de la localización desconocida");

    this.localizacionesRepo.add(localizacion);
  }

  addInvento(invento: Invento): void {
    if (invento.inventor === null) throw new Error("El invento debe tener un inventor");

    const inventor = this.personajesRepo.findById(invento.inventor);
    if (inventor === undefined) throw new Error("Inventor desconocido");

    this.inventosRepo.add(invento);
  }

  //métodos de eliminación

  removeDimension(id: string): void {
    this.dimensionesRepo.remove(id);

    const aux = this.localizacionesRepo.filterByDimension(id);
    aux.forEach((objeto) => {this.removeLocalizacion(objeto.id)});

    this.personajesRepo.setNullDimension(id);
    this.especiesRepo.setNullOrigen(id);
  }

  removePersonaje(id: string): void {
    this.personajesRepo.remove(id);
    this.inventosRepo.setNullInventor(id);
  }

  removeEspecie(id: string): void {
    this.especiesRepo.remove(id);
    this.personajesRepo.setNullEspecie(id);
  }

  removeLocalizacion(id: string): void {
    this.localizacionesRepo.remove(id);
    this.especiesRepo.setNullOrigen(id);
  }

  removeInvento(id: string): void {
    this.inventosRepo.remove(id);
  }

  //métodos de modificación

  updateDimension(id: string, cambios: { nombre?: string; estadoDim?: estadosDimension;
                                  nivelTec?: number; descripcion?: string;}): void {
    this.dimensionesRepo.update(id, cambios);
  }

  updatePersonaje(id: string, cambios: { nombre?: string; especie?: string | null; dimension?: string | null;
                                         estado?: estadosPersonaje; afiliacion?: tipoAfiliacion; 
                                         nivelInteligencia?: number; descripcion?: string }): void{

    if (cambios.especie !== undefined && cambios.especie !== null)
      if (!this.especiesRepo.findById(cambios.especie)) throw new Error("La especie no existe");

    if (cambios.dimension !== undefined && cambios.dimension !== null)
      if (!this.dimensionesRepo.findById(cambios.dimension)) throw new Error("La dimensión no existe");

    this.personajesRepo.update(id, cambios);
  }

  updateEspecie(id: string, cambios: { nombre?: string; origen?: string | null; tipo?: tiposEspecie; 
                                       esperanzaVida?: number; descripcion?: string }): void {
    
    if (cambios.origen !== undefined && cambios.origen !== null) { 
      if (!this.dimensionesRepo.findById(cambios.origen) && !this.localizacionesRepo.findById(cambios.origen))
        throw new Error("Origen de la especie desconocido"); 
    }

    this.especiesRepo.update(id, cambios);
  }

  updateLocalizacion(id: string, cambios: { nombre?: string; tipo?: tipoLocalizacion; poblacionAproximada?: number; 
                                dimension?: string | null; descripcion?: string }): void {

    if (cambios.dimension !== undefined && cambios.dimension !== null)
      if (!this.dimensionesRepo.findById(cambios.dimension)) throw new Error("Origen de la localización desconocida");

    this.localizacionesRepo.update(id, cambios);
  }

  updateInvento(id: string, cambios: { nombre?: string; inventor?: string | null; tipo?: tiposInvento; 
                                nivelPeligro?: number; descripcion?: string }): void {
    
    if (cambios.inventor !== undefined && cambios.inventor !== null)
      if (!this.personajesRepo.findById(cambios.inventor)) throw new Error("Inventor desconocido");

  this.inventosRepo.update(id, cambios);
  }

  //métodos para filtrar

  // ---------------- PERSONAJES ----------------

  filterPersonajesByNombre(nombre: string): Personaje[] {
    return this.personajesRepo.filterByNombre(nombre);
  }

  filterPersonajesByEspecie(especie: string): Personaje[] {
    return this.personajesRepo.filterByEspecie(especie);
  }

  filterPersonajesByAfiliacion(afiliacion: tipoAfiliacion): Personaje[] {
    return this.personajesRepo.filterByAfiliacion(afiliacion);
  }

  filterPersonajesByEstado(estado: estadosPersonaje): Personaje[] {
    return this.personajesRepo.filterByEstado(estado);
  }

  filterPersonajesByDimension(dimension: string): Personaje[] {
    return this.personajesRepo.filterByDimension(dimension);
  }

  // ---------------- LOCALIZACIONES ----------------

  filterLocalizacionesByNombre(nombre: string): Localizacion[] {
    return this.localizacionesRepo.filterByNombre(nombre);
  }

  filterLocalizacionesByTipo(tipo: tipoLocalizacion): Localizacion[] {
    return this.localizacionesRepo.filterByTipo(tipo);
  }

  filterLocalizacionesByDimension(id: string): Localizacion[] {
    return this.localizacionesRepo.filterByDimension(id);
  }

  // ---------------- INVENTOS ----------------

  filterInventosByNombre(nombre: string): Invento[] {
    return this.inventosRepo.filterByNombre(nombre);
  }

  filterInventosByTipo(tipo: tiposInvento): Invento[] {
    return this.inventosRepo.filterByTipo(tipo);
  }

  filterInventosByInventor(inventor: string): Invento[] {
    return this.inventosRepo.filterByInventor(inventor);
  }

  filterInventosByPeligrosidad(peligro: number): Invento[] {
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

  getVariantesPersonaje(personaje: Personaje): Personaje[] {
    return this.personajesRepo.getAll().filter(p =>
      p.id !== personaje.id &&
      this.normalize(p.nombre) === this.normalize(personaje.nombre) &&
      p.dimension !== personaje.dimension
    );
  }

  //métodos de control del estado global del multiverso

  getDimensionesDestruidas(): Dimension[] {
    return this.dimensionesRepo.filterByEstado("destruida");
  }

  getPersonajesDimDestruida(): Personaje[] {
    const idsDestruidas = this.getDimensionesDestruidas().map(d => d.id);
    return this.personajesRepo.getAll().filter(p =>
      p.dimension !== null && idsDestruidas.includes(p.dimension)
    );
  }

  getPersonajesDimEliminada(): Personaje[] {
    return this.personajesRepo.getNullDimension();
  }

  
  //métodos auxiliares
  private normalize(texto: string): string {
    return texto
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "")
      .toLowerCase();
  }
}