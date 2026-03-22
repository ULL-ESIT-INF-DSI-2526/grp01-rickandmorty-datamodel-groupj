import { JSONFilePreset } from "lowdb/node";
import { Low } from "lowdb";

import { Dimension } from "../Dimension.js";
import { Personaje } from "../personajes.js";
import { Invento } from "../inventos.js";
import { Localizacion } from "../localizaciones.js";
import { Especie } from "../especies.js";
import type { EventoMultiversal } from "../interfaces.js";

/** Tipo de dato */
export type Data = {
  dimension: Dimension[];
  personaje: Personaje[];
  invento: Invento[];
  localizacion: Localizacion[];
  especie: Especie[];
  eventos: EventoMultiversal[];
};

export const DefaultData: Data = {
  dimension: [],
  personaje: [],
  invento: [],
  localizacion: [],
  especie: [],
  eventos: [],
};

export const db: Low<Data> = await JSONFilePreset("src/Database/db.json", DefaultData);
