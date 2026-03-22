import { describe, expect, test, beforeEach, afterEach } from "vitest";
import { GestorMultiversal } from "../src/core/gestor.js";
import { Dimension } from "../src/core/models/Dimension.js";
import { Especie } from "../src/core/models/especies.js";
import { Personaje } from "../src/core/models/personajes.js";
import { Localizacion } from "../src/core/models/localizaciones.js";
import { Invento } from "../src/core/models/inventos.js";
import { IEventoViaje, IEventoDimension, IEventoInvento } from "../src/core/interfaces.js";
import { Low } from "lowdb";
import { Data, DefaultData } from "../src/database/db.js";
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
  db.data.eventos = [];
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


  test("addEventoViaje y getEventos", async () => {
    const d1 = new Dimension("D-001", "Dim1", "activa", 5, "d");
    const d2 = new Dimension("D-002", "Dim2", "activa", 5, "d");
    const e = new Especie("E001", "Humano", "D-001", "humanoide", 80, "d");
    const p = new Personaje("P001", "Rick", "E001", "D-001", "vivo", "Independiente", 10, "d");

    await gestor.addDimension(d1);
    await gestor.addDimension(d2);
    await gestor.addEspecie(e);
    await gestor.addPersonaje(p);

    const evento: IEventoViaje = {
      id: `VIAJE-${Date.now()}`,
      tipoEvento: "viaje",
      fecha: new Date().toISOString(),
      motivo: "Exploracion",
      personajeId: "P001",
      dimensionOrigenId: "D-001",
      dimensionDestinoId: "D-002"
    };

    await gestor.addEventoViaje(evento);
    const eventos = await gestor.getEventos();
    expect(eventos.length).toBe(1);
  });

  test("addEventoDestruccionDimension", async () => {
    const d = new Dimension("D-001", "Dim", "activa", 5, "d");
    await gestor.addDimension(d);

    const evento: IEventoDimension = {
      id: `DEST-${Date.now()}`,
      tipoEvento: "dimension",
      fecha: new Date().toISOString(),
      motivo: "experimento",
      dimensionId: "D-001",
      accion: "destruccion"
    };

    await gestor.addEventoDestruccionDimension(evento);
    const dimension = await gestor.dimensionesRepo.findById("D-001");
    expect(dimension?.estadoDim).toBe("destruida");
  });

  test("addEventoCreacionDimension", async () => {
    const dimension = new Dimension("D-001", "Dim", "activa", 5, "d");
    const evento: IEventoDimension = {
      id: `CREA-${Date.now()}`,
      tipoEvento: "dimension",
      fecha: new Date().toISOString(),
      motivo: "experimento",
      dimensionId: "D-001",
      accion: "creacion"
    };

    await gestor.addEventoCreacionDimension(dimension, evento);
    const dimensionCreada = await gestor.dimensionesRepo.findById("D-001");
    expect(dimensionCreada).toBeDefined();
  });

  test("addEventoInvento", async () => {
    const d = new Dimension("D-001", "Dim", "activa", 5, "d");
    const e = new Especie("E001", "Humano", "D-001", "humanoide", 80, "d");
    const p = new Personaje("P001", "Rick", "E001", "D-001", "vivo", "Independiente", 10, "d");
    const l = new Localizacion("L001", "Loc", "Planeta", 10, "D-001", "d");
    const i = new Invento("I001", "Gun", "P001", "Arma", 5, "d");

    await gestor.addDimension(d);
    await gestor.addEspecie(e);
    await gestor.addPersonaje(p);
    await gestor.addLocalizacion(l);
    await gestor.addInvento(i);

    const evento: IEventoInvento = {
      id: `INV-${Date.now()}`,
      tipoEvento: "invento",
      fecha: new Date().toISOString(),
      motivo: "Prueba",
      inventoId: "I001",
      localizacionId: "L001",
      accion: "despliegue"
    };

    await gestor.addEventoInvento(evento);
    const eventos = await gestor.filterEventosByTipoEvento("invento");
    expect(eventos.length).toBe(1);
  });

  test("filterEventosByTipoEvento", async () => {
    const d = new Dimension("D-001", "Dim", "activa", 5, "d");
    await gestor.addDimension(d);
    
    const evento: IEventoDimension = {
      id: `DEST-${Date.now()}`,
      tipoEvento: "dimension",
      fecha: new Date().toISOString(),
      motivo: "experimento",
      dimensionId: "D-001",
      accion: "destruccion"
    };
    
    await gestor.addEventoDestruccionDimension(evento);
    
    const dimensiones = await gestor.filterEventosByTipoEvento("dimension");
    expect(dimensiones.length).toBe(1);
  });

  test("getInformeDimensionesActivas", async () => {
    const d1 = new Dimension("D-001", "Dim1", "activa", 5, "d");
    const d2 = new Dimension("D-002", "Dim2", "activa", 8, "d");
    const d3 = new Dimension("D-003", "Dim3", "destruida", 3, "d");
    
    await gestor.addDimension(d1);
    await gestor.addDimension(d2);
    await gestor.addDimension(d3);
    
    const informe = await gestor.getInformeDimensionesActivas();
    expect(informe.activas.length).toBe(2);
    expect(informe.mediaNivelTec).toBe(6.5);
  });

  test("getInformePersonajesMasVariantes", async () => {
    const d1 = new Dimension("D-001", "Dim1", "activa", 5, "d");
    const d2 = new Dimension("D-002", "Dim2", "activa", 5, "d");
    const e = new Especie("E001", "Humano", "D-001", "humanoide", 80, "d");
    
    await gestor.addDimension(d1);
    await gestor.addDimension(d2);
    await gestor.addEspecie(e);
    
    const p1 = new Personaje("P001", "Rick", "E001", "D-001", "vivo", "Independiente", 10, "d");
    const p2 = new Personaje("P002", "Rick", "E001", "D-002", "vivo", "Independiente", 10, "d");
    const p3 = new Personaje("P003", "Morty", "E001", "D-001", "vivo", "Independiente", 5, "d");
    
    await gestor.addPersonaje(p1);
    await gestor.addPersonaje(p2);
    await gestor.addPersonaje(p3);
    
    const informe = await gestor.getInformePersonajesMasVariantes();
    expect(informe.maximoVersiones).toBe(2);
  });

  test("getInformeInventosDesplegados", async () => {
    const d = new Dimension("D-001", "Dim", "activa", 5, "d");
    const e = new Especie("E001", "Humano", "D-001", "humanoide", 80, "d");
    const p = new Personaje("P001", "Rick", "E001", "D-001", "vivo", "Independiente", 10, "d");
    const l = new Localizacion("L001", "Loc", "Planeta", 10, "D-001", "d");
    const i = new Invento("I001", "Gun", "P001", "Arma", 8, "d");

    await gestor.addDimension(d);
    await gestor.addEspecie(e);
    await gestor.addPersonaje(p);
    await gestor.addLocalizacion(l);
    await gestor.addInvento(i);

    const evento: IEventoInvento = {
      id: `INV-${Date.now()}`,
      tipoEvento: "invento",
      fecha: new Date().toISOString(),
      motivo: "Despliegue",
      inventoId: "I001",
      localizacionId: "L001",
      accion: "despliegue"
    };

    await gestor.addEventoInvento(evento);
    
    const desplegados = await gestor.getInformeInventosDesplegados();
    expect(desplegados.length).toBe(1);
    expect(desplegados[0].nivelPeligro).toBe(8);
  });

  test("getHistorialViajesPorPersonaje", async () => {
    const d1 = new Dimension("D-001", "Dim1", "activa", 5, "d");
    const d2 = new Dimension("D-002", "Dim2", "activa", 5, "d");
    const e = new Especie("E001", "Humano", "D-001", "humanoide", 80, "d");
    const p = new Personaje("P001", "Rick", "E001", "D-001", "vivo", "Independiente", 10, "d");

    await gestor.addDimension(d1);
    await gestor.addDimension(d2);
    await gestor.addEspecie(e);
    await gestor.addPersonaje(p);

    const evento: IEventoViaje = {
      id: `VIAJE-${Date.now()}`,
      tipoEvento: "viaje",
      fecha: new Date().toISOString(),
      motivo: "Viaje",
      personajeId: "P001",
      dimensionOrigenId: "D-001",
      dimensionDestinoId: "D-002"
    };

    await gestor.addEventoViaje(evento);

    const viajes = await gestor.getHistorialViajesPorPersonaje("P001");
    expect(viajes.length).toBe(1);
  });

  test("filterEventosByInventoId", async () => {
    const d = new Dimension("D-001", "Dim", "activa", 5, "d");
    const e = new Especie("E001", "Humano", "D-001", "humanoide", 80, "d");
    const p = new Personaje("P001", "Rick", "E001", "D-001", "vivo", "Independiente", 10, "d");
    const l = new Localizacion("L001", "Loc", "Planeta", 10, "D-001", "d");
    const i = new Invento("I001", "Gun", "P001", "Arma", 8, "d");

    await gestor.addDimension(d);
    await gestor.addEspecie(e);
    await gestor.addPersonaje(p);
    await gestor.addLocalizacion(l);
    await gestor.addInvento(i);

    const evento: IEventoInvento = {
      id: `INV-${Date.now()}`,
      tipoEvento: "invento",
      fecha: new Date().toISOString(),
      motivo: "Despliegue",
      inventoId: "I001",
      localizacionId: "L001",
      accion: "despliegue"
    };

    await gestor.addEventoInvento(evento);
    
    const eventos = await gestor.filterEventosByInventoId("I001");
    expect(eventos.length).toBe(1);
  });

  test("getNombrePersonajeById", async () => {
    const d = new Dimension("D-001", "Dim", "activa", 5, "d");
    const e = new Especie("E001", "Humano", "D-001", "humanoide", 80, "d");
    const p = new Personaje("P001", "Rick", "E001", "D-001", "vivo", "Independiente", 10, "d");
    
    await gestor.addDimension(d);
    await gestor.addEspecie(e);
    await gestor.addPersonaje(p);
    
    const nombre = await gestor.getNombrePersonajeById("P001");
    expect(nombre).toBe("Rick");
    
    const nombreNoExistente = await gestor.getNombrePersonajeById("NO_EXISTE");
    expect(nombreNoExistente).toBeUndefined();
  });

  test("getInformePersonajesMasVariantes sin variantes", async () => {
    const d = new Dimension("D-001", "Dim", "activa", 5, "d");
    const e = new Especie("E001", "Humano", "D-001", "humanoide", 80, "d");
    const p = new Personaje("P001", "Rick", "E001", "D-001", "vivo", "Independiente", 10, "d");
    
    await gestor.addDimension(d);
    await gestor.addEspecie(e);
    await gestor.addPersonaje(p);
    
    const informe = await gestor.getInformePersonajesMasVariantes();
    expect(informe.top.length).toBe(0);
    expect(informe.maximoVersiones).toBe(0);
  });

  test("getInformeInventosDesplegados con invento desconocido", async () => {
    const d = new Dimension("D-001", "Dim", "activa", 5, "d");
    const l = new Localizacion("L001", "Loc", "Planeta", 10, "D-001", "d");

    await gestor.addDimension(d);
    await gestor.addLocalizacion(l);

    const evento: IEventoInvento = {
      id: `INV-${Date.now()}`,
      tipoEvento: "invento",
      fecha: new Date().toISOString(),
      motivo: "Despliegue",
      inventoId: "I_NO_EXISTE",
      localizacionId: "L001",
      accion: "despliegue"
    };

    await gestor.eventosRepo.add(evento);
    
    const desplegados = await gestor.getInformeInventosDesplegados();
    expect(desplegados.length).toBe(1);
    expect(desplegados[0].inventoNombre).toBe("Invento desconocido");
    expect(desplegados[0].nivelPeligro).toBe(-1);
  });

test("getHistorialViajesPorPersonaje con multiples viajes para cubrir sort", async () => {
  const d1 = new Dimension("D-001", "Dim1", "activa", 5, "d");
  const d2 = new Dimension("D-002", "Dim2", "activa", 5, "d");
  const e = new Especie("E001", "Humano", "D-001", "humanoide", 80, "d");
  const p = new Personaje("P001", "Rick", "E001", "D-001", "vivo", "Independiente", 10, "d");

  await gestor.addDimension(d1);
  await gestor.addDimension(d2);
  await gestor.addEspecie(e);
  await gestor.addPersonaje(p);

  const evento1: IEventoViaje = {
    id: `VIAJE-1-${Date.now()}`,
    tipoEvento: "viaje",
    fecha: new Date("2024-01-01").toISOString(),
    motivo: "Viaje 1",
    personajeId: "P001",
    dimensionOrigenId: "D-001",
    dimensionDestinoId: "D-002"
  };

  const evento2: IEventoViaje = {
    id: `VIAJE-2-${Date.now()}`,
    tipoEvento: "viaje",
    fecha: new Date("2024-02-01").toISOString(),
    motivo: "Viaje 2",
    personajeId: "P001",
    dimensionOrigenId: "D-002",
    dimensionDestinoId: "D-001"
  };

  await gestor.addEventoViaje(evento1);
  await gestor.addEventoViaje(evento2);

  const viajes = await gestor.getHistorialViajesPorPersonaje("P001");
  expect(viajes.length).toBe(2);
  expect(viajes[0].fecha).toBe(evento1.fecha);
  expect(viajes[1].fecha).toBe(evento2.fecha);
});

test("getInformePersonajesMasVariantes con multiples variantes para cubrir sort", async () => {
  const d1 = new Dimension("D-001", "Dim1", "activa", 5, "d");
  const d2 = new Dimension("D-002", "Dim2", "activa", 5, "d");
  const d3 = new Dimension("D-003", "Dim3", "activa", 5, "d");
  const e = new Especie("E001", "Humano", "D-001", "humanoide", 80, "d");
  
  await gestor.addDimension(d1);
  await gestor.addDimension(d2);
  await gestor.addDimension(d3);
  await gestor.addEspecie(e);
  
  const p1 = new Personaje("P001", "Rick", "E001", "D-001", "vivo", "Independiente", 10, "d");
  const p2 = new Personaje("P002", "Rick", "E001", "D-002", "vivo", "Independiente", 10, "d");
  const p3 = new Personaje("P003", "Morty", "E001", "D-001", "vivo", "Independiente", 5, "d");
  const p4 = new Personaje("P004", "Morty", "E001", "D-002", "vivo", "Independiente", 5, "d");
  
  await gestor.addPersonaje(p1);
  await gestor.addPersonaje(p2);
  await gestor.addPersonaje(p3);
  await gestor.addPersonaje(p4);
  
  const informe = await gestor.getInformePersonajesMasVariantes();
  expect(informe.maximoVersiones).toBe(2);
  expect(informe.top.length).toBe(2); 
  expect(informe.top[0].nombreOriginal).toBe("Morty");
  expect(informe.top[1].nombreOriginal).toBe("Rick");
});

  test("getInformeInventosDesplegados con multiples inventos para cubrir sort", async () => {
    const d = new Dimension("D-001", "Dim", "activa", 5, "d");
    const e = new Especie("E001", "Humano", "D-001", "humanoide", 80, "d");
    const p = new Personaje("P001", "Rick", "E001", "D-001", "vivo", "Independiente", 10, "d");
    const l1 = new Localizacion("L001", "Loc1", "Planeta", 10, "D-001", "d");
    const l2 = new Localizacion("L002", "Loc2", "Planeta", 10, "D-001", "d");
    const i1 = new Invento("I001", "Gun", "P001", "Arma", 5, "d");
    const i2 = new Invento("I002", "Bomb", "P001", "Arma", 9, "d");

    await gestor.addDimension(d);
    await gestor.addEspecie(e);
    await gestor.addPersonaje(p);
    await gestor.addLocalizacion(l1);
    await gestor.addLocalizacion(l2);
    await gestor.addInvento(i1);
    await gestor.addInvento(i2);

    const evento1: IEventoInvento = {
      id: `INV-1-${Date.now()}`,
      tipoEvento: "invento",
      fecha: new Date().toISOString(),
      motivo: "Despliegue 1",
      inventoId: "I001",
      localizacionId: "L001",
      accion: "despliegue"
    };

    const evento2: IEventoInvento = {
      id: `INV-2-${Date.now()}`,
      tipoEvento: "invento",
      fecha: new Date().toISOString(),
      motivo: "Despliegue 2",
      inventoId: "I002",
      localizacionId: "L002",
      accion: "despliegue"
    };

    await gestor.addEventoInvento(evento1);
    await gestor.addEventoInvento(evento2);
    
    const desplegados = await gestor.getInformeInventosDesplegados();
    expect(desplegados.length).toBe(2);
    expect(desplegados[0].nivelPeligro).toBe(9);
    expect(desplegados[1].nivelPeligro).toBe(5);
  });

  test("addEventoViaje error personaje no existe (rama)", async () => {
    const d1 = new Dimension("D-001", "Dim1", "activa", 5, "d");
    const d2 = new Dimension("D-002", "Dim2", "activa", 5, "d");
    await gestor.addDimension(d1);
    await gestor.addDimension(d2);

    const evento: IEventoViaje = {
      id: `VIAJE-${Date.now()}`,
      tipoEvento: "viaje",
      fecha: new Date().toISOString(),
      motivo: "Exploracion",
      personajeId: "P_NO_EXISTE",
      dimensionOrigenId: "D-001",
      dimensionDestinoId: "D-002"
    };

    await expect(gestor.addEventoViaje(evento)).rejects.toThrow("El personaje no existe");
  });

  test("addEventoViaje error dimension origen no existe (rama)", async () => {
    const d2 = new Dimension("D-002", "Dim2", "activa", 5, "d");
    const e = new Especie("E001", "Humano", "D-002", "humanoide", 80, "d");
    const p = new Personaje("P001", "Rick", "E001", "D-002", "vivo", "Independiente", 10, "d");

    await gestor.addDimension(d2);
    await gestor.addEspecie(e);
    await gestor.addPersonaje(p);

    const evento: IEventoViaje = {
      id: `VIAJE-${Date.now()}`,
      tipoEvento: "viaje",
      fecha: new Date().toISOString(),
      motivo: "Exploracion",
      personajeId: "P001",
      dimensionOrigenId: "D_NO_EXISTE",
      dimensionDestinoId: "D-002"
    };

    await expect(gestor.addEventoViaje(evento)).rejects.toThrow("La dimensión de origen no existe");
  });

  test("addEventoViaje error dimension destino no existe (rama)", async () => {
    const d1 = new Dimension("D-001", "Dim1", "activa", 5, "d");
    const e = new Especie("E001", "Humano", "D-001", "humanoide", 80, "d");
    const p = new Personaje("P001", "Rick", "E001", "D-001", "vivo", "Independiente", 10, "d");

    await gestor.addDimension(d1);
    await gestor.addEspecie(e);
    await gestor.addPersonaje(p);

    const evento: IEventoViaje = {
      id: `VIAJE-${Date.now()}`,
      tipoEvento: "viaje",
      fecha: new Date().toISOString(),
      motivo: "Exploracion",
      personajeId: "P001",
      dimensionOrigenId: "D-001",
      dimensionDestinoId: "D_NO_EXISTE"
    };

    await expect(gestor.addEventoViaje(evento)).rejects.toThrow("La dimensión de destino no existe");
  });

  test("addEventoDestruccionDimension error dimension no existe (rama)", async () => {
    const evento: IEventoDimension = {
      id: `DEST-${Date.now()}`,
      tipoEvento: "dimension",
      fecha: new Date().toISOString(),
      motivo: "experimento",
      dimensionId: "D_NO_EXISTE",
      accion: "destruccion"
    };

    await expect(gestor.addEventoDestruccionDimension(evento)).rejects.toThrow("La dimensión no existe");
  });

  test("addEventoCreacionDimension error dimension ya existe (rama)", async () => {
    const dimension = new Dimension("D-001", "Dim", "activa", 5, "d");
    await gestor.addDimension(dimension);

    const evento: IEventoDimension = {
      id: `CREA-${Date.now()}`,
      tipoEvento: "dimension",
      fecha: new Date().toISOString(),
      motivo: "experimento",
      dimensionId: "D-001",
      accion: "creacion"
    };

    await expect(gestor.addEventoCreacionDimension(dimension, evento)).rejects.toThrow("La dimensión ya existe");
  });

  test("addEventoInvento error invento no existe (rama)", async () => {
    const d = new Dimension("D-001", "Dim", "activa", 5, "d");
    const l = new Localizacion("L001", "Loc", "Planeta", 10, "D-001", "d");

    await gestor.addDimension(d);
    await gestor.addLocalizacion(l);

    const evento: IEventoInvento = {
      id: `INV-${Date.now()}`,
      tipoEvento: "invento",
      fecha: new Date().toISOString(),
      motivo: "Despliegue",
      inventoId: "I_NO_EXISTE",
      localizacionId: "L001",
      accion: "despliegue"
    };

    await expect(gestor.addEventoInvento(evento)).rejects.toThrow("El invento no existe");
  });

  test("addEventoInvento error localizacion no existe (rama)", async () => {
    const d = new Dimension("D-001", "Dim", "activa", 5, "d");
    const e = new Especie("E001", "Humano", "D-001", "humanoide", 80, "d");
    const p = new Personaje("P001", "Rick", "E001", "D-001", "vivo", "Independiente", 10, "d");
    const i = new Invento("I001", "Gun", "P001", "Arma", 5, "d");

    await gestor.addDimension(d);
    await gestor.addEspecie(e);
    await gestor.addPersonaje(p);
    await gestor.addInvento(i);

    const evento: IEventoInvento = {
      id: `INV-${Date.now()}`,
      tipoEvento: "invento",
      fecha: new Date().toISOString(),
      motivo: "Despliegue",
      inventoId: "I001",
      localizacionId: "L_NO_EXISTE",
      accion: "despliegue"
    };

    await expect(gestor.addEventoInvento(evento)).rejects.toThrow("La localización no existe");
  });


  test("getInformeInventosDesplegados con localizacion desconocida", async () => {
    const d = new Dimension("D-001", "Dim", "activa", 5, "d");
    const e = new Especie("E001", "Humano", "D-001", "humanoide", 80, "d");
    const p = new Personaje("P001", "Rick", "E001", "D-001", "vivo", "Independiente", 10, "d");
    const i = new Invento("I001", "Gun", "P001", "Arma", 8, "d");

    await gestor.addDimension(d);
    await gestor.addEspecie(e);
    await gestor.addPersonaje(p);
    await gestor.addInvento(i);

    const evento: IEventoInvento = {
      id: `INV-${Date.now()}`,
      tipoEvento: "invento",
      fecha: new Date().toISOString(),
      motivo: "Despliegue",
      inventoId: "I001",
      localizacionId: "L_NO_EXISTE",
      accion: "despliegue"
    };

    await gestor.eventosRepo.add(evento);
    
    const desplegados = await gestor.getInformeInventosDesplegados();
    expect(desplegados.length).toBe(1);
    expect(desplegados[0].localizacionNombre).toBe("L_NO_EXISTE");
  });

test("getInformeInventosDesplegados con localizacion desconocida", async () => {
  const d = new Dimension("D-001", "Dim", "activa", 5, "d");
  const e = new Especie("E001", "Humano", "D-001", "humanoide", 80, "d");
  const p = new Personaje("P001", "Rick", "E001", "D-001", "vivo", "Independiente", 10, "d");
  const i = new Invento("I001", "Gun", "P001", "Arma", 8, "d");

  await gestor.addDimension(d);
  await gestor.addEspecie(e);
  await gestor.addPersonaje(p);
  await gestor.addInvento(i);

  // Crear evento con localizacion que no existe en la base de datos
  const evento: IEventoInvento = {
    id: `INV-${Date.now()}`,
    tipoEvento: "invento",
    fecha: new Date().toISOString(),
    motivo: "Despliegue",
    inventoId: "I001",
    localizacionId: "L_NO_EXISTE",
    accion: "despliegue"
  };

  // Añadir directamente al repositorio para evitar validación
  await gestor.eventosRepo.add(evento);
  
  const desplegados = await gestor.getInformeInventosDesplegados();
  expect(desplegados.length).toBe(1);
  // Verificar que usa el fallback (evento.localizacionId)
  expect(desplegados[0].localizacionNombre).toBe("L_NO_EXISTE");
});

});