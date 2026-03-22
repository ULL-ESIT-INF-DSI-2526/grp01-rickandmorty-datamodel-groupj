import prompts from "prompts";
import { GestorMultiversal } from "../gestor.js";
import {
  searchAfiliacionPersonaje,
  searchEspeciePersonaje,
  searchEstadoPersonaje,
  searchNombrePersonaje,
  searchOrigenPersonaje,
} from "./buscadores/searchPersonaje.js";
import {
  searchNombreLocalizacion,
  searchTipoLocalizacion,
  searchDimensionLocalizacion,
} from "./buscadores/searchLocalizacion.js";
import {
  searchInventorInvento,
  searchNombreInvento,
  searchTipoInvento,
  searchNivelInvento,
} from "./buscadores/searchInventos.js";

/**
 * Funcion que guarda las opciones del menu de consultas
 * @param gestor gestor del multiverso
 */
export async function mostrarMenuConsultas(
  gestor: GestorMultiversal,
): Promise<void> {
  let salir = false;
  while (!salir) {
    const respuesta = await prompts({
      type: "select",
      name: "consulta",
      message: "Consultas e informes",
      choices: [
        { title: "Consultar personajes", value: "personajes" },
        { title: "Consultar localizaciones", value: "localizaciones" },
        { title: "Consultar inventos", value: "inventos" },
        { title: "Variantes de personaje", value: "variantes" },
        { title: "Volver", value: "volver" },
      ],
    });

    switch (respuesta.consulta) {
      case "personajes":
        await consultasPersonaje(gestor);
        break;
      case "localizaciones":
        await consultasLocalizaciones(gestor);
        break;
      case "inventos":
        await consultasInventos(gestor);
        break;
      case "variantes":
        const input = await prompts({
          type: "text",
          name: "nombre",
          message: "Nombre de localizaicon",
          validate: (nombre) =>
            nombre.length > 0 ? true : "Debe de tener un nombre",
        });
        let result = await gestor.getVariantesPersonaje(input.nombre);
        console.log(result);
        break;
      case "volver":
        salir = true;
        break;
    }
  }
}

/**
 * Funcion que guarda las opciones del menu de localizaciones
 * @param gestor gestor del multiverso
 */
export async function consultasLocalizaciones(gestor: GestorMultiversal) {
  let salir = false;
  while (!salir) {
    const respuesta = await prompts({
      type: "select",
      name: "consulta localizacion",
      message: "Consulta de localizaciones",
      choices: [
        { title: "Nombre", value: "nombre" },
        { title: "Tipo", value: "tipo" },
        { title: "Dimension de origen", value: "dimension" },
        { title: "Volver", value: "volver" },
      ],
    });
    let input;
    let busqueda;
    switch (respuesta["consulta localizacion"]) {
      case "nombre":
        busqueda = await searchNombreLocalizacion(gestor);
        console.log(busqueda);
        break;
      case "tipo":
        busqueda = await searchTipoLocalizacion(gestor);
        console.log(busqueda);
        break;
      case "dimension":
        busqueda = await searchDimensionLocalizacion(gestor);
        console.log(busqueda);
        break;
      case "volver":
        salir = true;
        break;
    }
  }
}

/**
 * Funcion que guarda las opciones del menu de inventos
 * @param gestor gestor del multiverso
 */
export async function consultasInventos(gestor: GestorMultiversal) {
  let salir = false;
  while (!salir) {
    const respuesta = await prompts({
      type: "select",
      name: "consulta inventos",
      message: "Consulta de inventos",
      choices: [
        { title: "Nombre", value: "nombre" },
        { title: "Tipo", value: "tipo" },
        { title: "Inventor", value: "inventor" },
        { title: "Nivel de peligrosidad", value: "nivel" },
        { title: "Volver", value: "volver" },
      ],
    });
    let input;
    let busqueda;
    switch (respuesta["consulta inventos"]) {
      case "nombre":
        busqueda = await searchNombreInvento(gestor);
        console.log(busqueda);
        break;
      case "tipo":
        busqueda = await searchTipoInvento(gestor);
        console.log(busqueda);
        break;
      case "inventor":
        busqueda = await searchInventorInvento(gestor);
        console.log(busqueda);
        break;
      case "nivel":
        busqueda = await searchNivelInvento(gestor);
        console.log(busqueda);
        break;
      case "volver":
        salir = true;
        break;
    }
  }
}

/**
 * Funcion que guarda las opciones del menu de personajes
 * @param gestor gestor del multiverso
 */
export async function consultasPersonaje(gestor: GestorMultiversal) {
  let salir = false;
  while (!salir) {
    const respuesta = await prompts({
      type: "select",
      name: "consulta personaje",
      message: "Consulta de personajes",
      choices: [
        { title: "Nombre", value: "nombre" },
        { title: "Especie", value: "especie" },
        { title: "Afiliacion", value: "afiliacion" },
        { title: "Estado", value: "estado" },
        { title: "Dimension de origen", value: "origen" },
        { title: "Volver", value: "volver" },
      ],
    });
    let opcion;
    let input;
    let busqueda;
    switch (respuesta["consulta personaje"]) {
      case "nombre":
        busqueda = await searchNombrePersonaje(gestor);
        console.log(busqueda);
        break;
      case "especie":
        busqueda = await searchEspeciePersonaje(gestor);
        console.log(busqueda);
        break;
      case "afiliacion":
        busqueda = await searchAfiliacionPersonaje(gestor);
        console.log(busqueda);
        break;
      case "estado":
        busqueda = await searchEstadoPersonaje(gestor);
        console.log(busqueda);
        break;
      case "origen":
        busqueda = await searchOrigenPersonaje(gestor);
        console.log(busqueda);
        break;
      case "volver":
        salir = true;
        break;
    }
  }
}
