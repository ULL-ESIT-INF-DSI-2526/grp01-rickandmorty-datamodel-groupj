/** Valores posibles para el estado de la dimension */
export type estadosDimension = "activa" | "destruida" | "en cuarentena";

/** Tipos de especies */
export type tiposEspecie = "humanoide" | "amorfo" | "robotico" | "parasito" | "hivemind";

/** Tipos de inventos */
export type tiposInvento = "Arma" | "Dispositivo de viaje" | "Biotecnologia" | "Objeto cotidiano absurdo";

/** Valores posibles para el estado de un personaje */
export type estadosPersonaje = "vivo" | "muerto" | "desconocido" | "robot sustituto" | "clon";

/** Valores posibles para la afiliación de un personaje */
export type tipoAfiliacion = "Federacion Galactica" | "Consejo de Ricks" | "Familia Smith" | "Independiente";

/** Valores posibles para el tipo de localizacion */
export type tipoLocalizacion = "Planeta" | "Estacion espacial" | "Dimension de bolsillo" | "Simulacion virtual";  

/** Tipos de eventos del multiverso */
export type tipoEventoMultiversal = "viaje" | "dimension" | "invento";

/** Acciones posibles sobre dimensiones dentro de un evento */
export type accionEventoDimension = "creacion" | "destruccion";

/** Acciones posibles sobre inventos dentro de un evento */
export type accionEventoInvento = "despliegue" | "neutralizacion";