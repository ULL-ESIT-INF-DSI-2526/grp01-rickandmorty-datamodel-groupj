import { describe, expect, test, beforeEach } from "vitest";
import { RepositorioDimensiones } from "../src/RepositorioDimensiones";
import { Dimension } from "../src/Dimension";
import {Low} from "lowdb"
import { Data, DefaultData } from "../src/Database/db";
import { JSONFilePreset } from "lowdb/node";

let repo: RepositorioDimensiones;

beforeEach(async () => {
  let newdb: Low<Data> = await JSONFilePreset("src/Database/dbTest.json", DefaultData);
  repo = new RepositorioDimensiones(newdb);
});

describe("RepositorioDimensiones", () => {

  test("add correcto", async () => {
    const d = new Dimension("1", "Dimension 1", "activa", 5, "desc");
    await repo.add(d);

    expect(repo.getAll().then.length).toBe(1);
  });

  test("add duplicada por nombre normalizado", async () => {
    const d1 = new Dimension("1", "Dimensión", "activa", 5, "desc");
    const d2 = new Dimension("2", "dimension", "activa", 5, "desc");

    await repo.add(d1);

    expect(() => repo.add(d2)).toThrow("Dimensión duplicada");
  });

  test("update correcto", async () => {
    const d = new Dimension("1", "D1", "activa", 5, "desc");
    await repo.add(d);

    await repo.update("1", {
      nombre: "Nueva",
      estadoDim: "destruida",
      nivelTec: 7,
      descripcion: "nueva desc"
    });

    const updated = await repo.findById("1");

    expect(updated?.nombre).toBe("Nueva");
    expect(updated?.estadoDim).toBe("destruida");
    expect(updated?.nivelTec).toBe(7);
    expect(updated?.descripcion).toBe("nueva desc");
  });

  test("update lanza error si no existe", () => {
    expect(async () => await repo.update("X", { nombre: "test" }))
      .toThrow("La dimensión no existe");
  });

  test("update nombre vacío", async () => {
    const d = new Dimension("1", "D1", "activa", 5, "desc");
    await repo.add(d);

    expect(async () => await repo.update("1", { nombre: "" }))
      .toThrow("El nombre no puede estar vacío");
  });

  test("update nombre duplicado", async () => {
    const d1 = new Dimension("1", "A", "activa", 5, "desc");
    const d2 = new Dimension("2", "B", "activa", 5, "desc");

    await repo.add(d1);
    await repo.add(d2);

    expect(async () => await repo.update("2", { nombre: "A" }))
      .toThrow("El nombre de la dimensión ya existe");
  });

  test("update nivel tecnológico inválido (<1)", async () => {
    const d = new Dimension("1", "D1", "activa", 5, "desc");
    await repo.add(d);

    expect(() => repo.update("1", { nivelTec: 0 }))
      .toThrow("El nivel tecnológico debe estar entre 1 y 10");
  });

  test("update nivel tecnológico inválido (>10)", async () => {
    const d = new Dimension("1", "D1", "activa", 5, "desc");
    await repo.add(d);

    expect(async () => await repo.update("1", { nivelTec: 11 }))
      .toThrow("El nivel tecnológico debe estar entre 1 y 10");
  });

  test("update descripción vacía", async () => {
    const d = new Dimension("1", "D1", "activa", 5, "desc");
    await repo.add(d);

    expect(() => repo.update("1", { descripcion: "" }))
      .toThrow("La descripción no puede estar vacía");
  });

  test("filterByEstado funciona", async () => {
    const d1 = new Dimension("1", "A", "activa", 5, "desc");
    const d2 = new Dimension("2", "B", "destruida", 5, "desc");

    await repo.add(d1);
    await repo.add(d2);

    const result = await repo.filterByEstado("activa");

    expect(result.length).toBe(1);
    expect(result[0].id).toBe("1");
  });

  test("isDuplicate true", async () => {
    const d1 = new Dimension("1", "A", "activa", 5, "desc");
    const d2 = new Dimension("2", "a", "activa", 5, "desc");

    await repo.add(d1);

    expect(repo.isDuplicate(d2)).toBe(true);
  });

  test("isDuplicate false", async () => {
    const d1 = new Dimension("1", "A", "activa", 5, "desc");
    const d2 = new Dimension("2", "B", "activa", 5, "desc");

    await repo.add(d1);

    expect(repo.isDuplicate(d2)).toBe(false);
  });

  test("update sin cambios (no entra en ningún if)", async () => {
    const d = new Dimension("1", "D1", "activa", 5, "desc");
    await repo.add(d);

    await repo.update("1", {});

    const result = await repo.findById("1");

    expect(result).toEqual(d);
  }); 
  
  test("update nombre válido sin duplicado", async () => {
    const d = new Dimension("1", "D1", "activa", 5, "desc");
    await repo.add(d);

    await repo.update("1", { nombre: "NuevoNombre" });

    const result = await repo.findById("1")
    expect(result?.nombre).toBe("NuevoNombre");
  });
  
});