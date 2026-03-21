import { RepositorioBase } from "./RepositorioBase";
import { IDuplicable } from "./interfaces";
import { Especie } from "./especies";
import { tiposEspecie } from "./types";

export class RepositorioEspecies extends RepositorioBase<Especie> implements IDuplicable<Especie> {

  constructor(private normalize: (s: string) => string) {
    super();
  }

  override add(especie: Especie): void {
    if (this.isDuplicate(especie)) {
      throw new Error("Especie duplicada");
    }
    super.add(especie);
  }

  update(id: string, cambios: { nombre?: string; origen?: string | null; tipo?: tiposEspecie; 
                                       esperanzaVida?: number; descripcion?: string }): void {
    const especie = this.findById(id);
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

    const duplicado = this.objetos.some(e => 
      e.id !== copia.id &&
      this.normalize(e.nombre) === this.normalize(copia.nombre) &&
      e.tipo === copia.tipo &&
      e.origen === copia.origen); 
      
    if (duplicado) throw new Error("Especie duplicada");

    if (cambios.nombre !== undefined) especie.nombre = cambios.nombre;
    if (cambios.origen !== undefined) especie.origen = cambios.origen;
    if (cambios.tipo !== undefined) especie.tipo = cambios.tipo;
    if (cambios.esperanzaVida !== undefined) especie.esperanzaVida = cambios.esperanzaVida;
    if (cambios.descripcion !== undefined) especie.descripcion = cambios.descripcion;
  }

  setNullOrigen(id: string): void {
    this.objetos.forEach(e=> {
      if (e.origen === id) e.origen = null;
    });
  }

  isDuplicate(other: Especie): boolean { 
    const duplicado = this.objetos.some(e => 
      this.normalize(e.nombre) === this.normalize(other.nombre) &&
      e.tipo === other.tipo &&
      e.origen === other.origen); 

    if (duplicado) return true; 
    return false;
  }
}