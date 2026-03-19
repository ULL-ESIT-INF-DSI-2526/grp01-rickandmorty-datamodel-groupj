import { describe, expect, test, beforeEach } from "vitest";
import { Localizacion } from "../src/localizacion";

describe("test constructor de clase localizacion", () => {
  let localizacion: Localizacion;
  beforeEach(() => {
    localizacion = new Localizacion(
      "L1",
      "Tierra C-137",
      "Planeta",
      "D1",
      2000,
      "Ecosistema oceanico, arboleado y rocoso.",
    );
  });

  test("se crea una localizacion", () => {
    expect(localizacion instanceof Localizacion).toBe(true);
  });

  test("atributos de localizacion", () => {
    expect(localizacion.id).toBe("L1");
    expect(localizacion.nombre).toBe("Tierra C-137");
    expect(localizacion.tipo).toBe("Planeta");
    expect(localizacion.dimension).toBe("D1");
    expect(localizacion.poblacion).toBe(2000);
    expect(localizacion.descripcion).toBe(
      "Ecosistema oceanico, arboleado y rocoso.",
    );
  });
});
