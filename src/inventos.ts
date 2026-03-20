import { IInvento } from "./interfaces";
import { tiposInvento } from "./types";


/**
 * Clase que representa un invento en el sistema, implementa la interfaz IInvento.
 * @param id - Identificador único del invento
 * @param nombre - Nombre del invento
 * @param inventor - Nombre del inventor del invento, referencia a un personaje
 * @param tipo - Tipo de invento, debe ser uno de los valores definidos en tiposInvento
 * @param nivelPeligro - Nivel de peligro del invento, debe estar entre 1 y 10
 * @param descripcion - Descripción adicional del invento
 */
export class Invento implements IInvento {
    constructor(
        public readonly id: string,
        public nombre: string,
        public inventor: string | null,
        public tipo: tiposInvento,
        public nivelPeligro: number,
        public descripcion: string
    ) {
        if (nivelPeligro < 1 || nivelPeligro > 10) {
            throw new Error("El nivel de peligro debe estar entre 1 y 10.");
        }

    }
}