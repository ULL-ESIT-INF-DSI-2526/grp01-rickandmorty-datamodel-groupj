import { describe, expect, test, beforeEach } from "vitest";
import { Dimension } from "../src/Dimension";

describe("Tests constructor de clase Dimension", () => {
  let dimension: Dimension;

  beforeEach(() => {
    dimension = new Dimension("D-001", "C-137", "activa", 7, "Original");
  });

  test("se crea una dimension", () => {
    expect(dimension instanceof Dimension).toBe(true);
  });

  test("error de id vacio", () => {
    expect(() => new Dimension("", "C-137", "activa", 7, "Original"))
      .toThrow("La ID no puede ser vacia");
  });

  test("error de nombre vacio", () => {
    expect(() => new Dimension("D-001", "", "activa", 7, "Original"))
      .toThrow("El nombre no puede ser vacio");
  });

  test("error de descripcion vacia", () => {
    expect(() => new Dimension("D-001", "C-137", "activa", 7, ""))
      .toThrow("La descripcion no puede estar vacia");
  });

  test("error de rango (negativo)", () => {
    expect(() => new Dimension("D-001", "C-137", "activa", -1, "Original"))
      .toThrow("Indice fuera de rango");
  });

  test("error de rango (positivo)", () => {
    expect(() => new Dimension("D-001", "C-137", "activa", 11, "Original"))
      .toThrow("Indice fuera de rango");
  });

  test("atributos de la clase", () => {
    expect(dimension.id).toBe("D-001");
    expect(dimension.nombre).toBe("C-137");
    expect(dimension.estadoDim).toBe("activa");
    expect(dimension.nivelTec).toBe(7);
    expect(dimension.descripcion).toBe("Original");
  });
});
