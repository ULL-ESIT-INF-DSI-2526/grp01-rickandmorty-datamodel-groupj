import { describe, expect, test, beforeEach, afterEach } from "vitest";
import { RepositorioInventos } from "../src/RepositorioInventos";
import { Invento } from "../src/inventos";
import { Low } from "lowdb";
import { Data, DefaultData } from "../src/Database/db";
import { JSONFilePreset } from "lowdb/node";
import fs from "fs";
import path from "path";

let repo: RepositorioInventos;
let db: Low<Data>;
let testDbPath: string;

beforeEach(async () => {
  testDbPath = path.join(__dirname, `testDb_inventos_${Date.now()}.json`);
  db = await JSONFilePreset(testDbPath, DefaultData);
  db.data.invento = [];
  await db.write();
  repo = new RepositorioInventos(db);
});

afterEach(() => {
  if (fs.existsSync(testDbPath)) {
    fs.unlinkSync(testDbPath);
  }
});

describe("RepositorioInventos", () => {

  test("add correcto", async () => {
    const i = new Invento("1", "Pistola", "P1", "Arma", 5, "desc");
    await repo.add(i);
    const all = await repo.getAll();
    expect(all.length).toBe(1);
    await repo.remove("1");
  });

  test("add duplicado", async () => {
    const i1 = new Invento("1", "Pistola", "P1", "Arma", 5, "desc");
    const i2 = new Invento("2", "pistola", "P1", "Arma", 5, "desc");

    await repo.add(i1);
    await expect(repo.add(i2)).rejects.toThrow("Invento duplicado");
    await repo.remove("1");
  });

  test("update correcto", async () => {
    const i = new Invento("1", "Pistola", "P1", "Arma", 5, "desc");
    await repo.add(i);

    await repo.update("1", {
      nombre: "Laser",
      inventor: "P2",
      tipo: "Biotecnologia",
      nivelPeligro: 8,
      descripcion: "nuevo"
    });

    const updated = await repo.findById("1");

    expect(updated?.nombre).toBe("Laser");
    expect(updated?.inventor).toBe("P2");
    expect(updated?.tipo).toBe("Biotecnologia");
    expect(updated?.nivelPeligro).toBe(8);
    expect(updated?.descripcion).toBe("nuevo");
    await repo.remove("1");
  });

  test("update no existe", async () => {
    await expect(repo.update("X", {})).rejects.toThrow("El invento no existe");
  });

  test("update nombre vacío", async () => {
    const i = new Invento("1", "Pistola", "P1", "Arma", 5, "desc");
    await repo.add(i);

    await expect(repo.update("1", { nombre: "" })).rejects.toThrow("El nombre no puede estar vacío");
    await repo.remove("1");
  });

  test("update inventor null", async () => {
    const i = new Invento("1", "Pistola", "P1", "Arma", 5, "desc");
    await repo.add(i);

    await expect(repo.update("1", { inventor: null })).rejects.toThrow("El invento debe tener un inventor");
    await repo.remove("1");
  });

  test("update nivelPeligro inválido (<1)", async () => {
    const i = new Invento("1", "Pistola", "P1", "Arma", 5, "desc");
    await repo.add(i);

    await expect(repo.update("1", { nivelPeligro: 0 })).rejects.toThrow("El nivel de peligro debe estar entre 1 y 10");
    await repo.remove("1");
  });

  test("update nivelPeligro inválido (>10)", async () => {
    const i = new Invento("1", "Pistola", "P1", "Arma", 5, "desc");
    await repo.add(i);

    await expect(repo.update("1", { nivelPeligro: 11 })).rejects.toThrow("El nivel de peligro debe estar entre 1 y 10");
    await repo.remove("1");
  });

  test("update descripción vacía", async () => {
    const i = new Invento("1", "Pistola", "P1", "Arma", 5, "desc");
    await repo.add(i);

    await expect(repo.update("1", { descripcion: "" })).rejects.toThrow("La descripción no puede estar vacía");
    await repo.remove("1");
  });

  test("update duplicado", async () => {
    const i1 = new Invento("1", "Pistola", "P1", "Arma", 5, "desc");
    const i2 = new Invento("2", "Laser", "P2", "Arma", 5, "desc");

    await repo.add(i1);
    await repo.add(i2);

    await expect(repo.update("2", {
      nombre: "Pistola",
      inventor: "P1"
    })).rejects.toThrow("Invento duplicado");
    await repo.remove("1");
    await repo.remove("2");
  });

  test("update sin cambios", async () => {
    const i = new Invento("1", "Pistola", "P1", "Arma", 5, "desc");
    await repo.add(i);

    await repo.update("1", {});

    const result = await repo.findById("1");
    expect(result).toEqual(i);
    await repo.remove("1");
  });

  test("filterByNombre", async () => {
    const i1 = new Invento("1", "A", "P1", "Arma", 5, "d");
    const i2 = new Invento("2", "B", "P2", "Arma", 5, "d");
    await repo.add(i1);
    await repo.add(i2);

    const result = await repo.filterByNombre("A");

    expect(result.length).toBe(1);
    await repo.remove("1");
    await repo.remove("2");
  });

  test("filterByTipo", async () => {
    const i1 = new Invento("1", "A", "P1", "Arma", 5, "d");
    const i2 = new Invento("2", "B", "P2", "Biotecnologia", 5, "d");
    await repo.add(i1);
    await repo.add(i2);

    const result = await repo.filterByTipo("Arma");

    expect(result.length).toBe(1);
    await repo.remove("1");
    await repo.remove("2");
  });

  test("filterByInventor", async () => {
    const i1 = new Invento("1", "A", "P1", "Arma", 5, "d");
    const i2 = new Invento("2", "B", "P2", "Arma", 5, "d");
    await repo.add(i1);
    await repo.add(i2);

    const result = await repo.filterByInventor("P1");

    expect(result.length).toBe(1);
    await repo.remove("1");
    await repo.remove("2");
  });

  test("filterByPeligrosidad", async () => {
    const i1 = new Invento("1", "A", "P1", "Arma", 5, "d");
    const i2 = new Invento("2", "B", "P2", "Arma", 9, "d");
    await repo.add(i1);
    await repo.add(i2);

    const result = await repo.filterByPeligrosidad(9);

    expect(result.length).toBe(1);
    await repo.remove("1");
    await repo.remove("2");
  });

  test("setNullInventor", async () => {
    const i1 = new Invento("1", "A", "P1", "Arma", 5, "d");
    const i2 = new Invento("2", "B", "P2", "Arma", 5, "d");
    await repo.add(i1);
    await repo.add(i2);

    await repo.setNullInventor("P1");

    const updated1 = await repo.findById("1");
    const updated2 = await repo.findById("2");
    expect(updated1?.inventor).toBe(null);
    expect(updated2?.inventor).toBe("P2");
    await repo.remove("1");
    await repo.remove("2");
  });

  test("isDuplicate true", async () => {
    const i1 = new Invento("1", "Pistola", "P1", "Arma", 5, "d");
    const i2 = new Invento("2", "pistola", "P1", "Arma", 5, "d");

    await repo.add(i1);

    const result = await repo.isDuplicate(i2);
    expect(result).toBe(true);
    await repo.remove("1");
  });

  test("isDuplicate false", async () => {
    const i1 = new Invento("1", "Pistola", "P1", "Arma", 5, "d");
    const i2 = new Invento("2", "Laser", "P2", "Arma", 5, "d");

    await repo.add(i1);

    const result = await repo.isDuplicate(i2);
    expect(result).toBe(false);
    await repo.remove("1");
  });

  test("remove lanza error si el elemento no existe", async () => {
    await expect(repo.remove("X")).rejects.toThrow("El elemento no existe");
  });

});