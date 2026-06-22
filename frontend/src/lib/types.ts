export interface Usuario {
  id: number
  mail: string
  paisDoc: string
  tipoDoc: string
  numeroDoc: string
  paisDir: string
  localidad: string
  calle: string
  numeroDir: string
  codigoPostal: string
  rol: Rol
  fechaRegistro?: string
  estadoVerificacion?: string
  telefonos?: Telefono[]
}

export interface Telefono {
  id: number
  numero: string
}

export interface Fase {
  id: number
  nombre: string
  orden: number
}

export interface Estadio {
  id: number
  nombre: string
  ciudad: string
  pais: string
}

export interface Sector {
  id: number
  codigo: string
  capacidadMaxima?: number
}

export interface Evento {
  id: number
  fechaHora: string
  equipoLocal: string
  equipoVisitante: string
  estadio: Estadio
  fase: Fase
}

export interface PrecioSector {
  sectorId: number
  codigoSector: string
  capacidadMaxima: number
  precio: number
}

export interface EntradaResumen {
  id: number
  estado: EstadoEntrada
  precio: number
  codigoSector: string
}

export interface Venta {
  id: number
  fecha: string
  estado: EstadoVenta
  montoTotal: number
  entradas?: EntradaResumen[]
}

export interface Entrada {
  id: number
  estado: EstadoEntrada
  precio: number
  transferenciasRealizadas: number
  sector: { id: number; codigo: string }
  evento: {
    id: number
    fechaHora: string
    equipoLocal: string
    equipoVisitante: string
    estadioNombre: string
  }
}

export interface QrResponse {
  codigo: string
  expiraEn: string
  entradaId: number
}

export interface UsuarioDto {
  id: number
  mail: string
}

export interface Transferencia {
  id: number
  entradaId: number
  estado: EstadoTransferencia
  fechaHora: string
  origen: UsuarioDto
  destino: UsuarioDto
  evento: {
    id: number
    equipoLocal: string
    equipoVisitante: string
  }
}

export interface ResultadoValidacion {
  valida: boolean
  mensaje: string
  entrada?: {
    id: number
    eventoNombre: string
    sector: string
    propietario: string
  }
}

export interface ValidacionHistorial {
  id: number
  fechaHora: string
  resultado: string
  codigoQr: string
  entrada?: {
    id: number
    eventoNombre: string
    sector: string
  }
}

export interface EstadioAdmin {
  id: number
  nombre: string
  pais: string
  ciudad: string
}

export interface SectorAdmin {
  id: number
  codigo: string
  capacidadMaxima: number
}

export interface FaseConPrecios {
  id: number
  nombre: string
  orden: number
  precios?: FaseSectorPrecio[]
}

export interface FaseSectorPrecio {
  sectorId: number
  codigoSector: string
  precio: number
}

export interface ReporteEvento {
  eventoId: number
  equipoLocal: string
  equipoVisitante: string
  estadioNombre: string
  totalEntradas: number
  montoTotal: number
}

export interface ReporteComprador {
  usuarioId: number
  mail: string
  totalEntradas: number
  montoTotal: number
}

export interface ReporteFuncionario {
  funcionarioId: number
  mail: string
  sectoresAsignados: number
  validacionesRealizadas: number
}

export interface JwtPayload {
  sub: string
  rol: Rol
  iat: number
  exp: number
}

export type Rol = 'USUARIO_GENERAL' | 'ADMIN_PAIS' | 'FUNCIONARIO'
export type EstadoEntrada = 'ACTIVA' | 'TRANSFERIDA' | 'CONSUMIDA'
export type EstadoVenta = 'PENDIENTE' | 'COMPLETADA' | 'CANCELADA'
export type EstadoTransferencia = 'PENDIENTE' | 'ACEPTADA' | 'RECHAZADA'
