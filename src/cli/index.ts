import { main, mostrarMenuPrincipal } from "./menus/cli.js";

main().catch((error: unknown) => {
  console.error("Error inesperado en la CLI:", error);
});