package com.ucu.ticketing.service;

import com.ucu.ticketing.dto.request.*;
import com.ucu.ticketing.dto.response.EstadioResponse;
import com.ucu.ticketing.dto.response.EventoResponse;
import com.ucu.ticketing.exception.RecursoNoEncontradoException;
import com.ucu.ticketing.exception.ReglaNegocioException;
import com.ucu.ticketing.model.Estadio;
import com.ucu.ticketing.model.Evento;
import com.ucu.ticketing.model.Fase;
import com.ucu.ticketing.model.Sector;
import com.ucu.ticketing.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final AdminPaisRepository adminPaisRepository;
    private final EstadioRepository estadioRepository;
    private final SectorRepository sectorRepository;
    private final FaseRepository faseRepository;
    private final FaseSectorRepository faseSectorRepository;
    private final EventoRepository eventoRepository;
    private final FuncionarioRepository funcionarioRepository;
    private final FuncionarioSectorRepository funcionarioSectorRepository;
    private final JdbcTemplate jdbcTemplate;

    @Transactional
    public EstadioResponse crearEstadio(Long adminId, EstadioRequest req) {
        adminPaisRepository.findById(adminId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Admin no encontrado"));

        Long estadioId = estadioRepository.insert(adminId, req.getNombre(), req.getPais(), req.getCiudad());

        Estadio estadio = Estadio.builder()
                .id(estadioId)
                .adminId(adminId)
                .nombre(req.getNombre())
                .pais(req.getPais())
                .ciudad(req.getCiudad())
                .build();

        return toEstadioResponse(estadio);
    }

    public List<EstadioResponse> getEstadios(Long adminId) {
        return estadioRepository.findByAdminId(adminId)
                .stream()
                .map(this::toEstadioResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public void crearSector(Long adminId, Long estadioId, SectorRequest req) {
        Estadio estadio = estadioRepository.findById(estadioId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Estadio no encontrado"));

        if (!estadio.getAdminId().equals(adminId)) {
            throw new ReglaNegocioException("Este estadio no te pertenece");
        }

        sectorRepository.insert(estadioId, req.getCodigo(), req.getCapacidadMaxima());
    }

    @Transactional
    public EventoResponse crearEvento(Long adminId, EventoRequest req) {
        adminPaisRepository.findById(adminId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Admin no encontrado"));

        Estadio estadio = estadioRepository.findById(req.getEstadioId())
                .orElseThrow(() -> new RecursoNoEncontradoException("Estadio no encontrado"));

        if (!estadio.getAdminId().equals(adminId)) {
            throw new ReglaNegocioException("Este estadio no te pertenece");
        }

        Fase fase = faseRepository.findById(req.getFaseId())
                .orElseThrow(() -> new RecursoNoEncontradoException("Fase no encontrada"));

        Long eventoId;
        try {
            eventoId = eventoRepository.insert(
                    estadio.getId(), adminId, fase.getId(),
                    req.getEquipoLocal(), req.getEquipoVisitante(), req.getFechaHora());
        } catch (DataIntegrityViolationException e) {
            throw new ReglaNegocioException("Ya existe un evento en ese estadio que se superpone con el horario indicado");
        }

        Evento evento = Evento.builder()
                .id(eventoId)
                .estadioId(estadio.getId())
                .adminId(adminId)
                .faseId(fase.getId())
                .equipoLocal(req.getEquipoLocal())
                .equipoVisitante(req.getEquipoVisitante())
                .fechaHora(req.getFechaHora())
                .estadio(estadio)
                .fase(fase)
                .build();

        return toEventoResponse(evento);
    }

    public List<EventoResponse> getEventos(Long adminId) {
        return eventoRepository.findByAdminId(adminId)
                .stream()
                .map(this::toEventoResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public Fase crearFase(FaseRequest req) {
        Long id = faseRepository.insert(req.getNombre(), req.getOrden());
        return Fase.builder()
                .id(id)
                .nombre(req.getNombre())
                .orden(req.getOrden())
                .build();
    }

    @Transactional
    public void definirPrecio(Long faseId, FaseSectorRequest req) {
        faseRepository.findById(faseId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Fase no encontrada"));
        sectorRepository.findById(req.getSectorId())
                .orElseThrow(() -> new RecursoNoEncontradoException("Sector no encontrado"));

        faseSectorRepository.upsert(faseId, req.getSectorId(), req.getPrecio());
    }

    @Transactional
    public void asignarFuncionarioASector(Long adminId, Long sectorId, Long funcionarioId) {
        Sector sector = sectorRepository.findById(sectorId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Sector no encontrado"));

        Estadio estadio = estadioRepository.findById(sector.getEstadioId())
                .orElseThrow(() -> new RecursoNoEncontradoException("Estadio no encontrado"));

        if (!estadio.getAdminId().equals(adminId)) {
            throw new ReglaNegocioException("Este sector no pertenece a tus estadios");
        }

        funcionarioRepository.findById(funcionarioId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Funcionario no encontrado"));

        if (funcionarioSectorRepository.existsByFuncionarioIdAndSectorId(funcionarioId, sectorId)) {
            throw new ReglaNegocioException("El funcionario ya está asignado a ese sector");
        }

        funcionarioSectorRepository.insert(funcionarioId, sectorId);
    }

    public List<Map<String, Object>> getRankingEventos() {
        return jdbcTemplate.queryForList("SELECT * FROM ticketing.v_ranking_eventos");
    }

    public List<Map<String, Object>> getRankingCompradores() {
        return jdbcTemplate.queryForList("SELECT * FROM ticketing.v_ranking_compradores");
    }

    public List<Map<String, Object>> getAuditoriaFuncionarios() {
        return jdbcTemplate.queryForList("SELECT * FROM ticketing.v_auditoria_funcionarios");
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private EstadioResponse toEstadioResponse(Estadio e) {
        return EstadioResponse.builder()
                .id(e.getId())
                .nombre(e.getNombre())
                .ciudad(e.getCiudad())
                .pais(e.getPais())
                .build();
    }

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
}
