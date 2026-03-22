import prompts from "prompts";
import { GestorMultiversal } from "../../../core/gestor.js";
import { Invento } from "../../../core/models/inventos.js";

/**
 * Funcion que busca inventos por nombre.
 * @param gestor - gestor del multiverso.
 */
export async function searchNombreInvento(
  gestor: GestorMultiversal,
): Promise<Invento[]> {
  const input = await prompts({
    type: "text",
    name: "nombre",
    message: "Nombre del invento",
    validate: (nombre) =>
      nombre.length > 0 ? true : "Debe de tener un nombre",
  });
  const busqueda = await gestor.filterInventosByNombre(input.nombre);
  return busqueda;
}

/**
 * Funcion que busca inventos por inventor.
 * @param gestor - gestor del multiverso.
 */
export async function searchInventorInvento(
  gestor: GestorMultiversal,
): Promise<Invento[]> {
  const input = await prompts({
    type: "text",
    name: "nombre",
    message: "Nombre del inventor",
    validate: (nombre) =>
      nombre.length > 0 ? true : "Debe de tener un nombre",
  });
  const busqueda = await gestor.filterInventosByInventor(input.nombre);
  return busqueda;
}

/**
 * Funcion que busca inventos por tipo.
 * @param gestor - gestor del multiverso.
 */
export async function searchTipoInvento(
  gestor: GestorMultiversal,
): Promise<Invento[]> {
  const input = await prompts({
    type: "select",
    name: "tipo",
    message: "Tipo de invento:",
    choices: [
      { title: "Arma", value: "Arma" },
      { title: "Dispositivo de viaje", value: "Dispositivo de viaje" },
      { title: "Biotecnologia", value: "Biotecnologia" },
      { title: "Objeto cotidiano absurdo", value: "Objeto cotidiano absurdo" },
    ],
  });
  const busqueda = await gestor.filterInventosByTipo(input.tipo);
  return busqueda;
}

/**
 * Funcion que busca inventos por nivel de peligro.
 * @param gestor - gestor del multiverso.
 */
export async function searchNivelInvento(
  gestor: GestorMultiversal,
): Promise<Invento[]> {
  const input = await prompts(
    {
      type: "text",
      name: "nivel",
      message: "Nivel de peligro",
      validate: (nivel) =>
        Number(nivel) > 0 && Number(nivel) < 11 ? true : "Debe estar entre 1 y 10",
    });
  const busqueda = await gestor.filterInventosByPeligrosidad(Number(input.nivel));
  return busqueda;
}
