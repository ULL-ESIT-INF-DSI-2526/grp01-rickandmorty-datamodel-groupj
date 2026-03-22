import prompts from "prompts";
import { GestorMultiversal } from "../../core/gestor.js";
import { Dimension } from "../../core/models/Dimension.js";
import { estadosDimension } from "../../utils/types.js";

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

/**
 * Funcion que implementa los metodos de registro de dimensiones.
 * @param manager - gestor del multiverso.
 */
export async function mostrarMenuDimension(
  manager: GestorMultiversal,
): Promise<void> {
  let volver = false;
  while (!volver) {
    const respuesta = await prompts({
      type: "select",
      name: "accion",
      message: "Menu de Dimensiones",
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
        await addDimensionMenu(manager);
        break;
      case "eliminar":
        await removeDimensionMenu(manager);
        break;
      case "modificar":
        await modificarDimensionMenu(manager);
        break;
      case "mostrar": {
        const dimension = await manager.dimensionesRepo.getAll();
        console.log(dimension);
        break;
      }
      case "volver":
        volver = true;
        break;
    }
  }
}

/**
 * Funcion que permite anadir dimensiones mediante prompts.
 * @param manager - el gestor del multiverso.
 * @returns true si se ha creado la dimension de manera correcta.
 */
async function addDimensionMenu(manager: GestorMultiversal): Promise<boolean> {
  const data = await prompts([
    {
      type: "text",
      name: "id",
      message: "Introduce el ID de la dimensión a anadir (formato: D-XXX):",
      validate: (id) => (/^D-\d+$/.test(id) ? true : "Debe tener formato D-XXX (ej: D-001)"),
    },
    {
      type: "text",
      name: "nombre",
      message: "Nombre:",
      validate: (name) => (name.length > 0 ? true : "Debe de tener un nombre"),
    },
    {
      type: "select",
      name: "estadoDim",
      message: "Estado:",
      choices: [
        { title: "Activa", value: "activa" },
        { title: "Cuarentena", value: "en cuarentena" },
        { title: "Destruida", value: "destruida" },
      ],
    },
    {
      type: "text",
      name: "nivelTec",
      message: "Nivel tecnologico:",
      validate: (nivelTec) =>
        Number(nivelTec) >= 1 && Number(nivelTec) <= 10 ? true : "Debe ser entre 1-10",
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
    const newDimension = new Dimension(
      data.id,
      data.nombre,
      data.estadoDim,
      Number(data.nivelTec),
      data.descripcion,
    );

    await manager.addDimension(newDimension);
    console.log(`La dimension ${data.id} ha sido anadida correctamente`);
    return true;
  } catch (error: unknown) {
    console.log("Error", getErrorMessage(error));
    return false;
  }
}

/**
 * Funcion que permite eliminar una dimension del multiverso.
 * @param manager - el gestor del multiverso.
 * @returns true si se ha eliminado la dimension de manera correcta.
 */
async function removeDimensionMenu(
  manager: GestorMultiversal,
): Promise<boolean> {
  const { id } = await prompts({
    type: "text",
    name: "id",
    message: "ID a eliminar:",
    validate: (id) => (id.length > 0 ? true : "Debe de tener un ID"),
  });

  try {
    await manager.removeDimension(id);
    console.log(`La dimension ${id} ha sido eliminada correctamente.`);
    return true;
  } catch (error: unknown) {
    console.log("Error", getErrorMessage(error));
    return false;
  }
}

/**
 * Funcion que permite modificar los elementos de una dimension en la base de datos.
 * @param manager - gestor del multiverso.
 * @returns true si se ha modificado correctamente.
 */
async function modificarDimensionMenu(manager: GestorMultiversal): Promise<boolean> {
  const data = await prompts([
    {
      type: "text",
      name: "id",
      message: "Introduce el ID de la dimension a modificar:",
      validate: (id) => (/^D-\d+$/.test(id) ? true : "Debe tener formato D-XXX (ej: D-001)"),
    },
    {
      type: "text",
      name: "nombre",
      message: "Nombre: (vacio para no modificar)",
    },
    {
      type: "select",
      name: "estadoDim",
      message: "Estado:",
      choices: [
        { title: "Sin cambio", value: null },
        { title: "Activa", value: "activa" },
        { title: "Cuarentena", value: "en cuarentena" },
        { title: "Destruida", value: "destruida" },
      ],
    },
    {
      type: "text",
      name: "nivelTec",
      message: "Nivel tecnologico: (vacio para no modificar)",
      validate: (nivelTec) =>
        nivelTec === "" || (Number(nivelTec) >= 1 && Number(nivelTec) <= 10)
          ? true
          : "Debe ser entre 1-10",
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
      estadoDim?: estadosDimension;
      nivelTec?: number;
      descripcion?: string;
    } = {};

    if (data.nombre) mod.nombre = data.nombre;
    if (data.estadoDim !== null) mod.estadoDim = data.estadoDim as estadosDimension;
    if (data.nivelTec !== "") mod.nivelTec = Number(data.nivelTec);
    if (data.descripcion) mod.descripcion = data.descripcion;

    await manager.updateDimension(data.id, mod);
    console.log(`La dimension ${data.id} ha sido modificada correctamente.`);
    return true;
  } catch (error: unknown) {
    console.log("Error", getErrorMessage(error));
    return false;
  }
}
