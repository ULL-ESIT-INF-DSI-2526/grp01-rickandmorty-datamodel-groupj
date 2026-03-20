import { tiposEspecie } from "./types";
import { IEspecie } from "./interfaces";

/**
 * Clase que representa una especie en el sistema, implementa la interfaz IEspecie.
 * 
 * @param id - Identificador único de la especie
 * @param nombre - Nombre de la especie
 * @param origen - Origen de la especie (planeta o dimensión)
 * @param tipo - Tipo de especie
 * @param esperanzaVida - Esperanza de vida media (debe ser mayor que 0)
 * @param descripcion - Descripción adicional de la especie
 * 
 * @throws Error si el ID, nombre, origen o descripción están vacíos; o si la esperanza de vida es menor o igual a 0.
 */
export class Especie implements IEspecie {
  constructor (
    public readonly id: string,
    public nombre: string,
    public origen: string | null,
    public tipo: tiposEspecie,
    public esperanzaVida: number,
    public descripcion: string
  ) {
    if (id.trim() === "") throw new Error("ID vacío");
    if (nombre.trim() === "") throw new Error("Nombre vacío");
    if (origen.trim() === "") throw new Error("Origen vacío");
    if (descripcion.trim() === "") throw new Error("Descripción vacía");
    if (esperanzaVida <= 0) throw new Error("Esperanza de vida inválida"); 
  }
}