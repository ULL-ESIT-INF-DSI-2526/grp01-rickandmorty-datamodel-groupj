import prompts from "prompts";
import { GestorMultiversal } from "../gestor.js";
import { Personaje } from "../personajes.js";
import { estadosPersonaje, tipoAfiliacion } from "../types.js";

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

/**
 * Funcion que implementa los metodos de registro de personajes.
 * @param manager - gestor del multiverso.
 */
export async function mostrarMenuPersonaje(
  manager: GestorMultiversal,
): Promise<void> {
  let volver = false;
  while (!volver) {
    const respuesta = await prompts({
      type: "select",
      name: "accion",
      message: "Menu de Personajes",
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
        await addPersonajeMenu(manager);
        break;
      case "eliminar":
        await removePersonajeMenu(manager);
        break;
      case "modificar":
        await modificarPersonajeMenu(manager);
        break;
      case "mostrar": {
        const personaje = await manager.personajesRepo.getAll();
        console.log(personaje);
        break;
      }
      case "consultar":
        await consultasPersonaje(manager);
        break;
      case "volver":
        volver = true;
        break;
    }
  }
}

/**
 * Funcion que permite consultar personajes por diferentes criterios.
 * @param manager - gestor del multiverso
 */
async function consultasPersonaje(manager: GestorMultiversal): Promise<void> {
  let salir = false;
  while (!salir) {
    const respuesta = await prompts({
      type: "select",
      name: "consulta",
      message: "Consultar personajes por:",
      choices: [
        { title: "Nombre", value: "nombre" },
        { title: "Especie", value: "especie" },
        { title: "Afiliacion", value: "afiliacion" },
        { title: "Estado", value: "estado" },
        { title: "Dimension de origen", value: "dimension" },
        { title: "Variantes de un personaje", value: "variantes" },
        { title: "Volver", value: "volver" },
      ],
    });

    let resultados: Personaje[] = [];

    switch (respuesta.consulta) {
      case "nombre": {
        const { nombre } = await prompts({
          type: "text",
          name: "nombre",
          message: "Nombre del personaje:",
          validate: (valor) => valor.length > 0 || "Debe tener un nombre",
        });
        resultados = await manager.filterPersonajesByNombre(nombre);
        break;
      }
      case "especie": {
        const { especie } = await prompts({
          type: "text",
          name: "especie",
          message: "ID de la especie:",
          validate: (valor) => valor.length > 0 || "Debe tener un ID",
        });
        resultados = await manager.filterPersonajesByEspecie(especie);
        break;
      }
      case "afiliacion": {
        const { afiliacion } = await prompts({
          type: "select",
          name: "afiliacion",
          message: "Afiliacion:",
          choices: [
            { title: "Federacion Galactica", value: "Federacion Galactica" },
            { title: "Consejo de Ricks", value: "Consejo de Ricks" },
            { title: "Familia Smith", value: "Familia Smith" },
            { title: "Independiente", value: "Independiente" },
          ],
        });
        resultados = await manager.filterPersonajesByAfiliacion(afiliacion);
        break;
      }
      case "estado": {
        const { estado } = await prompts({
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
        });
        resultados = await manager.filterPersonajesByEstado(estado);
        break;
      }
      case "dimension": {
        const { dimension } = await prompts({
          type: "text",
          name: "dimension",
          message: "ID de la dimension de origen:",
          validate: (valor) => valor.length > 0 || "Debe tener un ID",
        });
        resultados = await manager.filterPersonajesByDimension(dimension);
        break;
      }
      case "variantes": {
        const { nombre } = await prompts({
          type: "text",
          name: "nombre",
          message: "Nombre del personaje para buscar sus variantes:",
          validate: (valor) => valor.length > 0 || "Debe tener un nombre",
        });
        resultados = await manager.getVariantesPersonaje(nombre);
        if (resultados.length > 0) {
          console.log(`\nVariantes de "${nombre}":`);
        }
        break;
      }
      case "volver":
        salir = true;
        continue;
    }

    if (resultados.length === 0) {
      console.log("No se encontraron personajes.");
      continue;
    }

    // Preguntar si quiere ordenar los resultados
    const { ordenar } = await prompts({
      type: "select",
      name: "ordenar",
      message: "¿Desea ordenar los resultados?",
      choices: [
        { title: "No", value: false },
        { title: "Si", value: true },
      ],
    });

    if (ordenar) {
      const { criterio, orden } = await prompts([
        {
          type: "select",
          name: "criterio",
          message: "Ordenar por:",
          choices: [
            { title: "Nombre", value: "nombre" },
            { title: "Nivel de inteligencia", value: "inteligencia" },
          ],
        },
        {
          type: "select",
          name: "orden",
          message: "Orden:",
          choices: [
            { title: "Ascendente", value: true },
            { title: "Descendente", value: false },
          ],
        },
      ]);

      if (criterio === "nombre") {
        resultados = manager.orderPersonajesByNombre(resultados, orden);
      } else {
        resultados = manager.orderPersonajesByInteligencia(resultados, orden);
      }
    }

    console.log(resultados);
  }
}

/**
 * Funcion que permite anadir personajes mediante prompts.
 * @param manager - el gestor del multiverso.
 * @returns true si se ha creado el personaje de manera correcta.
 */
async function addPersonajeMenu(manager: GestorMultiversal): Promise<boolean> {
  const data = await prompts([
    {
      type: "text",
      name: "id",
      message: "Introduce el ID del personaje a anadir (formato: PXXX):",
      validate: (id) => (/^P\d+$/.test(id) ? true : "Debe tener formato PXXX (ej: P001)"),
    },
    {
      type: "text",
      name: "nombre",
      message: "Nombre:",
      validate: (name) => (name.length > 0 ? true : "Debe de tener un nombre"),
    },
    {
      type: "text",
      name: "especie",
      message: "Especie:",
      validate: (especie) =>
        especie.length > 0 ? true : "Debe de tener una especie",
    },
    {
      type: "text",
      name: "dimension",
      message: "Dimension:",
      validate: (dimension) =>
        dimension.length > 0 ? true : "Debe de tener una dimension",
    },
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
      type: "text",
      name: "nivelInteligencia",
      message: "Nivel intelectual:",
      validate: (nivelInteligencia) =>
        Number(nivelInteligencia) >= 1 && Number(nivelInteligencia) <= 10
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
    const newPersonaje = new Personaje(
      data.id,
      data.nombre,
      data.especie,
      data.dimension,
      data.estado,
      data.afiliacion,
      Number(data.nivelInteligencia),
      data.descripcion,
    );

    await manager.addPersonaje(newPersonaje);
    console.log(`El personaje ${data.id} ha sido anadido correctamente`);
    return true;
  } catch (error: unknown) {
    console.log("Error", getErrorMessage(error));
    return false;
  }
}

/**
 * Funcion que permite eliminar un personaje del multiverso.
 * @param manager - el gestor del multiverso.
 * @returns true si se ha eliminado el personaje de manera correcta.
 */
async function removePersonajeMenu(
  manager: GestorMultiversal,
): Promise<boolean> {
  const { id } = await prompts({
    type: "text",
    name: "id",
    message: "ID a eliminar:",
    validate: (id) => (id.length > 0 ? true : "Debe de tener un ID"),
  });

  try {
    await manager.removePersonaje(id);
    console.log(`El personaje ${id} ha sido eliminado correctamente.`);
    return true;
  } catch (error: unknown) {
    console.log("Error", getErrorMessage(error));
    return false;
  }
}

/**
 * Funcion que permite modificar los elementos de un personaje en la base de datos.
 * @param manager - gestor del multiverso.
 * @returns true si se ha modificado correctamente.
 */
async function modificarPersonajeMenu(
  manager: GestorMultiversal,
): Promise<boolean> {
  const data = await prompts([
    {
      type: "text",
      name: "id",
      message: "Introduce el ID del personaje a modificar:",
      validate: (id) => (/^P\d+$/.test(id) ? true : "Debe tener formato PXXX (ej: P001)"),
    },
    {
      type: "text",
      name: "nombre",
      message: "Nombre: (vacio para no modificar)",
    },
    {
      type: "text",
      name: "especie",
      message: "Especie: (vacio para no modificar)",
    },
    {
      type: "text",
      name: "dimension",
      message: "Dimension: (vacio para no modificar)",
    },
    {
      type: "select",
      name: "estado",
      message: "Estado:",
      choices: [
        { title: "Sin modificar", value: null },
        { title: "Vivo", value: "vivo" },
        { title: "Muerto", value: "muerto" },
        { title: "Desconocido", value: "desconocido" },
        { title: "Robot sustituto", value: "robot sustituto" },
        { title: "Clon", value: "clon" },
      ],
    },
    {
      type: "select",
      name: "afiliacion",
      message: "Afiliacion:",
      choices: [
        { title: "Sin modificar", value: null },
        { title: "Federacion Galactica", value: "Federacion Galactica" },
        { title: "Consejo de Ricks", value: "Consejo de Ricks" },
        { title: "Familia Smith", value: "Familia Smith" },
        { title: "Independiente", value: "Independiente" },
      ],
    },
    {
      type: "text",
      name: "nivelInteligencia",
      message: "Nivel intelectual:",
      validate: (nivelInteligencia) =>
        nivelInteligencia === "" ||
        (Number(nivelInteligencia) >= 1 && Number(nivelInteligencia) <= 10)
          ? true
          : "Debe ser entre 1-10 o vacio",
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
      especie?: string | null;
      dimension?: string | null;
      estado?: estadosPersonaje;
      afiliacion?: tipoAfiliacion;
      nivelInteligencia?: number;
      descripcion?: string;
    } = {};

    if (data.nombre) mod.nombre = data.nombre;
    if (data.estado !== null) mod.estado = data.estado as estadosPersonaje;
    if (data.especie) mod.especie = data.especie;
    if (data.dimension) mod.dimension = data.dimension;
    if (data.nivelInteligencia !== "") {
      mod.nivelInteligencia = Number(data.nivelInteligencia);
    }
    if (data.afiliacion !== null) mod.afiliacion = data.afiliacion as tipoAfiliacion;
    if (data.descripcion) mod.descripcion = data.descripcion;

    await manager.updatePersonaje(data.id, mod);
    console.log(`El personaje ${data.id} ha sido modificado correctamente.`);
    return true;
  } catch (error: unknown) {
    console.log("Error", getErrorMessage(error));
    return false;
  }
}
