import prompts from "prompts";
import { GestorMultiversal } from "../gestor.js";
import { Dimension } from "../Dimension.js";

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
      { title: "Volver", value: "volver" },
    ],
  });
    switch (respuesta.accion) {
      case "anadir":
        await addDimensionMenu(manager);
        break;
      case "volver":
        volver = true;
        break;
    }
  }
}

async function addDimensionMenu(manager: GestorMultiversal) :Promise<boolean> {
  const data = await prompts([
    {
      type: "text",
      name: "id",
      message: "Introduce el ID de la dimensión a añadir:",
      validate: (id) => (id.length > 0 ? true : "Debe de tener un ID"),
    },
    {
      type: "text",
      name: "name",
      message: "Nombre:",
      validate: (name) => (name.length > 0 ? true : "Debe de tener un nombre"),
    },
    {
      type: "select",
      name: "state",
      message: "Estado:",
      choices: [
        { title: "Activa", value: "activa" },
        { title: "Cuatentena", value: "en cuarentena" },
        { title: "Destruida", value: "destruida" },
      ],
    },
    {
      type: "text",
      name: "techlevel",
      message: "Nivel tecnológico:",
      validate: (techlevel) =>
        techlevel >= 1 && techlevel <= 10 ? true : "Debe ser entre 1-10",
    },
    {
      type: "text",
      name: "desc",
      message: "Descripción:",
      validate: (desc) =>
        desc.length > 0 ? true : "Debe de tener descripción",
    },
  ]);

  try {
    const newDimension = new Dimension(
      data.id,
      data.name,
      data.state,
      data.techlevel,
      data.desc,
    );

    await manager.addDimension(newDimension);
    console.log(`La dimensión ${data.id} ha sido añadida correctamente`);
    return true;
  } catch (error: any) {
    console.log("Error", error.message);
    return false;
  }
}
