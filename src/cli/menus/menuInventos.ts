import prompts from "prompts";
import { GestorMultiversal } from "../../core/gestor.js";
import { Invento } from "../../core/models/inventos.js";
import { tiposInvento } from "../../utils/types.js";

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

/**
 * Funcion que implementa los metodos de registro de inventos.
 * @param manager - gestor del multiverso.
 */
export async function mostrarMenuInvento(
  manager: GestorMultiversal,
): Promise<void> {
  let volver = false;
  while (!volver) {
    const respuesta = await prompts({
      type: "select",
      name: "accion",
      message: "Menu de Inventos",
      choices: [
        { title: "Anadir", value: "anadir" },
        { title: "Modificar", value: "modificar" },
        { title: "Eliminar", value: "eliminar" },
        { title: "Mostrar todo", value: "mostrar" },
        { title: "Consultar", value: "consultar" },
        { title: "Volver", value: "volver" },
      ],
    });
    switch (respuesta.accion) {
      case "anadir":
        await addInventoMenu(manager);
        break;
      case "eliminar":
        await removeInventoMenu(manager);
        break;
      case "modificar":
        await modificarInventoMenu(manager);
        break;
      case "mostrar": {
        const inventos = await manager.inventosRepo.getAll();
        console.log(inventos);
        break;
      }
      case "consultar":
        await consultasInvento(manager);
        break;
      case "volver":
        volver = true;
        break;
    }
  }
}

/**
 * Funcion que permite consultar inventos por diferentes criterios.
 * @param manager - gestor del multiverso
 */
async function consultasInvento(manager: GestorMultiversal): Promise<void> {
  let salir = false;
  while (!salir) {
    const respuesta = await prompts({
      type: "select",
      name: "consulta",
      message: "Consultar inventos por:",
      choices: [
        { title: "Nombre", value: "nombre" },
        { title: "Tipo", value: "tipo" },
        { title: "Inventor", value: "inventor" },
        { title: "Nivel de peligrosidad", value: "nivel" },
        { title: "Volver", value: "volver" },
      ],
    });

    let resultados: Invento[] = [];

    switch (respuesta.consulta) {
      case "nombre": {
        const { nombre } = await prompts({
          type: "text",
          name: "nombre",
          message: "Nombre del invento:",
          validate: (valor) => valor.length > 0 || "Debe tener un nombre",
        });
        resultados = await manager.filterInventosByNombre(nombre);
        break;
      }
      case "tipo": {
        const { tipo } = await prompts({
          type: "select",
          name: "tipo",
          message: "Tipo de invento:",
          choices: [
            { title: "Arma", value: "Arma" },
            { title: "Dispositivo de viaje", value: "Dispositivo de viaje" },
            { title: "Biotecnologia", value: "Biotecnologia" },
            { title: "Objeto cotidiano absurdo", value: "Objeto cotidiano absurdo" },
          ],
        });
        resultados = await manager.filterInventosByTipo(tipo);
        break;
      }
      case "inventor": {
        const { inventor } = await prompts({
          type: "text",
          name: "inventor",
          message: "ID del inventor:",
          validate: (valor) => valor.length > 0 || "Debe tener un ID",
        });
        resultados = await manager.filterInventosByInventor(inventor);
        break;
      }
      case "nivel": {
        const { nivel } = await prompts({
          type: "text",
          name: "nivel",
          message: "Nivel de peligrosidad (1-10):",
          validate: (valor) => {
            const num = Number(valor);
            return (num >= 1 && num <= 10) ? true : "Debe ser entre 1 y 10";
          },
        });
        resultados = await manager.filterInventosByPeligrosidad(Number(nivel));
        break;
      }
      case "volver":
        salir = true;
        continue;
    }

    if (resultados.length > 0) {
      console.log(resultados);
    } else {
      console.log("No se encontraron inventos.");
    }
  }
}

/**
 * Funcion que permite anadir inventos mediante prompts.
 * @param manager - el gestor del multiverso.
 * @returns true si se ha creado el invento de manera correcta.
 */
async function addInventoMenu(manager: GestorMultiversal): Promise<boolean> {
  const data = await prompts([
    {
      type: "text",
      name: "id",
      message: "Introduce el ID del invento a anadir (formato: IXXX):",
      validate: (id) => (/^I\d+$/.test(id) ? true : "Debe tener formato IXXX (ej: I001)"),
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
      message: "Tipo de invento:",
      choices: [
        { title: "Arma", value: "Arma" },
        { title: "Dispositivo de viaje", value: "Dispositivo de viaje" },
        { title: "Biotecnologia", value: "Biotecnologia" },
        { title: "Objeto cotidiano absurdo", value: "Objeto cotidiano absurdo" },
      ],
    },
    {
      type: "text",
      name: "inventor",
      message: "Inventor:",
      validate: (inventor) =>
        inventor.length > 0 ? true : "Debe de tener un nombre",
    },
    {
      type: "text",
      name: "nivelPeligro",
      message: "Nivel de peligro:",
      validate: (nivelPeligro) =>
        Number(nivelPeligro) >= 1 && Number(nivelPeligro) <= 10
          ? true
          : "Debe ser entre 1-10",
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
    const newInvento = new Invento(
      data.id,
      data.nombre,
      data.inventor,
      data.tipo,
      Number(data.nivelPeligro),
      data.descripcion,
    );

    await manager.addInvento(newInvento);
    console.log(`El invento ${data.id} ha sido anadido correctamente`);
    return true;
  } catch (error: unknown) {
    console.log("Error", getErrorMessage(error));
    return false;
  }
}

/**
 * Funcion que permite eliminar un invento del multiverso.
 * @param manager - el gestor del multiverso.
 * @returns true si se ha eliminado el invento de manera correcta.
 */
async function removeInventoMenu(
  manager: GestorMultiversal,
): Promise<boolean> {
  const { id } = await prompts({
    type: "text",
    name: "id",
    message: "ID a eliminar:",
    validate: (id) => (id.length > 0 ? true : "Debe de tener un ID"),
  });

  try {
    await manager.removeInvento(id);
    console.log(`El invento ${id} ha sido eliminado correctamente.`);
    return true;
  } catch (error: unknown) {
    console.log("Error", getErrorMessage(error));
    return false;
  }
}

/**
 * Funcion que permite modificar los elementos de un invento.
 * @param manager - gestor del multiverso.
 * @returns true si se ha modificado correctamente.
 */
async function modificarInventoMenu(
  manager: GestorMultiversal,
): Promise<boolean> {
  const data = await prompts([
    {
      type: "text",
      name: "id",
      message: "Introduce el ID del invento a modificar (formato: IXXX):",
      validate: (id) => (/^I\d+$/.test(id) ? true : "Debe tener formato IXXX (ej: I001)"),
    },
    {
      type: "text",
      name: "nombre",
      message: "Nombre: (vacio para no modificar)",
    },
    {
      type: "select",
      name: "tipo",
      message: "Tipo de invento:",
      choices: [
        { title: "Sin cambio", value: null },
        { title: "Arma", value: "Arma" },
        { title: "Dispositivo de viaje", value: "Dispositivo de viaje" },
        { title: "Biotecnologia", value: "Biotecnologia" },
        { title: "Objeto cotidiano absurdo", value: "Objeto cotidiano absurdo" },
      ],
    },
    {
      type: "text",
      name: "inventor",
      message: "Inventor: (vacio para no modificar)",
    },
    {
      type: "text",
      name: "nivelPeligro",
      message: "Nivel peligro: (vacio para no modificar)",
      validate: (nivelPeligro) =>
        (nivelPeligro >= 1 && nivelPeligro <= 10) || nivelPeligro.length === 0
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
      inventor?: string | null;
      tipo?: tiposInvento;
      nivelPeligro?: number;
      descripcion?: string;
    } = {};

    if (data.nombre) mod.nombre = data.nombre;
    if (data.tipo !== null) mod.tipo = data.tipo as tiposInvento;
    if (data.nivelPeligro !== "") mod.nivelPeligro = Number(data.nivelPeligro);
    if (data.inventor) mod.inventor = data.inventor;
    if (data.descripcion) mod.descripcion = data.descripcion;

    await manager.updateInvento(data.id, mod);
    console.log(`El invento ${data.id} ha sido modificado correctamente.`);
    return true;
  } catch (error: unknown) {
    console.log("Error", getErrorMessage(error));
    return false;
  }
}
