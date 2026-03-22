/**
 * Script para rellenar la base de datos con datos iniciales de Rick & Morty.
 * Cumple con los requisitos mínimos:
 * - 15 dimensiones
 * - 30 personajes
 * - 10 especies
 * - 20 localizaciones
 * - 15 inventos
 */

import { GestorMultiversal } from "./core/gestor.js";
import { Dimension } from "./core/models/Dimension.js";
import { Personaje } from "./core/models/personajes.js";
import { Especie } from "./core/models/especies.js";
import { Localizacion } from "./core/models/localizaciones.js";
import { Invento } from "./core/models/inventos.js";
import { db } from "./database/db.js";

async function seedDatabase(): Promise<void> {
  await db.read();
  db.data = {
    dimension: [],
    personaje: [],
    invento: [],
    localizacion: [],
    especie: [],
    eventos: [],
  };
  await db.write();

  const gestor = new GestorMultiversal(db);

  console.log("Iniciando poblacion de base de datos Rick & Morty...\n");

  // --- DIMENSIONES (15) ---
  console.log("Anadiendo dimensiones...");
  const dimensiones = [
    new Dimension("D-001", "C-137", "activa", 8, "Dimensión original de Rick y Morty"),
    new Dimension("D-002", "C-500A", "activa", 7, "Dimensión con nivel tecnológico avanzado"),
    new Dimension("D-003", "J19ζ7", "activa", 6, "Dimensión explorada en aventuras tempranas"),
    new Dimension("D-004", "Cronenberg", "destruida", 1, "Dimensión de los Cronenbergs"),
    new Dimension("D-005", "Burbuja de Mantequilla", "destruida", 2, "Dimensión ficticia benevolente"),
    new Dimension("D-006", "Puro Plasma", "activa", 9, "Dimensión de seres de plasma"),
    new Dimension("D-007", "Agua Purificada", "en cuarentena", 1, "Dimensión en cuarentena"),
    new Dimension("D-008", "Gotecha", "activa", 3, "Dimensión primitiva"),
    new Dimension("D-009", "Citadela", "activa", 10, "Sede del Consejo de Ricks"),
    new Dimension("D-010", "Tierra Alienígena", "activa", 5, "Planeta de insectos gigantes"),
    new Dimension("D-011", "Vehemencia", "activa", 4, "Dimensión de emociones vivientes"),
    new Dimension("D-012", "Fantasmárica", "activa", 6, "Dimensión con espíritus"),
    new Dimension("D-013", "Radiante", "destruida", 1, "Dimensión radiactiva"),
    new Dimension("D-014", "Espejo Cósmico", "activa", 7, "Dimensión reflejo"),
    new Dimension("D-015", "Gazorpazorp", "activa", 8, "Planeta de los Gazorps"),
  ];

  for (const dim of dimensiones) {
    try {
      await gestor.addDimension(dim);
    } catch (err) {
      console.log(`- ${dim.id} ya existe`);
    }
  }
  console.log(`${dimensiones.length} dimensiones anadidas\n`);

  // --- ESPECIES (10) ---
  console.log("Anadiendo especies...");
  const especies = [
    new Especie("E001", "Humano", "D-001", "humanoide", 80, "Especie terrestre inteligente"),
    new Especie("E002", "Gazorp", "D-015", "humanoide", 70, "Raza de pequeños humanoides"),
    new Especie("E003", "Meeseeks", "D-009", "amorfo", 10, "Seres creados para cumplir deseos"),
    new Especie("E004", "Zigerion", "D-015", "humanoide", 60, "Raza de estafadores extraterrestres"),
    new Especie("E005", "Kronenberg", "D-004", "amorfo", 50, "Mutantes de gravedad corporal cambiante"),
    new Especie("E006", "Plasma", "D-006", "amorfo", 90, "Seres de puro plasma energético"),
    new Especie("E007", "Insectoide", "D-010", "robotico", 40, "Insectos gigantes inteligentes"),
    new Especie("E008", "Paraíta", "D-008", "parasito", 30, "Parásitos de la dimensión Gotecha"),
    new Especie("E009", "Fantasma", "D-012", "amorfo", 100, "Entidades espectrales inmortales"),
    new Especie("E010", "Ciborgiano", "D-009", "robotico", 120, "Raza cyborg superinteligente"),
  ];

  for (const esp of especies) {
    try {
      await gestor.addEspecie(esp);
    } catch (err) {
      console.log(`- ${esp.id} ya existe`);
    }
  }
  console.log(`${especies.length} especies anadidas\n`);

  // --- PERSONAJES (30) ---
  console.log("Anadiendo personajes...");
  const personajes = [
    new Personaje("P001", "Rick Sánchez", "E001", "D-001", "vivo", "Consejo de Ricks", 10, "Científico genio"),
    new Personaje("P002", "Morty Smith", "E001", "D-001", "vivo", "Independiente", 4, "Adolescente aventurero"),
    new Personaje("P003", "Jerry Smith", "E001", "D-001", "vivo", "Familia Smith", 2, "Padre mediocre"),
    new Personaje("P004", "Beth Smith", "E001", "D-001", "vivo", "Familia Smith", 6, "Veterinaria ambiciosa"),
    new Personaje("P005", "Summer Smith", "E001", "D-001", "vivo", "Familia Smith", 7, "Adolescente inteligente"),
    new Personaje("P006", "Evil Morty", "E001", "D-002", "vivo", "Independiente", 9, "Versión malvada de Morty"),
    new Personaje("P007", "Pickle Rick", "E001", "D-001", "vivo", "Independiente", 10, "Rick convertido en pepinillo"),
    new Personaje("P008", "Jessica", "E001", "D-001", "vivo", "Independiente", 5, "Novia de Morty"),
    new Personaje("P009", "Mr. Poopybutthole", "E001", "D-001", "vivo", "Independiente", 3, "Personaje universo paralelo"),
    new Personaje("P010", "Birdperson", "E005", "D-003", "muerto", "Independiente", 8, "Amigo que habla como pájaro"),
    new Personaje("P011", "Squanchy", "E002", "D-015", "vivo", "Independiente", 4, "Amigo gato alienígena"),
    new Personaje("P012", "Mr. Meeseeks", "E003", "D-009", "vivo", "Independiente", 1, "Meeseeks que siempre aparece"),
    new Personaje("P013", "Unity", "E006", "D-006", "desconocido", "Independiente", 10, "Entidad colmena de plasma"),
    new Personaje("P014", "Gearhead", "E010", "D-009", "vivo", "Consejo de Ricks", 8, "Cyborg experto en tecnología"),
    new Personaje("P015", "Million Ants", "E007", "D-010", "vivo", "Independiente", 7, "Colonia de hormigas guerreras"),
    new Personaje("P016", "Abradolf Lincler", "E001", "D-009", "muerto", "Independiente", 6, "Clón experimental fallido"),
    new Personaje("P017", "Arthricia", "E003", "D-009", "vivo", "Independiente", 2, "Meeseeks artista"),
    new Personaje("P018", "Hemorrhage", "E007", "D-010", "muerto", "Independiente", 5, "Insecto guerrero vencido"),
    new Personaje("P019", "Krombopulos Michael", "E004", "D-005", "muerto", "Independiente", 7, "Traficante de armas"),
    new Personaje("P020", "Trandor", "E007", "D-010", "vivo", "Independiente", 6, "Lider de insectos"),
    new Personaje("P021", "Lucius Needful", "E001", "D-001", "vivo", "Independiente", 9, "Vendedor de deseos"),
    new Personaje("P022", "Steely Dan", "E001", "D-002", "vivo", "Independiente", 8, "Psicópata sin emociones"),
    new Personaje("P023", "Ghostly Gary", "E009", "D-012", "vivo", "Independiente", 4, "Fantasma tipo Clark Kent"),
    new Personaje("P024", "Glexo Slim Slim", "E002", "D-015", "vivo", "Independiente", 5, "Alienígena cómico"),
    new Personaje("P025", "Revolio Clockberg Jr", "E001", "D-001", "vivo", "Independiente", 9, "Personaje importante mysterio"),
    new Personaje("P026", "Physician", "E001", "D-003", "vivo", "Independiente", 7, "Doctor de aventuras"),
    new Personaje("P027", "Scroopy", "E001", "D-001", "vivo", "Independiente", 6, "Trabajador en nave"),
    new Personaje("P028", "Tinyrick", "E001", "D-001", "vivo", "Independiente", 10, "Rick en cuerpo pequeño"),
    new Personaje("P029", "Truant Officer Alien", "E002", "D-015", "vivo", "Independiente", 5, "Supervisor escolar alienígena"),
    new Personaje("P030", "Fart", "E006", "D-006", "vivo", "Independiente", 9, "Entidad gaseosa inteligente"),
  ];

  for (const pers of personajes) {
    try {
      await gestor.addPersonaje(pers);
    } catch (err) {
      console.log(`- ${pers.id} ya existe`);
    }
  }
  console.log(`${personajes.length} personajes anadidos\n`);

  // --- LOCALIZACIONES (20) ---
  console.log("Anadiendo localizaciones...");
  const localizaciones = [
    new Localizacion("L001", "Casa Smith", "Planeta", 4, "D-001", "Casa residencia en Tierra"),
    new Localizacion("L002", "Citadela de los Ricks", "Estacion espacial", 1000000, "D-009", "Centro del Consejo de Ricks"),
    new Localizacion("L003", "Titán", "Planeta", 250000, "D-010", "Luna con océanos de metano"),
    new Localizacion("L004", "Gazorpazorp", "Planeta", 500000, "D-015", "Planeta hogar de Gazorps"),
    new Localizacion("L005", "Piscina Recreativa", "Simulacion virtual", 5000, "D-005", "Dimensión burbuja de mantequilla"),
    new Localizacion("L006", "Escuela Buenas Noches", "Planeta", 500, "D-001", "Escuela en Tierra C-137"),
    new Localizacion("L007", "Patio del Club", "Dimension de bolsillo", 1000, "D-009", "Club secreto de alienígenas"),
    new Localizacion("L008", "Área de Pruebas", "Planeta", 100, "D-001", "Laboratorio de Rick"),
    new Localizacion("L009", "Hive-Seven", "Planeta", 50000, "D-010", "Nido de insectos inteligentes"),
    new Localizacion("L010", "Planeta Jerryboree", "Planeta", 10000, "D-001", "Centro de cuidado Jerry"),
    new Localizacion("L011", "Núcleo Radiante", "Planeta", 1000000, "D-013", "Centro radiactivo destruido"),
    new Localizacion("L012", "Monasterio de Viejo Señor", "Planeta", 50, "D-003", "Templo antiguo alienígena"),
    new Localizacion("L013", "Estación Pura Agua", "Estacion espacial", 5000, "D-007", "En cuarentena"),
    new Localizacion("L014", "Ciudad Gotecha", "Planeta", 100000, "D-008", "Capital de Gotecha"),
    new Localizacion("L015", "Castillo de Cristal", "Planeta", 2000, "D-014", "Palacio espejo cósmico"),
    new Localizacion("L016", "Mercado Intergaláctico", "Estacion espacial", 50000, "D-009", "Centro de comercio alien"),
    new Localizacion("L017", "Playa Paradiso", "Planeta", 100, "D-005", "Playa de dimensión destruida"),
    new Localizacion("L018", "Torre Cronómetra", "Planeta", 500, "D-004", "Torre dimensional Cronenberg"),
    new Localizacion("L019", "Nube de Polvo Estelar", "Estacion espacial", 10000, "D-006", "En el espacio profundo"),
    new Localizacion("L020", "Palacio del Rey", "Planeta", 5000, "D-015", "Residencia real Gazorp"),
  ];

  for (const loc of localizaciones) {
    try {
      await gestor.addLocalizacion(loc);
    } catch (err) {
      console.log(`- ${loc.id} ya existe`);
    }
  }
  console.log(`${localizaciones.length} localizaciones anadidas\n`);

  // --- INVENTOS (15) ---
  console.log("Anadiendo inventos...");
  const inventos = [
    new Invento("I001", "Portal Gun", "P001", "Dispositivo de viaje", 10, "Arma que crea portales interdimensionales"),
    new Invento("I002", "Cronómetro de Neutrinos", "P001", "Dispositivo de viaje", 8, "Viaja en el tiempo"),
    new Invento("I003", "Brazo de Plumbus", "P001", "Objeto cotidiano absurdo", 2, "Herramienta versátil común"),
    new Invento("I004", "Rayo Desintegrador", "P001", "Arma", 9, "Desintegra materia instantáneamente"),
    new Invento("I005", "Dispositivo de Teletransportación", "P001", "Dispositivo de viaje", 7, "Teletransporta personas corta distancia"),
    new Invento("I006", "Biomasa Mejorada", "P001", "Biotecnologia", 8, "Mejora atributos biológicos"),
    new Invento("I007", "Generador de Meeseeks", "P001", "Biotecnologia", 6, "Crea entidades para cumplir deseos"),
    new Invento("I008", "Jetpack de Antimateria", "P001", "Dispositivo de viaje", 9, "Vuelo con propulsión antimaterial"),
    new Invento("I009", "Casco Cerebral", "P001", "Biotecnologia", 8, "Conecta mentes entre dimensiones"),
    new Invento("I010", "Droga de Aumento Mental", "P001", "Biotecnologia", 10, "Incrementa inteligencia dramáticamente"),
    new Invento("I011", "Botella de Espacio Negativo", "P001", "Objeto cotidiano absurdo", 3, "Espacio infinito dentro"),
    new Invento("I012", "Clon de Rick Improvisado", "P001", "Biotecnologia", 5, "Clon de corta durabilidad"),
    new Invento("I013", "Arma de Probabilidad", "P001", "Arma", 9, "Manipula probabilidades del universo"),
    new Invento("I014", "Escudo Demoníaco", "P001", "Arma", 7, "Protector energético demoníaco"),
    new Invento("I015", "Traje de Invisibilidad Cuántica", "P001", "Dispositivo de viaje", 8, "Invisibilidad a nivel subatómico"),
  ];

  for (const inv of inventos) {
    try {
      await gestor.addInvento(inv);
    } catch (err) {
      console.log(`- ${inv.id} ya existe`);
    }
  }
  console.log(`${inventos.length} inventos anadidos\n`);

  console.log("Base de datos poblada exitosamente.");
  console.log("Datos iniciales cargados desde Rick & Morty universe.\n");
}

seedDatabase().catch((error) => {
  console.error("Error al poblar base de datos:", error);
  process.exit(1);
});
