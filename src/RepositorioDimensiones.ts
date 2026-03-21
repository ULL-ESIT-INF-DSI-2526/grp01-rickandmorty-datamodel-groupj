import { RepositorioBase } from "./RepositorioBase";
import { Dimension } from "./Dimension";
import { IDuplicable } from "./interfaces";
import { estadosDimension } from "./types";

export class RepositorioDimensiones extends RepositorioBase<Dimension> implements IDuplicable<Dimension>{

  constructor(private normalize: (s: string) => string) {
    super();
  }

  override add(dimension: Dimension): void {
    if (this.isDuplicate(dimension)) {
      throw new Error("Dimensión duplicada");
    }
    super.add(dimension);
  }

  update(id: string, cambios: { nombre?: string; estadoDim?: estadosDimension;
                                nivelTec?: number; descripcion?: string;}): void {
    const dimension = this.findById(id);
    if (!dimension) throw new Error("La dimensión no existe");

    if (cambios.nombre !== undefined) {
      if (cambios.nombre.trim() === "") throw new Error("El nombre no puede estar vacío");
      else if (this.objetos.some(d => this.normalize(d.nombre) === this.normalize(cambios.nombre) && d.id !== id)) 
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

    if (cambios.nombre !== undefined) dimension.nombre = cambios.nombre;
    if (cambios.estadoDim !== undefined) dimension.estadoDim = cambios.estadoDim;
    if (cambios.nivelTec !== undefined) dimension.nivelTec = cambios.nivelTec;
    if (cambios.descripcion !== undefined) dimension.descripcion = cambios.descripcion;
  }

  filterByEstado(estado: estadosDimension): Dimension[] {
    return this.objetos.filter(d => d.estadoDim === estado);
  }

  isDuplicate(other: Dimension): boolean { 
    const duplicado = this.objetos.some(d => this.normalize(d.nombre) === this.normalize(other.nombre)); 
    if (duplicado) return true; 
    return false;
  }
}