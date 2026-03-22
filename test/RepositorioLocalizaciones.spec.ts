import { describe, expect, test, beforeEach, afterEach } from "vitest";
import { RepositorioLocalizaciones } from "../src/RepositorioLocalizaciones";
import { Localizacion } from "../src/localizaciones";
import { Low } from "lowdb";
import { Data, DefaultData } from "../src/Database/db";
import { JSONFilePreset } from "lowdb/node";
import fs from "fs";
import path from "path";

let repo: RepositorioLocalizaciones;
let db: Low<Data>;
let testDbPath: string;

beforeEach(async () => {
  testDbPath = path.join(__dirname, `testDb_localizaciones_${Date.now()}.json`);
  db = await JSONFilePreset(testDbPath, DefaultData);
  db.data.localizacion = [];
  await db.write();
  repo = new RepositorioLocalizaciones(db);
});

afterEach(() => {
  if (fs.existsSync(testDbPath)) {
    fs.unlinkSync(testDbPath);
  }
});

describe("RepositorioLocalizaciones", () => {

  test("add correcto", async () => {
    const l = new Localizacion("L001", "Tierra", "Planeta", 1000, "D-001", "desc");
    await repo.add(l);
    const all = await repo.getAll();
    expect(all.length).toBe(1);
    await repo.remove("L001");
  });

  test("add duplicado", async () => {
    const l1 = new Localizacion("L001", "Tierra", "Planeta", 1000, "D-001", "desc");
    const l2 = new Localizacion("L002", "tierra", "Planeta", 2000, "D-001", "desc");

    await repo.add(l1);
    await expect(repo.add(l2)).rejects.toThrow("Localizacion duplicada");
    await repo.remove("L001");
  });

  test("update correcto", async () => {
    const l = new Localizacion("L001", "Tierra", "Planeta", 1000, "D-001", "desc");
    await repo.add(l);

    await repo.update("L001", {
      nombre: "Marte",
      tipo: "Planeta",
      poblacionAproximada: 500,
      dimension: "D-002",
      descripcion: "nuevo"
    });

    const updated = await repo.findById("L001");

    expect(updated?.nombre).toBe("Marte");
    expect(updated?.dimension).toBe("D-002");
    expect(updated?.poblacionAproximada).toBe(500);
    expect(updated?.descripcion).toBe("nuevo");
    await repo.remove("L001");
  });

  test("update no existe", async () => {
    await expect(repo.update("X", {})).rejects.toThrow("La localización no existe");
  });

  test("update nombre vacío", async () => {
    const l = new Localizacion("L001", "Tierra", "Planeta", 1000, "D-001", "desc");
    await repo.add(l);

    await expect(repo.update("L001", { nombre: "" })).rejects.toThrow("El nombre no puede estar vacío");
    await repo.remove("L001");
  });

  test("update dimension null", async () => {
    const l = new Localizacion("L001", "Tierra", "Planeta", 1000, "D-001", "desc");
    await repo.add(l);

    await expect(repo.update("L001", { dimension: null })).rejects.toThrow("La localización debe tener una dimensión");
    await repo.remove("L001");
  });

  test("update poblacion negativa", async () => {
    const l = new Localizacion("L001", "Tierra", "Planeta", 1000, "D-001", "desc");
    await repo.add(l);

    await expect(repo.update("L001", { poblacionAproximada: -1 })).rejects.toThrow("La población no puede ser negativa");
    await repo.remove("L001");
  });

  test("update descripción vacía", async () => {
    const l = new Localizacion("L001", "Tierra", "Planeta", 1000, "D-001", "desc");
    await repo.add(l);

    await expect(repo.update("L001", { descripcion: "" })).rejects.toThrow("La descripción no puede estar vacía");
    await repo.remove("L001");
  });

  test("update duplicado", async () => {
    const l1 = new Localizacion("L001", "Tierra", "Planeta", 1000, "D-001", "desc");
    const l2 = new Localizacion("L002", "Marte", "Planeta", 500, "D-002", "desc");

    await repo.add(l1);
    await repo.add(l2);

    await expect(repo.update("2", {
      nombre: "Tierra",
      dimension: "D-001"
    })).rejects.toThrow("Localización duplicada");
    await repo.remove("L001");
    await repo.remove("2");
  });

  test("update sin cambios", async () => {
    const l = new Localizacion("L001", "Tierra", "Planeta", 1000, "D-001", "desc");
    await repo.add(l);

    await repo.update("L001", {});

    const result = await repo.findById("L001");
    expect(result).toEqual(l);
    await repo.remove("L001");
  });

  test("filterByNombre", async () => {
    const l1 = new Localizacion("L001", "D-", "Planeta", 1, "D-001", "d");
    const l2 = new Localizacion("L002", "B", "Planeta", 1, "D-001", "d");
    await repo.add(l1);
    await repo.add(l2);

    const result = await repo.filterByNombre("D-");

    expect(result.length).toBe(1);
    await repo.remove("L001");
    await repo.remove("2");
  });

  test("filterByTipo", async () => {
    const l1 = new Localizacion("L001", "D-", "Planeta", 1, "D-001", "d");
    const l2 = new Localizacion("L002", "B", "Estacion espacial", 1, "D-001", "d");
    await repo.add(l1);
    await repo.add(l2);

    const result = await repo.filterByTipo("Planeta");

    expect(result.length).toBe(1);
    await repo.remove("L001");
    await repo.remove("2");
  });

  test("filterByDimension", async () => {
    const l1 = new Localizacion("L001", "D-", "Planeta", 1, "D-001", "d");
    const l2 = new Localizacion("L002", "B", "Planeta", 1, "D-002", "d");
    await repo.add(l1);
    await repo.add(l2);

    const result = await repo.filterByDimension("D-001");

    expect(result.length).toBe(1);
    await repo.remove("L001");
    await repo.remove("2");
  });

  test("isDuplicate true", async () => {
    const l1 = new Localizacion("L001", "Tierra", "Planeta", 1000, "D-001", "desc");
    const l2 = new Localizacion("L002", "tierra", "Planeta", 2000, "D-001", "desc");

    await repo.add(l1);

    const result = await repo.isDuplicate(l2);
    expect(result).toBe(true);
    await repo.remove("L001");
  });

  test("isDuplicate false", async () => {
    const l1 = new Localizacion("L001", "Tierra", "Planeta", 1000, "D-001", "desc");
    const l2 = new Localizacion("L002", "Marte", "Planeta", 2000, "D-002", "desc");

    await repo.add(l1);

    const result = await repo.isDuplicate(l2);
    expect(result).toBe(false);
    await repo.remove("L001");
  });

  test("remove lanza error si el elemento no existe", async () => {
    await expect(repo.remove("X")).rejects.toThrow("El elemento no existe");
  });

});