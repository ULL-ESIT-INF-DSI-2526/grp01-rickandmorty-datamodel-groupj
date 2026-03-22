import { describe, expect, test, beforeEach, afterEach } from "vitest";
import { RepositorioDimensiones } from "../src/core/repositories/RepositorioDimensiones.js";
import { Dimension } from "../src/core/models/Dimension.js";
import { Low } from "lowdb";
import { Data, DefaultData } from "../src/database/db.js";
import { JSONFilePreset } from "lowdb/node";

let repo: RepositorioDimensiones;
let db: Low<Data>;

beforeEach(async () => {
  db = await JSONFilePreset("src/Database/dbTest.json", DefaultData);
  db.data.dimension = [];
  await db.write();
  repo = new RepositorioDimensiones(db);
});

describe("RepositorioDimensiones", () => {

  test("add correcto", async () => {
    const d = new Dimension("D-3", "Dimension 1", "activa", 5, "desc");
    await repo.add(d);
    const all = await repo.getAll();
    expect(all.length).toBe(1);
    await repo.remove("D-3");
  });

  test("add duplicada por nombre normalizado", async () => {
    const d1 = new Dimension("D-4", "Dimensión", "activa", 5, "desc");
    const d2 = new Dimension("D-5", "dimension", "activa", 5, "desc");

    await repo.add(d1);
    await expect(repo.add(d2)).rejects.toThrow("Dimensión duplicada");
    await repo.remove("D-4");
  });

  test("update correcto", async () => {
    const d = new Dimension("D-6", "D-001", "activa", 5, "desc");
    await repo.add(d);

    await repo.update("D-6", {
      nombre: "Nueva",
      estadoDim: "destruida",
      nivelTec: 7,
      descripcion: "nueva desc"
    });

    const updated = await repo.findById("D-6");

    expect(updated?.nombre).toBe("Nueva");
    expect(updated?.estadoDim).toBe("destruida");
    expect(updated?.nivelTec).toBe(7);
    expect(updated?.descripcion).toBe("nueva desc");
    await repo.remove("D-6");
  });

  test("update lanza error si no existe", async () => {
    await expect(repo.update("X", { nombre: "test" })).rejects.toThrow("La dimensión no existe");
  });

  test("update nombre vacío", async () => {
    const d = new Dimension("D-7", "D-001", "activa", 5, "desc");
    await repo.add(d);

    await expect(repo.update("D-7", { nombre: "" })).rejects.toThrow("El nombre no puede estar vacío");
    await repo.remove("D-7");
  });

  test("update nombre duplicado", async () => {
    const d1 = new Dimension("D-8", "D-", "activa", 5, "desc");
    const d2 = new Dimension("D-9", "B", "activa", 5, "desc");

    await repo.add(d1);
    await repo.add(d2);

    await expect(repo.update("D-9", { nombre: "D-" })).rejects.toThrow("El nombre de la dimensión ya existe");
    await repo.remove("D-8");
    await repo.remove("D-9");
  });

  test("update nivel tecnológico inválido (<1)", async () => {
    const d = new Dimension("D-10", "D-001", "activa", 5, "desc");
    await repo.add(d);

    await expect(repo.update("D-10", { nivelTec: 0 })).rejects.toThrow("El nivel tecnológico debe estar entre 1 y 10");
    await repo.remove("D-10");
  });

  test("update nivel tecnológico inválido (>10)", async () => {
    const d = new Dimension("D-11", "D-001", "activa", 5, "desc");
    await repo.add(d);

    await expect(repo.update("D-11", { nivelTec: 11 })).rejects.toThrow("El nivel tecnológico debe estar entre 1 y 10");
    await repo.remove("D-11");
  });

  test("update descripción vacía", async () => {
    const d = new Dimension("D-12", "D-001", "activa", 5, "desc");
    await repo.add(d);

    await expect(repo.update("D-12", { descripcion: "" })).rejects.toThrow("La descripción no puede estar vacía");
    await repo.remove("D-12");
  });

  test("filterByEstado funciona", async () => {
    const d1 = new Dimension("D-13", "D-", "activa", 5, "desc");
    const d2 = new Dimension("D-14", "B", "destruida", 5, "desc");

    await repo.add(d1);
    await repo.add(d2);

    const result = await repo.filterByEstado("activa");

    expect(result.length).toBe(1);
    expect(result[0].id).toBe("D-13");
    await repo.remove("D-13");
    await repo.remove("D-14");
  });

  test("isDuplicate true", async () => {
    const d1 = new Dimension("D-15", "D-", "activa", 5, "desc");
    const d2 = new Dimension("D-16", "d-", "activa", 5, "desc");

    await repo.add(d1);

    const result = await repo.isDuplicate(d2);
    expect(result).toBe(true);
    await repo.remove("D-15");
  });

  test("isDuplicate false", async () => {
    const d1 = new Dimension("D-17", "D-", "activa", 5, "desc");
    const d2 = new Dimension("D-18", "B", "activa", 5, "desc");

    await repo.add(d1);

    const result = await repo.isDuplicate(d2);
    expect(result).toBe(false);
    await repo.remove("D-17");
  });

  test("update sin cambios (no entra en ningún if)", async () => {
    const d = new Dimension("D-19", "D-001", "activa", 5, "desc");
    await repo.add(d);

    await repo.update("D-19", {});

    const result = await repo.findById("D-19");

    expect(result).toEqual(d);
    await repo.remove("D-19");
  }); 
  
  test("update nombre válido sin duplicado", async () => {
    const d = new Dimension("D-20", "D-001", "activa", 5, "desc");
    await repo.add(d);

    await repo.update("D-20", { nombre: "NuevoNombre" });

    const result = await repo.findById("D-20");
    expect(result?.nombre).toBe("NuevoNombre");
    await repo.remove("D-20");
  });

  test("remove lanza error si el elemento no existe", async () => {
    await expect(repo.remove("X")).rejects.toThrow("El elemento no existe");
  });
  
  test("add lanza error si ID no tiene formato D-XXX", async () => {
    const d = new Dimension("1", "Dimension 1", "activa", 5, "desc");
    await expect(repo.add(d)).rejects.toThrow("El ID de dimensión debe tener formato D-XXX");
  });  
  
});