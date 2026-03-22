import { describe, expect, test, beforeEach, afterEach } from "vitest";
import { RepositorioEventos } from "../src/RepositorioEventos";
import { EventoMultiversal } from "../src/interfaces";
import { Low } from "lowdb";
import { Data, DefaultData } from "../src/Database/db";
import { JSONFilePreset } from "lowdb/node";
import fs from "fs";
import path from "path";

let repo: RepositorioEventos;
let db: Low<Data>;
let testDbPath: string;

beforeEach(async () => {
  testDbPath = path.join(__dirname, `testDb_eventos_${Date.now()}.json`);
  db = await JSONFilePreset(testDbPath, DefaultData);
  db.data.eventos = [];
  await db.write();
  repo = new RepositorioEventos(db);
});

afterEach(() => {
  if (fs.existsSync(testDbPath)) {
    fs.unlinkSync(testDbPath);
  }
});

describe("RepositorioEventos", () => {

  test("add correcto - evento viaje", async () => {
    const evento: EventoMultiversal = {
      id: "E1",
      tipoEvento: "viaje",
      fecha: new Date().toISOString(),
      motivo: "Viaje interdimensional",
      personajeId: "P001",
      dimensionOrigenId: "D-001",
      dimensionDestinoId: "D-002"
    };
    await repo.add(evento);
    const all = await repo.getAll();
    expect(all.length).toBe(1);
  });

  test("add correcto - evento dimension creacion", async () => {
    const evento: EventoMultiversal = {
      id: "E2",
      tipoEvento: "dimension",
      fecha: new Date().toISOString(),
      motivo: "Creación de dimensión",
      dimensionId: "D-003",
      accion: "creacion"
    };
    await repo.add(evento);
    const all = await repo.getAll();
    expect(all.length).toBe(1);
  });

  test("add correcto - evento dimension destruccion", async () => {
    const evento: EventoMultiversal = {
      id: "E3",
      tipoEvento: "dimension",
      fecha: new Date().toISOString(),
      motivo: "Destrucción de dimensión",
      dimensionId: "D-001",
      accion: "destruccion"
    };
    await repo.add(evento);
    const all = await repo.getAll();
    expect(all.length).toBe(1);
  });

  test("add correcto - evento invento despliegue", async () => {
    const evento: EventoMultiversal = {
      id: "E4",
      tipoEvento: "invento",
      fecha: new Date().toISOString(),
      motivo: "Despliegue de invento",
      inventoId: "I1",
      localizacionId: "L1",
      accion: "despliegue"
    };
    await repo.add(evento);
    const all = await repo.getAll();
    expect(all.length).toBe(1);
  });

  test("add correcto - evento invento neutralizacion", async () => {
    const evento: EventoMultiversal = {
      id: "E5",
      tipoEvento: "invento",
      fecha: new Date().toISOString(),
      motivo: "Neutralización de invento",
      inventoId: "I1",
      localizacionId: "L1",
      accion: "neutralizacion"
    };
    await repo.add(evento);
    const all = await repo.getAll();
    expect(all.length).toBe(1);
  });

  test("add duplicado por id", async () => {
    const evento: EventoMultiversal = {
      id: "E1",
      tipoEvento: "viaje",
      fecha: new Date().toISOString(),
      motivo: "Viaje interdimensional",
      personajeId: "P001",
      dimensionOrigenId: "D-001",
      dimensionDestinoId: "D-002"
    };
    await repo.add(evento);
    await expect(repo.add(evento)).rejects.toThrow("El ID del evento ya existe");
  });

  test("findById existente", async () => {
    const evento: EventoMultiversal = {
      id: "E1",
      tipoEvento: "viaje",
      fecha: new Date().toISOString(),
      motivo: "Viaje interdimensional",
      personajeId: "P001",
      dimensionOrigenId: "D-001",
      dimensionDestinoId: "D-002"
    };
    await repo.add(evento);
    const found = await repo.findById("E1");
    expect(found).toEqual(evento);
  });

  test("findById no existente", async () => {
    const found = await repo.findById("NO_EXISTE");
    expect(found).toBeUndefined();
  });

  test("getAll devuelve todos los eventos", async () => {
    const evento1: EventoMultiversal = {
      id: "E1",
      tipoEvento: "viaje",
      fecha: new Date().toISOString(),
      motivo: "Viaje interdimensional",
      personajeId: "P001",
      dimensionOrigenId: "D-001",
      dimensionDestinoId: "D-002"
    };
    const evento2: EventoMultiversal = {
      id: "E2",
      tipoEvento: "dimension",
      fecha: new Date().toISOString(),
      motivo: "Creación de dimensión",
      dimensionId: "D-003",
      accion: "creacion"
    };
    await repo.add(evento1);
    await repo.add(evento2);
    const all = await repo.getAll();
    expect(all.length).toBe(2);
  });

  test("filterByTipoEvento - viaje", async () => {
    const evento1: EventoMultiversal = {
      id: "E1",
      tipoEvento: "viaje",
      fecha: new Date().toISOString(),
      motivo: "Viaje interdimensional",
      personajeId: "P001",
      dimensionOrigenId: "D-001",
      dimensionDestinoId: "D-002"
    };
    const evento2: EventoMultiversal = {
      id: "E2",
      tipoEvento: "dimension",
      fecha: new Date().toISOString(),
      motivo: "Creación de dimensión",
      dimensionId: "D-003",
      accion: "creacion"
    };
    await repo.add(evento1);
    await repo.add(evento2);
    const result = await repo.filterByTipoEvento("viaje");
    expect(result.length).toBe(1);
    expect(result[0].id).toBe("E1");
  });

  test("filterByTipoEvento - dimension", async () => {
    const evento1: EventoMultiversal = {
      id: "E1",
      tipoEvento: "viaje",
      fecha: new Date().toISOString(),
      motivo: "Viaje interdimensional",
      personajeId: "P001",
      dimensionOrigenId: "D-001",
      dimensionDestinoId: "D-002"
    };
    const evento2: EventoMultiversal = {
      id: "E2",
      tipoEvento: "dimension",
      fecha: new Date().toISOString(),
      motivo: "Destrucción de dimensión",
      dimensionId: "D-001",
      accion: "destruccion"
    };
    await repo.add(evento1);
    await repo.add(evento2);
    const result = await repo.filterByTipoEvento("dimension");
    expect(result.length).toBe(1);
    expect(result[0].id).toBe("E2");
  });

  test("filterByTipoEvento - invento", async () => {
    const evento1: EventoMultiversal = {
      id: "E1",
      tipoEvento: "viaje",
      fecha: new Date().toISOString(),
      motivo: "Viaje interdimensional",
      personajeId: "P001",
      dimensionOrigenId: "D-001",
      dimensionDestinoId: "D-002"
    };
    const evento2: EventoMultiversal = {
      id: "E2",
      tipoEvento: "invento",
      fecha: new Date().toISOString(),
      motivo: "Despliegue de invento",
      inventoId: "I1",
      localizacionId: "L1",
      accion: "despliegue"
    };
    await repo.add(evento1);
    await repo.add(evento2);
    const result = await repo.filterByTipoEvento("invento");
    expect(result.length).toBe(1);
    expect(result[0].id).toBe("E2");
  });

  test("filterByTipoEvento - sin resultados", async () => {
    const evento: EventoMultiversal = {
      id: "E1",
      tipoEvento: "viaje",
      fecha: new Date().toISOString(),
      motivo: "Viaje interdimensional",
      personajeId: "P001",
      dimensionOrigenId: "D-001",
      dimensionDestinoId: "D-002"
    };
    await repo.add(evento);
    const result = await repo.filterByTipoEvento("invento");
    expect(result.length).toBe(0);
  });

  test("filterByInventoId", async () => {
    const evento1: EventoMultiversal = {
      id: "E1",
      tipoEvento: "invento",
      fecha: new Date().toISOString(),
      motivo: "Despliegue de invento",
      inventoId: "I1",
      localizacionId: "L1",
      accion: "despliegue"
    };
    const evento2: EventoMultiversal = {
      id: "E2",
      tipoEvento: "invento",
      fecha: new Date().toISOString(),
      motivo: "Neutralización de invento",
      inventoId: "I2",
      localizacionId: "L2",
      accion: "neutralizacion"
    };
    const evento3: EventoMultiversal = {
      id: "E3",
      tipoEvento: "viaje",
      fecha: new Date().toISOString(),
      motivo: "Viaje interdimensional",
      personajeId: "P001",
      dimensionOrigenId: "D-001",
      dimensionDestinoId: "D-002"
    };
    await repo.add(evento1);
    await repo.add(evento2);
    await repo.add(evento3);
    const result = await repo.filterByInventoId("I1");
    expect(result.length).toBe(1);
    expect(result[0].id).toBe("E1");
  });

  test("filterByInventoId - con normalización", async () => {
    const evento: EventoMultiversal = {
      id: "E1",
      tipoEvento: "invento",
      fecha: new Date().toISOString(),
      motivo: "Despliegue de invento",
      inventoId: "Invento-1",
      localizacionId: "L1",
      accion: "despliegue"
    };
    await repo.add(evento);
    const result = await repo.filterByInventoId("invento-1");
    expect(result.length).toBe(1);
  });

  test("filterByInventoId - sin resultados", async () => {
    const evento: EventoMultiversal = {
      id: "E1",
      tipoEvento: "viaje",
      fecha: new Date().toISOString(),
      motivo: "Viaje interdimensional",
      personajeId: "P001",
      dimensionOrigenId: "D-001",
      dimensionDestinoId: "D-002"
    };
    await repo.add(evento);
    const result = await repo.filterByInventoId("I1");
    expect(result.length).toBe(0);
  });

  test("add lanza error si base de datos no inicializada", async () => {
    const mockDb = {
      data: null,
      read: async () => {},
      write: async () => {}
    } as unknown as Low<Data>;
    const repo = new RepositorioEventos(mockDb);
    
    const evento: EventoMultiversal = {
      id: "E1",
      tipoEvento: "viaje",
      fecha: new Date().toISOString(),
      motivo: "Viaje interdimensional",
      personajeId: "P001",
      dimensionOrigenId: "D-001",
      dimensionDestinoId: "D-002"
    };
    
    await expect(repo.add(evento)).rejects.toThrow("Base de datos no inicializada");
  });

  test("findById lanza error si base de datos no inicializada", async () => {
    const mockDb = {
      data: null,
      read: async () => {},
      write: async () => {}
    } as unknown as Low<Data>;
    const repo = new RepositorioEventos(mockDb);
    
    await expect(repo.findById("E1")).rejects.toThrow("Base de datos no inicializada");
  });

  test("getAll lanza error si base de datos no inicializada", async () => {
    const mockDb = {
      data: null,
      read: async () => {},
      write: async () => {}
    } as unknown as Low<Data>;
    const repo = new RepositorioEventos(mockDb);
    
    await expect(repo.getAll()).rejects.toThrow("Base de datos no inicializada");
  });

  test("filterByTipoEvento lanza error si base de datos no inicializada", async () => {
    const mockDb = {
      data: null,
      read: async () => {},
      write: async () => {}
    } as unknown as Low<Data>;
    const repo = new RepositorioEventos(mockDb);
    
    await expect(repo.filterByTipoEvento("viaje")).rejects.toThrow("Base de datos no inicializada");
  });

  test("filterByInventoId lanza error si base de datos no inicializada", async () => {
    const mockDb = {
      data: null,
      read: async () => {},
      write: async () => {}
    } as unknown as Low<Data>;
    const repo = new RepositorioEventos(mockDb);
    
    await expect(repo.filterByInventoId("I1")).rejects.toThrow("Base de datos no inicializada");
  });

});