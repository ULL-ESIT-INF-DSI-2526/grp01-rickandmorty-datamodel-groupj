import { JSONFilePreset } from "lowdb/node";
import { Low } from "lowdb";

import { Dimension } from "../core/models/Dimension.js";
import { Personaje } from "../core/models/personajes.js";
import { Invento } from "../core/models/inventos.js";
import { Localizacion } from "../core/models/localizaciones.js";
import { Especie } from "../core/models/especies.js";
import type { EventoMultiversal } from "../core/interfaces.js";

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

export const db: Low<Data> = await JSONFilePreset("src/database/db.json", DefaultData);
