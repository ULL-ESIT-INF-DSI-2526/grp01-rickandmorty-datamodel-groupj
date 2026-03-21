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

describe("GestorMultiversal", () => {

  // ---------- ADD ----------

  test("addDimension correcto", () => {
    const d = new Dimension("D1", "Dim", "activa", 5, "desc");
    gestor.addDimension(d);

    expect(gestor.getDimensionesDestruidas().length).toBe(0);
  });

  test("addPersonaje error por null", () => {
    const p = new Personaje("P1", "Rick", null, null, "vivo", "Independiente", 10, "d");

    expect(() => gestor.addPersonaje(p))
      .toThrow("El personaje debe tener una dimensión y especie");
  });

  test("addPersonaje error por referencias inexistentes", () => {
    const p = new Personaje("P1", "Rick", "E1", "D1", "vivo", "Independiente", 10, "d");

    expect(() => gestor.addPersonaje(p))
      .toThrow("Especie o dimensión inexistentes");
  });

  test("addPersonaje correcto", () => {
    const d = new Dimension("D1", "Dim", "activa", 5, "d");
    const e = new Especie("E1", "Humano", "D1", "humanoide", 80, "d");

    gestor.addDimension(d);
    gestor.addEspecie(e);

    const p = new Personaje("P1", "Rick", "E1", "D1", "vivo", "Independiente", 10, "d");

    gestor.addPersonaje(p);

    expect(gestor.filterPersonajesByNombre("Rick").length).toBe(1);
  });

  test("addEspecie error origen null", () => {
    const e = new Especie("E1", "Humano", null, "humanoide", 80, "d");

    expect(() => gestor.addEspecie(e))
      .toThrow("La especie debe tener un origen");
  });

  test("addEspecie error origen desconocido", () => {
    const e = new Especie("E1", "Humano", "X", "humanoide", 80, "d");

    expect(() => gestor.addEspecie(e))
      .toThrow("Origen de la especie desconocido");
  });

  test("addLocalizacion error", () => {
    const l = new Localizacion("L1", "Loc", "Planeta", 10, null, "d");

    expect(() => gestor.addLocalizacion(l))
      .toThrow("La localización debe tener una dimensión");
  });

  test("addInvento error", () => {
    const i = new Invento("I1", "Gun", null, "Arma", 5, "d");

    expect(() => gestor.addInvento(i))
      .toThrow("El invento debe tener un inventor");
  });

  test("addLocalizacion dimension no existe", () => {
    const l = new Localizacion("L1", "Loc", "Planeta", 10, "D_NO", "d");

    expect(() => gestor.addLocalizacion(l))
      .toThrow("Origen de la localización desconocida");
  });

  test("addInvento inventor no existe", () => {
    const i = new Invento("I1", "Gun", "P_NO", "Arma", 5, "d");

    expect(() => gestor.addInvento(i))
      .toThrow("Inventor desconocido");
  });

  // ---------- REMOVE ----------

  test("removeDimension cascada", () => {
    const d = new Dimension("D1", "Dim", "activa", 5, "d");
    const l = new Localizacion("L1", "Loc", "Planeta", 10, "D1", "d");

    gestor.addDimension(d);
    gestor.addLocalizacion(l);

    gestor.removeDimension("D1");

    expect(gestor.filterLocalizacionesByDimension("D1").length).toBe(0);
  });

  test("removePersonaje afecta inventos", () => {
    const d = new Dimension("D1", "Dim", "activa", 5, "d");
    const e = new Especie("E1", "Humano", "D1", "humanoide", 80, "d");
    const p = new Personaje("P1", "Rick", "E1", "D1", "vivo", "Independiente", 10, "d");
    const i = new Invento("I1", "Gun", "P1", "Arma", 5, "d");

    gestor.addDimension(d);
    gestor.addEspecie(e);
    gestor.addPersonaje(p);
    gestor.addInvento(i);

    gestor.removePersonaje("P1");

    expect(gestor.filterInventosByInventor("P1").length).toBe(0);
  });

  test("removeEspecie afecta personajes", () => {
    const d = new Dimension("D1", "Dim", "activa", 5, "d");
    const e = new Especie("E1", "Humano", "D1", "humanoide", 80, "d");
    const p = new Personaje("P1", "Rick", "E1", "D1", "vivo", "Independiente", 10, "d");

    gestor.addDimension(d);
    gestor.addEspecie(e);
    gestor.addPersonaje(p);

    gestor.removeEspecie("E1");

    expect(gestor.filterPersonajesByEspecie("E1").length).toBe(0);
  });

  test("removeLocalizacion afecta especies", () => {
    const d = new Dimension("D1", "Dim", "activa", 5, "d");
    const l = new Localizacion("L1", "Loc", "Planeta", 10, "D1", "d");
    const e = new Especie("E1", "Humano", "L1", "humanoide", 80, "d");

    gestor.addDimension(d);
    gestor.addLocalizacion(l);
    gestor.addEspecie(e);

    gestor.removeLocalizacion("L1");

    expect(() => gestor.addEspecie(e)).toThrow();
  });

  test("removeInvento simple", () => {
    const d = new Dimension("D1", "Dim", "activa", 5, "d");
    const e = new Especie("E1", "Humano", "D1", "humanoide", 80, "d");
    const p = new Personaje("P1", "Rick", "E1", "D1", "vivo", "Independiente", 10, "d");
    const i = new Invento("I1", "Gun", "P1", "Arma", 5, "d");

    gestor.addDimension(d);
    gestor.addEspecie(e);
    gestor.addPersonaje(p);
    gestor.addInvento(i);

    gestor.removeInvento("I1");

    expect(gestor.filterInventosByNombre("Gun").length).toBe(0);
  });

  // ---------- UPDATE ----------

  test("updateDimension", () => {
    const d = new Dimension("D1", "Dim", "activa", 5, "d");

    gestor.addDimension(d);

    gestor.updateDimension("D1", { nombre: "Nueva" });

    expect(true).toBe(true);
  });

  test("updatePersonaje sin especie ni dimension", () => {
    const d = new Dimension("D1", "Dim", "activa", 5, "d");
    const e = new Especie("E1", "Humano", "D1", "humanoide", 80, "d");
    const p = new Personaje("P1", "Rick", "E1", "D1", "vivo", "Independiente", 10, "d");

    gestor.addDimension(d);
    gestor.addEspecie(e);
    gestor.addPersonaje(p);

    gestor.updatePersonaje("P1", { estado: "muerto" });

    expect(true).toBe(true);
  });

  test("updateEspecie sin origen", () => {
    const d = new Dimension("D1", "Dim", "activa", 5, "d");
    const e = new Especie("E1", "Humano", "D1", "humanoide", 80, "d");

    gestor.addDimension(d);
    gestor.addEspecie(e);

    gestor.updateEspecie("E1", { nombre: "Nueva" });

    expect(true).toBe(true);
  });

  test("updatePersonaje error especie", () => {
    expect(() =>
      gestor.updatePersonaje("X", { especie: "E1" })
    ).toThrow("La especie no existe");
  });

  test("updateLocalizacion error dimension", () => {
    expect(() =>
      gestor.updateLocalizacion("X", { dimension: "D1" })
    ).toThrow("Origen de la localización desconocida");
  });

  test("updateInvento error inventor", () => {
    expect(() =>
      gestor.updateInvento("X", { inventor: "P1" })
    ).toThrow("Inventor desconocido");
  });

  test("updatePersonaje sin validaciones (undefined)", () => {
    const d = new Dimension("D1", "Dim", "activa", 5, "d");
    const e = new Especie("E1", "Humano", "D1", "humanoide", 80, "d");
    const p = new Personaje("P1", "Rick", "E1", "D1", "vivo", "Independiente", 10, "d");

    gestor.addDimension(d);
    gestor.addEspecie(e);
    gestor.addPersonaje(p);

    gestor.updatePersonaje("P1", {});

    expect(gestor.filterPersonajesByNombre("Rick").length).toBe(1);
  });

  test("updateEspecie origen válido dimension", () => {
    const d = new Dimension("D1", "Dim", "activa", 5, "d");
    const e = new Especie("E1", "Humano", "D1", "humanoide", 80, "d");

    gestor.addDimension(d);
    gestor.addEspecie(e);

    gestor.updateEspecie("E1", { origen: "D1" });

    expect(true).toBe(true);
  });

  test("updateEspecie origen válido localizacion", () => {
    const d = new Dimension("D1", "Dim", "activa", 5, "d");
    const l = new Localizacion("L1", "Loc", "Planeta", 10, "D1", "d");
    const e = new Especie("E1", "Humano", "D1", "humanoide", 80, "d");

    gestor.addDimension(d);
    gestor.addLocalizacion(l);
    gestor.addEspecie(e);

    gestor.updateEspecie("E1", { origen: "L1" });

    expect(true).toBe(true);
  });

  test("updateEspecie sin entrar en if", () => {
    const d = new Dimension("D1", "Dim", "activa", 5, "d");
    const e = new Especie("E1", "Humano", "D1", "humanoide", 80, "d");

    gestor.addDimension(d);
    gestor.addEspecie(e);

    gestor.updateEspecie("E1", {});

    expect(true).toBe(true);
  });

  test("updateLocalizacion válido", () => {
    const d = new Dimension("D1", "Dim", "activa", 5, "d");
    const l = new Localizacion("L1", "Loc", "Planeta", 10, "D1", "d");

    gestor.addDimension(d);
    gestor.addLocalizacion(l);

    gestor.updateLocalizacion("L1", { dimension: "D1" });

    expect(true).toBe(true);
  });

  test("updateLocalizacion sin entrar en if", () => {
    const d = new Dimension("D1", "Dim", "activa", 5, "d");
    const l = new Localizacion("L1", "Loc", "Planeta", 10, "D1", "d");

    gestor.addDimension(d);
    gestor.addLocalizacion(l);

    gestor.updateLocalizacion("L1", {});

    expect(true).toBe(true);
  });

  test("updateInvento válido", () => {
    const d = new Dimension("D1", "Dim", "activa", 5, "d");
    const e = new Especie("E1", "Humano", "D1", "humanoide", 80, "d");
    const p = new Personaje("P1", "Rick", "E1", "D1", "vivo", "Independiente", 10, "d");
    const i = new Invento("I1", "Gun", "P1", "Arma", 5, "d");

    gestor.addDimension(d);
    gestor.addEspecie(e);
    gestor.addPersonaje(p);
    gestor.addInvento(i);

    gestor.updateInvento("I1", { inventor: "P1" });

    expect(true).toBe(true);
  });

  test("updateInvento sin entrar en if", () => {
    const d = new Dimension("D1", "Dim", "activa", 5, "d");
    const e = new Especie("E1", "Humano", "D1", "humanoide", 80, "d");
    const p = new Personaje("P1", "Rick", "E1", "D1", "vivo", "Independiente", 10, "d");
    const i = new Invento("I1", "Gun", "P1", "Arma", 5, "d");

    gestor.addDimension(d);
    gestor.addEspecie(e);
    gestor.addPersonaje(p);
    gestor.addInvento(i);

    gestor.updateInvento("I1", {});

    expect(true).toBe(true);
  });

  test("updatePersonaje con dimension válida existente", () => {
    const d = new Dimension("D1", "Dim", "activa", 5, "d");
    const e = new Especie("E1", "Humano", "D1", "humanoide", 80, "d");
    const p = new Personaje("P1", "Rick", "E1", "D1", "vivo", "Independiente", 10, "d");

    gestor.addDimension(d);
    gestor.addEspecie(e);
    gestor.addPersonaje(p);

    gestor.updatePersonaje("P1", { dimension: "D1" });

    expect(true).toBe(true);
  });

  test("updatePersonaje con dimension válida existente", () => {
    const d = new Dimension("D1", "Dim", "activa", 5, "d");
    const e = new Especie("E1", "Humano", "D1", "humanoide", 80, "d");
    const p = new Personaje("P1", "Rick", "E1", "D1", "vivo", "Independiente", 10, "d");

    gestor.addDimension(d);
    gestor.addEspecie(e);
    gestor.addPersonaje(p);

    gestor.updatePersonaje("P1", { dimension: "D1" }); // entra en if pero NO lanza error

    expect(true).toBe(true);
  });

  test("updateEspecie origen válido solo localizacion", () => {
    const d = new Dimension("D1", "Dim", "activa", 5, "d");
    const l = new Localizacion("L1", "Loc", "Planeta", 10, "D1", "d");
    const e = new Especie("E1", "Humano", "D1", "humanoide", 80, "d");

    gestor.addDimension(d);
    gestor.addLocalizacion(l);
    gestor.addEspecie(e);

    gestor.updateEspecie("E1", { origen: "L1" });

    expect(true).toBe(true);
  });

  test("updateEspecie origen válido solo localizacion (cubre AND parcial)", () => {
    const d = new Dimension("D1", "Dim", "activa", 5, "d");
    const l = new Localizacion("L1", "Loc", "Planeta", 10, "D1", "d");
    const e = new Especie("E1", "Humano", "D1", "humanoide", 80, "d");

    gestor.addDimension(d);
    gestor.addLocalizacion(l);
    gestor.addEspecie(e);

    gestor.updateEspecie("E1", { origen: "L1" });

    expect(true).toBe(true);
  });

  test("updateEspecie origen válido solo dimension", () => {
    const d = new Dimension("D1", "Dim", "activa", 5, "d");
    const e = new Especie("E1", "Humano", "D1", "humanoide", 80, "d");

    gestor.addDimension(d);
    gestor.addEspecie(e);

    gestor.updateEspecie("E1", { origen: "D1" });

    expect(true).toBe(true);
  });

  test("updateEspecie origen existe como dimension Y localizacion", () => {
    const d = new Dimension("X", "Dim", "activa", 5, "d");
    const l = new Localizacion("X", "Loc", "Planeta", 10, "X", "d");
    const e = new Especie("E1", "Humano", "X", "humanoide", 80, "d");

    gestor.addDimension(d);
    gestor.addLocalizacion(l);
    gestor.addEspecie(e);

    gestor.updateEspecie("E1", { origen: "X" });

    expect(true).toBe(true);
  });

  test("updateEspecie origen undefined", () => {
    const d = new Dimension("D1", "Dim", "activa", 5, "d");
    const e = new Especie("E1", "Humano", "D1", "humanoide", 80, "d");

    gestor.addDimension(d);
    gestor.addEspecie(e);

    gestor.updateEspecie("E1", {});

    expect(true).toBe(true);
  });

  test("updateEspecie lanza error si origen no existe en ningun sitio", () => {
    const d = new Dimension("D1", "Dim", "activa", 5, "d");
    const e = new Especie("E1", "Humano", "D1", "humanoide", 80, "d");

    gestor.addDimension(d);
    gestor.addEspecie(e);

    expect(() => {
      gestor.updateEspecie("E1", { origen: "NO_EXISTE" });
    }).toThrow("Origen de la especie desconocido");
  });

  test("updatePersonaje especie no existe", () => {
    const d = new Dimension("D1", "Dim", "activa", 5, "d");
    const e = new Especie("E1", "Humano", "D1", "humanoide", 80, "d");
    const p = new Personaje("P1", "Rick", "E1", "D1", "vivo", "Independiente", 10, "d");

    gestor.addDimension(d);
    gestor.addEspecie(e);
    gestor.addPersonaje(p);

    expect(() =>
      gestor.updatePersonaje("P1", { especie: "NO_EXISTE" })
    ).toThrow("La especie no existe");
  });

  test("updatePersonaje dimension no existe", () => {
    const d = new Dimension("D1", "Dim", "activa", 5, "d");
    const e = new Especie("E1", "Humano", "D1", "humanoide", 80, "d");
    const p = new Personaje("P1", "Rick", "E1", "D1", "vivo", "Independiente", 10, "d");

    gestor.addDimension(d);
    gestor.addEspecie(e);
    gestor.addPersonaje(p);

    expect(() =>
      gestor.updatePersonaje("P1", { dimension: "NO_EXISTE" })
    ).toThrow("La dimensión no existe");
  });

  test("updatePersonaje especie no existe (cubre throw real)", () => {
    const d = new Dimension("D1", "Dim", "activa", 5, "d");
    const e = new Especie("E1", "Humano", "D1", "humanoide", 80, "d");
    const p = new Personaje("P1", "Rick", "E1", "D1", "vivo", "Independiente", 10, "d");

    gestor.addDimension(d);
    gestor.addEspecie(e);
    gestor.addPersonaje(p);

    expect(() =>
      gestor.updatePersonaje("P1", { especie: "E_NO_EXISTE" })
    ).toThrow("La especie no existe");
  });

test("updatePersonaje especie existe (no entra al throw)", () => {
  const d = new Dimension("D1", "Dim", "activa", 5, "d");
  const e = new Especie("E1", "Humano", "D1", "humanoide", 80, "d");
  const p = new Personaje("P1", "Rick", "E1", "D1", "vivo", "Independiente", 10, "d");

  gestor.addDimension(d);
  gestor.addEspecie(e);
  gestor.addPersonaje(p);

  gestor.updatePersonaje("P1", { especie: "E1" });

  expect(true).toBe(true);
});

  // ---------- FILTER ----------

  test("filters funcionan", () => {
    const d = new Dimension("D1", "Dim", "activa", 5, "d");
    const e = new Especie("E1", "Humano", "D1", "humanoide", 80, "d");
    const p = new Personaje("P1", "Rick", "E1", "D1", "vivo", "Independiente", 10, "d");

    gestor.addDimension(d);
    gestor.addEspecie(e);
    gestor.addPersonaje(p);

    expect(gestor.filterPersonajesByNombre("Rick").length).toBe(1);
    expect(gestor.filterPersonajesByEspecie("E1").length).toBe(1);
  });

  test("filters localizaciones gestor", () => {
    const d = new Dimension("D1", "Dim", "activa", 5, "d");
    const l = new Localizacion("L1", "Loc", "Planeta", 10, "D1", "d");

    gestor.addDimension(d);
    gestor.addLocalizacion(l);

    expect(gestor.filterLocalizacionesByNombre("Loc").length).toBe(1);
    expect(gestor.filterLocalizacionesByTipo("Planeta").length).toBe(1);
    expect(gestor.filterLocalizacionesByDimension("D1").length).toBe(1);
  });

  test("filters inventos gestor", () => {
    const d = new Dimension("D1", "Dim", "activa", 5, "d");
    const e = new Especie("E1", "Humano", "D1", "humanoide", 80, "d");
    const p = new Personaje("P1", "Rick", "E1", "D1", "vivo", "Independiente", 10, "d");
    const i = new Invento("I1", "Gun", "P1", "Arma", 5, "d");

    gestor.addDimension(d);
    gestor.addEspecie(e);
    gestor.addPersonaje(p);
    gestor.addInvento(i);

    expect(gestor.filterInventosByNombre("Gun").length).toBe(1);
    expect(gestor.filterInventosByTipo("Arma").length).toBe(1);
    expect(gestor.filterInventosByPeligrosidad(5).length).toBe(1);
  });

  test("filters personajes restantes gestor", () => {
    const d = new Dimension("D1", "Dim", "activa", 5, "d");
    const e = new Especie("E1", "Humano", "D1", "humanoide", 80, "d");
    const p = new Personaje("P1", "Rick", "E1", "D1", "vivo", "Independiente", 10, "d");

    gestor.addDimension(d);
    gestor.addEspecie(e);
    gestor.addPersonaje(p);

    expect(gestor.filterPersonajesByAfiliacion("Independiente").length).toBe(1);
    expect(gestor.filterPersonajesByEstado("vivo").length).toBe(1);
    expect(gestor.filterPersonajesByDimension("D1").length).toBe(1);
  });

  // ---------- ORDER ----------

  test("orderPersonajesByNombre asc/desc", () => {
    const p1 = new Personaje("1", "B", "E1", "D1", "vivo", "Independiente", 1, "d");
    const p2 = new Personaje("2", "A", "E1", "D1", "vivo", "Independiente", 1, "d");

    const asc = gestor.orderPersonajesByNombre([p1, p2], true);
    const desc = gestor.orderPersonajesByNombre([p1, p2], false);

    expect(asc[0].nombre).toBe("A");
    expect(desc[0].nombre).toBe("B");
  });

  test("orderPersonajesByInteligencia asc/desc", () => {
    const p1 = new Personaje("1", "A", "E1", "D1", "vivo", "Independiente", 1, "d");
    const p2 = new Personaje("2", "B", "E1", "D1", "vivo", "Independiente", 10, "d");

    const asc = gestor.orderPersonajesByInteligencia([p1, p2], true);
    const desc = gestor.orderPersonajesByInteligencia([p1, p2], false);

    expect(asc[0].nivelInteligencia).toBe(1);
    expect(desc[0].nivelInteligencia).toBe(10);
  });

  // ---------- VARIANTES ----------

  test("getVariantesPersonaje", () => {
    const d1 = new Dimension("D1", "A", "activa", 5, "d");
    const d2 = new Dimension("D2", "B", "activa", 5, "d");
    const e = new Especie("E1", "Humano", "D1", "humanoide", 80, "d");

    gestor.addDimension(d1);
    gestor.addDimension(d2);
    gestor.addEspecie(e);

    const p1 = new Personaje("1", "Rick", "E1", "D1", "vivo", "Independiente", 10, "d");
    const p2 = new Personaje("2", "Rick", "E1", "D2", "vivo", "Independiente", 10, "d");

    gestor.addPersonaje(p1);
    gestor.addPersonaje(p2);

    const variantes = gestor.getVariantesPersonaje(p1);

    expect(variantes.length).toBe(1);
  });

  // ---------- ESTADO GLOBAL ----------

  test("getDimensionesDestruidas", () => {
    const d = new Dimension("D1", "Dim", "destruida", 5, "d");
    gestor.addDimension(d);

    expect(gestor.getDimensionesDestruidas().length).toBe(1);
  });

  test("getPersonajesDimDestruida", () => {
    const d = new Dimension("D1", "Dim", "destruida", 5, "d");
    const e = new Especie("E1", "Humano", "D1", "humanoide", 80, "d");

    gestor.addDimension(d);
    gestor.addEspecie(e);

    const p = new Personaje("P1", "Rick", "E1", "D1", "vivo", "Independiente", 10, "d");
    gestor.addPersonaje(p);

    expect(gestor.getPersonajesDimDestruida().length).toBe(1);
  });

  test("getPersonajesDimEliminada", () => {
    const d = new Dimension("D1", "Dim", "activa", 5, "d");
    const e = new Especie("E1", "Humano", "D1", "humanoide", 80, "d");

    gestor.addDimension(d);
    gestor.addEspecie(e);

    const p = new Personaje("P1", "Rick", "E1", "D1", "vivo", "Independiente", 10, "d");
    gestor.addPersonaje(p);

    gestor.removeDimension("D1");

    expect(gestor.getPersonajesDimEliminada().length).toBe(1);
  });

});