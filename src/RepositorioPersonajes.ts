import { RepositorioBase } from "./RepositorioBase";
import { IDuplicable } from "./interfaces";
import { Personaje } from "./personajes";
import { estadosPersonaje } from "./types";
import { tipoAfiliacion } from "./types";

export class RepositorioPersonajes extends RepositorioBase<Personaje> implements IDuplicable<Personaje> {

  constructor(private normalize: (s: string) => string) {
    super();
  }

  override add(personaje: Personaje): void {
    if (this.isDuplicate(personaje)) {
      throw new Error("Personaje duplicado");
    }
    super.add(personaje);
  }

  update(id: string, cambios: { nombre?: string; especie?: string | null; dimension?: string | null;
                                estado?: estadosPersonaje; afiliacion?: tipoAfiliacion; 
                                nivelInteligencia?: number; descripcion?: string }): void {
    const personaje = this.findById(id);
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

    const duplicado = this.objetos.some(p => 
      p.id !== copia.id &&
      this.normalize(p.nombre) === this.normalize(copia.nombre) &&
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
  }

  filterByNombre(nombre: string): Personaje[] {
    return this.objetos.filter(p => p.nombre === nombre);
  }

  filterByEspecie(especie: string): Personaje[] {
    return this.objetos.filter(p => p.especie === especie);
  }

  filterByAfiliacion(afiliacion: tipoAfiliacion): Personaje[] {
    return this.objetos.filter(p => p.afiliacion === afiliacion);
  }

  filterByEstado(estado: estadosPersonaje): Personaje[] {
    return this.objetos.filter(p => p.estado === estado);
  }

  filterByDimension(dimension: string): Personaje[] {
    return this.objetos.filter(p => p.dimension === dimension);
  }

  setNullDimension(id: string): void {
    this.objetos.forEach(e => {
      if (e.dimension === id) e.dimension = null;
    });
  }

  setNullEspecie(id: string): void {
    this.objetos.forEach(e => {
      if (e.especie === id) e.especie = null;
    });
  }

  getNullDimension(): Personaje[] {
    return this.objetos.filter(e => e.dimension === null);
  }

  isDuplicate(other: Personaje): boolean { 
    const duplicado = this.objetos.some(p => 
      this.normalize(p.nombre) === this.normalize(other.nombre) &&
      p.especie === other.especie &&
      p.dimension === other.dimension); 

    if (duplicado) return true; 
    return false;
  }
}