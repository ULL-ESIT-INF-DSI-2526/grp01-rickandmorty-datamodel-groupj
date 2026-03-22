import { describe, expect, test } from "vitest";
import { Localizacion } from "../src/core/models/localizaciones.js";

describe("Localizacion", () => {

  test("crea una localización válida correctamente", () => {
    const loc = new Localizacion(
      "1",
      "Tierra C-137",
      "Planeta",
      8000000000,
      "C-137",
      "desc"
    );

    expect(loc.id).toBe("1");
    expect(loc.nombre).toBe("Tierra C-137");
    expect(loc.dimension).toBe("C-137");
  });

  test("error si id vacío", () => {
    expect(() =>
      new Localizacion("", "Tierra", "Planeta", 1, "dim", "desc")
    ).toThrow();
  });

  test("error si nombre vacío", () => {
    expect(() =>
      new Localizacion("1", "", "Planeta", 1, "dim", "desc")
    ).toThrow();
  });

  test("error si dimensión string vacía", () => {
    expect(() =>
      new Localizacion("1", "Tierra", "Planeta", 1, "", "desc")
    ).toThrow();
  });

  test("error si descripción vacía", () => {
    expect(() =>
      new Localizacion("1", "Tierra", "Planeta", 1, "dim", "")
    ).toThrow();
  });

  test("error si población negativa", () => {
    expect(() =>
      new Localizacion("1", "Tierra", "Planeta", -1, "dim", "desc")
    ).toThrow();
  });

  test("permite población 0", () => {
    const loc = new Localizacion(
      "1",
      "Vacío",
      "Planeta",
      0,
      "dim",
      "desc"
    );

    expect(loc.poblacionAproximada).toBe(0);
  });

  test("error si campos solo espacios", () => {
    expect(() =>
      new Localizacion("   ", "   ", "Planeta", 1, "   ", "   ")
    ).toThrow();
  });

  test("NO falla cuando dimension no es string (rama typeof falsa)", () => {
    const loc = new Localizacion(
      "1",
      "Lugar",
      "Planeta",
      10,
      null,
      "desc"
    );

    expect(loc.dimension).toBeNull();
  });

});