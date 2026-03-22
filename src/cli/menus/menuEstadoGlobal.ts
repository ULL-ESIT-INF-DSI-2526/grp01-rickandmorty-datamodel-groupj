import prompts from "prompts";
import { GestorMultiversal } from "../../core/gestor.js";
import { Dimension } from "../../core/models/Dimension.js";
import { Personaje } from "../../core/models/personajes.js";

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

/**
 * Menu que muestra el estado global del multiverso.
 * @param manager - gestor del multiverso
 */
export async function mostrarMenuEstadoGlobal(
  manager: GestorMultiversal,
): Promise<void> {
  let volver = false;
  while (!volver) {
    const respuesta = await prompts({
      type: "select",
      name: "accion",
      message: "Estado Global del Multiverso",
      choices: [
        { title: "Dimensiones destruidas", value: "dimensionesDestruidas" },
        { title: "Personajes de dimensiones destruidas", value: "personajesDimDestruida" },
        { title: "Personajes sin dimension (huérfanos)", value: "personajesSinDimension" },
        { title: "Volver", value: "volver" },
      ],
    });

    switch (respuesta.accion) {
      case "dimensionesDestruidas":
        await mostrarDimensionesDestruidas(manager);
        break;
      case "personajesDimDestruida":
        await mostrarPersonajesDimDestruida(manager);
        break;
      case "personajesSinDimension":
        await mostrarPersonajesSinDimension(manager);
        break;
      case "volver":
        volver = true;
        break;
    }
  }
}

/**
 * Muestra las dimensiones que estan destruidas.
 * @param manager - gestor del multiverso
 */
async function mostrarDimensionesDestruidas(manager: GestorMultiversal): Promise<void> {
  try {
    const dimensiones = await manager.getDimensionesDestruidas();
    if (dimensiones.length === 0) {
      console.log("No hay dimensiones destruidas registradas.");
      return;
    }
    console.log("\n=== Dimensiones Destruidas ===");
    dimensiones.forEach((d: Dimension) => {
      console.log(`- ${d.id} | ${d.nombre} | Nivel tecnologico: ${d.nivelTec}`);
    });
  } catch (error: unknown) {
    console.log("Error", getErrorMessage(error));
  }
}

/**
 * Muestra los personajes que pertenecen a dimensiones que estan destruidas.
 * @param manager - gestor del multiverso
 */
async function mostrarPersonajesDimDestruida(manager: GestorMultiversal): Promise<void> {
  try {
    const personajes = await manager.getPersonajesDimDestruida();
    if (personajes.length === 0) {
      console.log("No hay personajes en dimensiones destruidas.");
      return;
    }
    console.log("\n=== Personajes en Dimensiones Destruidas ===");
    personajes.forEach((p: Personaje) => {
      console.log(`- ${p.id} | ${p.nombre} | Dimension: ${p.dimension}`);
    });
  } catch (error: unknown) {
    console.log("Error", getErrorMessage(error));
  }
}

/**
 * Muestra los personajes que tienen la dimension de origen como null.
 * @param manager - gestor del multiverso
 */
async function mostrarPersonajesSinDimension(manager: GestorMultiversal): Promise<void> {
  try {
    const personajes = await manager.getPersonajesDimEliminada();
    if (personajes.length === 0) {
      console.log("No hay personajes sin dimension asignada.");
      return;
    }
    console.log("\n=== Personajes sin Dimension (Huerfanos) ===");
    personajes.forEach((p: Personaje) => {
      console.log(`- ${p.id} | ${p.nombre} | Especie: ${p.especie}`);
    });
  } catch (error: unknown) {
    console.log("Error", getErrorMessage(error));
  }
}