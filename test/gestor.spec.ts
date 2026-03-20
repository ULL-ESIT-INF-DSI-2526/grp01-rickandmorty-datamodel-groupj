import { describe, expect, test, beforeEach } from "vitest";
import { GestorMultiversal } from "../src/gestor";
import { Dimension } from "../src/Dimension";
import { Especie } from "../src/especies";
import { Personaje } from "../src/personajes";
import { Localizacion } from "../src/localizaciones";
import { Invento } from "../src/inventos";

let gestor: GestorMultiversal;

beforeEach(() => {
  gestor = new GestorMultiversal();
});

describe("GestorMultiversal - Dimensiones", () => {

  test("addDimension correcto", () => {
    const d = new Dimension("C-1", "Dimension 1", "activa", 5, "desc");
    gestor.addDimension(d);
    expect(gestor.lengthDimensiones()).toBe(1);
  });

  test("addDimension id duplicado", () => {
    const d = new Dimension("C-1", "Dimension 1", "activa", 5, "desc");
    gestor.addDimension(d);
    expect(() => gestor.addDimension(d)).toThrow();
  });

  test("addDimension nombre duplicado normalizado", () => {
    const d1 = new Dimension("C-1", "Dimensión", "activa", 5, "desc");
    const d2 = new Dimension("C-2", "dimension", "activa", 5, "desc");

    gestor.addDimension(d1);
    expect(() => gestor.addDimension(d2)).toThrow();
  });

  test("removeDimension inexistente", () => {
    expect(() => gestor.removeDimension("X")).toThrow();
  });

  test("removeDimension elimina localizaciones y desasocia correctamente", () => {
    const d1 = new Dimension("C-1", "D1", "activa", 5, "desc");
    const d2 = new Dimension("C-2", "D2", "activa", 5, "desc");

    gestor.addDimension(d1);
    gestor.addDimension(d2);

    const loc = new Localizacion("L1", "Tierra", "Planeta", 1000, "C-1", "desc");
    gestor.addLocalizacion(loc);

    const e1 = new Especie("E1", "Humano", "C-1", "humanoide", 80, "desc");
    const e2 = new Especie("E2", "Alien", "C-2", "amorfo", 50, "desc");

    gestor.addEspecie(e1);
    gestor.addEspecie(e2);

    const p1 = new Personaje("P1", "Rick", "E1", "C-1", "vivo", "Independiente", 10, "desc");
    const p2 = new Personaje("P2", "Morty", "E2", "C-2", "vivo", "Independiente", 5, "desc");

    gestor.addPersonaje(p1);
    gestor.addPersonaje(p2);

    gestor.removeDimension("C-1");

    expect(p1.dimension).toBeNull(); // entra en if
    expect(p2.dimension).toBe("C-2"); // no entra
    expect(e1.origen).toBeNull();
    expect(e2.origen).toBe("C-2");
    expect(gestor.lengthLocalizaciones()).toBe(0);
  });

  test("updateDimension inexistente", () => {
    expect(() => gestor.updateDimension("X", { descripcion: "nueva" })).toThrow();
  });

  test("updateDimension actualiza descripcion", () => {
    const d = new Dimension("C-1", "D1", "activa", 5, "desc");
    gestor.addDimension(d);

    gestor.updateDimension("C-1", { descripcion: "descripcion actualizada" });

    expect(d.descripcion).toBe("descripcion actualizada");
  });

  test("updateDimension actualiza estado y nivel", () => {
    const d = new Dimension("C-1", "D1", "activa", 5, "desc");
    gestor.addDimension(d);

    gestor.updateDimension("C-1", { estadoDim: "destruida", nivelTec: 9 });

    expect(d.estadoDim).toBe("destruida");
    expect(d.nivelTec).toBe(9);
  });

  test("updateDimension nombre vacio", () => {
    const d = new Dimension("C-1", "D1", "activa", 5, "desc");
    gestor.addDimension(d);

    expect(() => gestor.updateDimension("C-1", { nombre: "   " })).toThrow();
  });

  test("updateDimension nivel fuera de rango", () => {
    const d = new Dimension("C-1", "D1", "activa", 5, "desc");
    gestor.addDimension(d);

    expect(() => gestor.updateDimension("C-1", { nivelTec: 11 })).toThrow();
  });

  test("updateDimension descripcion vacia", () => {
    const d = new Dimension("C-1", "D1", "activa", 5, "desc");
    gestor.addDimension(d);

    expect(() => gestor.updateDimension("C-1", { descripcion: "" })).toThrow();
  });

  test("updateDimension nombre duplicado", () => {
    const d1 = new Dimension("C-1", "Dimension 1", "activa", 5, "desc");
    const d2 = new Dimension("C-2", "Dimension 2", "activa", 5, "desc");
    gestor.addDimension(d1);
    gestor.addDimension(d2);

    expect(() => gestor.updateDimension("C-2", { nombre: "dimension 1" })).toThrow();
  });

  test("updateDimension permite mantener el mismo nombre", () => {
    const d = new Dimension("C-1", "Dimension 1", "activa", 5, "desc");
    gestor.addDimension(d);

    expect(() => gestor.updateDimension("C-1", { nombre: "Dimension 1" })).not.toThrow();
  });

});

describe("GestorMultiversal - Especies", () => {

  test("addEspecie correcto (dimension)", () => {
    const d = new Dimension("C-1", "D1", "activa", 5, "desc");
    gestor.addDimension(d);

    const e = new Especie("E1", "Humano", "C-1", "humanoide", 80, "desc");
    gestor.addEspecie(e);

    expect(gestor.lengthEspecies()).toBe(1);
  });

  test("addEspecie correcto (localizacion)", () => {
    const d = new Dimension("C-1", "D1", "activa", 5, "desc");
    gestor.addDimension(d);

    const l = new Localizacion("L1", "Tierra", "Planeta", 1000, "C-1", "desc");
    gestor.addLocalizacion(l);

    const e = new Especie("E1", "Alien", "L1", "amorfo", 50, "desc");
    gestor.addEspecie(e);

    expect(gestor.lengthEspecies()).toBe(1);
  });

  test("addEspecie origen null", () => {
    const e = new Especie("E1", "Humano", null, "humanoide", 80, "desc");
    expect(() => gestor.addEspecie(e)).toThrow();
  });

  test("addEspecie origen inexistente", () => {
    const e = new Especie("E1", "Humano", "X", "humanoide", 80, "desc");
    expect(() => gestor.addEspecie(e)).toThrow();
  });

  test("addEspecie id duplicado", () => {
    const d = new Dimension("C-1", "D1", "activa", 5, "desc");
    gestor.addDimension(d);

    const e1 = new Especie("E1", "Humano", "C-1", "humanoide", 80, "desc");
    const e2 = new Especie("E1", "Alien", "C-1", "amorfo", 50, "desc");

    gestor.addEspecie(e1);
    expect(() => gestor.addEspecie(e2)).toThrow();
  });

  test("addEspecie duplicada por contenido", () => {
    const d = new Dimension("C-1", "D1", "activa", 5, "desc");
    gestor.addDimension(d);

    const e1 = new Especie("E1", "Humano", "C-1", "humanoide", 80, "desc");
    const e2 = new Especie("E2", "humano", "C-1", "humanoide", 80, "desc");

    gestor.addEspecie(e1);
    expect(() => gestor.addEspecie(e2)).toThrow();
  });

  test("removeEspecie desasocia personajes correctamente", () => {
    const d = new Dimension("C-1", "D1", "activa", 5, "desc");
    gestor.addDimension(d);

    const e = new Especie("E1", "Humano", "C-1", "humanoide", 80, "desc");
    gestor.addEspecie(e);

    const p = new Personaje("P1", "Rick", "E1", "C-1", "vivo", "Independiente", 10, "desc");
    gestor.addPersonaje(p);

    gestor.removeEspecie("E1");

    expect(p.especie).toBeNull();
  });

  test("removeEspecie no afecta otros personajes", () => {
    const d = new Dimension("C-1", "D1", "activa", 5, "desc");
    gestor.addDimension(d);

    const e1 = new Especie("E1", "Humano", "C-1", "humanoide", 80, "desc");
    const e2 = new Especie("E2", "Alien", "C-1", "amorfo", 50, "desc");

    gestor.addEspecie(e1);
    gestor.addEspecie(e2);

    const p = new Personaje("P1", "Rick", "E2", "C-1", "vivo", "Independiente", 10, "desc");
    gestor.addPersonaje(p);

    gestor.removeEspecie("E1");

    expect(p.especie).toBe("E2");
  });

  test("removeEspecie inexistente", () => {
    expect(() => gestor.removeEspecie("X")).toThrow();
  });

});

describe("GestorMultiversal - Personajes", () => {

  test("addPersonaje correcto", () => {
    const d = new Dimension("C-1", "D1", "activa", 5, "desc");
    gestor.addDimension(d);

    const e = new Especie("E1", "Humano", "C-1", "humanoide", 80, "desc");
    gestor.addEspecie(e);

    const p = new Personaje("P1", "Rick", "E1", "C-1", "vivo", "Independiente", 10, "desc");
    gestor.addPersonaje(p);

    expect(gestor.lengthPersonajes()).toBe(1);
  });

  test("addPersonaje con null", () => {
    const p = new Personaje("P1", "Rick", null, "C-1", "vivo", "Independiente", 10, "desc");
    expect(() => gestor.addPersonaje(p)).toThrow();
  });

  test("addPersonaje especie inexistente", () => {
    const d = new Dimension("C-1", "D1", "activa", 5, "desc");
    gestor.addDimension(d);

    const p = new Personaje("P1", "Rick", "E999", "C-1", "vivo", "Independiente", 10, "desc");

    expect(() => gestor.addPersonaje(p)).toThrow();
  });

  test("addPersonaje dimension inexistente", () => {
    const d = new Dimension("C-1", "D1", "activa", 5, "desc");
    gestor.addDimension(d);

    const e = new Especie("E1", "Humano", "C-1", "humanoide", 80, "desc");
    gestor.addEspecie(e);

    const p = new Personaje("P1", "Rick", "E1", "C-999", "vivo", "Independiente", 10, "desc");

    expect(() => gestor.addPersonaje(p)).toThrow();
  });

  test("addPersonaje duplicado", () => {
    const d = new Dimension("C-1", "D1", "activa", 5, "desc");
    gestor.addDimension(d);

    const e = new Especie("E1", "Humano", "C-1", "humanoide", 80, "desc");
    gestor.addEspecie(e);

    const p1 = new Personaje("P1", "Rick", "E1", "C-1", "vivo", "Independiente", 10, "desc");
    const p2 = new Personaje("P2", "rick", "E1", "C-1", "vivo", "Independiente", 10, "desc");

    gestor.addPersonaje(p1);
    expect(() => gestor.addPersonaje(p2)).toThrow();
  });

  test("addPersonaje id duplicado (no duplicado lógico)", () => {
    const d = new Dimension("C-1", "D1", "activa", 5, "desc");
    gestor.addDimension(d);

    const e = new Especie("E1", "Humano", "C-1", "humanoide", 80, "desc");
    gestor.addEspecie(e);

    const p1 = new Personaje("P1", "Rick", "E1", "C-1", "vivo", "Independiente", 10, "desc");
    const p2 = new Personaje("P1", "Morty", "E1", "C-1", "vivo", "Independiente", 5, "desc");

    gestor.addPersonaje(p1);

    expect(() => gestor.addPersonaje(p2)).toThrow();
  });

  test("removePersonaje desasocia inventos", () => {
    const d = new Dimension("C-1", "D1", "activa", 5, "desc");
    gestor.addDimension(d);

    const e = new Especie("E1", "Humano", "C-1", "humanoide", 80, "desc");
    gestor.addEspecie(e);

    const p = new Personaje("P1", "Rick", "E1", "C-1", "vivo", "Independiente", 10, "desc");
    gestor.addPersonaje(p);

    const i = new Invento("I1", "Portal", "P1", "Arma", 5, "desc");
    gestor.addInvento(i);

    gestor.removePersonaje("P1");

    expect(i.inventor).toBeNull();
  });

  test("removePersonaje no afecta inventos de otros", () => {
    const d = new Dimension("C-1", "D1", "activa", 5, "desc");
    gestor.addDimension(d);

    const e = new Especie("E1", "Humano", "C-1", "humanoide", 80, "desc");
    gestor.addEspecie(e);

    const p1 = new Personaje("P1", "Rick", "E1", "C-1", "vivo", "Independiente", 10, "desc");
    const p2 = new Personaje("P2", "Morty", "E1", "C-1", "vivo", "Independiente", 5, "desc");

    gestor.addPersonaje(p1);
    gestor.addPersonaje(p2);

    const i = new Invento("I1", "Gun", "P2", "Arma", 5, "desc");
    gestor.addInvento(i);

    gestor.removePersonaje("P1");

    expect(i.inventor).toBe("P2");
  });

  test("removePersonaje inexistente", () => {
    expect(() => gestor.removePersonaje("X")).toThrow();
  });

});

describe("GestorMultiversal - Localizaciones", () => {

  test("addLocalizacion correcto", () => {
    const d = new Dimension("C-1", "D1", "activa", 5, "desc");
    gestor.addDimension(d);

    const l = new Localizacion("L1", "Tierra", "Planeta", 1000, "C-1", "desc");
    gestor.addLocalizacion(l);

    expect(gestor.lengthLocalizaciones()).toBe(1);
  });

  test("addLocalizacion dimension null", () => {
    const l = new Localizacion("L1", "Tierra", "Planeta", 1000, null as any, "desc");
    expect(() => gestor.addLocalizacion(l)).toThrow();
  });

  test("addLocalizacion dimension inexistente", () => {
    const l = new Localizacion("L1", "Tierra", "Planeta", 1000, "X", "desc");
    expect(() => gestor.addLocalizacion(l)).toThrow();
  });

  test("addLocalizacion duplicada", () => {
    const d = new Dimension("C-1", "D1", "activa", 5, "desc");
    gestor.addDimension(d);

    const l1 = new Localizacion("L1", "Tierra", "Planeta", 1000, "C-1", "desc");
    const l2 = new Localizacion("L2", "tierra", "Planeta", 1000, "C-1", "desc");

    gestor.addLocalizacion(l1);
    expect(() => gestor.addLocalizacion(l2)).toThrow();
  });

  test("addLocalizacion id duplicado (no duplicado lógico)", () => {
    const d = new Dimension("C-1", "D1", "activa", 5, "desc");
    gestor.addDimension(d);

    const l1 = new Localizacion("L1", "Tierra", "Planeta", 1000, "C-1", "desc");
    const l2 = new Localizacion("L1", "Marte", "Planeta", 1000, "C-1", "desc");

    gestor.addLocalizacion(l1);

    expect(() => gestor.addLocalizacion(l2)).toThrow("El ID de la localización ya existe.");
  });

  test("removeLocalizacion desasocia especies", () => {
    const d = new Dimension("C-1", "D1", "activa", 5, "desc");
    gestor.addDimension(d);

    const l = new Localizacion("L1", "Tierra", "Planeta", 1000, "C-1", "desc");
    gestor.addLocalizacion(l);

    const e = new Especie("E1", "Humano", "L1", "humanoide", 80, "desc");
    gestor.addEspecie(e);

    gestor.removeLocalizacion("L1");

    expect(e.origen).toBeNull();
  });

  test("removeLocalizacion no afecta especies no relacionadas", () => {
    const d = new Dimension("C-1", "D1", "activa", 5, "desc");
    gestor.addDimension(d);

    const l1 = new Localizacion("L1", "Tierra", "Planeta", 1000, "C-1", "desc");
    const l2 = new Localizacion("L2", "Marte", "Planeta", 1000, "C-1", "desc");

    gestor.addLocalizacion(l1);
    gestor.addLocalizacion(l2);

    const e = new Especie("E1", "Humano", "L2", "humanoide", 80, "desc");
    gestor.addEspecie(e);

    gestor.removeLocalizacion("L1");

    expect(e.origen).toBe("L2");
  });

  test("removeLocalizacion inexistente", () => {
    expect(() => gestor.removeLocalizacion("X")).toThrow();
  });

});

describe("GestorMultiversal - Inventos", () => {

  test("addInvento correcto", () => {
    const d = new Dimension("C-1", "D1", "activa", 5, "desc");
    gestor.addDimension(d);

    const e = new Especie("E1", "Humano", "C-1", "humanoide", 80, "desc");
    gestor.addEspecie(e);

    const p = new Personaje("P1", "Rick", "E1", "C-1", "vivo", "Independiente", 10, "desc");
    gestor.addPersonaje(p);

    const i = new Invento("I1", "Portal", "P1", "Arma", 5, "desc");
    gestor.addInvento(i);

    expect(gestor.lengthInventos()).toBe(1);
  });

  test("addInvento inventor null", () => {
    const i = new Invento("I1", "Portal", null as any, "Arma", 5, "desc");
    expect(() => gestor.addInvento(i)).toThrow();
  });

  test("addInvento inventor inexistente", () => {
    const i = new Invento("I1", "Portal", "P999", "Arma", 5, "desc");
    expect(() => gestor.addInvento(i)).toThrow();
  });

  test("addInvento id duplicado", () => {
    const d = new Dimension("C-1", "D1", "activa", 5, "desc");
    gestor.addDimension(d);

    const e = new Especie("E1", "Humano", "C-1", "humanoide", 80, "desc");
    gestor.addEspecie(e);

    const p = new Personaje("P1", "Rick", "E1", "C-1", "vivo", "Independiente", 10, "desc");
    gestor.addPersonaje(p);

    const i1 = new Invento("I1", "Gun", "P1", "Arma", 5, "desc");
    const i2 = new Invento("I1", "Otra", "P1", "Arma", 5, "desc");

    gestor.addInvento(i1);
    expect(() => gestor.addInvento(i2)).toThrow();
  });

  test("addInvento duplicado normalizado", () => {
    const d = new Dimension("C-1", "D1", "activa", 5, "desc");
    gestor.addDimension(d);

    const e = new Especie("E1", "Humano", "C-1", "humanoide", 80, "desc");
    gestor.addEspecie(e);

    const p = new Personaje("P1", "Rick", "E1", "C-1", "vivo", "Independiente", 10, "desc");
    gestor.addPersonaje(p);

    const i1 = new Invento("I1", "Portal Gun", "P1", "Arma", 5, "desc");
    const i2 = new Invento("I2", "portal   gun", "P1", "Arma", 5, "desc");

    gestor.addInvento(i1);
    expect(() => gestor.addInvento(i2)).toThrow();
  });

  test("removeInvento inexistente", () => {
    expect(() => gestor.removeInvento("X")).toThrow();
  });

  test("removeInvento correcto", () => {
    const d = new Dimension("C-1", "D1", "activa", 5, "desc");
    gestor.addDimension(d);

    const e = new Especie("E1", "Humano", "C-1", "humanoide", 80, "desc");
    gestor.addEspecie(e);

    const p = new Personaje("P1", "Rick", "E1", "C-1", "vivo", "Independiente", 10, "desc");
    gestor.addPersonaje(p);

    const i = new Invento("I1", "Portal", "P1", "Arma", 5, "desc");
    gestor.addInvento(i);

    gestor.removeInvento("I1");

    expect(gestor.lengthInventos()).toBe(0);
  });

});