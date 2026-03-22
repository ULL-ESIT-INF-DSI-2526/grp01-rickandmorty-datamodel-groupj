import { RepositorioDimensiones } from "./repositories/RepositorioDimensiones.js";
import { RepositorioEspecies } from "./repositories/RepositorioEspecies.js";
import { RepositorioPersonajes } from "./repositories/RepositorioPersonajes.js";
import { RepositorioLocalizaciones } from "./repositories/RepositorioLocalizaciones.js";
import { RepositorioInventos } from "./repositories/RepositorioInventos.js";
import { RepositorioEventos } from "./repositories/RepositorioEventos.js";
import { Dimension } from "./models/Dimension.js";
import { Especie } from "./models/especies.js";
import { Personaje } from "./models/personajes.js";
import { Localizacion } from "./models/localizaciones.js";
import { Invento } from "./models/inventos.js";
import { EventoMultiversal, IEventoInvento, IEventoViaje } from "./interfaces.js";
import { estadosDimension } from "../utils/types.js";
import { estadosPersonaje } from "../utils/types.js";
import { tipoAfiliacion } from "../utils/types.js";
import { tiposEspecie } from "../utils/types.js";
import { tipoLocalizacion } from "../utils/types.js";
import { tiposInvento } from "../utils/types.js";
import { tipoEventoMultiversal } from "../utils/types.js";
import { Low } from "lowdb";
import { Data } from "../database/db.js";
import { normalize } from "../utils/auxFunc.js";
import { IEventoDimension } from "./interfaces.js";

function isEventoInvento(evento: EventoMultiversal): evento is IEventoInvento {
  return evento.tipoEvento === "invento";
}

function isEventoViaje(evento: EventoMultiversal): evento is IEventoViaje {
  return evento.tipoEvento === "viaje";
}

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
  public eventosRepo: RepositorioEventos;

  constructor(database: Low<Data>) {
    this._db = database;
    this.dimensionesRepo = new RepositorioDimensiones(this._db);
    this.personajesRepo = new RepositorioPersonajes(this._db);
    this.especiesRepo = new RepositorioEspecies(this._db);
    this.localizacionesRepo = new RepositorioLocalizaciones(this._db);
    this.inventosRepo = new RepositorioInventos(this._db);
    this.eventosRepo = new RepositorioEventos(this._db);
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

  //métodos de eventos e informes

  async addEventoViaje(evento: EventoMultiversal): Promise<void> {
    const viaje = evento as IEventoViaje;
    
    const personaje = await this.personajesRepo.findById(viaje.personajeId);
    if (!personaje) throw new Error("El personaje no existe");

    const dimensionOrigen = await this.dimensionesRepo.findById(viaje.dimensionOrigenId);
    if (!dimensionOrigen) throw new Error("La dimensión de origen no existe");

    const dimensionDestino = await this.dimensionesRepo.findById(viaje.dimensionDestinoId);
    if (!dimensionDestino) throw new Error("La dimensión de destino no existe");

    await this.eventosRepo.add(evento);
  }


  async addEventoDestruccionDimension(evento: EventoMultiversal): Promise<void> {
    const event = evento as IEventoDimension;
    const dimension = await this.dimensionesRepo.findById(event.dimensionId);
    if (!dimension) throw new Error("La dimensión no existe");
    await this.dimensionesRepo.update(event.dimensionId, { estadoDim: "destruida" });
    await this.eventosRepo.add(evento);
  }

  async addEventoCreacionDimension(dimension: Dimension, evento: EventoMultiversal): Promise<void> {
    const existe = await this.dimensionesRepo.findById(dimension.id);
    if (existe) throw new Error("La dimensión ya existe");
    await this.addDimension(dimension);
    await this.eventosRepo.add(evento);
  }

  async addEventoInvento(evento: EventoMultiversal): Promise<void> {
    const event = evento as IEventoInvento;
    const invento = await this.inventosRepo.findById(event.inventoId);
    if (!invento) throw new Error("El invento no existe");
    const localizacion = await this.localizacionesRepo.findById(event.localizacionId);
    if (!localizacion) throw new Error("La localización no existe");
    await this.eventosRepo.add(evento);
  }


  async getEventos(): Promise<EventoMultiversal[]> {
    await this._db.read();
    return this.eventosRepo.getAll();
  }

  async filterEventosByTipoEvento(tipo: tipoEventoMultiversal): Promise<EventoMultiversal[]> {
    await this._db.read();
    return this.eventosRepo.filterByTipoEvento(tipo);
  }

  async filterEventosByInventoId(inventoId: string): Promise<EventoMultiversal[]> {
    await this._db.read();
    return this.eventosRepo.filterByInventoId(inventoId);
  }

  async getHistorialViajesPorPersonaje(personajeId: string): Promise<IEventoViaje[]> {
    const eventos = await this.getEventos();
    return eventos
      .filter(isEventoViaje)
      .filter((evento) => normalize(evento.personajeId) === normalize(personajeId))
      .sort((a, b) => a.fecha.localeCompare(b.fecha));
  }

  async getNombrePersonajeById(personajeId: string): Promise<string | undefined> {
    const personaje = await this.personajesRepo.findById(personajeId);
    return personaje?.nombre;
  }

  async getInformeDimensionesActivas(): Promise<{ activas: Dimension[]; mediaNivelTec: number }> {
    const dimensiones = await this.dimensionesRepo.getAll();
    const activas = dimensiones.filter((dimension) => dimension.estadoDim === "activa");
    const sumaNivelTec = activas.reduce((suma, dimension) => suma + dimension.nivelTec, 0);
    const mediaNivelTec = activas.length > 0 ? sumaNivelTec / activas.length : 0;
    return { activas, mediaNivelTec };
  }

  async getInformePersonajesMasVariantes(): Promise<{
    top: Array<{ nombreOriginal: string; totalVersiones: number }>;
    maximoVersiones: number;
  }> {
    const personajes = await this.personajesRepo.getAll();
    const conteoPorNombre = new Map<string, { nombreOriginal: string; totalVersiones: number }>();

    personajes.forEach((personaje) => {
      const clave = normalize(personaje.nombre);
      const actual = conteoPorNombre.get(clave);

      if (!actual) {
        conteoPorNombre.set(clave, { nombreOriginal: personaje.nombre, totalVersiones: 1 });
        return;
      }

      actual.totalVersiones += 1;
    });

    const candidatos = [...conteoPorNombre.values()].filter((registro) => registro.totalVersiones > 1);
    if (candidatos.length === 0) {
      return { top: [], maximoVersiones: 0 };
    }

    const maximoVersiones = Math.max(...candidatos.map((registro) => registro.totalVersiones));
    const top = candidatos
      .filter((registro) => registro.totalVersiones === maximoVersiones)
      .sort((a, b) => a.nombreOriginal.localeCompare(b.nombreOriginal));

    return { top, maximoVersiones };
  }

  async getInformeInventosDesplegados(): Promise<Array<{
    inventoId: string;
    inventoNombre: string;
    nivelPeligro: number;
    localizacionNombre: string;
  }>> {
    const eventos = await this.getEventos();
    const inventos = await this.inventosRepo.getAll();
    const localizaciones = await this.localizacionesRepo.getAll();

    const eventosInvento = eventos.filter(isEventoInvento);
    const ultimoEventoPorInvento = new Map<string, IEventoInvento>();

    eventosInvento.forEach((evento) => {
      const previo = ultimoEventoPorInvento.get(evento.inventoId);
      if (!previo || evento.fecha > previo.fecha) {
        ultimoEventoPorInvento.set(evento.inventoId, evento);
      }
    });

    return [...ultimoEventoPorInvento.values()]
      .filter((evento) => evento.accion === "despliegue")
      .map((evento) => {
        const invento = inventos.find((item) => item.id === evento.inventoId);
        const localizacion = localizaciones.find((item) => item.id === evento.localizacionId);

        return {
          inventoId: evento.inventoId,
          inventoNombre: invento?.nombre ?? "Invento desconocido",
          nivelPeligro: invento?.nivelPeligro ?? -1,
          localizacionNombre: localizacion?.nombre ?? evento.localizacionId,
        };
      })
      .sort((a, b) => b.nivelPeligro - a.nivelPeligro);
  }

}