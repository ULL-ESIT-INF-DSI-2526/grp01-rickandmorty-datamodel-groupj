import { describe, expect, test, beforeEach, afterEach } from "vitest";
import { RepositorioPersonajes } from "../src/RepositorioPersonajes";
import { Personaje } from "../src/personajes";
import { Low } from "lowdb";
import { Data, DefaultData } from "../src/Database/db";
import { JSONFilePreset } from "lowdb/node";
import fs from "fs";
import path from "path";

let repo: RepositorioPersonajes;
let db: Low<Data>;
let testDbPath: string;

beforeEach(async () => {
  testDbPath = path.join(__dirname, `testDb_personajes_${Date.now()}.json`);
  db = await JSONFilePreset(testDbPath, DefaultData);
  db.data.personaje = [];
  await db.write();
  repo = new RepositorioPersonajes(db);
});

afterEach(() => {
  if (fs.existsSync(testDbPath)) {
    fs.unlinkSync(testDbPath);
  }
});

describe("RepositorioPersonajes", () => {

  test("add correcto", async () => {
    const p = new Personaje("P001", "Rick", "E1", "D-001", "vivo", "Independiente", 10, "desc");
    await repo.add(p);
    const all = await repo.getAll();
    expect(all.length).toBe(1);
    await repo.remove("P001");
  });

  test("add duplicado", async () => {
    const p1 = new Personaje("P001", "Rick", "E1", "D-001", "vivo", "Independiente", 10, "desc");
    const p2 = new Personaje("P002", "rick", "E1", "D-001", "vivo", "Independiente", 10, "desc");

    await repo.add(p1);
    await expect(repo.add(p2)).rejects.toThrow("Personaje duplicado");
    await repo.remove("P001");
  });

  test("update correcto", async () => {
    const p = new Personaje("P001", "Rick", "E1", "D-001", "vivo", "Independiente", 10, "desc");
    await repo.add(p);

    await repo.update("P001", {
      nombre: "Morty",
      especie: "E2",
      dimension: "D-002",
      estado: "muerto",
      afiliacion: "Familia Smith",
      nivelInteligencia: 5,
      descripcion: "nuevo"
    });

    const updated = await repo.findById("P001");

    expect(updated?.nombre).toBe("Morty");
    expect(updated?.especie).toBe("E2");
    expect(updated?.dimension).toBe("D-002");
    expect(updated?.estado).toBe("muerto");
    expect(updated?.afiliacion).toBe("Familia Smith");
    expect(updated?.nivelInteligencia).toBe(5);
    expect(updated?.descripcion).toBe("nuevo");
    await repo.remove("P001");
  });

  test("update no existe", async () => {
    await expect(repo.update("X", {})).rejects.toThrow("El personaje no existe");
  });

  test("update nombre vacío", async () => {
    const p = new Personaje("P001", "Rick", "E1", "D-001", "vivo", "Independiente", 10, "desc");
    await repo.add(p);

    await expect(repo.update("P001", { nombre: "" })).rejects.toThrow("El nombre no puede estar vacío");
    await repo.remove("P001");
  });

  test("update especie null", async () => {
    const p = new Personaje("P001", "Rick", "E1", "D-001", "vivo", "Independiente", 10, "desc");
    await repo.add(p);

    await expect(repo.update("P001", { especie: null })).rejects.toThrow("La especie no puede ser null");
    await repo.remove("P001");
  });

  test("update dimension null", async () => {
    const p = new Personaje("P001", "Rick", "E1", "D-001", "vivo", "Independiente", 10, "desc");
    await repo.add(p);

    await expect(repo.update("P001", { dimension: null })).rejects.toThrow("La dimensión no puede ser null");
    await repo.remove("P001");
  });

  test("update nivel inteligencia inválido (<1)", async () => {
    const p = new Personaje("P001", "Rick", "E1", "D-001", "vivo", "Independiente", 10, "desc");
    await repo.add(p);

    await expect(repo.update("P001", { nivelInteligencia: 0 })).rejects.toThrow("El nivel de inteligencia debe estar entre 1 y 10");
    await repo.remove("P001");
  });

  test("update nivel inteligencia inválido (>10)", async () => {
    const p = new Personaje("P001", "Rick", "E1", "D-001", "vivo", "Independiente", 10, "desc");
    await repo.add(p);

    await expect(repo.update("P001", { nivelInteligencia: 11 })).rejects.toThrow("El nivel de inteligencia debe estar entre 1 y 10");
    await repo.remove("P001");
  });

  test("update descripción vacía", async () => {
    const p = new Personaje("P001", "Rick", "E1", "D-001", "vivo", "Independiente", 10, "desc");
    await repo.add(p);

    await expect(repo.update("P001", { descripcion: "" })).rejects.toThrow("La descripción no puede estar vacía");
    await repo.remove("P001");
  });

  test("update duplicado", async () => {
    const p1 = new Personaje("P001", "Rick", "E1", "D-001", "vivo", "Independiente", 10, "desc");
    const p2 = new Personaje("P002", "Morty", "E2", "D-002", "vivo", "Independiente", 5, "desc");

    await repo.add(p1);
    await repo.add(p2);

    await expect(repo.update("2", {
      nombre: "Rick",
      especie: "E1",
      dimension: "D-001"
    })).rejects.toThrow("Personaje duplicado");
    await repo.remove("P001");
    await repo.remove("2");
  });

  test("update sin cambios", async () => {
    const p = new Personaje("P001", "Rick", "E1", "D-001", "vivo", "Independiente", 10, "desc");
    await repo.add(p);

    await repo.update("P001", {});

    const result = await repo.findById("P001");
    expect(result).toEqual(p);
    await repo.remove("P001");
  });

  test("filterByNombre", async () => {
    const p1 = new Personaje("P001", "Rick", "E1", "D-001", "vivo", "Independiente", 10, "d");
    const p2 = new Personaje("P002", "Morty", "E2", "D-002", "vivo", "Independiente", 5, "d");
    await repo.add(p1);
    await repo.add(p2);

    const result = await repo.filterByNombre("Rick");
    expect(result.length).toBe(1);
    await repo.remove("P001");
    await repo.remove("2");
  });

  test("filterByEspecie", async () => {
    const p1 = new Personaje("P001", "Rick", "E1", "D-001", "vivo", "Independiente", 10, "d");
    const p2 = new Personaje("P002", "Morty", "E2", "D-002", "vivo", "Independiente", 5, "d");
    await repo.add(p1);
    await repo.add(p2);

    const result = await repo.filterByEspecie("E1");
    expect(result.length).toBe(1);
    await repo.remove("P001");
    await repo.remove("2");
  });

  test("filterByAfiliacion", async () => {
    const p1 = new Personaje("P001", "Rick", "E1", "D-001", "vivo", "Independiente", 10, "d");
    const p2 = new Personaje("P002", "Morty", "E2", "D-002", "vivo", "Familia Smith", 5, "d");
    await repo.add(p1);
    await repo.add(p2);

    const result = await repo.filterByAfiliacion("Familia Smith");
    expect(result.length).toBe(1);
    await repo.remove("P001");
    await repo.remove("2");
  });

  test("filterByEstado", async () => {
    const p1 = new Personaje("P001", "Rick", "E1", "D-001", "vivo", "Independiente", 10, "d");
    const p2 = new Personaje("P002", "Morty", "E2", "D-002", "muerto", "Independiente", 5, "d");
    await repo.add(p1);
    await repo.add(p2);

    const result = await repo.filterByEstado("muerto");
    expect(result.length).toBe(1);
    await repo.remove("P001");
    await repo.remove("2");
  });

  test("filterByDimension", async () => {
    const p1 = new Personaje("P001", "Rick", "E1", "D-001", "vivo", "Independiente", 10, "d");
    const p2 = new Personaje("P002", "Morty", "E2", "D-002", "vivo", "Independiente", 5, "d");
    await repo.add(p1);
    await repo.add(p2);

    const result = await repo.filterByDimension("D-001");
    expect(result.length).toBe(1);
    await repo.remove("P001");
    await repo.remove("2");
  });

  test("setNullDimension", async () => {
    const p = new Personaje("P001", "Rick", "E1", "D-001", "vivo", "Independiente", 10, "d");
    await repo.add(p);

    await repo.setNullDimension("D-001");

    const updated = await repo.findById("P001");
    expect(updated?.dimension).toBe(null);
    await repo.remove("P001");
  });

  test("setNullEspecie", async () => {
    const p = new Personaje("P001", "Rick", "E1", "D-001", "vivo", "Independiente", 10, "d");
    await repo.add(p);

    await repo.setNullEspecie("E1");

    const updated = await repo.findById("P001");
    expect(updated?.especie).toBe(null);
    await repo.remove("P001");
  });

  test("getNullDimension", async () => {
    const p = new Personaje("P001", "Rick", "E1", null, "vivo", "Independiente", 10, "d");
    await repo.add(p);

    const result = await repo.getNullDimension();
    expect(result.length).toBe(1);
    await repo.remove("P001");
  });

  test("isDuplicate true", async () => {
    const p1 = new Personaje("P001", "Rick", "E1", "D-001", "vivo", "Independiente", 10, "d");
    const p2 = new Personaje("P002", "rick", "E1", "D-001", "vivo", "Independiente", 10, "d");

    await repo.add(p1);

    const result = await repo.isDuplicate(p2);
    expect(result).toBe(true);
    await repo.remove("P001");
  });

  test("isDuplicate false", async () => {
    const p1 = new Personaje("P001", "Rick", "E1", "D-001", "vivo", "Independiente", 10, "d");
    const p2 = new Personaje("P002", "Morty", "E2", "D-002", "vivo", "Independiente", 5, "d");

    await repo.add(p1);

    const result = await repo.isDuplicate(p2);
    expect(result).toBe(false);
    await repo.remove("P001");
  });

  test("setNullDimension no modifica si no coincide", async () => {
    const p = new Personaje("P001", "Rick", "E1", "D-001", "vivo", "Independiente", 10, "d");
    await repo.add(p);

    await repo.setNullDimension("D-002");

    const updated = await repo.findById("P001");
    expect(updated?.dimension).toBe("D-001");
    await repo.remove("P001");
  });

  test("setNullEspecie no modifica si no coincide", async () => {
    const p = new Personaje("P001", "Rick", "E1", "D-001", "vivo", "Independiente", 10, "d");
    await repo.add(p);

    await repo.setNullEspecie("E2");

    const updated = await repo.findById("P001");
    expect(updated?.especie).toBe("E1");
    await repo.remove("P001");
  });

  test("getNullDimension vacío", async () => {
    const p = new Personaje("P001", "Rick", "E1", "D-001", "vivo", "Independiente", 10, "d");
    await repo.add(p);

    const result = await repo.getNullDimension();
    expect(result.length).toBe(0);
    await repo.remove("P001");
  });

  test("remove lanza error si el elemento no existe", async () => {
    await expect(repo.remove("X")).rejects.toThrow("El elemento no existe");
  });

});