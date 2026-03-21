import { RepositorioBase } from "./RepositorioBase";
import { IDuplicable } from "./interfaces";
import { Localizacion } from "./localizaciones";
import { tipoLocalizacion } from "./types";

export class RepositorioLocalizaciones extends RepositorioBase<Localizacion> implements IDuplicable<Localizacion> {

  constructor(private normalize: (s: string) => string) {
    super();
  }

  override add(localizacion: Localizacion): void {
    if (this.isDuplicate(localizacion)) {
      throw new Error("Localizacion duplicada");
    }
    super.add(localizacion);
  }

  update(id: string, cambios: { nombre?: string; tipo?: tipoLocalizacion; poblacionAproximada?: number; 
                                dimension?: string | null; descripcion?: string }): void {
    const localizacion = this.findById(id);
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

    const duplicado = this.objetos.some(l =>
      l.id !== id &&
      this.normalize(l.nombre) === this.normalize(copia.nombre) &&
      l.tipo === copia.tipo &&
      l.dimension === copia.dimension
    );
    if (duplicado) throw new Error("Localización duplicada");

    if (cambios.nombre !== undefined) localizacion.nombre = cambios.nombre;
    if (cambios.tipo !== undefined) localizacion.tipo = cambios.tipo;
    if (cambios.poblacionAproximada !== undefined) localizacion.poblacionAproximada = cambios.poblacionAproximada;
    if (cambios.dimension !== undefined) localizacion.dimension = cambios.dimension;
    if (cambios.descripcion !== undefined) localizacion.descripcion = cambios.descripcion;
  }

  filterByNombre(nombre: string): Localizacion[] {
    return this.objetos.filter(l => l.nombre === nombre);
  } 
  
  filterByTipo(tipo: tipoLocalizacion): Localizacion[] {
    return this.objetos.filter(l => l.tipo === tipo);
  }

  filterByDimension(id: string): Localizacion[] {
    return this.objetos.filter(l => l.dimension === id);
  }

  isDuplicate(other: Localizacion): boolean { 
    const duplicado = this.objetos.some(l => 
      this.normalize(l.nombre) === this.normalize(other.nombre) &&
      l.tipo === other.tipo &&
      l.dimension === other.dimension); 

    if (duplicado) return true; 
    return false;
  }
}