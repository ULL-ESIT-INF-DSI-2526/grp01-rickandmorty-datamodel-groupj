import { describe, expect, test, beforeEach } from "vitest";

import { Dimension } from "../src/Dimension";

describe("Tests constructor de clase Dimension", () => {
  let dimension: Dimension;
  beforeEach(() => {
    dimension = new Dimension("D1", "C-137", "activa", "Original", 7);
  });

  test("se crea una dimension", () => {
    expect(dimension instanceof Dimension).toBe(true);
  });

  test("error de id vacio", () => {
    expect(() => new Dimension("", "C-137", "activa", "Original", 7)).toThrow(
      "La ID no puede ser vacia",
    );
  });

  test("error de nombre vacio", () => {
    expect(() => new Dimension("D1", "", "activa", "Original", 7)).toThrow(
      "El nombre no puede ser vacio",
    );
  });

  test("error de rango (negativo)", () => {
    expect(
      () => new Dimension("D1", "C-137", "activa", "Original", -1),
    ).toThrow("Indice fuera de rango");
  });

  test("error de rango (positivo)", () => {
    expect(
      () => new Dimension("D1", "C-137", "activa", "Original", 11),
    ).toThrow("Indice fuera de rango");
  });

  test("atributos de la clase", () => {
    expect(dimension.id).toBe("D1");
    expect(dimension.nombre).toBe("C-137");
    expect(dimension.descripcion).toBe("Original");
    expect(dimension.estadoDim).toBe("activa");
    expect(dimension.nivelTec).toBe(7);
  });
});
