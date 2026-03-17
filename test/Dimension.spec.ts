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
});
