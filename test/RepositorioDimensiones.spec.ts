import { describe, expect, test, beforeEach } from "vitest";
import { RepositorioDimensiones } from "../src/RepositorioDimensiones";
import { Dimension } from "../src/Dimension";

let repo: RepositorioDimensiones;

const normalize = (s: string) =>
  s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

beforeEach(() => {
  repo = new RepositorioDimensiones(normalize);
});

describe("RepositorioDimensiones", () => {

  test("add correcto", () => {
    const d = new Dimension("1", "Dimension 1", "activa", 5, "desc");
    repo.add(d);

    expect(repo.getAll().length).toBe(1);
  });

  test("add duplicada por nombre normalizado", () => {
    const d1 = new Dimension("1", "Dimensión", "activa", 5, "desc");
    const d2 = new Dimension("2", "dimension", "activa", 5, "desc");

    repo.add(d1);

    expect(() => repo.add(d2)).toThrow("Dimensión duplicada");
  });

  test("update correcto", () => {
    const d = new Dimension("1", "D1", "activa", 5, "desc");
    repo.add(d);

    repo.update("1", {
      nombre: "Nueva",
      estadoDim: "destruida",
      nivelTec: 7,
      descripcion: "nueva desc"
    });

    const updated = repo.findById("1");

    expect(updated?.nombre).toBe("Nueva");
    expect(updated?.estadoDim).toBe("destruida");
    expect(updated?.nivelTec).toBe(7);
    expect(updated?.descripcion).toBe("nueva desc");
  });

  test("update lanza error si no existe", () => {
    expect(() => repo.update("X", { nombre: "test" }))
      .toThrow("La dimensión no existe");
  });

  test("update nombre vacío", () => {
    const d = new Dimension("1", "D1", "activa", 5, "desc");
    repo.add(d);

    expect(() => repo.update("1", { nombre: "" }))
      .toThrow("El nombre no puede estar vacío");
  });

  test("update nombre duplicado", () => {
    const d1 = new Dimension("1", "A", "activa", 5, "desc");
    const d2 = new Dimension("2", "B", "activa", 5, "desc");

    repo.add(d1);
    repo.add(d2);

    expect(() => repo.update("2", { nombre: "A" }))
      .toThrow("El nombre de la dimensión ya existe");
  });

  test("update nivel tecnológico inválido (<1)", () => {
    const d = new Dimension("1", "D1", "activa", 5, "desc");
    repo.add(d);

    expect(() => repo.update("1", { nivelTec: 0 }))
      .toThrow("El nivel tecnológico debe estar entre 1 y 10");
  });

  test("update nivel tecnológico inválido (>10)", () => {
    const d = new Dimension("1", "D1", "activa", 5, "desc");
    repo.add(d);

    expect(() => repo.update("1", { nivelTec: 11 }))
      .toThrow("El nivel tecnológico debe estar entre 1 y 10");
  });

  test("update descripción vacía", () => {
    const d = new Dimension("1", "D1", "activa", 5, "desc");
    repo.add(d);

    expect(() => repo.update("1", { descripcion: "" }))
      .toThrow("La descripción no puede estar vacía");
  });

  test("filterByEstado funciona", () => {
    const d1 = new Dimension("1", "A", "activa", 5, "desc");
    const d2 = new Dimension("2", "B", "destruida", 5, "desc");

    repo.add(d1);
    repo.add(d2);

    const result = repo.filterByEstado("activa");

    expect(result.length).toBe(1);
    expect(result[0].id).toBe("1");
  });

  test("isDuplicate true", () => {
    const d1 = new Dimension("1", "A", "activa", 5, "desc");
    const d2 = new Dimension("2", "a", "activa", 5, "desc");

    repo.add(d1);

    expect(repo.isDuplicate(d2)).toBe(true);
  });

  test("isDuplicate false", () => {
    const d1 = new Dimension("1", "A", "activa", 5, "desc");
    const d2 = new Dimension("2", "B", "activa", 5, "desc");

    repo.add(d1);

    expect(repo.isDuplicate(d2)).toBe(false);
  });

  test("update sin cambios (no entra en ningún if)", () => {
    const d = new Dimension("1", "D1", "activa", 5, "desc");
    repo.add(d);

    repo.update("1", {});

    const result = repo.findById("1");

    expect(result).toEqual(d);
  }); 
  
  test("update nombre válido sin duplicado", () => {
    const d = new Dimension("1", "D1", "activa", 5, "desc");
    repo.add(d);

    repo.update("1", { nombre: "NuevoNombre" });

    expect(repo.findById("1")?.nombre).toBe("NuevoNombre");
  });
  
});