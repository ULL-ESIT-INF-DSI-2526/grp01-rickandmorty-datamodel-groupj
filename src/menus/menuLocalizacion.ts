import prompts from "prompts";
import { GestorMultiversal } from "../gestor.js";
import { Localizacion } from "../localizaciones.js";
import { tipoLocalizacion } from "../types.js";

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

/**
 * Funcion que implementa los metodos de registro de localizaciones.
 * @param manager - gestor del multiverso.
 */
export async function mostrarMenuLocalizacion(
  manager: GestorMultiversal,
): Promise<void> {
  let volver = false;
  while (!volver) {
    const respuesta = await prompts({
      type: "select",
      name: "accion",
      message: "Menu de Localizaciones",
      choices: [
        { title: "Anadir", value: "anadir" },
        { title: "Modificar", value: "modificar" },
        { title: "Eliminar", value: "eliminar" },
        { title: "Mostrar todo", value: "mostrar" },
        { title: "Volver", value: "volver" },
      ],
    });
    switch (respuesta.accion) {
      case "anadir":
        await addLocalizacionMenu(manager);
        break;
      case "eliminar":
        await removeLocalizacionMenu(manager);
        break;
      case "modificar":
        await modificarLocalizacionMenu(manager);
        break;
      case "mostrar": {
        const localizaciones = await manager.localizacionesRepo.getAll();
        console.log(localizaciones);
        break;
      }
      case "volver":
        volver = true;
        break;
    }
  }
}

/**
 * Funcion que permite anadir localizaciones mediante prompts.
 * @param manager - el gestor del multiverso.
 * @returns true si se ha creado la localizacion de manera correcta.
 */
async function addLocalizacionMenu(
  manager: GestorMultiversal,
): Promise<boolean> {
  const data = await prompts([
    {
      type: "text",
      name: "id",
      message: "Introduce el ID de la localizacion a anadir (formato: LXXX):",
      validate: (id) => (/^L\d+$/.test(id) ? true : "Debe tener formato LXXX (ej: L001)"),
    },
    {
      type: "text",
      name: "nombre",
      message: "Nombre:",
      validate: (name) => (name.length > 0 ? true : "Debe de tener un nombre"),
    },
    {
      type: "select",
      name: "tipo",
      message: "Tipo de localizacion:",
      choices: [
        { title: "Planeta", value: "Planeta" },
        { title: "Estacion espacial", value: "Estacion espacial" },
        { title: "Dimension de bolsillo", value: "Dimension de bolsillo" },
        { title: "Simulacion virtual", value: "Simulacion virtual" },
      ],
    },
    {
      type: "text",
      name: "poblacionAproximada",
      message: "Poblacion aproximada:",
      validate: (poblacionAproximada) =>
        Number(poblacionAproximada) >= 0 ? true : "No puede ser negativo",
    },
    {
      type: "text",
      name: "dimension",
      message: "Dimension de origen:",
      validate: (dimension) =>
        dimension.length > 0 ? true : "Debe de tener una dimension de origen",
    },
    {
      type: "text",
      name: "descripcion",
      message: "Descripcion:",
      validate: (descripcion) =>
        descripcion.length > 0 ? true : "Debe de tener descripcion",
    },
  ]);

  try {
    const newLocalizacion = new Localizacion(
      data.id,
      data.nombre,
      data.tipo,
      Number(data.poblacionAproximada),
      data.dimension,
      data.descripcion,
    );

    await manager.addLocalizacion(newLocalizacion);
    console.log(`La localizacion ${data.id} ha sido anadida correctamente`);
    return true;
  } catch (error: unknown) {
    console.log("Error", getErrorMessage(error));
    return false;
  }
}

/**
 * Funcion que permite eliminar una localizacion del multiverso.
 * @param manager - el gestor del multiverso.
 * @returns true si se ha eliminado la localizacion de manera correcta.
 */
async function removeLocalizacionMenu(
  manager: GestorMultiversal,
): Promise<boolean> {
  const { id } = await prompts({
    type: "text",
    name: "id",
    message: "ID a eliminar:",
    validate: (id) => (id.length > 0 ? true : "Debe de tener un ID"),
  });

  try {
    await manager.removeLocalizacion(id);
    console.log(`La localizacion ${id} ha sido eliminada correctamente.`);
    return true;
  } catch (error: unknown) {
    console.log("Error", getErrorMessage(error));
    return false;
  }
}

/**
 * Funcion que permite modificar los elementos de una localizacion.
 * @param manager - gestor del multiverso.
 * @returns true si se ha modificado correctamente.
 */
async function modificarLocalizacionMenu(
  manager: GestorMultiversal,
): Promise<boolean> {
  const data = await prompts([
    {
      type: "text",
      name: "id",
      message: "Introduce el ID de la localizacion a modificar (formato: LXXX):",
      validate: (id) => (/^L\d+$/.test(id) ? true : "Debe tener formato LXXX (ej: L001)"),
    },
    {
      type: "text",
      name: "nombre",
      message: "Nombre: (vacio para no modificar)",
    },
    {
      type: "select",
      name: "tipo",
      message: "Tipo de localizacion:",
      choices: [
        { title: "Sin modificar", value: null },
        { title: "Planeta", value: "Planeta" },
        { title: "Estacion espacial", value: "Estacion espacial" },
        { title: "Dimension de bolsillo", value: "Dimension de bolsillo" },
        { title: "Simulacion virtual", value: "Simulacion virtual" },
      ],
    },
    {
      type: "text",
      name: "poblacionAproximada",
      message: "Poblacion aproximada: (vacio para no modificar)",
      validate: (poblacionAproximada) =>
        poblacionAproximada === "" || Number(poblacionAproximada) >= 0
          ? true
          : "No puede ser negativo",
    },
    {
      type: "text",
      name: "dimension",
      message: "Dimension de origen: (vacio para no modificar)",
    },
    {
      type: "text",
      name: "descripcion",
      message: "Descripcion: (vacio para no modificar)",
    },
  ]);

  try {
    const mod: {
      nombre?: string;
      tipo?: tipoLocalizacion;
      poblacionAproximada?: number;
      dimension?: string | null;
      descripcion?: string;
    } = {};

    if (data.nombre) mod.nombre = data.nombre;
    if (data.tipo !== null) mod.tipo = data.tipo as tipoLocalizacion;
    if (data.poblacionAproximada !== "") {
      mod.poblacionAproximada = Number(data.poblacionAproximada);
    }
    if (data.dimension) mod.dimension = data.dimension;
    if (data.descripcion) mod.descripcion = data.descripcion;

    await manager.updateLocalizacion(data.id, mod);
    console.log(`La localizacion ${data.id} ha sido modificada correctamente.`);
    return true;
  } catch (error: unknown) {
    console.log("Error", getErrorMessage(error));
    return false;
  }
}