import { describe, expect, test } from "vitest";
import { Personaje } from "../src/core/models/personajes.js";

describe("Personaje", () => {

  test("crea un personaje válido correctamente", () => {
    const personaje = new Personaje(
      "1",
      "Rick Sanchez",
      "especie1",
      "dimension1",
      "vivo",
      "Independiente",
      10,
      "Científico brillante"
    );

    expect(personaje.id).toBe("1");
    expect(personaje.nombre).toBe("Rick Sanchez");
    expect(personaje.especie).toBe("especie1");
    expect(personaje.dimension).toBe("dimension1");
    expect(personaje.estado).toBe("vivo");
    expect(personaje.afiliacion).toBe("Independiente");
    expect(personaje.nivelInteligencia).toBe(10);
    expect(personaje.descripcion).toBe("Científico brillante");
  });

  test("lanza error si el ID está vacío", () => {
    expect(() => {
      new Personaje(
        "",
        "Rick",
        "esp",
        "dim",
        "vivo",
        "Independiente",
        5,
        "desc"
      );
    }).toThrow();
  });

  test("lanza error si el nombre está vacío", () => {
    expect(() => {
      new Personaje(
        "1",
        "",
        "esp",
        "dim",
        "vivo",
        "Independiente",
        5,
        "desc"
      );
    }).toThrow();
  });

  test("lanza error si la especie está vacía", () => {
    expect(() => {
      new Personaje(
        "1",
        "Rick",
        "",
        "dim",
        "vivo",
        "Independiente",
        5,
        "desc"
      );
    }).toThrow();
  });

  test("lanza error si la dimensión está vacía", () => {
    expect(() => {
      new Personaje(
        "1",
        "Rick",
        "esp",
        "",
        "vivo",
        "Independiente",
        5,
        "desc"
      );
    }).toThrow();
  });

  test("lanza error si la descripción está vacía", () => {
    expect(() => {
      new Personaje(
        "1",
        "Rick",
        "esp",
        "dim",
        "vivo",
        "Independiente",
        5,
        ""
      );
    }).toThrow();
  });

  test("lanza error si el nivel de inteligencia es 0", () => {
    expect(() => {
      new Personaje(
        "1",
        "Rick",
        "esp",
        "dim",
        "vivo",
        "Independiente",
        0,
        "desc"
      );
    }).toThrow();
  });

  test("lanza error si el nivel de inteligencia es mayor que 10", () => {
    expect(() => {
      new Personaje(
        "1",
        "Rick",
        "esp",
        "dim",
        "vivo",
        "Independiente",
        11,
        "desc"
      );
    }).toThrow();
  });

  test("lanza error si el nivel de inteligencia es negativo", () => {
    expect(() => {
      new Personaje(
        "1",
        "Rick",
        "esp",
        "dim",
        "vivo",
        "Independiente",
        -1,
        "desc"
      );
    }).toThrow();
  });

  test("lanza error si los campos tienen solo espacios", () => {
    expect(() => {
      new Personaje(
        "   ",
        "   ",
        "   ",
        "   ",
        "vivo",
        "Independiente",
        5,
        "   "
      );
    }).toThrow();
  });

  test("especie null", () => {
    const personaje = new Personaje(
      "1",
      "Rick",
      null,
      "dim",
      "vivo",
      "Independiente",
      5,
      "desc"
    );

    expect(personaje.especie).toBeNull();
  });

  test("dimension null", () => {
    const personaje = new Personaje(
      "1",
      "Rick",
      "esp",
      null,
      "vivo",
      "Independiente",
      5,
      "desc"
    );

    expect(personaje.dimension).toBeNull();
  });

});