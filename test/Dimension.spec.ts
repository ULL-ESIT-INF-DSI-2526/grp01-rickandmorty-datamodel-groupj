import { describe, expect, test, beforeEach } from "vitest";

import { Dimension } from "../src/Dimension";

describe("Tests constructor de clase Dimension", () => {
  let dimension: Dimension;
  beforeEach(() => {
    dimension = new Dimension({
      id: "D1",
      nombre: "C-137",
      descripcion: "Original",
      estadoDim: "activa",
      nivelTec: 7,
    });
  });

  test("se crea una dimension", () => {
    expect(dimension instanceof Dimension).toBe(true);
  });

  test("error de id vacio", () => {
    expect(
      () =>
        new Dimension({
          id: "",
          nombre: "C-137",
          descripcion: "Original",
          estadoDim: "activa",
          nivelTec: 7,
        }),
    ).toThrow("La ID no puede ser vacia");
  });

  test("error de nombre vacio", () => {
    expect(
      () =>
        new Dimension({
          id: "D1",
          nombre: "",
          descripcion: "Original",
          estadoDim: "activa",
          nivelTec: 7,
        }),
    ).toThrow("El nombre no puede ser vacio");
  });

  test("error de estado vacio o inválido", () => {
    expect(
      () =>
        new Dimension({
          id: "D1",
          nombre: "C-137",
          descripcion: "Original",
          estadoDim: "",
          nivelTec: 7,
        } as any),
    ).toThrow("El estado de la dimension no puede ser vacia o es invalida");

    expect(
      () =>
        new Dimension({
          id: "D1",
          nombre: "C-137",
          descripcion: "Original",
          estadoDim: "pendiente" as any,
          nivelTec: 7,
        } as any),
    ).toThrow("El estado de la dimension no puede ser vacia o es invalida");
  });

  test("error de rango (negativo)", () => {
    expect(
      () =>
        new Dimension({
          id: "D1",
          nombre: "C-137",
          descripcion: "Original",
          estadoDim: "activa",
          nivelTec: -1,
        }),
    ).toThrow("Indice fuera de rango");
  });

  test("error de rango (positivo)", () => {
    expect(
      () =>
        new Dimension({
          id: "D1",
          nombre: "C-137",
          descripcion: "Original",
          estadoDim: "activa",
          nivelTec: 11,
        }),
    ).toThrow("Indice fuera de rango");
  });
});
