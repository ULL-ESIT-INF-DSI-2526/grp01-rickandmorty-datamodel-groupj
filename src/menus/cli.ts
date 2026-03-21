import prompts from "prompts";
import { GestorMultiversal } from "../gestor.js";
import { db } from "../Database/db.js";
import { mostrarMenuDimenison } from "./menuDimension.js";

type OpcionMenuPrincipal =
  | "dimensiones"
  | "personajes"
  | "especies"
  | "localizaciones"
  | "inventos"
  | "consultas"
  | "salir";

export async function mostrarMenuPrincipal(): Promise<OpcionMenuPrincipal> {
  const respuesta = await prompts({
    type: "select",
    name: "opcion",
    message: "Gestor Multiversal - Menu principal",
    choices: [
      { title: "Dimensiones", value: "dimensiones" },
      { title: "Personajes", value: "personajes" },
      { title: "Especies", value: "especies" },
      { title: "Localizaciones", value: "localizaciones" },
      { title: "Inventos", value: "inventos" },
      { title: "Consultas e informes", value: "consultas" },
      { title: "Salir", value: "salir" },
    ],
  });

  return respuesta.opcion as OpcionMenuPrincipal;
}

export async function mostrarMenuEntidad(nombre: string): Promise<void> {
  const respuesta = await prompts({
    type: "select",
    name: "accion",
    message: `Menu de ${nombre}`,
    choices: [
      { title: "Anadir", value: "anadir" },
      { title: "Modificar", value: "modificar" },
      { title: "Eliminar", value: "eliminar" },
      { title: "Volver", value: "volver" },
    ],
  });

  if (respuesta.accion !== "volver") {
    console.log(`Accion '${respuesta.accion}' de ${nombre} pendiente de implementar.`);
  }
}

export async function mostrarMenuConsultas(): Promise<void> {
  const respuesta = await prompts({
    type: "select",
    name: "consulta",
    message: "Consultas e informes",
    choices: [
      { title: "Consultar personajes", value: "personajes" },
      { title: "Consultar localizaciones", value: "localizaciones" },
      { title: "Consultar inventos", value: "inventos" },
      { title: "Volver", value: "volver" },
    ],
  });

  if (respuesta.consulta !== "volver") {
    console.log(`Consulta '${respuesta.consulta}' pendiente de implementar.`);
  }
}

export async function main(): Promise<void> {
  await db.read();
  const gestor = new GestorMultiversal(db);
  let salir = false;

  while (!salir) {
    const opcion = await mostrarMenuPrincipal();

    switch (opcion) {
      case "dimensiones":
        await mostrarMenuDimenison(gestor);
        break;
      case "personajes":
        await mostrarMenuDimenison(gestor);
        break;
      case "especies":
        await mostrarMenuDimenison(gestor);
        break;
      case "localizaciones":
        await mostrarMenuDimenison(gestor);
        break;
      case "inventos":
        await mostrarMenuDimenison(gestor);
        break;
      case "consultas":
        await mostrarMenuConsultas();
        break;
      case "salir":
        salir = true;
        console.log("Saliendo del Gestor Multiversal...");
        break;
      default:
        console.log("Opcion no valida.");
    }
  }
}