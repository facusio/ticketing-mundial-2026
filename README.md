# Ticketing Mundial 2026

Sistema de ticketing para el Mundial de Fútbol 2026.  
Trabajo Obligatorio — Bases de Datos II, UCU 2026.

**Integrantes:** Facundo Banchero · Gastón Puyares

---

## Estructura del repositorio

```
ticketing-mundial-2026/
├── backend/    # API REST — Spring Boot 3 + Java 21 + PostgreSQL
└── frontend/   # Aplicación web — Next.js 15 + TypeScript + Tailwind CSS
```

---

## Stack

| Capa | Tecnología |
|------|-----------|
| Base de datos | PostgreSQL 15 |
| Backend | Spring Boot 3.3, Java 21, Spring JDBC / JdbcTemplate, Spring Security + JWT |
| Frontend | Next.js 15 (App Router), TypeScript, Tailwind CSS, shadcn/ui |

---

## Requisitos previos

- Java 21+
- Maven 3.9+
- Node.js 20+ y npm
- PostgreSQL 15+ corriendo localmente

---

## Levantar el proyecto

### 1. Base de datos

```bash
psql -U postgres -c "CREATE DATABASE ticketing_mundial;"
psql -U postgres -d ticketing_mundial -f backend/src/main/resources/db/create.sql
```

El script crea el schema `ticketing` con todas las tablas, triggers y vistas.

### 2. Backend

```bash
cd backend

export DB_HOST=localhost
export DB_PORT=5432
export DB_NAME=ticketing_mundial
export DB_USER=postgres
export DB_PASSWORD=tu_password

mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

La API queda disponible en `http://localhost:8080`.  
Swagger UI: `http://localhost:8080/swagger-ui.html`

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

La app queda disponible en `http://localhost:3000`.

> El backend debe estar corriendo antes de levantar el frontend.

---

## Roles del sistema

| Rol | Descripción |
|-----|-------------|
| `USUARIO_GENERAL` | Compra entradas, genera QR, transfiere entradas |
| `ADMIN_PAIS` | Administra estadios, sectores, eventos, fases y precios |
| `FUNCIONARIO` | Valida entradas en el acceso al estadio escaneando QR |

---

## Funcionalidades principales

- Registro y login con JWT (expiración 24 hs)
- Compra de entradas con límite de 5 por usuario por evento
- QR dinámico por entrada con expiración de 30 segundos
- Transferencia de entradas entre usuarios (máx. 3 por entrada)
- Validación ternaria: funcionario + dispositivo + QR
- Reportes: ranking de eventos, ranking de compradores, auditoría de funcionarios

---

## Variables de entorno

### Backend (`backend/`)

| Variable | Default dev | Descripción |
|----------|-------------|-------------|
| `DB_HOST` | `localhost` | Host de PostgreSQL |
| `DB_PORT` | `5432` | Puerto de PostgreSQL |
| `DB_NAME` | `ticketing_mundial` | Nombre de la base de datos |
| `DB_USER` | `postgres` | Usuario |
| `DB_PASSWORD` | `postgres` | Contraseña |
| `JWT_SECRET` | (dev only) | Secret HS256, mínimo 32 caracteres |
| `SPRING_PROFILES_ACTIVE` | `dev` | Perfil: `dev` o `prod` |

### Frontend (`frontend/`)

Crear `frontend/.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:8080
```
