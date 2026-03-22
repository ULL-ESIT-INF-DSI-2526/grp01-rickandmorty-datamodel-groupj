import prompts from "prompts";
import { GestorMultiversal } from "../../core/gestor.js";
import { Dimension } from "../../core/models/Dimension.js";
import { IEventoViaje, IEventoDimension, IEventoInvento } from "../../core/interfaces.js";

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

/**
 * Menu que gestiona los eventos del multiverso.
 * @param manager - gestor del multiverso
 */
export async function mostrarMenuEventos(
  manager: GestorMultiversal,
): Promise<void> {
  let volver = false;
  while (!volver) {
    const respuesta = await prompts({
      type: "select",
      name: "accion",
      message: "Eventos del Multiverso",
      choices: [
        { title: "Registrar evento", value: "registrar" },
        { title: "Consultar eventos", value: "consultar" },
        { title: "Volver", value: "volver" },
      ],
    });

    switch (respuesta.accion) {
      case "registrar":
        await registrarEvento(manager);
        break;
      case "consultar":
        await consultarEventos(manager);
        break;
      case "volver":
        volver = true;
        break;
    }
  }
}

/**
 * Menu para registrar diferentes tipos de eventos.
 * @param manager - gestor del multiverso
 */
async function registrarEvento(manager: GestorMultiversal): Promise<void> {
  const { tipoEvento } = await prompts({
    type: "select",
    name: "tipoEvento",
    message: "Tipo de evento a registrar:",
    choices: [
      { title: "Viaje interdimensional", value: "viaje" },
      { title: "Creacion de dimension", value: "creacion" },
      { title: "Destruccion de dimension", value: "destruccion" },
      { title: "Despliegue de artefacto", value: "despliegue" },
      { title: "Neutralizacion de artefacto", value: "neutralizacion" },
    ],
  });

  switch (tipoEvento) {
    case "viaje":
      await registrarViaje(manager);
      break;
    case "creacion":
      await registrarCreacionDimension(manager);
      break;
    case "destruccion":
      await registrarDestruccionDimension(manager);
      break;
    case "despliegue":
      await registrarDespliegueInvento(manager);
      break;
    case "neutralizacion":
      await registrarNeutralizacionInvento(manager);
      break;
  }
}

/**
 * Registra un viaje interdimensional.
 * @param manager - gestor del multiverso
 */
async function registrarViaje(manager: GestorMultiversal): Promise<void> {
  const data = await prompts([
    {
      type: "text",
      name: "personajeId",
      message: "ID del personaje:",
      validate: (valor) => valor.length > 0 || "Debe tener un ID",
    },
    {
      type: "text",
      name: "dimensionOrigenId",
      message: "ID de la dimension de origen:",
      validate: (valor) => valor.length > 0 || "Debe tener un ID",
    },
    {
      type: "text",
      name: "dimensionDestinoId",
      message: "ID de la dimension de destino:",
      validate: (valor) => valor.length > 0 || "Debe tener un ID",
    },
    {
      type: "text",
      name: "motivo",
      message: "Motivo del viaje:",
      validate: (valor) => valor.length > 0 || "Debe tener un motivo",
    },
  ]);

  const evento: IEventoViaje = {
    id: `VIAJE-${Date.now()}`,
    tipoEvento: "viaje",
    fecha: new Date().toISOString(),
    motivo: data.motivo,
    personajeId: data.personajeId,
    dimensionOrigenId: data.dimensionOrigenId,
    dimensionDestinoId: data.dimensionDestinoId,
  };

  try {
    await manager.addEventoViaje(evento);
    console.log(`Viaje registrado correctamente.`);
  } catch (error: unknown) {
    console.log("Error", getErrorMessage(error));
  }
}

/**
 * Registra la creacion de una dimension.
 * @param manager - gestor del multiverso
 */
async function registrarCreacionDimension(manager: GestorMultiversal): Promise<void> {
  const data = await prompts([
    {
      type: "text",
      name: "id",
      message: "ID de la dimension (formato: D-XXX):",
      validate: (id) => (/^D-\d+$/.test(id) ? true : "Debe tener formato D-XXX (ej: D-001)"),
    },
    {
      type: "text",
      name: "nombre",
      message: "Nombre:",
      validate: (valor) => valor.length > 0 || "Debe tener un nombre",
    },
    {
      type: "select",
      name: "estadoDim",
      message: "Estado:",
      choices: [
        { title: "Activa", value: "activa" },
        { title: "Cuarentena", value: "en cuarentena" },
      ],
    },
    {
      type: "text",
      name: "nivelTec",
      message: "Nivel tecnologico:",
      validate: (valor) => {
        const num = Number(valor);
        return (num >= 1 && num <= 10) ? true : "Debe ser entre 1-10";
      },
    },
    {
      type: "text",
      name: "descripcion",
      message: "Descripcion:",
      validate: (valor) => valor.length > 0 || "Debe tener descripcion",
    },
    {
      type: "select",
      name: "motivo",
      message: "Motivo de la creacion:",
      choices: [
        { title: "Experimento", value: "experimento" },
        { title: "Paradoja", value: "paradoja" },
      ],
    },
  ]);

  const dimension = new Dimension(
    data.id,
    data.nombre,
    data.estadoDim,
    Number(data.nivelTec),
    data.descripcion,
  );

  const evento: IEventoDimension = {
    id: `CREACION-${Date.now()}`,
    tipoEvento: "dimension",
    fecha: new Date().toISOString(),
    motivo: data.motivo,
    dimensionId: data.id,
    accion: "creacion",
  };

  try {
    await manager.addEventoCreacionDimension(dimension, evento);
    console.log(`Dimension ${data.id} creada correctamente.`);
  } catch (error: unknown) {
    console.log("Error", getErrorMessage(error));
  }
}

/**
 * Registra la destruccion de una dimension.
 * @param manager - gestor del multiverso
 */
async function registrarDestruccionDimension(manager: GestorMultiversal): Promise<void> {
  const data = await prompts([
    {
      type: "text",
      name: "dimensionId",
      message: "ID de la dimension a destruir:",
      validate: (valor) => valor.length > 0 || "Debe tener un ID",
    },
    {
      type: "select",
      name: "motivo",
      message: "Motivo de la destruccion:",
      choices: [
        { title: "Experimento", value: "experimento" },
        { title: "Paradoja", value: "paradoja" },
      ],
    },
  ]);

  const evento: IEventoDimension = {
    id: `DESTRUCCION-${Date.now()}`,
    tipoEvento: "dimension",
    fecha: new Date().toISOString(),
    motivo: data.motivo,
    dimensionId: data.dimensionId,
    accion: "destruccion",
  };

  try {
    await manager.addEventoDestruccionDimension(evento);
    console.log(`Dimension ${data.dimensionId} destruida correctamente.`);
  } catch (error: unknown) {
    console.log("Error", getErrorMessage(error));
  }
}

/**
 * Registra el despliegue de un invento.
 * @param manager - gestor del multiverso
 */
async function registrarDespliegueInvento(manager: GestorMultiversal): Promise<void> {
  const data = await prompts([
    {
      type: "text",
      name: "inventoId",
      message: "ID del invento:",
      validate: (valor) => valor.length > 0 || "Debe tener un ID",
    },
    {
      type: "text",
      name: "localizacionId",
      message: "ID de la localizacion:",
      validate: (valor) => valor.length > 0 || "Debe tener un ID",
    },
    {
      type: "text",
      name: "motivo",
      message: "Motivo del despliegue:",
      validate: (valor) => valor.length > 0 || "Debe tener un motivo",
    },
  ]);

  const evento: IEventoInvento = {
    id: `DESPLIEGUE-${Date.now()}`,
    tipoEvento: "invento",
    fecha: new Date().toISOString(),
    motivo: data.motivo,
    inventoId: data.inventoId,
    localizacionId: data.localizacionId,
    accion: "despliegue",
  };

  try {
    await manager.addEventoInvento(evento);
    console.log(`Despliegue registrado correctamente.`);
  } catch (error: unknown) {
    console.log("Error", getErrorMessage(error));
  }
}

/**
 * Registra la neutralizacion de un invento.
 * @param manager - gestor del multiverso
 */
async function registrarNeutralizacionInvento(manager: GestorMultiversal): Promise<void> {
  const data = await prompts([
    {
      type: "text",
      name: "inventoId",
      message: "ID del invento:",
      validate: (valor) => valor.length > 0 || "Debe tener un ID",
    },
    {
      type: "text",
      name: "localizacionId",
      message: "ID de la localizacion:",
      validate: (valor) => valor.length > 0 || "Debe tener un ID",
    },
    {
      type: "text",
      name: "motivo",
      message: "Motivo de la neutralizacion:",
      validate: (valor) => valor.length > 0 || "Debe tener un motivo",
    },
  ]);

  const evento: IEventoInvento = {
    id: `NEUTRALIZACION-${Date.now()}`,
    tipoEvento: "invento",
    fecha: new Date().toISOString(),
    motivo: data.motivo,
    inventoId: data.inventoId,
    localizacionId: data.localizacionId,
    accion: "neutralizacion",
  };

  try {
    await manager.addEventoInvento(evento);
    console.log(`Neutralizacion registrada correctamente.`);
  } catch (error: unknown) {
    console.log("Error", getErrorMessage(error));
  }
}

/**
 * Consulta eventos por tipo.
 * @param manager - gestor del multiverso
 */
async function consultarEventos(manager: GestorMultiversal): Promise<void> {
  let salir = false;
  while (!salir) {
    const respuesta = await prompts({
      type: "select",
      name: "consulta",
      message: "Consultar eventos:",
      choices: [
        { title: "Viajes interdimensionales", value: "viaje" },
        { title: "Creacion/Destruccion de dimension", value: "dimension" },
        { title: "Despliegue/Neutralizacion de invento", value: "invento" },
        { title: "Volver", value: "volver" },
      ],
    });

    switch (respuesta.consulta) {
      case "viaje": {
        const eventos = await manager.filterEventosByTipoEvento("viaje");
        if (eventos.length === 0) {
          console.log("No hay viajes registrados.");
        } else {
          console.log(eventos);
        }
        break;
      }
      case "dimension": {
        const eventos = await manager.filterEventosByTipoEvento("dimension");
        if (eventos.length === 0) {
          console.log("No hay eventos de creacion o destruccion de dimension registrados.");
        } else {
          console.log(eventos);
        }
        break;
      }
      case "invento": {
        const eventos = await manager.filterEventosByTipoEvento("invento");
        if (eventos.length === 0) {
          console.log("No hay eventos de despliegue o neutralizacion de inventos registrados.");
        } else {
          console.log(eventos);
        }
        break;
      }
      case "volver":
        salir = true;
        break;
    }
  }
}