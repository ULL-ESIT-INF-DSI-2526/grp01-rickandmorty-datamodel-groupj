# Gestor de multiverso

Sistema capaz de gestionar un multiverso basado en la serie Rick & Morty, en este gestor se pueden crear, borrar y modificar dimensiones, personajes, especies, localizaciones e inventos. Tambien se pueden registrar eventos como el viaje de un personaje o la creacion/destruccion de una dimension.

## Componentes del grupo
* Juan Esteban Tamayo Marmolejo
* Ramon Colomer Laws
* Juan Pablo Calzadilla Gonzalez

## Metodo de Instalacion y ejecucion

### Requisitos previos
es necesario tene los siguientes componentes instalados en la maquina local
* Node.js (version 20 o superior)
* Gestor de paquetes ``npm``

### Pasos
1. Obtener el proyecto en la maquina local, ya sea mediante una descarga o un clone de Git
2. Instalar las dependiencias usando
```bash
npm install
```
3. Ejecutar la aplicacion usando
```bash
npm start
```
<br>

## Pruebas de codigo y calidad
Para confirmar que el codigo funciona de manera correcta se hicieron pruebas de los distintos objetos y repositorios usando vitest, tambien se hizo pruebas usando coverage para generar un reporte de los tests

```bash
# Ejecutar test
npm test

# Generar un reporte de cobertura
npm run coverage
```
<br>

### Emblemas de estado

[![CI Tests](https://github.com/ULL-ESIT-INF-DSI-2526/grp01-rickandmorty-datamodel-groupj/actions/workflows/ci.yml/badge.svg)](https://github.com/ULL-ESIT-INF-DSI-2526/grp01-rickandmorty-datamodel-groupj/actions/workflows/ci.yml)