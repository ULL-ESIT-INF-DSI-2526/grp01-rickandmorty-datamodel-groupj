import prompts from "prompts";
import { GestorMultiversal } from "../../../core/gestor.js";
import { Personaje } from "../../../core/models/personajes.js";

/**
 * Funcion que busca personajes por nombre.
 * @param gestor - gestor del multiverso.
 */
export async function searchNombrePersonaje(
  gestor: GestorMultiversal,
): Promise<Personaje[]> {
  const input = await prompts([
    {
      type: "text",
      name: "nombre",
      message: "nombre de personaje",
      validate: (nombre) =>
        nombre.length > 0 ? true : "Debe de tener un nombre",
    },
    {
      type: "select",
      name: "dato",
      message: "Dato para ordenar",
      choices: [
        { title: "Nombre", value: "nombre" },
        { title: "Nivel de inteligencia", value: "nivel" },
      ],
    },
    {
      type: "select",
      name: "orden",
      message: "De que manera",
      choices: [
        { title: "Ascendiente", value: "ascendiente" },
        { title: "Descendiente", value: "descendiente" },
      ],
    },
  ]);
  let busqueda = await gestor.filterPersonajesByNombre(input.nombre);
  if (input.dato === "nombre") {
    if (input.orden === "ascendiente") {
      busqueda = gestor.orderPersonajesByNombre(busqueda, true);
    } else {
      busqueda = gestor.orderPersonajesByNombre(busqueda, false);
    }
  } else {
    if (input.orden === "ascendiente") {
      busqueda = gestor.orderPersonajesByInteligencia(busqueda, true);
    } else {
      busqueda = gestor.orderPersonajesByInteligencia(busqueda, false);
    }
  }
  return busqueda;
}

/**
 * Funcion que busca personajes por especie.
 * @param gestor - gestor del multiverso.
 */
export async function searchEspeciePersonaje(
  gestor: GestorMultiversal,
): Promise<Personaje[]> {
  const input = await prompts([
    {
      type: "text",
      name: "nombre",
      message: "especie de personaje",
      validate: (nombre) =>
        nombre.length > 0 ? true : "Debe de tener una especie",
    },
    {
      type: "select",
      name: "dato",
      message: "Dato para ordenar",
      choices: [
        { title: "Nombre", value: "nombre" },
        { title: "Nivel de inteligencia", value: "nivel" },
      ],
    },
    {
      type: "select",
      name: "orden",
      message: "De que manera",
      choices: [
        { title: "Ascendiente", value: "ascendiente" },
        { title: "Descendiente", value: "descendiente" },
      ],
    },
  ]);
  let busqueda = await gestor.filterPersonajesByEspecie(input.nombre);
  if (input.dato === "nombre") {
    if (input.orden === "ascendiente") {
      busqueda = gestor.orderPersonajesByNombre(busqueda, true);
    } else {
      busqueda = gestor.orderPersonajesByNombre(busqueda, false);
    }
  } else {
    if (input.orden === "ascendiente") {
      busqueda = gestor.orderPersonajesByInteligencia(busqueda, true);
    } else {
      busqueda = gestor.orderPersonajesByInteligencia(busqueda, false);
    }
  }
  return busqueda;
}

/**
 * Funcion que busca personajes por afiliacion.
 * @param gestor - gestor del multiverso.
 */
export async function searchAfiliacionPersonaje(
  gestor: GestorMultiversal,
): Promise<Personaje[]> {
  const input = await prompts([
    {
      type: "select",
      name: "afiliacion",
      message: "Afiliacion:",
      choices: [
        { title: "Federacion Galactica", value: "Federacion Galactica" },
        { title: "Consejo de Ricks", value: "Consejo de Ricks" },
        { title: "Familia Smith", value: "Familia Smith" },
        { title: "Independiente", value: "Independiente" },
      ],
    },
    {
      type: "select",
      name: "dato",
      message: "Dato para ordenar",
      choices: [
        { title: "Nombre", value: "nombre" },
        { title: "Nivel de inteligencia", value: "nivel" },
      ],
    },
    {
      type: "select",
      name: "orden",
      message: "De que manera",
      choices: [
        { title: "Ascendiente", value: "ascendiente" },
        { title: "Descendiente", value: "descendiente" },
      ],
    },
  ]);
  let busqueda = await gestor.filterPersonajesByAfiliacion(input.afiliacion);
  if (input.dato === "nombre") {
    if (input.orden === "ascendiente") {
      busqueda = gestor.orderPersonajesByNombre(busqueda, true);
    } else {
      busqueda = gestor.orderPersonajesByNombre(busqueda, false);
    }
  } else {
    if (input.orden === "ascendiente") {
      busqueda = gestor.orderPersonajesByInteligencia(busqueda, true);
    } else {
      busqueda = gestor.orderPersonajesByInteligencia(busqueda, false);
    }
  }
  return busqueda;
}

/**
 * Funcion que busca personajes por estado.
 * @param gestor - gestor del multiverso.
 */
export async function searchEstadoPersonaje(
  gestor: GestorMultiversal,
): Promise<Personaje[]> {
  const input = await prompts([
    {
      type: "select",
      name: "estado",
      message: "Estado:",
      choices: [
        { title: "Vivo", value: "vivo" },
        { title: "Muerto", value: "muerto" },
        { title: "Desconocido", value: "desconocido" },
        { title: "Robot sustituto", value: "robot sustituto" },
        { title: "Clon", value: "clon" },
      ],
    },
    {
      type: "select",
      name: "dato",
      message: "Dato para ordenar",
      choices: [
        { title: "Nombre", value: "nombre" },
        { title: "Nivel de inteligencia", value: "nivel" },
      ],
    },
    {
      type: "select",
      name: "orden",
      message: "De que manera",
      choices: [
        { title: "Ascendiente", value: "ascendiente" },
        { title: "Descendiente", value: "descendiente" },
      ],
    },
  ]);
  let busqueda = await gestor.filterPersonajesByEstado(input.estado);
  if (input.dato === "nombre") {
    if (input.orden === "ascendiente") {
      busqueda.sort((one, two) => (one.nombre > two.nombre ? -1 : 1));
    } else {
      busqueda.sort((one, two) => (one.nombre > two.nombre ? 1 : -1));
    }
  } else {
    if (input.orden === "ascendiente") {
      busqueda.sort((one, two) =>
        one.nivelInteligencia > two.nivelInteligencia ? -1 : 1,
      );
    } else {
      busqueda.sort((one, two) =>
        one.nivelInteligencia > two.nivelInteligencia ? 1 : -1,
      );
    }
  }
  return busqueda;
}

/**
 * Funcion que busca personajes por dimension de origen.
 * @param gestor - gestor del multiverso.
 */
export async function searchOrigenPersonaje(
  gestor: GestorMultiversal,
): Promise<Personaje[]> {
  const input = await prompts([
    {
      type: "text",
      name: "nombre",
      message: "Dimension de origen del personaje",
      validate: (nombre) =>
        nombre.length > 0 ? true : "Debe de tener una dimension de origen",
    },
    {
      type: "select",
      name: "dato",
      message: "Dato para ordenar",
      choices: [
        { title: "Nombre", value: "nombre" },
        { title: "Nivel de inteligencia", value: "nivel" },
      ],
    },
    {
      type: "select",
      name: "orden",
      message: "De que manera",
      choices: [
        { title: "Ascendiente", value: "ascendiente" },
        { title: "Descendiente", value: "descendiente" },
      ],
    },
  ]);
  let busqueda = await gestor.filterPersonajesByDimension(input.nombre);
  if (input.dato === "nombre") {
    if (input.orden === "ascendiente") {
      busqueda = gestor.orderPersonajesByNombre(busqueda, true);
    } else {
      busqueda = gestor.orderPersonajesByNombre(busqueda, false);
    }
  } else {
    if (input.orden === "ascendiente") {
      busqueda = gestor.orderPersonajesByInteligencia(busqueda, true);
    } else {
      busqueda = gestor.orderPersonajesByInteligencia(busqueda, false);
    }
  }
  return busqueda;
}
