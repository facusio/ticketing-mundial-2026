# Ticketing Mundial 2026

Sistema de ticketing para el Mundial de Fútbol 2026.  
Trabajo Obligatorio — Bases de Datos II, UCU 2026.

**Integrantes:** Facundo Banchero · Gastón Puyares

---

## Estructura del repositorio

```
ticketing-mundial-2026/
├── backend/    # API REST — Spring Boot 3 + Java 21 + PostgreSQL
└── frontend/   # Aplicación web — Next.js 16 + TypeScript + Tailwind CSS
```

---

## Stack

| Capa | Tecnología |
|------|-----------|
| Base de datos | PostgreSQL 15+ |
| Backend | Spring Boot 3.3, Java 21, Spring JDBC, Spring Security + JWT |
| Frontend | Next.js 16 (App Router), TypeScript, Tailwind CSS v4, shadcn/ui |

---

## Requisitos previos

- Java 21+
- Maven 3.9+
- Node.js 20+ y npm
- PostgreSQL 15+ corriendo localmente

---

## Levantar el proyecto

### 1. Base de datos

Primero creá la base de datos y cargá el esquema. Reemplazá `TU_USUARIO` con tu usuario de PostgreSQL (en macOS suele ser tu nombre de usuario del sistema; en Linux/Windows suele ser `postgres`).

```bash
# Crear la base de datos
createdb -U TU_USUARIO ticketing_mundial

# Crear el schema, tablas, triggers y vistas
psql -U TU_USUARIO -d ticketing_mundial -f backend/src/main/resources/db/create.sql

# Cargar datos de prueba
psql -U TU_USUARIO -d ticketing_mundial -f backend/src/main/resources/db/seed.sql
```

> **macOS:** si no tenés el rol `postgres`, usá tu usuario de sistema. Si `createdb` no funciona, abrí psql directamente: `psql -d postgres` y ejecutá `CREATE DATABASE ticketing_mundial;`

### 2. Backend

```bash
cd backend

mvn spring-boot:run \
  -Dspring-boot.run.jvmArguments="\
    -DDB_USER=TU_USUARIO \
    -DDB_PASSWORD=TU_PASSWORD \
    -DDB_NAME=ticketing_mundial"
```

Si tu usuario de PostgreSQL no tiene contraseña (común en macOS):

```bash
cd backend

DB_USER=TU_USUARIO DB_PASSWORD="" DB_NAME=ticketing_mundial mvn spring-boot:run
```

La API queda disponible en `http://localhost:8080`.  
Swagger UI: `http://localhost:8080/swagger-ui.html`

### 3. Frontend

```bash
cd frontend
npm install
npm run dev:webpack
```

La app queda disponible en `http://localhost:3000`.

> Usá `dev:webpack` en lugar de `dev`. La versión con Turbopack (el default) tiene un bug que rompe la compilación en esta versión de Next.js.

> El backend debe estar corriendo antes de usar el frontend.

---

## Credenciales de prueba

Todos los usuarios del `seed.sql` usan la misma contraseña: **`test1234`**

| Mail | Contraseña | Rol |
|------|------------|-----|
| `superadmin@mundial2026.com` | `test1234` | SUPERADMIN |
| `admin@mundial2026.com` | `test1234` | ADMIN_PAIS |
| `funcionario@mundial2026.com` | `test1234` | FUNCIONARIO |
| `usuario@mundial2026.com` | `test1234` | USUARIO_GENERAL |
| `hincha2@mundial2026.com` | `test1234` | USUARIO_GENERAL |

> Los usuarios generales también pueden registrarse desde el formulario de la app. ADMIN_PAIS y FUNCIONARIO solo los crea el SUPERADMIN.

---

## Datos de prueba incluidos en seed.sql

- **1 estadio:** Estadio Centenario (Montevideo) con sectores NORTE, SUR y PALCO
- **5 fases:** Fase de Grupos, Octavos, Cuartos, Semifinal y Final — con precios por sector
- **3 eventos:**
  - Argentina vs Brasil (Fase de Grupos, en 7 días)
  - Uruguay vs Colombia (Fase de Grupos, en 10 días)
  - Argentina vs Uruguay (Octavos de Final, en 20 días)
- **Funcionario** asignado únicamente al sector PALCO del Centenario
- **2 usuarios generales** con entradas ya compradas para enriquecer los reportes

---

## Acceso desde el teléfono / escaneo de QR

La cámara del celular requiere HTTPS. Para exponer la app con HTTPS usá **cloudflared** (Cloudflare Tunnel) — es gratis, estable y no requiere cuenta.

### Instalación (una sola vez)

```bash
# macOS
brew install cloudflare/cloudflare/cloudflared

# Windows
winget install --id Cloudflare.cloudflared

# Linux
curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -o cloudflared
chmod +x cloudflared && sudo mv cloudflared /usr/local/bin/
```

### Levantar el túnel

Con el frontend **ya corriendo** en `localhost:3000`:

```bash
cloudflared tunnel --url http://localhost:3000 --no-autoupdate
```

El comando imprime una URL del tipo:

```
https://alguna-palabra-aleatoria.trycloudflare.com
```

Abrí esa URL en el celular — ya tiene HTTPS, la cámara va a funcionar directamente.

> La URL cambia cada vez que reiniciás el túnel. El túnel solo funciona mientras el frontend y el backend estén corriendo en tu máquina.

### Para mejor rendimiento en el celular (opcional)

En lugar de `dev:webpack`, podés correr la build de producción — carga más rápido a través del túnel:

```bash
cd frontend
npm run build   # una sola vez, tarda ~1-2 min
npm start       # levanta el servidor de producción
```

---

## Roles del sistema

| Rol | Descripción |
|-----|-------------|
| `SUPERADMIN` | Crea cuentas de ADMIN_PAIS y FUNCIONARIO |
| `ADMIN_PAIS` | Administra estadios, sectores, eventos, fases y precios |
| `FUNCIONARIO` | Valida entradas en la puerta del estadio escaneando QR |
| `USUARIO_GENERAL` | Compra entradas, genera QR, transfiere entradas |

---

## Funcionalidades principales

- Registro y login con JWT (expiración 24 hs)
- Compra de entradas con límite de 5 por transacción de compra (sin tope acumulado por evento; se pueden hacer varias compras)
- QR dinámico por entrada con expiración de 30 segundos
- Notificación automática al usuario cuando su entrada es validada
- Transferencia de entradas entre usuarios (máx. 3 transferencias por entrada)
- Validación ternaria: funcionario + dispositivo + QR
- Reportes: ranking de eventos, ranking de compradores, auditoría de funcionarios

---

## Variables de entorno del backend

Todas tienen valores por defecto para desarrollo. Solo es necesario sobreescribir las de la base de datos.

| Variable | Default | Descripción |
|----------|---------|-------------|
| `DB_HOST` | `localhost` | Host de PostgreSQL |
| `DB_PORT` | `5432` | Puerto de PostgreSQL |
| `DB_NAME` | `ticketing_mundial` | Nombre de la base de datos |
| `DB_USER` | `postgres` | Usuario de PostgreSQL |
| `DB_PASSWORD` | `postgres` | Contraseña de PostgreSQL |
| `JWT_SECRET` | (solo dev) | Secret HS256, mínimo 32 caracteres |
| `PORT` | `8080` | Puerto del servidor |
