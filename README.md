# Pausas Activas (La Numero 1)
Aplicación de escritorio desarrollada con **React**, **Vite** y **Electron** para promover la salud laboral mediante pausas activas programadas en las oficinas centrales de la empresa _La Número 1_. Incluye un reproductor de ejercicios en video, alertas interactivas y configuraciones personalizadas.

## Requisitos Previos:
* [Node.js](https://nodejs.org/) (versión LTS recomendada)
* [PNPM](https://pnpm.io/) instalado globalmente:
  ```bash
  npm install -g pnpm
  ```

## Instalación y Desarrollo:
1. Clona o descarga el repositorio y abre una terminal en la carpeta del proyecto.
2. Instala todas las dependencias del proyecto:
    ```bash
    pnpm install
    ```

## Pasos para probar la app en el navegador (solo interfaz web):
1. Ejecuta el siguiente comando:
    ```bash
    pnpm run dev
    ```
2. Ingresa al http://localhost:5173/ en tu navegador para abrir la app.

## Pasos para probar la app de escritorio:
Para probar la app con toda la funcionalidad nativa de escritorio (bandeja, alertas e IPC), ejecuta el siguiente comando:
```bash
pnpm run desktop
```

## Pasos para crear el instalador de Windows:
1. Abre una terminal en la carpeta del proyecto.
2. Ejecuta el siguiente comando:
    ```bash
    pnpm run dist
    ```
3. Una vez finalizado el proceso, ve a la carpeta generada:
`release/`
4. Ahí encontrarás el instalador `Pausas Activas Setup.exe` listo para instalar y probar en cualquier equipo con Windows.
