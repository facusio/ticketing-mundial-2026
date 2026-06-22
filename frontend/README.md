# Ticketing Mundial 2026 — Frontend

Aplicacion web desarrollada en Next.js 14 + React para el sistema de ticketing del Mundial 2026.
Trabajo Obligatorio — Bases de Datos II, UCU 2026.

## Integrantes

- Facundo Banchero
- Gaston Puyares

## Stack

- Next.js 14 (App Router)
- React + TypeScript
- Tailwind CSS
- shadcn/ui
- qrcode.react (generacion de QR)
- html5-qrcode (escaneo de QR por camara)

## Requisitos previos

- Node.js 20+
- npm
- El backend debe estar corriendo en http://localhost:8080

## Ejecucion

```bash
npm install
npm run dev
```

La app queda disponible en http://localhost:3000

## Variables de entorno

Crear un archivo `.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:8080
```
