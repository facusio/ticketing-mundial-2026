package com.ucu.ticketing.service;

import com.ucu.ticketing.dto.request.TransferenciaRequest;
import com.ucu.ticketing.dto.request.VentaRequest;
import com.ucu.ticketing.dto.response.*;
import com.ucu.ticketing.exception.AccesoDenegadoException;
import com.ucu.ticketing.exception.RecursoNoEncontradoException;
import com.ucu.ticketing.exception.ReglaNegocioException;
import com.ucu.ticketing.model.*;
import com.ucu.ticketing.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final UsuarioGeneralRepository usuarioGeneralRepository;
    private final TelefonoRepository telefonoRepository;
    private final EventoRepository eventoRepository;
    private final FaseSectorRepository faseSectorRepository;
    private final VentaRepository ventaRepository;
    private final EntradaRepository entradaRepository;
    private final TokenQrRepository tokenQrRepository;
    private final TransferenciaRepository transferenciaRepository;

    @Value("${app.commission-rate:0.05}")
    private BigDecimal commissionRate;

    @Transactional(readOnly = true)
    public PerfilResponse getPerfil(Long usuarioId) {
        Usuario u = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario no encontrado"));

        UsuarioGeneral ug = usuarioGeneralRepository.findById(usuarioId).orElse(null);
        List<Telefono> telefonos = telefonoRepository.findByUsuarioId(usuarioId);

        return PerfilResponse.builder()
                .id(u.getId())
                .mail(u.getMail())
                .paisDoc(u.getPaisDoc())
                .tipoDoc(u.getTipoDoc())
                .numeroDoc(u.getNumeroDoc())
                .paisDir(u.getPaisDir())
                .localidad(u.getLocalidad())
                .calle(u.getCalle())
                .numeroDir(u.getNumeroDir())
                .codigoPostal(u.getCodigoPostal())
                .rol(u.getRol())
                .fechaRegistro(ug != null ? ug.getFechaRegistro() : null)
                .estadoVerificacion(ug != null ? ug.getEstadoVerificacion() : null)
                .telefonos(telefonos.stream().map(t -> PerfilResponse.TelefonoDto.builder()
                        .id(t.getId())
                        .numero(t.getNumero())
                        .build()).collect(Collectors.toList()))
                .build();
    }

    @Transactional(readOnly = true)
    public List<EventoResponse> getEventos(String pais, Long estadioId) {
        return eventoRepository.findProximosFiltrados(LocalDateTime.now(), pais, estadioId)
                .stream()
                .map(this::toEventoResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<PrecioSectorResponse> getPreciosPorEvento(Long eventoId) {
        Evento evento = eventoRepository.findById(eventoId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Evento no encontrado: " + eventoId));

        return faseSectorRepository.findByFaseIdAndEstadioId(evento.getFaseId(), evento.getEstadioId())
                .stream()
                .map(fs -> PrecioSectorResponse.builder()
                        .sectorId(fs.getSector().getId())
                        .codigoSector(fs.getSector().getCodigo())
                        .capacidadMaxima(fs.getSector().getCapacidadMaxima())
                        .precio(fs.getPrecio())
                        .build())
                .collect(Collectors.toList());
    }

    @Transactional
    public VentaResponse crearVenta(Long usuarioId, VentaRequest req) {
        usuarioGeneralRepository.findById(usuarioId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario no encontrado"));

        Evento evento = eventoRepository.findById(req.getEventoId())
                .orElseThrow(() -> new RecursoNoEncontradoException("Evento no encontrado: " + req.getEventoId()));

        int totalEntradas = req.getItems().stream().mapToInt(VentaRequest.ItemVentaRequest::getCantidad).sum();
        if (totalEntradas > 5) {
            throw new ReglaNegocioException("No se pueden comprar más de 5 entradas por transacción");
        }

        BigDecimal subtotal = BigDecimal.ZERO;
        List<VentaResponse.EntradaResumenDto> resumenPrevio = new ArrayList<>();

        record ItemInfo(Long sectorId, String sectorCodigo, BigDecimal precio) {}
        List<ItemInfo> items = new ArrayList<>();

        for (VentaRequest.ItemVentaRequest item : req.getItems()) {
            FaseSector fs = faseSectorRepository.findByFaseIdAndSectorId(evento.getFaseId(), item.getSectorId())
                    .orElseThrow(() -> new RecursoNoEncontradoException(
                            "No hay precio definido para el sector " + item.getSectorId() + " en esta fase"));

            if (!fs.getSector().getEstadioId().equals(evento.getEstadioId())) {
                throw new ReglaNegocioException("El sector " + item.getSectorId() + " no pertenece al estadio del evento");
            }

            subtotal = subtotal.add(fs.getPrecio().multiply(BigDecimal.valueOf(item.getCantidad())));
            for (int i = 0; i < item.getCantidad(); i++) {
                items.add(new ItemInfo(item.getSectorId(), fs.getSector().getCodigo(), fs.getPrecio()));
            }
        }

        BigDecimal montoTotal = subtotal.multiply(BigDecimal.ONE.add(commissionRate))
                .setScale(2, RoundingMode.HALF_UP);

        LocalDateTime ahora = LocalDateTime.now();
        Long ventaId = ventaRepository.insert(usuarioId, ahora, "PENDIENTE", montoTotal, commissionRate);

        for (ItemInfo info : items) {
            Long entradaId = entradaRepository.insert(
                    ventaId, evento.getId(), info.sectorId(), usuarioId,
                    info.precio(), "ACTIVA", (short) 0);
            resumenPrevio.add(VentaResponse.EntradaResumenDto.builder()
                    .id(entradaId)
                    .estado("ACTIVA")
                    .precio(info.precio())
                    .codigoSector(info.sectorCodigo())
                    .build());
        }

        return VentaResponse.builder()
                .id(ventaId)
                .fecha(ahora)
                .estado("PENDIENTE")
                .montoTotal(montoTotal)
                .entradas(resumenPrevio)
                .build();
    }

    @Transactional(readOnly = true)
    public List<VentaResponse> getVentas(Long usuarioId) {
        return ventaRepository.findByUsuarioIdOrderByFechaDesc(usuarioId)
                .stream()
                .map(v -> VentaResponse.builder()
                        .id(v.getId())
                        .fecha(v.getFecha())
                        .estado(v.getEstado())
                        .montoTotal(v.getMontoTotal())
                        .build())
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<EntradaResponse> getEntradas(Long usuarioId) {
        return entradaRepository.findByPropietarioActualId(usuarioId)
                .stream()
                .map(this::toEntradaResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public QrResponse getQr(Long usuarioId, Long entradaId) {
        Entrada entrada = entradaRepository.findById(entradaId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Entrada no encontrada: " + entradaId));

        if (!entrada.getPropietarioActualId().equals(usuarioId)) {
            throw new AccesoDenegadoException("Esta entrada no te pertenece");
        }

        if ("CONSUMIDA".equals(entrada.getEstado())) {
            throw new ReglaNegocioException("La entrada ya fue consumida");
        }

        TokenQr tokenActivo = tokenQrRepository.findByEntradaIdAndActivoTrue(entradaId).orElse(null);

        if (tokenActivo == null || tokenActivo.getExpiraEn().isBefore(LocalDateTime.now())) {
            tokenQrRepository.desactivarTokensActivos(entradaId);

            LocalDateTime ahora = LocalDateTime.now();
            String codigo = UUID.randomUUID().toString();
            LocalDateTime expiraEn = ahora.plusSeconds(30);

            tokenQrRepository.insert(entradaId, codigo, ahora, expiraEn, true);

            return QrResponse.builder()
                    .codigo(codigo)
                    .expiraEn(expiraEn)
                    .entradaId(entradaId)
                    .build();
        }

        return QrResponse.builder()
                .codigo(tokenActivo.getCodigo())
                .expiraEn(tokenActivo.getExpiraEn())
                .entradaId(entradaId)
                .build();
    }

    @Transactional
    public TransferenciaResponse crearTransferencia(Long origenId, TransferenciaRequest req) {
        Entrada entrada = entradaRepository.findById(req.getEntradaId())
                .orElseThrow(() -> new RecursoNoEncontradoException("Entrada no encontrada"));

        if (!entrada.getPropietarioActualId().equals(origenId)) {
            throw new AccesoDenegadoException("Esta entrada no te pertenece");
        }
        if ("CONSUMIDA".equals(entrada.getEstado())) {
            throw new ReglaNegocioException("No se puede transferir una entrada consumida");
        }
        if ("TRANSFERIDA".equals(entrada.getEstado())) {
            throw new ReglaNegocioException("La entrada tiene una transferencia pendiente activa");
        }
        if (entrada.getTransferenciasRealizadas() >= 3) {
            throw new ReglaNegocioException("La entrada alcanzó el máximo de 3 transferencias permitidas");
        }

        Usuario destino = usuarioRepository.findByMail(req.getDestinoMail())
                .orElseThrow(() -> new RecursoNoEncontradoException("No existe usuario con mail: " + req.getDestinoMail()));

        if (destino.getId().equals(origenId)) {
            throw new ReglaNegocioException("No podés transferirte una entrada a vos mismo");
        }

        Usuario origen = usuarioRepository.findById(origenId).orElseThrow();

        LocalDateTime ahora = LocalDateTime.now();
        Long transferenciaId = transferenciaRepository.insert(
                req.getEntradaId(), origenId, destino.getId(), ahora, "PENDIENTE");

        entradaRepository.updateEstado(req.getEntradaId(), "TRANSFERIDA");

        Transferencia transferencia = Transferencia.builder()
                .id(transferenciaId)
                .entradaId(req.getEntradaId())
                .origenId(origenId)
                .destinoId(destino.getId())
                .fechaHora(ahora)
                .estado("PENDIENTE")
                .entrada(entrada)
                .origen(origen)
                .destino(destino)
                .build();

        return toTransferenciaResponse(transferencia);
    }

    @Transactional(readOnly = true)
    public List<TransferenciaResponse> getTransferenciasRecibidas(Long usuarioId) {
        return transferenciaRepository.findByDestinoIdAndEstado(usuarioId, "PENDIENTE")
                .stream()
                .map(this::toTransferenciaResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public void aceptarTransferencia(Long usuarioId, Long transferenciaId) {
        Transferencia t = transferenciaRepository.findById(transferenciaId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Transferencia no encontrada"));

        if (!t.getDestinoId().equals(usuarioId)) {
            throw new AccesoDenegadoException("Esta transferencia no está dirigida a vos");
        }
        if (!"PENDIENTE".equals(t.getEstado())) {
            throw new ReglaNegocioException("La transferencia ya fue procesada");
        }

        transferenciaRepository.updateEstado(transferenciaId, "ACEPTADA");

        // Actualizar entrada: nuevo propietario, estado ACTIVA, incrementar transferencias_realizadas
        // (el trigger T7 también lo hace; esta actualización explícita garantiza consistencia)
        entradaRepository.confirmarTransferencia(t.getEntrada().getId(), t.getDestinoId());
    }

    @Transactional
    public void rechazarTransferencia(Long usuarioId, Long transferenciaId) {
        Transferencia t = transferenciaRepository.findById(transferenciaId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Transferencia no encontrada"));

        if (!t.getDestinoId().equals(usuarioId)) {
            throw new AccesoDenegadoException("Esta transferencia no está dirigida a vos");
        }
        if (!"PENDIENTE".equals(t.getEstado())) {
            throw new ReglaNegocioException("La transferencia ya fue procesada");
        }

        transferenciaRepository.updateEstado(transferenciaId, "RECHAZADA");
        entradaRepository.updateEstado(t.getEntradaId(), "ACTIVA");
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private EventoResponse toEventoResponse(Evento e) {
        return EventoResponse.builder()
                .id(e.getId())
                .fechaHora(e.getFechaHora())
                .equipoLocal(e.getEquipoLocal())
                .equipoVisitante(e.getEquipoVisitante())
                .estadio(EventoResponse.EstadioDto.builder()
                        .id(e.getEstadio().getId())
                        .nombre(e.getEstadio().getNombre())
                        .ciudad(e.getEstadio().getCiudad())
                        .pais(e.getEstadio().getPais())
                        .build())
                .fase(EventoResponse.FaseDto.builder()
                        .id(e.getFase().getId())
                        .nombre(e.getFase().getNombre())
                        .orden(e.getFase().getOrden())
                        .build())
                .build();
    }

    private EntradaResponse toEntradaResponse(Entrada e) {
        return EntradaResponse.builder()
                .id(e.getId())
                .estado(e.getEstado())
                .precio(e.getPrecio())
                .transferenciasRealizadas(e.getTransferenciasRealizadas())
                .sector(EntradaResponse.SectorDto.builder()
                        .id(e.getSector().getId())
                        .codigo(e.getSector().getCodigo())
                        .build())
                .evento(EntradaResponse.EventoDto.builder()
                        .id(e.getEvento().getId())
                        .fechaHora(e.getEvento().getFechaHora())
                        .equipoLocal(e.getEvento().getEquipoLocal())
                        .equipoVisitante(e.getEvento().getEquipoVisitante())
                        .estadioNombre(e.getEvento().getEstadio().getNombre())
                        .build())
                .build();
    }

    private TransferenciaResponse toTransferenciaResponse(Transferencia t) {
        return TransferenciaResponse.builder()
                .id(t.getId())
                .entradaId(t.getEntradaId())
                .estado(t.getEstado())
                .fechaHora(t.getFechaHora())
                .origen(TransferenciaResponse.UsuarioDto.builder()
                        .id(t.getOrigen().getId())
                        .mail(t.getOrigen().getMail())
                        .build())
                .destino(TransferenciaResponse.UsuarioDto.builder()
                        .id(t.getDestino().getId())
                        .mail(t.getDestino().getMail())
                        .build())
                .evento(TransferenciaResponse.EventoDto.builder()
                        .id(t.getEntrada().getEvento().getId())
                        .equipoLocal(t.getEntrada().getEvento().getEquipoLocal())
                        .equipoVisitante(t.getEntrada().getEvento().getEquipoVisitante())
                        .build())
                .build();
    }
}
