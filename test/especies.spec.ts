import { describe, expect, test } from "vitest";
import { Especie } from "../src/especies";

describe("Especie", () => {

  test("crea una especie válida correctamente", () => {
    const especie = new Especie(
      "1",
      "Humano",
      "Tierra",
      "humanoide",
      80,
      "Especie dominante en la Tierra"
    );

    expect(especie.id).toBe("1");
    expect(especie.nombre).toBe("Humano");
    expect(especie.origen).toBe("Tierra");
    expect(especie.tipo).toBe("humanoide");
    expect(especie.esperanzaVida).toBe(80);
    expect(especie.descripcion).toBe("Especie dominante en la Tierra");
  });

  test("lanza error si el ID está vacío", () => {
    expect(() => {
      new Especie(
        "",
        "Humano",
        "Tierra",
        "humanoide",
        80,
        "desc"
      );
    }).toThrow();
  });

  test("lanza error si el nombre está vacío", () => {
    expect(() => {
      new Especie(
        "1",
        "",
        "Tierra",
        "humanoide",
        80,
        "desc"
      );
    }).toThrow();
  });

  test("lanza error si el origen está vacío", () => {
    expect(() => {
      new Especie(
        "1",
        "Humano",
        "",
        "humanoide",
        80,
        "desc"
      );
    }).toThrow();
  });

  test("lanza error si la descripción está vacía", () => {
    expect(() => {
      new Especie(
        "1",
        "Humano",
        "Tierra",
        "humanoide",
        80,
        ""
      );
    }).toThrow();
  });

  test("lanza error si la esperanza de vida es 0", () => {
    expect(() => {
      new Especie(
        "1",
        "Humano",
        "Tierra",
        "humanoide",
        0,
        "desc"
      );
    }).toThrow();
  });

  test("lanza error si la esperanza de vida es negativa", () => {
    expect(() => {
      new Especie(
        "1",
        "Humano",
        "Tierra",
        "humanoide",
        -10,
        "desc"
      );
    }).toThrow();
  });

  test("lanza error si los campos tienen solo espacios", () => {
    expect(() => {
      new Especie(
        "   ",
        "   ",
        "   ",
        "humanoide",
        10,
        "   "
      );
    }).toThrow();
  });

});