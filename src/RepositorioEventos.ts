import { Low } from "lowdb";
import { EventoMultiversal } from "./interfaces.js";
import { Data } from "./Database/db.js";
import { tipoEventoMultiversal } from "./types.js";

/**
 * Repositorio para registrar y consultar eventos del multiverso.
 */
export class RepositorioEventos {
  private _db: Low<Data>;

  constructor(database: Low<Data>) {
    this._db = database;
  }

  async add(evento: EventoMultiversal): Promise<void> {
    await this._db.read();

    if (!this._db.data) {
      throw new Error("Base de datos no inicializada");
    }

    const existeId = this._db.data.eventos.some((e) => e.id === evento.id);
    if (existeId) {
      throw new Error("El ID del evento ya existe");
    }

    this._db.data.eventos.push(evento);
    await this._db.write();
  }

  async findById(id: string): Promise<EventoMultiversal | undefined> {
    await this._db.read();

    if (!this._db.data) {
      throw new Error("Base de datos no inicializada");
    }

    return this._db.data.eventos.find((e) => e.id === id);
  }

  async getAll(): Promise<EventoMultiversal[]> {
    await this._db.read();

    if (!this._db.data) {
      throw new Error("Base de datos no inicializada");
    }

    return [...this._db.data.eventos];
  }

  async filterByTipoEvento(tipo: tipoEventoMultiversal): Promise<EventoMultiversal[]> {
    await this._db.read();

    if (!this._db.data) {
      throw new Error("Base de datos no inicializada");
    }

    return this._db.data.eventos.filter((e) => e.tipoEvento === tipo);
  }

  async filterByInventoId(inventoId: string): Promise<EventoMultiversal[]> {
    await this._db.read();

    if (!this._db.data) {
      throw new Error("Base de datos no inicializada");
    }

    return this._db.data.eventos.filter((e) =>
      e.tipoEvento === "invento" && e.inventoId === inventoId,
    );
  }
}
