import { describe, expect, test, beforeEach } from "vitest";
import { RepositorioPersonajes } from "../src/RepositorioPersonajes";
import { Personaje } from "../src/personajes";

let repo: RepositorioPersonajes;

const normalize = (s: string) =>
  s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

beforeEach(() => {
  repo = new RepositorioPersonajes(normalize);
});

describe("RepositorioPersonajes", () => {

  test("add correcto", () => {
    const p = new Personaje("1", "Rick", "E1", "D1", "vivo", "Independiente", 10, "desc");
    repo.add(p);

    expect(repo.getAll().length).toBe(1);
  });

  test("add duplicado", () => {
    const p1 = new Personaje("1", "Rick", "E1", "D1", "vivo", "Independiente", 10, "desc");
    const p2 = new Personaje("2", "rick", "E1", "D1", "vivo", "Independiente", 10, "desc");

    repo.add(p1);

    expect(() => repo.add(p2)).toThrow("Personaje duplicado");
  });

  test("update correcto", () => {
    const p = new Personaje("1", "Rick", "E1", "D1", "vivo", "Independiente", 10, "desc");
    repo.add(p);

    repo.update("1", {
      nombre: "Morty",
      especie: "E2",
      dimension: "D2",
      estado: "muerto",
      afiliacion: "Familia Smith",
      nivelInteligencia: 5,
      descripcion: "nuevo"
    });

    const updated = repo.findById("1");

    expect(updated?.nombre).toBe("Morty");
    expect(updated?.especie).toBe("E2");
    expect(updated?.dimension).toBe("D2");
    expect(updated?.estado).toBe("muerto");
    expect(updated?.afiliacion).toBe("Familia Smith");
    expect(updated?.nivelInteligencia).toBe(5);
    expect(updated?.descripcion).toBe("nuevo");
  });

  test("update no existe", () => {
    expect(() => repo.update("X", {}))
      .toThrow("El personaje no existe");
  });

  test("update nombre vacío", () => {
    const p = new Personaje("1", "Rick", "E1", "D1", "vivo", "Independiente", 10, "desc");
    repo.add(p);

    expect(() => repo.update("1", { nombre: "" }))
      .toThrow("El nombre no puede estar vacío");
  });

  test("update especie null", () => {
    const p = new Personaje("1", "Rick", "E1", "D1", "vivo", "Independiente", 10, "desc");
    repo.add(p);

    expect(() => repo.update("1", { especie: null }))
      .toThrow("La especie no puede ser null");
  });

  test("update dimension null", () => {
    const p = new Personaje("1", "Rick", "E1", "D1", "vivo", "Independiente", 10, "desc");
    repo.add(p);

    expect(() => repo.update("1", { dimension: null }))
      .toThrow("La dimensión no puede ser null");
  });

  test("update nivel inteligencia inválido", () => {
    const p = new Personaje("1", "Rick", "E1", "D1", "vivo", "Independiente", 10, "desc");
    repo.add(p);

    expect(() => repo.update("1", { nivelInteligencia: 0 }))
      .toThrow("El nivel de inteligencia debe estar entre 1 y 10");
  });

  test("update descripción vacía", () => {
    const p = new Personaje("1", "Rick", "E1", "D1", "vivo", "Independiente", 10, "desc");
    repo.add(p);

    expect(() => repo.update("1", { descripcion: "" }))
      .toThrow("La descripción no puede estar vacía");
  });

  test("update duplicado", () => {
    const p1 = new Personaje("1", "Rick", "E1", "D1", "vivo", "Independiente", 10, "desc");
    const p2 = new Personaje("2", "Morty", "E2", "D2", "vivo", "Independiente", 5, "desc");

    repo.add(p1);
    repo.add(p2);

    expect(() => repo.update("2", {
      nombre: "Rick",
      especie: "E1",
      dimension: "D1"
    })).toThrow("Personaje duplicado");
  });

  test("update sin cambios", () => {
    const p = new Personaje("1", "Rick", "E1", "D1", "vivo", "Independiente", 10, "desc");
    repo.add(p);

    repo.update("1", {});

    expect(repo.findById("1")).toEqual(p);
  });

  // -------- FILTERS --------

  test("filterByNombre", () => {
    repo.add(new Personaje("1", "Rick", "E1", "D1", "vivo", "Independiente", 10, "d"));
    repo.add(new Personaje("2", "Morty", "E2", "D2", "vivo", "Independiente", 5, "d"));

    expect(repo.filterByNombre("Rick").length).toBe(1);
  });

  test("filterByEspecie", () => {
    repo.add(new Personaje("1", "Rick", "E1", "D1", "vivo", "Independiente", 10, "d"));
    repo.add(new Personaje("2", "Morty", "E2", "D2", "vivo", "Independiente", 5, "d"));

    expect(repo.filterByEspecie("E1").length).toBe(1);
  });

  test("filterByAfiliacion", () => {
    repo.add(new Personaje("1", "Rick", "E1", "D1", "vivo", "Independiente", 10, "d"));
    repo.add(new Personaje("2", "Morty", "E2", "D2", "vivo", "Familia Smith", 5, "d"));

    expect(repo.filterByAfiliacion("Familia Smith").length).toBe(1);
  });

  test("filterByEstado", () => {
    repo.add(new Personaje("1", "Rick", "E1", "D1", "vivo", "Independiente", 10, "d"));
    repo.add(new Personaje("2", "Morty", "E2", "D2", "muerto", "Independiente", 5, "d"));

    expect(repo.filterByEstado("muerto").length).toBe(1);
  });

  test("filterByDimension", () => {
    repo.add(new Personaje("1", "Rick", "E1", "D1", "vivo", "Independiente", 10, "d"));
    repo.add(new Personaje("2", "Morty", "E2", "D2", "vivo", "Independiente", 5, "d"));

    expect(repo.filterByDimension("D1").length).toBe(1);
  });

  test("setNullDimension", () => {
    const p = new Personaje("1", "Rick", "E1", "D1", "vivo", "Independiente", 10, "d");
    repo.add(p);

    repo.setNullDimension("D1");

    expect(repo.findById("1")?.dimension).toBe(null);
  });

  test("setNullEspecie", () => {
    const p = new Personaje("1", "Rick", "E1", "D1", "vivo", "Independiente", 10, "d");
    repo.add(p);

    repo.setNullEspecie("E1");

    expect(repo.findById("1")?.especie).toBe(null);
  });

  test("getNullDimension", () => {
    const p = new Personaje("1", "Rick", null, null, "vivo", "Independiente", 10, "d");
    repo.add(p);

    expect(repo.getNullDimension().length).toBe(1);
  });

  test("isDuplicate true", () => {
    const p1 = new Personaje("1", "Rick", "E1", "D1", "vivo", "Independiente", 10, "d");
    const p2 = new Personaje("2", "rick", "E1", "D1", "vivo", "Independiente", 10, "d");

    repo.add(p1);

    expect(repo.isDuplicate(p2)).toBe(true);
  });

  test("isDuplicate false", () => {
    const p1 = new Personaje("1", "Rick", "E1", "D1", "vivo", "Independiente", 10, "d");
    const p2 = new Personaje("2", "Morty", "E2", "D2", "vivo", "Independiente", 5, "d");

    repo.add(p1);

    expect(repo.isDuplicate(p2)).toBe(false);
  });

  test("setNullDimension no modifica si no coincide", () => {
    const p = new Personaje("1", "Rick", "E1", "D1", "vivo", "Independiente", 10, "d");
    repo.add(p);

    repo.setNullDimension("D2"); // no coincide

    expect(repo.findById("1")?.dimension).toBe("D1");
  });

  test("setNullEspecie no modifica si no coincide", () => {
    const p = new Personaje("1", "Rick", "E1", "D1", "vivo", "Independiente", 10, "d");
    repo.add(p);

    repo.setNullEspecie("E2"); // no coincide

    expect(repo.findById("1")?.especie).toBe("E1");
  });

  test("getNullDimension vacío", () => {
    const p = new Personaje("1", "Rick", "E1", "D1", "vivo", "Independiente", 10, "d");
    repo.add(p);

    expect(repo.getNullDimension().length).toBe(0);
  });

});