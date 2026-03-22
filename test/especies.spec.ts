import { describe, expect, test } from "vitest";
import { Especie } from "../src/core/models/especies.js";

describe("Especie", () => {

  test("crea una especie válida correctamente", () => {
    const especie = new Especie(
      "1",
      "Humano",
      "Tierra",
      "humanoide",
      80,
      "desc"
    );

    expect(especie.id).toBe("1");
    expect(especie.nombre).toBe("Humano");
    expect(especie.origen).toBe("Tierra");
  });

  test("permite origen null", () => {
    const especie = new Especie(
      "1",
      "Alien",
      null,
      "amorfo",
      50,
      "desc"
    );

    expect(especie.origen).toBeNull();
  });

  test("error si id vacío", () => {
    expect(() =>
      new Especie("", "Humano", "Tierra", "humanoide", 80, "desc")
    ).toThrow("ID vacío");
  });

  test("error si nombre vacío", () => {
    expect(() =>
      new Especie("1", "", "Tierra", "humanoide", 80, "desc")
    ).toThrow("Nombre vacío");
  });

  test("error si origen string vacío", () => {
    expect(() =>
      new Especie("1", "Humano", "", "humanoide", 80, "desc")
    ).toThrow("Origen vacío");
  });

  test("NO falla si origen es null (no entra en trim)", () => {
    expect(() =>
      new Especie("1", "Humano", null, "humanoide", 80, "desc")
    ).not.toThrow();
  });

  test("error si descripción vacía", () => {
    expect(() =>
      new Especie("1", "Humano", "Tierra", "humanoide", 80, "")
    ).toThrow("Descripción vacía");
  });

  test("error si esperanza de vida <= 0", () => {
    expect(() =>
      new Especie("1", "Humano", "Tierra", "humanoide", 0, "desc")
    ).toThrow("Esperanza de vida inválida");

    expect(() =>
      new Especie("1", "Humano", "Tierra", "humanoide", -1, "desc")
    ).toThrow("Esperanza de vida inválida");
  });

  test("error si campos tienen solo espacios", () => {
    expect(() =>
      new Especie("   ", "   ", "   ", "humanoide", 10, "   ")
    ).toThrow();
  });

});