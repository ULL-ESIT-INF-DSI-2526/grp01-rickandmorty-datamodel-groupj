import { describe, expect, test, beforeEach, afterEach } from "vitest";
import { GestorMultiversal } from "../src/gestor";
import { Dimension } from "../src/Dimension";
import { Especie } from "../src/especies";
import { Personaje } from "../src/personajes";
import { Localizacion } from "../src/localizaciones";
import { Invento } from "../src/inventos";
import { Low } from "lowdb";
import { Data, DefaultData } from "../src/Database/db";
import { JSONFilePreset } from "lowdb/node";
import fs from "fs";
import path from "path";

let gestor: GestorMultiversal;
let db: Low<Data>;
let testDbPath: string;

beforeEach(async () => {
  testDbPath = path.join(__dirname, `testDb_gestor_${Date.now()}.json`);
  db = await JSONFilePreset(testDbPath, DefaultData);
  db.data.dimension = [];
  db.data.especie = [];
  db.data.personaje = [];
  db.data.localizacion = [];
  db.data.invento = [];
  await db.write();
  gestor = new GestorMultiversal(db);
});

afterEach(() => {
  if (fs.existsSync(testDbPath)) {
    fs.unlinkSync(testDbPath);
  }
});

describe("GestorMultiversal", () => {

  test("addDimension correcto", async () => {
    const d = new Dimension("D-001", "Dim", "activa", 5, "desc");
    await gestor.addDimension(d);
    const dimensiones = await gestor.dimensionesRepo.getAll();
    expect(dimensiones.length).toBe(1);
  });

  test("addPersonaje error por null", async () => {
    const p = new Personaje("P001", "Rick", null, null, "vivo", "Independiente", 10, "d");
    await expect(gestor.addPersonaje(p)).rejects.toThrow("El personaje debe tener una dimensión y especie");
  });

  test("addPersonaje error por referencias inexistentes", async () => {
    const p = new Personaje("P001", "Rick", "E001", "D-001", "vivo", "Independiente", 10, "d");
    await expect(gestor.addPersonaje(p)).rejects.toThrow("Especie o dimensión inexistentes");
  });

  test("addPersonaje correcto", async () => {
    const d = new Dimension("D-001", "Dim", "activa", 5, "d");
    const e = new Especie("E001", "Humano", "D-001", "humanoide", 80, "d");

    await gestor.addDimension(d);
    await gestor.addEspecie(e);

    const p = new Personaje("P001", "Rick", "E001", "D-001", "vivo", "Independiente", 10, "d");
    await gestor.addPersonaje(p);

    const result = await gestor.filterPersonajesByNombre("Rick");
    expect(result.length).toBe(1);
  });

  test("addEspecie error origen null", async () => {
    const e = new Especie("E001", "Humano", null, "humanoide", 80, "d");
    await expect(gestor.addEspecie(e)).rejects.toThrow("La especie debe tener un origen");
  });

  test("addEspecie error origen desconocido", async () => {
    const e = new Especie("E001", "Humano", "X", "humanoide", 80, "d");
    await expect(gestor.addEspecie(e)).rejects.toThrow("Origen de la especie desconocido");
  });

  test("addLocalizacion error dimension null", async () => {
    const l = new Localizacion("L1", "Loc", "Planeta", 10, null, "d");
    await expect(gestor.addLocalizacion(l)).rejects.toThrow("La localización debe tener una dimensión");
  });

  test("addLocalizacion dimension no existe", async () => {
    const l = new Localizacion("L1", "Loc", "Planeta", 10, "D_NO", "d");
    await expect(gestor.addLocalizacion(l)).rejects.toThrow("Origen de la localización desconocida");
  });

  test("addInvento error inventor null", async () => {
    const i = new Invento("I1", "Gun", null, "Arma", 5, "d");
    await expect(gestor.addInvento(i)).rejects.toThrow("El invento debe tener un inventor");
  });

  test("addInvento inventor no existe", async () => {
    const i = new Invento("I1", "Gun", "P_NO", "Arma", 5, "d");
    await expect(gestor.addInvento(i)).rejects.toThrow("Inventor desconocido");
  });

  test("addLocalizacion correcto", async () => {
    const d = new Dimension("D-001", "Dim", "activa", 5, "d");
    await gestor.addDimension(d);
    const l = new Localizacion("L1", "Loc", "Planeta", 10, "D-001", "d");
    await gestor.addLocalizacion(l);
    const localizaciones = await gestor.localizacionesRepo.getAll();
    expect(localizaciones.length).toBe(1);
  });

  test("addInvento correcto", async () => {
    const d = new Dimension("D-001", "Dim", "activa", 5, "d");
    const e = new Especie("E001", "Humano", "D-001", "humanoide", 80, "d");
    const p = new Personaje("P001", "Rick", "E001", "D-001", "vivo", "Independiente", 10, "d");
    await gestor.addDimension(d);
    await gestor.addEspecie(e);
    await gestor.addPersonaje(p);
    const i = new Invento("I1", "Gun", "P001", "Arma", 5, "d");
    await gestor.addInvento(i);
    const inventos = await gestor.inventosRepo.getAll();
    expect(inventos.length).toBe(1);
  });

  test("removeDimension cascada", async () => {
    const d = new Dimension("D-001", "Dim", "activa", 5, "d");
    const l = new Localizacion("L1", "Loc", "Planeta", 10, "D-001", "d");
    await gestor.addDimension(d);
    await gestor.addLocalizacion(l);
    await gestor.removeDimension("D-001");
    const localizaciones = await gestor.filterLocalizacionesByDimension("D-001");
    expect(localizaciones.length).toBe(0);
  });

  test("removePersonaje afecta inventos", async () => {
    const d = new Dimension("D-001", "Dim", "activa", 5, "d");
    const e = new Especie("E001", "Humano", "D-001", "humanoide", 80, "d");
    const p = new Personaje("P001", "Rick", "E001", "D-001", "vivo", "Independiente", 10, "d");
    const i = new Invento("I1", "Gun", "P001", "Arma", 5, "d");
    await gestor.addDimension(d);
    await gestor.addEspecie(e);
    await gestor.addPersonaje(p);
    await gestor.addInvento(i);
    await gestor.removePersonaje("P001");
    const inventos = await gestor.filterInventosByInventor("P001");
    expect(inventos.length).toBe(0);
  });

  test("removeEspecie afecta personajes", async () => {
    const d = new Dimension("D-001", "Dim", "activa", 5, "d");
    const e = new Especie("E001", "Humano", "D-001", "humanoide", 80, "d");
    const p = new Personaje("P001", "Rick", "E001", "D-001", "vivo", "Independiente", 10, "d");
    await gestor.addDimension(d);
    await gestor.addEspecie(e);
    await gestor.addPersonaje(p);
    await gestor.removeEspecie("E001");
    const personajes = await gestor.filterPersonajesByEspecie("E001");
    expect(personajes.length).toBe(0);
  });

  test("removeLocalizacion afecta especies", async () => {
    const d = new Dimension("D-001", "Dim", "activa", 5, "d");
    const l = new Localizacion("L1", "Loc", "Planeta", 10, "D-001", "d");
    const e = new Especie("E001", "Humano", "L1", "humanoide", 80, "d");
    await gestor.addDimension(d);
    await gestor.addLocalizacion(l);
    await gestor.addEspecie(e);
    await gestor.removeLocalizacion("L1");
    const especie = await gestor.especiesRepo.findById("E001");
    expect(especie?.origen).toBe(null);
  });

  test("removeInvento simple", async () => {
    const d = new Dimension("D-001", "Dim", "activa", 5, "d");
    const e = new Especie("E001", "Humano", "D-001", "humanoide", 80, "d");
    const p = new Personaje("P001", "Rick", "E001", "D-001", "vivo", "Independiente", 10, "d");
    const i = new Invento("I1", "Gun", "P001", "Arma", 5, "d");
    await gestor.addDimension(d);
    await gestor.addEspecie(e);
    await gestor.addPersonaje(p);
    await gestor.addInvento(i);
    await gestor.removeInvento("I1");
    const inventos = await gestor.filterInventosByNombre("Gun");
    expect(inventos.length).toBe(0);
  });

  test("updateDimension", async () => {
    const d = new Dimension("D-001", "Dim", "activa", 5, "d");
    await gestor.addDimension(d);
    await gestor.updateDimension("D-001", { nombre: "Nueva" });
    const updated = await gestor.dimensionesRepo.findById("D-001");
    expect(updated?.nombre).toBe("Nueva");
  });

  test("updatePersonaje correcto", async () => {
    const d = new Dimension("D-001", "Dim", "activa", 5, "d");
    const e = new Especie("E001", "Humano", "D-001", "humanoide", 80, "d");
    const p = new Personaje("P001", "Rick", "E001", "D-001", "vivo", "Independiente", 10, "d");
    await gestor.addDimension(d);
    await gestor.addEspecie(e);
    await gestor.addPersonaje(p);
    await gestor.updatePersonaje("P001", { estado: "muerto" });
    const updated = await gestor.personajesRepo.findById("P001");
    expect(updated?.estado).toBe("muerto");
  });

  test("updatePersonaje error especie no existe", async () => {
    const d = new Dimension("D-001", "Dim", "activa", 5, "d");
    const e = new Especie("E001", "Humano", "D-001", "humanoide", 80, "d");
    const p = new Personaje("P001", "Rick", "E001", "D-001", "vivo", "Independiente", 10, "d");
    await gestor.addDimension(d);
    await gestor.addEspecie(e);
    await gestor.addPersonaje(p);
    await expect(gestor.updatePersonaje("P001", { especie: "NO_EXISTE" })).rejects.toThrow("La especie no existe");
  });

  test("updatePersonaje error dimension no existe", async () => {
    const d = new Dimension("D-001", "Dim", "activa", 5, "d");
    const e = new Especie("E001", "Humano", "D-001", "humanoide", 80, "d");
    const p = new Personaje("P001", "Rick", "E001", "D-001", "vivo", "Independiente", 10, "d");
    await gestor.addDimension(d);
    await gestor.addEspecie(e);
    await gestor.addPersonaje(p);
    await expect(gestor.updatePersonaje("P001", { dimension: "NO_EXISTE" })).rejects.toThrow("La dimensión no existe");
  });

  test("updateEspecie correcto", async () => {
    const d = new Dimension("D-001", "Dim", "activa", 5, "d");
    const e = new Especie("E001", "Humano", "D-001", "humanoide", 80, "d");
    await gestor.addDimension(d);
    await gestor.addEspecie(e);
    await gestor.updateEspecie("E001", { nombre: "Nueva" });
    const updated = await gestor.especiesRepo.findById("E001");
    expect(updated?.nombre).toBe("Nueva");
  });

  test("updateEspecie error origen desconocido", async () => {
    const d = new Dimension("D-001", "Dim", "activa", 5, "d");
    const e = new Especie("E001", "Humano", "D-001", "humanoide", 80, "d");
    await gestor.addDimension(d);
    await gestor.addEspecie(e);
    await expect(gestor.updateEspecie("E001", { origen: "NO_EXISTE" })).rejects.toThrow("Origen de la especie desconocido");
  });

  test("updateLocalizacion correcto", async () => {
    const d = new Dimension("D-001", "Dim", "activa", 5, "d");
    const l = new Localizacion("L1", "Loc", "Planeta", 10, "D-001", "d");
    await gestor.addDimension(d);
    await gestor.addLocalizacion(l);
    await gestor.updateLocalizacion("L1", { nombre: "Nueva" });
    const updated = await gestor.localizacionesRepo.findById("L1");
    expect(updated?.nombre).toBe("Nueva");
  });

  test("updateLocalizacion error dimension no existe", async () => {
    const d = new Dimension("D-001", "Dim", "activa", 5, "d");
    const l = new Localizacion("L1", "Loc", "Planeta", 10, "D-001", "d");
    await gestor.addDimension(d);
    await gestor.addLocalizacion(l);
    await expect(gestor.updateLocalizacion("L1", { dimension: "NO_EXISTE" })).rejects.toThrow("Origen de la localización desconocida");
  });

  test("updateInvento correcto", async () => {
    const d = new Dimension("D-001", "Dim", "activa", 5, "d");
    const e = new Especie("E001", "Humano", "D-001", "humanoide", 80, "d");
    const p = new Personaje("P001", "Rick", "E001", "D-001", "vivo", "Independiente", 10, "d");
    const i = new Invento("I1", "Gun", "P001", "Arma", 5, "d");
    await gestor.addDimension(d);
    await gestor.addEspecie(e);
    await gestor.addPersonaje(p);
    await gestor.addInvento(i);
    await gestor.updateInvento("I1", { nombre: "Nueva" });
    const updated = await gestor.inventosRepo.findById("I1");
    expect(updated?.nombre).toBe("Nueva");
  });

  test("updateInvento error inventor no existe", async () => {
    const d = new Dimension("D-001", "Dim", "activa", 5, "d");
    const e = new Especie("E001", "Humano", "D-001", "humanoide", 80, "d");
    const p = new Personaje("P001", "Rick", "E001", "D-001", "vivo", "Independiente", 10, "d");
    const i = new Invento("I1", "Gun", "P001", "Arma", 5, "d");
    await gestor.addDimension(d);
    await gestor.addEspecie(e);
    await gestor.addPersonaje(p);
    await gestor.addInvento(i);
    await expect(gestor.updateInvento("I1", { inventor: "NO_EXISTE" })).rejects.toThrow("Inventor desconocido");
  });

  test("orderPersonajesByNombre asc/desc", () => {
    const p1 = new Personaje("P001", "D-001", "E001", "D-001", "vivo", "Independiente", 1, "d");
    const p2 = new Personaje("P002", "D-", "E001", "D-001", "vivo", "Independiente", 1, "d");
    const asc = gestor.orderPersonajesByNombre([p1, p2], true);
    const desc = gestor.orderPersonajesByNombre([p1, p2], false);
    expect(asc[0].nombre).toBe("D-");
    expect(desc[0].nombre).toBe("D-001");
  });

  test("orderPersonajesByInteligencia asc/desc", () => {
    const p1 = new Personaje("P001", "D-", "E001", "D-001", "vivo", "Independiente", 1, "d");
    const p2 = new Personaje("P002", "D-001", "E001", "D-001", "vivo", "Independiente", 10, "d");
    const asc = gestor.orderPersonajesByInteligencia([p1, p2], true);
    const desc = gestor.orderPersonajesByInteligencia([p1, p2], false);
    expect(asc[0].nivelInteligencia).toBe(1);
    expect(desc[0].nivelInteligencia).toBe(10);
  });

  test("getVariantesPersonaje", async () => {
    const d1 = new Dimension("D-001", "D-", "activa", 5, "d");
    const d2 = new Dimension("D-002", "D-001", "activa", 5, "d");
    const e = new Especie("E001", "Humano", "D-001", "humanoide", 80, "d");
    await gestor.addDimension(d1);
    await gestor.addDimension(d2);
    await gestor.addEspecie(e);
    const p1 = new Personaje("P001", "Rick", "E001", "D-001", "vivo", "Independiente", 10, "d");
    const p2 = new Personaje("P002", "Rick", "E001", "D-002", "vivo", "Independiente", 10, "d");
    await gestor.addPersonaje(p1);
    await gestor.addPersonaje(p2);
    const variantes = await gestor.getVariantesPersonaje("Rick");
    expect(variantes.length).toBe(2);
  });

  test("getDimensionesDestruidas", async () => {
    const d = new Dimension("D-001", "Dim", "destruida", 5, "d");
    await gestor.addDimension(d);
    const destruidas = await gestor.getDimensionesDestruidas();
    expect(destruidas.length).toBe(1);
  });

  test("getPersonajesDimDestruida", async () => {
    const d = new Dimension("D-001", "Dim", "destruida", 5, "d");
    const e = new Especie("E001", "Humano", "D-001", "humanoide", 80, "d");
    await gestor.addDimension(d);
    await gestor.addEspecie(e);
    const p = new Personaje("P001", "Rick", "E001", "D-001", "vivo", "Independiente", 10, "d");
    await gestor.addPersonaje(p);
    const personajes = await gestor.getPersonajesDimDestruida();
    expect(personajes.length).toBe(1);
  });

  test("getPersonajesDimEliminada", async () => {
    const d = new Dimension("D-001", "Dim", "activa", 5, "d");
    const e = new Especie("E001", "Humano", "D-001", "humanoide", 80, "d");
    await gestor.addDimension(d);
    await gestor.addEspecie(e);
    const p = new Personaje("P001", "Rick", "E001", "D-001", "vivo", "Independiente", 10, "d");
    await gestor.addPersonaje(p);
    await gestor.removeDimension("D-001");
    const personajes = await gestor.getPersonajesDimEliminada();
    expect(personajes.length).toBe(1);
  });

  test("filterPersonajesByAfiliacion", async () => {
    const d = new Dimension("D-001", "Dim", "activa", 5, "d");
    const e = new Especie("E001", "Humano", "D-001", "humanoide", 80, "d");
    const p = new Personaje("P001", "Rick", "E001", "D-001", "vivo", "Independiente", 10, "d");
    await gestor.addDimension(d);
    await gestor.addEspecie(e);
    await gestor.addPersonaje(p);
    const result = await gestor.filterPersonajesByAfiliacion("Independiente");
    expect(result.length).toBe(1);
  });

  test("filterPersonajesByEstado", async () => {
    const d = new Dimension("D-001", "Dim", "activa", 5, "d");
    const e = new Especie("E001", "Humano", "D-001", "humanoide", 80, "d");
    const p = new Personaje("P001", "Rick", "E001", "D-001", "vivo", "Independiente", 10, "d");
    await gestor.addDimension(d);
    await gestor.addEspecie(e);
    await gestor.addPersonaje(p);
    const result = await gestor.filterPersonajesByEstado("vivo");
    expect(result.length).toBe(1);
  });

  test("filterPersonajesByDimension", async () => {
    const d = new Dimension("D-001", "Dim", "activa", 5, "d");
    const e = new Especie("E001", "Humano", "D-001", "humanoide", 80, "d");
    const p = new Personaje("P001", "Rick", "E001", "D-001", "vivo", "Independiente", 10, "d");
    await gestor.addDimension(d);
    await gestor.addEspecie(e);
    await gestor.addPersonaje(p);
    const result = await gestor.filterPersonajesByDimension("D-001");
    expect(result.length).toBe(1);
  });

  test("filterLocalizacionesByNombre", async () => {
    const d = new Dimension("D-001", "Dim", "activa", 5, "d");
    const l = new Localizacion("L1", "Loc", "Planeta", 10, "D-001", "d");
    await gestor.addDimension(d);
    await gestor.addLocalizacion(l);
    const result = await gestor.filterLocalizacionesByNombre("Loc");
    expect(result.length).toBe(1);
  });

  test("filterLocalizacionesByTipo", async () => {
    const d = new Dimension("D-001", "Dim", "activa", 5, "d");
    const l = new Localizacion("L1", "Loc", "Planeta", 10, "D-001", "d");
    await gestor.addDimension(d);
    await gestor.addLocalizacion(l);
    const result = await gestor.filterLocalizacionesByTipo("Planeta");
    expect(result.length).toBe(1);
  });

  test("filterInventosByTipo", async () => {
    const d = new Dimension("D-001", "Dim", "activa", 5, "d");
    const e = new Especie("E001", "Humano", "D-001", "humanoide", 80, "d");
    const p = new Personaje("P001", "Rick", "E001", "D-001", "vivo", "Independiente", 10, "d");
    const i = new Invento("I1", "Gun", "P001", "Arma", 5, "d");
    await gestor.addDimension(d);
    await gestor.addEspecie(e);
    await gestor.addPersonaje(p);
    await gestor.addInvento(i);
    const result = await gestor.filterInventosByTipo("Arma");
    expect(result.length).toBe(1);
  });

  test("filterInventosByPeligrosidad", async () => {
    const d = new Dimension("D-001", "Dim", "activa", 5, "d");
    const e = new Especie("E001", "Humano", "D-001", "humanoide", 80, "d");
    const p = new Personaje("P001", "Rick", "E001", "D-001", "vivo", "Independiente", 10, "d");
    const i = new Invento("I1", "Gun", "P001", "Arma", 5, "d");
    await gestor.addDimension(d);
    await gestor.addEspecie(e);
    await gestor.addPersonaje(p);
    await gestor.addInvento(i);
    const result = await gestor.filterInventosByPeligrosidad(5);
    expect(result.length).toBe(1);
  });

  test("filterInventosByInventor", async () => {
    const d = new Dimension("D-001", "Dim", "activa", 5, "d");
    const e = new Especie("E001", "Humano", "D-001", "humanoide", 80, "d");
    const p = new Personaje("P001", "Rick", "E001", "D-001", "vivo", "Independiente", 10, "d");
    const i = new Invento("I1", "Gun", "P001", "Arma", 5, "d");
    await gestor.addDimension(d);
    await gestor.addEspecie(e);
    await gestor.addPersonaje(p);
    await gestor.addInvento(i);
    const result = await gestor.filterInventosByInventor("P001");
    expect(result.length).toBe(1);
  });

  test("updatePersonaje especie existe", async () => {
    const d = new Dimension("D-001", "Dim", "activa", 5, "d");
    const e = new Especie("E001", "Humano", "D-001", "humanoide", 80, "d");
    const p = new Personaje("P001", "Rick", "E001", "D-001", "vivo", "Independiente", 10, "d");
    
    await gestor.addDimension(d);
    await gestor.addEspecie(e);
    await gestor.addPersonaje(p);
    
    await gestor.updatePersonaje("P001", { especie: "E001" });
    
    const updated = await gestor.personajesRepo.findById("P001");
    expect(updated?.especie).toBe("E001");
  });

  test("updatePersonaje dimension existe", async () => {
    const d = new Dimension("D-001", "Dim", "activa", 5, "d");
    const e = new Especie("E001", "Humano", "D-001", "humanoide", 80, "d");
    const p = new Personaje("P001", "Rick", "E001", "D-001", "vivo", "Independiente", 10, "d");
    
    await gestor.addDimension(d);
    await gestor.addEspecie(e);
    await gestor.addPersonaje(p);
    
    await gestor.updatePersonaje("P001", { dimension: "D-001" });
    
    const updated = await gestor.personajesRepo.findById("P001");
    expect(updated?.dimension).toBe("D-001");
  });

  test("updateEspecie origen existe como dimension", async () => {
    const d = new Dimension("D-001", "Dim", "activa", 5, "d");
    const e = new Especie("E001", "Humano", "D-001", "humanoide", 80, "d");
    
    await gestor.addDimension(d);
    await gestor.addEspecie(e);
    
    // Cambiar origen a uno que SÍ existe (D1)
    await gestor.updateEspecie("E001", { origen: "D-001" });
    
    const updated = await gestor.especiesRepo.findById("E001");
    expect(updated?.origen).toBe("D-001");
  });

  test("updateEspecie origen existe como localizacion", async () => {
    const d = new Dimension("D-001", "Dim", "activa", 5, "d");
    const l = new Localizacion("L1", "Loc", "Planeta", 10, "D-001", "d");
    const e = new Especie("E001", "Humano", "D-001", "humanoide", 80, "d");
    
    await gestor.addDimension(d);
    await gestor.addLocalizacion(l);
    await gestor.addEspecie(e);
    
    await gestor.updateEspecie("E001", { origen: "L1" });
    
    const updated = await gestor.especiesRepo.findById("E001");
    expect(updated?.origen).toBe("L1");
  });

  test("updateLocalizacion dimension existe", async () => {
    const d = new Dimension("D-001", "Dim", "activa", 5, "d");
    const l = new Localizacion("L1", "Loc", "Planeta", 10, "D-001", "d");
    
    await gestor.addDimension(d);
    await gestor.addLocalizacion(l);
    
    await gestor.updateLocalizacion("L1", { dimension: "D-001" });
    
    const updated = await gestor.localizacionesRepo.findById("L1");
    expect(updated?.dimension).toBe("D-001");
  });

  test("updateInvento inventor existe", async () => {
    const d = new Dimension("D-001", "Dim", "activa", 5, "d");
    const e = new Especie("E001", "Humano", "D-001", "humanoide", 80, "d");
    const p = new Personaje("P001", "Rick", "E001", "D-001", "vivo", "Independiente", 10, "d");
    const i = new Invento("I1", "Gun", "P001", "Arma", 5, "d");
    
    await gestor.addDimension(d);
    await gestor.addEspecie(e);
    await gestor.addPersonaje(p);
    await gestor.addInvento(i);
    
    await gestor.updateInvento("I1", { inventor: "P001" });
    
    const updated = await gestor.inventosRepo.findById("I1");
    expect(updated?.inventor).toBe("P001");
  });

});