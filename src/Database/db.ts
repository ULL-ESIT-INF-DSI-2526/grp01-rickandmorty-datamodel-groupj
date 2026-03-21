import { JSONFilePreset } from "lowdb/node";
import { Low } from "lowdb";

import { Dimension } from "../Dimension.js";
import { Personaje } from "../personajes.js";
import { Invento } from "../inventos.js";
import { Localizacion } from "../localizaciones.js";
import { Especie } from "../especies.js";

/** Tipo de dato */
export type Data = {
  dimension: Dimension[];
  personaje: Personaje[];
  invento: Invento[];
  localizacion: Localizacion[];
  especie: Especie[];
};

export const DefaultData: Data = {
  dimension: [],
  personaje: [],
  invento: [],
  localizacion: [],
  especie: [],
};

export const db: Low<Data> = await JSONFilePreset("src/Database/db.json", DefaultData);
