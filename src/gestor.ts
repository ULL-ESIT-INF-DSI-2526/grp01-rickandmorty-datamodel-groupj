import { Localizacion } from "./localizaciones";
import { Personaje } from "./personajes";
import { Dimension } from "./Dimension";
import { Invento } from "./inventos";
import { Especie } from "./especies";
import { estadosDimension, estadosPersonaje, tipoAfiliacion, tiposEspecie, tiposInvento, tipoLocalizacion } from "./types";

export class GestorMultiversal {
  private personajes: Personaje[] = [];
  private especies: Especie[] = [];
  private dimensiones: Dimension[] = [];
  private localizaciones: Localizacion[] = [];
  private inventos: Invento[] = [];

  // métodos para dimensiones

  lengthDimensiones(): number {
    return this.dimensiones.length;
  }

  addDimension(dimension: Dimension): void {
    const existeId = this.dimensiones.some(d => d.id === dimension.id);
    if (existeId) throw new Error("El ID de la dimensión ya existe.");

    const duplicado = this.dimensiones.some(d =>
      this.normalize(d.nombre) === this.normalize(dimension.nombre));
    if (duplicado) throw new Error("Dimensión duplicada");

    this.dimensiones.push(dimension);
  }

  removeDimension(id: string): void {
    const existe = this.dimensiones.some(d => d.id === id);
    if (!existe) throw new Error("La dimensión no existe");
    // eliminar dimensión
    this.dimensiones = this.dimensiones.filter(d => d.id !== id);
    // eliminar localizaciones
    const aux = this.localizaciones.filter(l => l.dimension === id);
    aux.forEach(loc => this.removeLocalizacion(loc.id));
    // desasociar personajes
    this.personajes.forEach(p => {
      if (p.dimension === id) p.dimension = null;
    });
    // desasociar especies cuyo origen sea la dimensión
    this.especies.forEach(e => {
      if (e.origen === id) e.origen = null;
    });
  }

  // Actualizar dimensión
  updateDimension(id: string, cambios: { nombre?: string; estadoDim?: estadosDimension; nivelTec?: number; descripcion?: string }): void {
    const dimension = this.dimensiones.find(d => d.id === id);
    if (!dimension) throw new Error("La dimensión no existe");

    // Validar nombre
    if (cambios.nombre !== undefined) {
      if (cambios.nombre.trim() === "") {
        throw new Error("El nombre no puede estar vacío");
      } else if (this.dimensiones.some(d => this.normalize(d.nombre) === this.normalize(cambios.nombre) && d.id !== id)) {
        throw new Error("El nombre de la dimensión ya existe");
      }
    }

    // Validar nivel tecnológico
    if (cambios.nivelTec !== undefined) {
      if (cambios.nivelTec < 1 || cambios.nivelTec > 10) {
        throw new Error("El nivel tecnológico debe estar entre 1 y 10");
      }
    }

    // Validar descripción
    if (cambios.descripcion !== undefined) {
      if (cambios.descripcion.trim() === "") {
        throw new Error("La descripción no puede estar vacía");
      }
    }

    // Aplicar cambios solo si toda la validación pasó
    if (cambios.nombre !== undefined) dimension.nombre = cambios.nombre;
    if (cambios.estadoDim !== undefined) dimension.estadoDim = cambios.estadoDim;
    if (cambios.nivelTec !== undefined) dimension.nivelTec = cambios.nivelTec;
    if (cambios.descripcion !== undefined) dimension.descripcion = cambios.descripcion;

  }

  // métodos para personajes
  lengthPersonajes(): number {
    return this.personajes.length;
  }

  addPersonaje(personaje: Personaje): void {
    if (personaje.dimension === null || personaje.especie === null) throw new Error("El personaje debe tener una dimensión y especie");
    const especie = this.especies.find(e => e.id === personaje.especie);
    const dimension = this.dimensiones.find(d => d.id === personaje.dimension);
    if (!especie || !dimension) throw new Error("Especie o dimensión inexistentes");

    const existeId = this.personajes.some(p => p.id === personaje.id);
    if (existeId) throw new Error("El ID del personaje ya existe.");
    
    const duplicado = this.personajes.some(p =>
      this.normalize(p.nombre) === this.normalize(personaje.nombre) &&
      p.especie === personaje.especie &&
      p.dimension === personaje.dimension
    );
    if (duplicado) throw new Error("Personaje duplicado");

    this.personajes.push(personaje);
  }

  removePersonaje(id: string): void {
    const existe = this.personajes.some(p => p.id === id);
    if (!existe) throw new Error("El personaje no existe");
    //se elimina el personaje
    this.personajes = this.personajes.filter(p => p.id !== id);
    // desasociar inventos
    this.inventos.forEach(i => {
      if (i.inventor === id) i.inventor = null;
    })
  }

  updatePersonaje(id: string, cambios: { nombre?: string; especie?: string | null; dimension?: string | null; 
                                        estado?: estadosPersonaje; afiliacion?: tipoAfiliacion; 
                                        nivelInteligencia?: number; descripcion?: string }): void {
    const personaje = this.personajes.find(p => p.id === id);
    if (!personaje) throw new Error("El personaje no existe");
    

    // Validar nombre
    if (cambios.nombre !== undefined) {
      if (cambios.nombre.trim() === "") {
        throw new Error("El nombre no puede estar vacío");
      }
    }

    // Validar especie
    if (cambios.especie !== undefined && cambios.especie !== null) {
      const especieExiste = this.especies.find(e => e.id === cambios.especie);
      if (!especieExiste) throw new Error("La especie no existe");
    }

    // Validar dimensión
    if (cambios.dimension !== undefined && cambios.dimension !== null) {
      const dimensionExiste = this.dimensiones.find(d => d.id === cambios.dimension);
      if (!dimensionExiste) throw new Error("La dimensión no existe");
    }

    // Validar nivel de inteligencia
    if (cambios.nivelInteligencia !== undefined) {
      if (cambios.nivelInteligencia <= 0 || cambios.nivelInteligencia > 10) {
        throw new Error("El nivel de inteligencia debe estar entre 1 y 10");
      }
    }

    // Validar descripción
    if (cambios.descripcion !== undefined) {
      if (cambios.descripcion.trim() === "") {
        throw new Error("La descripción no puede estar vacía");
      }
    }

    // Comprobar si el cambio de nombre, especie o dimensión generaría un personaje duplicado
    const nombreAComprobar = cambios.nombre !== undefined ? cambios.nombre : personaje.nombre;
    const especieAComprobar = cambios.especie !== undefined ? cambios.especie : personaje.especie;
    const dimensionAComprobar = cambios.dimension !== undefined ? cambios.dimension : personaje.dimension;

    const duplicado = this.personajes.some(p =>
      p.id !== id &&
      this.normalize(p.nombre) === this.normalize(nombreAComprobar) &&
      p.especie === especieAComprobar &&
      p.dimension === dimensionAComprobar
    );
    if (duplicado) throw new Error("Personaje duplicado");

    // Si no se ha lanzado ningún error, se aplican los cambios
    if (cambios.nombre !== undefined) personaje.nombre = cambios.nombre;
    if (cambios.especie !== undefined) personaje.especie = cambios.especie;
    if (cambios.dimension !== undefined) personaje.dimension = cambios.dimension;
    if (cambios.estado !== undefined) personaje.estado = cambios.estado;
    if (cambios.afiliacion !== undefined) personaje.afiliacion = cambios.afiliacion;
    if (cambios.nivelInteligencia !== undefined) personaje.nivelInteligencia = cambios.nivelInteligencia;
    if (cambios.descripcion !== undefined) personaje.descripcion = cambios.descripcion;
  }


  // métodos para especies

  lengthEspecies(): number {
    return this.especies.length;
  }

  addEspecie(especie: Especie): void {
    if (especie.origen === null) throw new Error("La especie debe tener un origen");
    const dimension = this.dimensiones.find(d => d.id === especie.origen);
    const localizacion = this.localizaciones.find(l => l.id === especie.origen);
    if (!dimension && !localizacion) throw new Error("Origen de la especie desconocido");

    const existeId = this.especies.some(e => e.id === especie.id);
    if (existeId) throw new Error("El ID de la especie ya existe.");

    const duplicado = this.especies.some(e =>
      this.normalize(e.nombre) === this.normalize(especie.nombre) &&
      e.tipo === especie.tipo &&
      e.origen === especie.origen
    );    
    if (duplicado) throw new Error("Especie duplicada");

    this.especies.push(especie);
  }
  
  removeEspecie(id: string): void {
    const existe = this.especies.some(e => e.id === id);
    if (!existe) throw new Error("La especie no existe");
    //se elimina la especie
    this.especies = this.especies.filter(e => e.id !== id);
    // desasociar personajes
    this.personajes.forEach(p => {
      if (p.especie === id) p.especie = null;
    })
  }

  // métodos para localizaciones

  lengthLocalizaciones(): number {
    return this.localizaciones.length;
  }

  addLocalizacion(localizacion: Localizacion): void {
    if (localizacion.dimension === null) throw new Error("La localización debe tener una dimensión");
    const dimension = this.dimensiones.find(d => d.id === localizacion.dimension);
    if (!dimension) throw new Error("Origen de la localización desconocida");

    const existeId = this.localizaciones.some(l => l.id === localizacion.id);
    if (existeId) throw new Error("El ID de la localización ya existe.");

    const duplicado = this.localizaciones.some(l =>
      this.normalize(l.nombre) === this.normalize(localizacion.nombre) &&
      l.tipo === localizacion.tipo &&
      l.dimension === localizacion.dimension
    );    
    if (duplicado) throw new Error("Localización duplicada");  

    this.localizaciones.push(localizacion);
  }

  removeLocalizacion(id: string): void {
    const existe = this.localizaciones.some(l => l.id === id);
    if (!existe) throw new Error("La localización no existe");
    // se elimina la localización
    this.localizaciones = this.localizaciones.filter(l => l.id !== id);
    // desasociar especies
    this.especies.forEach(e => {
      if (e.origen === id) e.origen = null;
    });
  }

  // métodos para inventos

  lengthInventos(): number {
    return this.inventos.length;
  }

  addInvento(invento: Invento): void {
    if (invento.inventor === null) throw new Error("El invento debe tener un inventor");
    const inventor = this.personajes.find(p => p.id === invento.inventor);
    if (!inventor) throw new Error("Inventor desconocido");

    const existeId = this.inventos.some(i => i.id === invento.id);
    if (existeId) throw new Error("El ID del invento ya existe.");

    const duplicado = this.inventos.some(i =>
      this.normalize(i.nombre) === this.normalize(invento.nombre) &&
      i.tipo === invento.tipo &&
      i.inventor === invento.inventor
    );    
    if (duplicado) throw new Error("Invento duplicado");

    this.inventos.push(invento);
  }

  removeInvento(id: string): void {
    const existe = this.inventos.some(i => i.id === id);
    if (!existe) throw new Error("El invento no existe");
    // se elimina el invento
    this.inventos = this.inventos.filter(i => i.id !== id);
  }  

  // métodos auxiliares

  private normalize(texto: string): string {
    return texto
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "")
      .toLowerCase();
  }
}