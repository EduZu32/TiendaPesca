# 🎣 Tienda de Pesca - Proyecto DAW

Este es un proyecto de tienda online de pesca desarrollado con **Node.js, Express, MySQL y Bootstrap**.

## 🚀 Instalación y Configuración

1️⃣ Instalar Dependencias

npm install

2️⃣ Configurar Variables de Entorno

Modifica el config/db.js para asegurar la conexion con MySQL;

    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASS || "",
    database: process.env.DB_NAME || "tienda_pesca",

3️⃣ Crear la Base de Datos en MySQL

CREATE DATABASE tienda_pesca;
USE tienda_pesca;

Import la base de datos

4️⃣ Iniciar el Backend
npm start

El servidor estará disponible en:
http://localhost:4000

5️⃣ Abrir el Frontend
Abrir index.html en un navegador o utilizar Live Server en VSCode.
