import { describe, expect, test, beforeEach, afterEach } from "vitest";
import { RepositorioDimensiones } from "../src/RepositorioDimensiones";
import { Dimension } from "../src/Dimension";
import { Low } from "lowdb";
import { Data, DefaultData } from "../src/Database/db";
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
    const d = new Dimension("A3", "Dimension 1", "activa", 5, "desc");
    await repo.add(d);
    const all = await repo.getAll();
    expect(all.length).toBe(1);
    await repo.remove("A3");
  });

  test("add duplicada por nombre normalizado", async () => {
    const d1 = new Dimension("A4", "Dimensión", "activa", 5, "desc");
    const d2 = new Dimension("A5", "dimension", "activa", 5, "desc");

    await repo.add(d1);
    await expect(repo.add(d2)).rejects.toThrow("Dimensión duplicada");
    await repo.remove("A4");
  });

  test("update correcto", async () => {
    const d = new Dimension("A6", "D1", "activa", 5, "desc");
    await repo.add(d);

    await repo.update("A6", {
      nombre: "Nueva",
      estadoDim: "destruida",
      nivelTec: 7,
      descripcion: "nueva desc"
    });

    const updated = await repo.findById("A6");

    expect(updated?.nombre).toBe("Nueva");
    expect(updated?.estadoDim).toBe("destruida");
    expect(updated?.nivelTec).toBe(7);
    expect(updated?.descripcion).toBe("nueva desc");
    await repo.remove("A6");
  });

  test("update lanza error si no existe", async () => {
    await expect(repo.update("X", { nombre: "test" })).rejects.toThrow("La dimensión no existe");
  });

  test("update nombre vacío", async () => {
    const d = new Dimension("A7", "D1", "activa", 5, "desc");
    await repo.add(d);

    await expect(repo.update("A7", { nombre: "" })).rejects.toThrow("El nombre no puede estar vacío");
    await repo.remove("A7");
  });

  test("update nombre duplicado", async () => {
    const d1 = new Dimension("A8", "A", "activa", 5, "desc");
    const d2 = new Dimension("A9", "B", "activa", 5, "desc");

    await repo.add(d1);
    await repo.add(d2);

    await expect(repo.update("A9", { nombre: "A" })).rejects.toThrow("El nombre de la dimensión ya existe");
    await repo.remove("A8");
    await repo.remove("A9");
  });

  test("update nivel tecnológico inválido (<1)", async () => {
    const d = new Dimension("A10", "D1", "activa", 5, "desc");
    await repo.add(d);

    await expect(repo.update("A10", { nivelTec: 0 })).rejects.toThrow("El nivel tecnológico debe estar entre 1 y 10");
    await repo.remove("A10");
  });

  test("update nivel tecnológico inválido (>10)", async () => {
    const d = new Dimension("A11", "D1", "activa", 5, "desc");
    await repo.add(d);

    await expect(repo.update("A11", { nivelTec: 11 })).rejects.toThrow("El nivel tecnológico debe estar entre 1 y 10");
    await repo.remove("A11");
  });

  test("update descripción vacía", async () => {
    const d = new Dimension("A12", "D1", "activa", 5, "desc");
    await repo.add(d);

    await expect(repo.update("A12", { descripcion: "" })).rejects.toThrow("La descripción no puede estar vacía");
    await repo.remove("A12");
  });

  test("filterByEstado funciona", async () => {
    const d1 = new Dimension("A13", "A", "activa", 5, "desc");
    const d2 = new Dimension("A14", "B", "destruida", 5, "desc");

    await repo.add(d1);
    await repo.add(d2);

    const result = await repo.filterByEstado("activa");

    expect(result.length).toBe(1);
    expect(result[0].id).toBe("A13");
    await repo.remove("A13");
    await repo.remove("A14");
  });

  test("isDuplicate true", async () => {
    const d1 = new Dimension("A15", "A", "activa", 5, "desc");
    const d2 = new Dimension("A16", "a", "activa", 5, "desc");

    await repo.add(d1);

    const result = await repo.isDuplicate(d2);
    expect(result).toBe(true);
    await repo.remove("A15");
  });

  test("isDuplicate false", async () => {
    const d1 = new Dimension("A17", "A", "activa", 5, "desc");
    const d2 = new Dimension("A18", "B", "activa", 5, "desc");

    await repo.add(d1);

    const result = await repo.isDuplicate(d2);
    expect(result).toBe(false);
    await repo.remove("A17");
  });

  test("update sin cambios (no entra en ningún if)", async () => {
    const d = new Dimension("A19", "D1", "activa", 5, "desc");
    await repo.add(d);

    await repo.update("A19", {});

    const result = await repo.findById("A19");

    expect(result).toEqual(d);
    await repo.remove("A19");
  }); 
  
  test("update nombre válido sin duplicado", async () => {
    const d = new Dimension("A20", "D1", "activa", 5, "desc");
    await repo.add(d);

    await repo.update("A20", { nombre: "NuevoNombre" });

    const result = await repo.findById("A20");
    expect(result?.nombre).toBe("NuevoNombre");
    await repo.remove("A20");
  });

  test("remove lanza error si el elemento no existe", async () => {
    await expect(repo.remove("X")).rejects.toThrow("El elemento no existe");
  });
  
});