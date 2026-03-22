import prompts from "prompts";
import { GestorMultiversal } from "../../core/gestor.js";
import { Dimension } from "../../core/models/Dimension.js";
import { Personaje } from "../../core/models/personajes.js";

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

/**
 * Menu que muestra los informes del multiverso.
 * @param manager - gestor del multiverso
 */
export async function mostrarMenuInformes(
  manager: GestorMultiversal,
): Promise<void> {
  let volver = false;
  while (!volver) {
    const respuesta = await prompts({
      type: "select",
      name: "informe",
      message: "Informes del Multiverso",
      choices: [
        { title: "Dimensiones activas y nivel tecnologico medio", value: "dimensionesActivas" },
        { title: "Personajes con mas versiones alternativas", value: "personajesVariantes" },
        { title: "Inventos mas peligrosos desplegados", value: "inventosDesplegados" },
        { title: "Historial de viajes de un personaje", value: "historialViajes" },
        { title: "Volver", value: "volver" },
      ],
    });

    switch (respuesta.informe) {
      case "dimensionesActivas":
        await informeDimensionesActivas(manager);
        break;
      case "personajesVariantes":
        await informePersonajesMasVariantes(manager);
        break;
      case "inventosDesplegados":
        await informeInventosDesplegados(manager);
        break;
      case "historialViajes":
        await informeHistorialViajes(manager);
        break;
      case "volver":
        volver = true;
        break;
    }
  }
}

/**
 * Informe de dimensiones activas y su nivel tecnologico medio.
 * @param manager - gestor del multiverso
 */
async function informeDimensionesActivas(manager: GestorMultiversal): Promise<void> {
  try {
    const { activas, mediaNivelTec } = await manager.getInformeDimensionesActivas();

    if (activas.length === 0) {
      console.log("No hay dimensiones activas registradas.");
      return;
    }

    console.log("\n=== Dimensiones Activas ===");
    console.log(`Total: ${activas.length} dimensiones`);
    console.log(`Nivel tecnologico medio: ${mediaNivelTec.toFixed(2)}`);
    console.log("\nListado de dimensiones activas:");
    activas.forEach((d: Dimension) => {
      console.log(`- ${d.id} | ${d.nombre} | Nivel tecnologico: ${d.nivelTec}`);
    });
  } catch (error: unknown) {
    console.log("Error", getErrorMessage(error));
  }
}

/**
 * Informe de personajes con mayor numero de versiones alternativas.
 * @param manager - gestor del multiverso
 */
async function informePersonajesMasVariantes(manager: GestorMultiversal): Promise<void> {
  try {
    const { top, maximoVersiones } = await manager.getInformePersonajesMasVariantes();

    if (top.length === 0) {
      console.log("No hay personajes con versiones alternativas registradas.");
      return;
    }

    console.log("\n=== Personajes con mas versiones alternativas ===");
    console.log(`Maximo de versiones: ${maximoVersiones}`);
    console.log("\nPersonajes con mas versiones:");
    top.forEach((registro) => {
      console.log(`- ${registro.nombreOriginal} | ${registro.totalVersiones} versiones`);
    });
  } catch (error: unknown) {
    console.log("Error", getErrorMessage(error));
  }
}

/**
 * Informe de inventos desplegados actualmente ordenados por nivel de peligrosidad.
 * @param manager - gestor del multiverso
 */
async function informeInventosDesplegados(manager: GestorMultiversal): Promise<void> {
  try {
    const desplegados = await manager.getInformeInventosDesplegados();

    if (desplegados.length === 0) {
      console.log("No hay inventos desplegados actualmente.");
      return;
    }

    console.log("\n=== Inventos Desplegados (ordenados por peligrosidad) ===");
    desplegados.forEach((item) => {
      console.log(`- ${item.inventoId} | ${item.inventoNombre} | Peligro: ${item.nivelPeligro} | Localizacion: ${item.localizacionNombre}`);
    });
  } catch (error: unknown) {
    console.log("Error", getErrorMessage(error));
  }
}

/**
 * Informe del historial de viajes interdimensionales de un personaje.
 * @param manager - gestor del multiverso
 */
async function informeHistorialViajes(manager: GestorMultiversal): Promise<void> {
  try {
    const { personajeId } = await prompts({
      type: "text",
      name: "personajeId",
      message: "ID del personaje para historial de viajes:",
      validate: (valor) => valor.length > 0 ? true : "Debe tener un ID",
    });

    const viajes = await manager.getHistorialViajesPorPersonaje(personajeId);
    const nombrePersonaje = await manager.getNombrePersonajeById(personajeId) ?? personajeId;

    if (viajes.length === 0) {
      console.log(`No hay viajes registrados para ${nombrePersonaje}.`);
      return;
    }

    console.log(`\n=== Historial de viajes de ${nombrePersonaje} ===`);
    console.log(`Total de viajes: ${viajes.length}`);
    console.log("\nListado de viajes:");
    viajes.forEach((viaje) => {
      console.log(`- ${viaje.fecha} | ${viaje.dimensionOrigenId} -> ${viaje.dimensionDestinoId} | Motivo: ${viaje.motivo}`);
    });
  } catch (error: unknown) {
    console.log("Error", getErrorMessage(error));
  }
}