import { describe, expect, test } from "vitest";
import { Invento } from "../src/inventos";

describe("Test constructor Invento ", () => {
    test("Deberia crear un invento correctamente", () => {
        const invento = new Invento(
            "pg137",
            "Portal Gun",
            "Rick Sanchez",
            "Dispositivo de viaje",
            9,
            "Un dispositivo que permite viajar entre dimensiones."
        );
        expect(invento.id).toBe("pg137");
        expect(invento.nombre).toBe("Portal Gun");
        expect(invento.inventor).toBe("Rick Sanchez");
        expect(invento.tipo).toBe("Dispositivo de viaje");
        expect(invento.nivelPeligro).toBe(9);
        expect(invento.descripcion).toBe("Un dispositivo que permite viajar entre dimensiones.");
    });


        test("Deberia crear un invento correctamente", () => {
        const invento = new Invento(
            "plaser1",
            "Pistola láser",
            "Rick Sanchez",
            "Arma",
            9,
            "Arma de energía que dispara rayos láser, capaz de causar daño significativo a objetivos vivos y estructuras. Es una herramienta comúnmente utilizada por Rick en sus aventuras interdimensionales, conocida por su alta potencia y versatilidad en combate."
        );
        expect(invento.id).toBe("plaser1");
        expect(invento.nombre).toBe("Pistola láser");
        expect(invento.inventor).toBe("Rick Sanchez");
        expect(invento.tipo).toBe("Arma");
        expect(invento.nivelPeligro).toBe(9);
        expect(invento.descripcion).toBe("Arma de energía que dispara rayos láser, capaz de causar daño significativo a objetivos vivos y estructuras. Es una herramienta comúnmente utilizada por Rick en sus aventuras interdimensionales, conocida por su alta potencia y versatilidad en combate.");
    });

    test("Deberia lanzar un error si el nivel de peligro es distinto de 1-10", () => {
        expect(() => {
            new Invento(
                "inv001",
                "Invention 1",
                "Inventor 1",
                "Arma",
                0,
                "Descripción del invento 1"
            );
        }).toThrow("El nivel de peligro debe estar entre 1 y 10.");
    });
});