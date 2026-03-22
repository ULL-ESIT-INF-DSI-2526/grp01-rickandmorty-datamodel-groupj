import prompts from "prompts";
import { GestorMultiversal } from "../../core/gestor.js";
import { Especie } from "../../core/models/especies.js";
import { tiposEspecie } from "../../utils/types.js";

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

/**
 * Funcion que implementa los metodos de registro de especies.
 * @param manager - gestor del multiverso.
 */
export async function mostrarMenuEspecie(
  manager: GestorMultiversal,
): Promise<void> {
  let volver = false;

  while (!volver) {
    const respuesta = await prompts({
      type: "select",
      name: "accion",
      message: "Menu de Especies",
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
        await addEspecieMenu(manager);
        break;
      case "eliminar":
        await removeEspecieMenu(manager);
        break;
      case "modificar":
        await modificarEspecieMenu(manager);
        break;
      case "mostrar": {
        const especies = await manager.especiesRepo.getAll();
        console.log(especies);
        break;
      }
      case "volver":
        volver = true;
        break;
    }
  }
}

/**
 * Funcion que permite anadir especies mediante prompts.
 * @param manager - el gestor del multiverso.
 * @returns true si se ha creado la especie de manera correcta.
 */
async function addEspecieMenu(manager: GestorMultiversal): Promise<boolean> {
  const data = await prompts([
    {
      type: "text",
      name: "id",
      message: "Introduce el ID de la especie a anadir (formato: EXXX):",
      validate: (id) => (/^E\d+$/.test(id) ? true : "Debe tener formato EXXX (ej: E001)"),
    },
    {
      type: "text",
      name: "nombre",
      message: "Nombre:",
      validate: (nombre) => (nombre.length > 0 ? true : "Debe tener un nombre"),
    },
    {
      type: "text",
      name: "origen",
      message: "ID de origen (dimension o localizacion):",
      validate: (origen) => (origen.length > 0 ? true : "Debe tener origen"),
    },
    {
      type: "select",
      name: "tipo",
      message: "Tipo:",
      choices: [
        { title: "Humanoide", value: "humanoide" },
        { title: "Amorfo", value: "amorfo" },
        { title: "Robotico", value: "robotico" },
        { title: "Parasito", value: "parasito" },
        { title: "Hivemind", value: "hivemind" },
      ],
    },
    {
      type: "text",
      name: "esperanzaVida",
      message: "Esperanza de vida:",
      validate: (esperanzaVida) =>
        Number(esperanzaVida) > 0 ? true : "Debe ser mayor que 0",
    },
    {
      type: "text",
      name: "descripcion",
      message: "Descripcion:",
      validate: (descripcion) =>
        descripcion.length > 0 ? true : "Debe tener descripcion",
    },
  ]);

  try {
    const newEspecie = new Especie(
      data.id,
      data.nombre,
      data.origen,
      data.tipo,
      Number(data.esperanzaVida),
      data.descripcion,
    );

    await manager.addEspecie(newEspecie);
    console.log(`La especie ${data.id} ha sido anadida correctamente`);
    return true;
  } catch (error: unknown) {
    console.log("Error", getErrorMessage(error));
    return false;
  }
}

/**
 * Funcion que permite eliminar una especie del multiverso.
 * @param manager - el gestor del multiverso.
 * @returns true si se ha eliminado la especie de manera correcta.
 */
async function removeEspecieMenu(manager: GestorMultiversal): Promise<boolean> {
  const { id } = await prompts({
    type: "text",
    name: "id",
    message: "ID de la especie a eliminar:",
    validate: (value) => (value.length > 0 ? true : "Debe tener un ID"),
  });

  try {
    await manager.removeEspecie(id);
    console.log(`La especie ${id} ha sido eliminada correctamente.`);
    return true;
  } catch (error: unknown) {
    console.log("Error", getErrorMessage(error));
    return false;
  }
}

/**
 * Funcion que permite modificar los elementos de una especie en la base de datos.
 * @param manager - gestor del multiverso.
 * @returns true si se ha modificado correctamente.
 */
async function modificarEspecieMenu(manager: GestorMultiversal): Promise<boolean> {
  const data = await prompts([
    {
      type: "text",
      name: "id",
      message: "Introduce el ID de la especie a modificar (formato: EXXX):",
      validate: (id) => (/^E\d+$/.test(id) ? true : "Debe tener formato EXXX (ej: E001)"),
    },
    {
      type: "text",
      name: "nombre",
      message: "Nombre: (vacio para no modificar)",
    },
    {
      type: "text",
      name: "origen",
      message: "Origen: (vacio para no modificar)",
    },
    {
      type: "select",
      name: "tipo",
      message: "Tipo:",
      choices: [
        { title: "Sin modificar", value: null },
        { title: "Humanoide", value: "humanoide" },
        { title: "Amorfo", value: "amorfo" },
        { title: "Robotico", value: "robotico" },
        { title: "Parasito", value: "parasito" },
        { title: "Hivemind", value: "hivemind" },
      ],
    },
    {
      type: "text",
      name: "esperanzaVida",
      message: "Esperanza de vida: (vacio para no modificar)",
      validate: (esperanzaVida) =>
        esperanzaVida === "" || Number(esperanzaVida) > 0
          ? true
          : "Debe ser mayor que 0",
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
      origen?: string | null;
      tipo?: tiposEspecie;
      esperanzaVida?: number;
      descripcion?: string;
    } = {};

    if (data.nombre) mod.nombre = data.nombre;
    if (data.origen) mod.origen = data.origen;
    if (data.tipo !== null) mod.tipo = data.tipo as tiposEspecie;
    if (data.esperanzaVida !== "") mod.esperanzaVida = Number(data.esperanzaVida);
    if (data.descripcion) mod.descripcion = data.descripcion;

    await manager.updateEspecie(data.id, mod);
    console.log(`La especie ${data.id} ha sido modificada correctamente.`);
    return true;
  } catch (error: unknown) {
    console.log("Error", getErrorMessage(error));
    return false;
  }
}