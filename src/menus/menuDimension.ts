import prompts from "prompts";
import { GestorMultiversal } from "../gestor.js";
import { Dimension } from "../Dimension.js";

/**
 * Funcion que implementa los metodos de registro de dimensiones
 * @param manager gestor del multiverso
 */
export async function mostrarMenuDimenison(
  manager: GestorMultiversal,
): Promise<void> {
  let volver = false;
  while (!volver) {
    const respuesta = await prompts({
      type: "select",
      name: "accion",
      message: `Menu de Dimensiones`,
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
      case "mostrar":
        const dimension = await manager.dimensionesRepo.getAll();
        console.log(dimension);
        break;
      case "volver":
        volver = true;
        break;
    }
  }
}

/**
 * Funcion que permite añadir dimensiones mediante prompts
 * @param manager el gestor del multiverso
 * @returns true si se ha creado la dimension de manera correcta
 */
async function addDimensionMenu(manager: GestorMultiversal): Promise<boolean> {
  // Prompts para recopilar los datos del objeto
  const data = await prompts([
    {
      type: "text",
      name: "id",
      message: "Introduce el ID de la dimensión a añadir:",
      validate: (id) => (id.length > 0 ? true : "Debe de tener un ID"),
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
        { title: "Cuatentena", value: "en cuarentena" },
        { title: "Destruida", value: "destruida" },
      ],
    },
    {
      type: "text",
      name: "nivelTec",
      message: "Nivel tecnológico:",
      validate: (nivelTec) =>
        nivelTec >= 1 && nivelTec <= 10 ? true : "Debe ser entre 1-10",
    },
    {
      type: "text",
      name: "descripcion",
      message: "Descripción:",
      validate: (descripcion) =>
        descripcion.length > 0 ? true : "Debe de tener descripción",
    },
  ]);

  try {
    const newDimension = new Dimension(
      data.id,
      data.nombre,
      data.estadoDim,
      data.nivelTec,
      data.descripcion,
    );

    await manager.addDimension(newDimension);
    console.log(`La dimensión ${data.id} ha sido añadida correctamente`);
    return true;
  } catch (error: any) {
    console.log("Error", error.message);
    return false;
  }
}

/**
 * Funcion que permite eliminar una dimension del multiverso
 * @param manager el gestor del multiverso
 * @returns true si se ha eliminado la dimension de manera correcta
 * @throws Error si no existe el ID que se quiere eliminar
 */
async function removeDimensionMenu(
  manager: GestorMultiversal,
): Promise<boolean> {
  // Prompt conseguir el id a eliminar
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
  } catch (error: any) {
    console.log("Error", error.message);
    return false;
  }
}

/**
 * Funcion que permite modificar los elementos de una dimension en la base de datos
 * @param manager 
 * @throws Error si no se ha podido modificar la dimension o si no existe
 */
async function modificarDimensionMenu(manager: GestorMultiversal) {
  // Prompts para recopilar los datos para modificar
  const data = await prompts([
    {
      type: "text",
      name: "id",
      message: "Introduce el ID de la dimensión a añadir:",
      validate: (id) => (id.length > 0 ? true : "Debe de tener un ID"),
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
        { title: "sin cambio", value: null },
        { title: "Activa", value: "activa" },
        { title: "Cuatentena", value: "en cuarentena" },
        { title: "Destruida", value: "destruida" },
      ],
    },
    {
      type: "text",
      name: "nivelTec",
      message: "Nivel tecnológico: (vacio para no modificar)",
      validate: (nivelTec) =>
        (nivelTec >= 1 && nivelTec <= 10) || isNaN(nivelTec)
          ? true
          : "Debe ser entre 1-10",
    },
    {
      type: "text",
      name: "descripcion",
      message: "Descripción: (vacio para no modificar)",
    },
  ]);
  try {
    const mod: any = {};
    if (data.nombre) mod.nombre = data.nombre;
    if (data.estadoDim !== null) mod.estadoDim = data.estadoDim;
    if (!isNaN(data.nivelTec)) mod.nivelTec = data.nivelTec;
    if (data.descripcion) mod.descripcion = data.descripcion;

    const result = await manager.updateDimension(data.id, mod);
    console.log(`La dimension ${data.id} ha sido modificada correctamente.`);
  } catch (error: any) {
    console.log("error", error.message);
  }
}
