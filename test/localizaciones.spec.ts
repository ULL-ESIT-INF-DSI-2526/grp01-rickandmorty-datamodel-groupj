import { describe, expect, test } from "vitest";
import { Localizacion } from "../src/localizaciones";

describe("Localizacion", () => {

  test("crea una localización válida correctamente", () => {
    const loc = new Localizacion(
      "1",
      "Tierra C-137",
      "Planeta",
      8000000000,
      "C-137",
      "Planeta principal"
    );

    expect(loc.id).toBe("1");
    expect(loc.nombre).toBe("Tierra C-137");
    expect(loc.tipo).toBe("Planeta");
    expect(loc.poblacionAproximada).toBe(8000000000);
    expect(loc.dimension).toBe("C-137");
    expect(loc.descripcion).toBe("Planeta principal");
  });

  test("lanza error si el ID está vacío", () => {
    expect(() => {
      new Localizacion(
        "",
        "Tierra",
        "Planeta",
        1,
        "dim",
        "desc"
      );
    }).toThrow();
  });

  test("lanza error si el nombre está vacío", () => {
    expect(() => {
      new Localizacion(
        "1",
        "",
        "Planeta",
        1,
        "dim",
        "desc"
      );
    }).toThrow();
  });

  test("lanza error si la dimensión está vacía", () => {
    expect(() => {
      new Localizacion(
        "1",
        "Tierra",
        "Planeta",
        1,
        "",
        "desc"
      );
    }).toThrow();
  });

  test("lanza error si la descripción está vacía", () => {
    expect(() => {
      new Localizacion(
        "1",
        "Tierra",
        "Planeta",
        1,
        "dim",
        ""
      );
    }).toThrow();
  });

  test("lanza error si la población es negativa", () => {
    expect(() => {
      new Localizacion(
        "1",
        "Tierra",
        "Planeta",
        -1,
        "dim",
        "desc"
      );
    }).toThrow();
  });

  test("permite población igual a 0", () => {
    const loc = new Localizacion(
      "1",
      "Lugar vacío",
      "Planeta",
      0,
      "dim",
      "Sin habitantes"
    );

    expect(loc.poblacionAproximada).toBe(0);
  });

  test("lanza error si los campos tienen solo espacios", () => {
    expect(() => {
      new Localizacion(
        "   ",
        "   ",
        "Planeta",
        1,
        "   ",
        "   "
      );
    }).toThrow();
  });

});