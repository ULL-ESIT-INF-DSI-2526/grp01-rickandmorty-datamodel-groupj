import prompts from "prompts";
import { GestorMultiversal } from "../gestor.js";
import { db } from "../Database/db.js";
import { RepositorioEventos } from "../RepositorioEventos.js";
import { EventoMultiversal, IEventoInvento, IEventoViaje } from "../interfaces.js";
import { normalize } from "../auxFunc.js";
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

function isEventoInvento(evento: EventoMultiversal): evento is IEventoInvento {
  return evento.tipoEvento === "invento";
}

function isEventoViaje(evento: EventoMultiversal): evento is IEventoViaje {
  return evento.tipoEvento === "viaje";
}

/**
 * Funcion que guarda las opciones del menu de consultas
 * @param gestor - gestor del multiverso
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
        { title: "Consultar eventos", value: "eventos" },
        { title: "Variantes de personaje", value: "variantes" },
        { title: "Informes del multiverso", value: "informes" },
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
      case "eventos":
        await consultasEventos(gestor);
        break;
      case "variantes": {
        const input = await prompts({
          type: "text",
          name: "nombre",
          message: "Nombre del personaje",
          validate: (nombre) =>
            nombre.length > 0 ? true : "Debe de tener un nombre",
        });
        const result = await gestor.getVariantesPersonaje(input.nombre);
        console.log(result);
        break;
      }
      case "informes":
        await menuInformes(gestor);
        break;
      case "volver":
        salir = true;
        break;
    }
  }
}

/**
 * Funcion que guarda las opciones del menu de eventos.
 * @param gestor - gestor del multiverso
 */
async function consultasEventos(gestor: GestorMultiversal): Promise<void> {
  const eventosRepo = new RepositorioEventos(db);
  let salir = false;

  while (!salir) {
    const respuesta = await prompts({
      type: "select",
      name: "consultaEvento",
      message: "Consulta de eventos",
      choices: [
        { title: "Historial de viajes por personaje", value: "historial-viajes" },
        { title: "Eventos por tipo", value: "tipo" },
        { title: "Eventos de invento por ID", value: "invento-id" },
        { title: "Volver", value: "volver" },
      ],
    });

    switch (respuesta.consultaEvento) {
      case "historial-viajes":
        await informeHistorialViajes(gestor);
        break;
      case "tipo": {
        const { tipo } = await prompts({
          type: "select",
          name: "tipo",
          message: "Tipo de evento:",
          choices: [
            { title: "Viaje", value: "viaje" },
            { title: "Dimension", value: "dimension" },
            { title: "Invento", value: "invento" },
          ],
        });

        const eventosTipo = await eventosRepo.filterByTipoEvento(tipo);
        console.log(eventosTipo);
        break;
      }
      case "invento-id": {
        const { inventoId } = await prompts({
          type: "text",
          name: "inventoId",
          message: "ID del invento:",
          validate: (valor) => (valor.length > 0 ? true : "Debe tener un ID"),
        });

        const eventosInvento = await eventosRepo.filterByInventoId(inventoId);
        console.log(eventosInvento);
        break;
      }
      case "volver":
        salir = true;
        break;
    }
  }
}

/**
 * Menu de informes globales del multiverso.
 * @param gestor - gestor del multiverso
 */
async function menuInformes(gestor: GestorMultiversal): Promise<void> {
  let salir = false;

  while (!salir) {
    const respuesta = await prompts({
      type: "select",
      name: "informe",
      message: "Informes del multiverso",
      choices: [
        { title: "Dimensiones activas y nivel tecnológico medio", value: "dimensiones-activas" },
        { title: "Personajes con más versiones alternativas", value: "personajes-variantes" },
        { title: "Inventos desplegados más peligrosos y localización", value: "inventos-desplegados" },
        { title: "Historial de viajes de un personaje", value: "historial-viajes" },
        { title: "Volver", value: "volver" },
      ],
    });

    switch (respuesta.informe) {
      case "dimensiones-activas":
        await informeDimensionesActivas(gestor);
        break;
      case "personajes-variantes":
        await informePersonajesMasVariantes(gestor);
        break;
      case "inventos-desplegados":
        await informeInventosDesplegados(gestor);
        break;
      case "historial-viajes":
        await informeHistorialViajes(gestor);
        break;
      case "volver":
        salir = true;
        break;
    }
  }
}

/**
 * Informe de dimensiones activas y su nivel tecnológico medio.
 * @param gestor - gestor del multiverso
 */
async function informeDimensionesActivas(gestor: GestorMultiversal): Promise<void> {
  const dimensiones = await gestor.dimensionesRepo.getAll();
  const activas = dimensiones.filter((dimension) => dimension.estadoDim === "activa");

  if (activas.length === 0) {
    console.log("No hay dimensiones activas registradas.");
    return;
  }

  const sumaNivelTec = activas.reduce((suma, dimension) => suma + dimension.nivelTec, 0);
  const mediaNivelTec = sumaNivelTec / activas.length;

  console.log(`Dimensiones activas (${activas.length}):`);
  activas.forEach((dimension) => {
    console.log(`- ${dimension.id} | ${dimension.nombre} | nivelTec: ${dimension.nivelTec}`);
  });
  console.log(`Nivel tecnológico medio: ${mediaNivelTec.toFixed(2)}`);
}

/**
 * Informe de personajes con mayor número de versiones alternativas.
 * @param gestor - gestor del multiverso
 */
async function informePersonajesMasVariantes(gestor: GestorMultiversal): Promise<void> {
  const personajes = await gestor.personajesRepo.getAll();
  const conteoPorNombre = new Map<string, { nombreOriginal: string; totalVersiones: number }>();

  personajes.forEach((personaje) => {
    const clave = normalize(personaje.nombre);
    const actual = conteoPorNombre.get(clave);

    if (!actual) {
      conteoPorNombre.set(clave, { nombreOriginal: personaje.nombre, totalVersiones: 1 });
      return;
    }

    actual.totalVersiones += 1;
  });

  const candidatos = [...conteoPorNombre.values()].filter((registro) => registro.totalVersiones > 1);

  if (candidatos.length === 0) {
    console.log("No hay versiones alternativas registradas para ningún personaje.");
    return;
  }

  const maximoVersiones = Math.max(...candidatos.map((registro) => registro.totalVersiones));
  const top = candidatos
    .filter((registro) => registro.totalVersiones === maximoVersiones)
    .sort((a, b) => a.nombreOriginal.localeCompare(b.nombreOriginal));

  console.log(`Personajes con más versiones alternativas (${maximoVersiones - 1} alternativas):`);
  top.forEach((registro) => {
    console.log(`- ${registro.nombreOriginal} | versiones: ${registro.totalVersiones}`);
  });
}

/**
 * Informe de inventos desplegados actualmente ordenados por nivel de peligrosidad.
 * @param gestor - gestor del multiverso
 */
async function informeInventosDesplegados(gestor: GestorMultiversal): Promise<void> {
  const eventosRepo = new RepositorioEventos(db);
  const eventos = await eventosRepo.getAll();
  const inventos = await gestor.inventosRepo.getAll();
  const localizaciones = await gestor.localizacionesRepo.getAll();

  const eventosInvento = eventos.filter(isEventoInvento);
  const ultimoEventoPorInvento = new Map<string, IEventoInvento>();

  eventosInvento.forEach((evento) => {
    const previo = ultimoEventoPorInvento.get(evento.inventoId);
    if (!previo || evento.fecha > previo.fecha) {
      ultimoEventoPorInvento.set(evento.inventoId, evento);
    }
  });

  const desplegados = [...ultimoEventoPorInvento.values()]
    .filter((evento) => evento.accion === "despliegue")
    .map((evento) => {
      const invento = inventos.find((item) => item.id === evento.inventoId);
      const localizacion = localizaciones.find((item) => item.id === evento.localizacionId);

      return {
        inventoId: evento.inventoId,
        inventoNombre: invento?.nombre ?? "Invento desconocido",
        nivelPeligro: invento?.nivelPeligro ?? -1,
        localizacionNombre: localizacion?.nombre ?? evento.localizacionId,
      };
    })
    .sort((a, b) => b.nivelPeligro - a.nivelPeligro);

  if (desplegados.length === 0) {
    console.log("No hay inventos desplegados actualmente.");
    return;
  }

  console.log(`Inventos desplegados actualmente (${desplegados.length}):`);
  desplegados.forEach((item) => {
    console.log(
      `- ${item.inventoId} | ${item.inventoNombre} | peligro: ${item.nivelPeligro} | localizacion: ${item.localizacionNombre}`,
    );
  });
}

/**
 * Informe del historial de viajes interdimensionales de un personaje.
 * @param gestor - gestor del multiverso
 */
async function informeHistorialViajes(gestor: GestorMultiversal): Promise<void> {
  const { personajeId } = await prompts({
    type: "text",
    name: "personajeId",
    message: "ID del personaje para historial de viajes:",
    validate: (valor) => (valor.length > 0 ? true : "Debe tener un ID"),
  });

  const eventosRepo = new RepositorioEventos(db);
  const eventos = await eventosRepo.getAll();
  const viajes = eventos
    .filter(isEventoViaje)
    .filter((evento) => normalize(evento.personajeId) === normalize(personajeId))
    .sort((a, b) => a.fecha.localeCompare(b.fecha));

  const personaje = await gestor.personajesRepo.findById(personajeId);
  const nombrePersonaje = personaje?.nombre ?? personajeId;

  if (viajes.length === 0) {
    console.log(`No hay viajes registrados para ${nombrePersonaje}.`);
    return;
  }

  console.log(`Historial de viajes de ${nombrePersonaje} (${viajes.length}):`);
  viajes.forEach((viaje) => {
    console.log(
      `- ${viaje.fecha} | ${viaje.dimensionOrigenId} -> ${viaje.dimensionDestinoId} | motivo: ${viaje.motivo}`,
    );
  });
}

/**
 * Funcion que guarda las opciones del menu de localizaciones
 * @param gestor - gestor del multiverso
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
 * @param gestor - gestor del multiverso
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
 * @param gestor - gestor del multiverso
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
