package com.ucu.ticketing.service;

import com.ucu.ticketing.dto.request.DispositivoRequest;
import com.ucu.ticketing.dto.request.ValidacionRequest;
import com.ucu.ticketing.dto.response.ValidacionResponse;
import com.ucu.ticketing.exception.AccesoDenegadoException;
import com.ucu.ticketing.exception.RecursoNoEncontradoException;
import com.ucu.ticketing.exception.ReglaNegocioException;
import com.ucu.ticketing.model.Dispositivo;
import com.ucu.ticketing.model.Entrada;
import com.ucu.ticketing.model.TokenQr;
import com.ucu.ticketing.model.Usuario;
import com.ucu.ticketing.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class FuncionarioService {

    private final FuncionarioRepository funcionarioRepository;
    private final DispositivoRepository dispositivoRepository;
    private final FuncionarioSectorRepository funcionarioSectorRepository;
    private final TokenQrRepository tokenQrRepository;
    private final ValidacionTernariaRepository validacionTernariaRepository;

    @Transactional
    public void registrarDispositivo(Long funcionarioId, DispositivoRequest req) {
        funcionarioRepository.findById(funcionarioId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Funcionario no encontrado"));

        dispositivoRepository.findByDeviceUidAndFuncionarioId(req.getDeviceUid(), funcionarioId)
                .ifPresentOrElse(
                        d -> { /* ya existe, no duplicar */ },
                        () -> dispositivoRepository.insert(funcionarioId, req.getDeviceUid())
                );
    }

    public List<Map<String, Object>> getSectoresAsignados(Long funcionarioId) {
        return funcionarioSectorRepository.getSectoresAsignados(funcionarioId);
    }

    @Transactional
    public ValidacionResponse validar(Long funcionarioId, ValidacionRequest req) {
        // 1. Buscar token QR con todos los datos de entrada via JOIN
        TokenQr token = tokenQrRepository.findByCodigo(req.getCodigoQr())
                .orElseThrow(() -> new RecursoNoEncontradoException("QR no encontrado o inválido"));

        // 2. Validar que esté activo y no expirado
        if (!token.getActivo()) {
            throw new ReglaNegocioException("El QR no está activo");
        }
        if (token.getExpiraEn().isBefore(LocalDateTime.now())) {
            throw new ReglaNegocioException("El QR está expirado. Pedile al titular que regenere el código");
        }

        // 3. Obtener la entrada (con sector, evento, propietario ya populados por el JOIN)
        Entrada entrada = token.getEntrada();

        // 4. Verificar que el sector esté asignado al funcionario
        if (!funcionarioSectorRepository.existsByFuncionarioIdAndSectorId(funcionarioId, entrada.getSectorId())) {
            throw new AccesoDenegadoException("No estás habilitado para validar entradas de este sector");
        }

        // 5. Verificar que la entrada no esté ya consumida
        if ("CONSUMIDA".equals(entrada.getEstado())) {
            throw new ReglaNegocioException("Entrada ya validada: esta entrada fue consumida anteriormente");
        }

        // 6. Obtener el dispositivo
        funcionarioRepository.findById(funcionarioId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Funcionario no encontrado"));

        Dispositivo dispositivo = dispositivoRepository.findByDeviceUidAndFuncionarioId(req.getDeviceUid(), funcionarioId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Dispositivo no registrado. Registralo primero"));

        // 7. Insertar validacion_ternaria — el trigger T6 marcará la entrada como CONSUMIDA
        LocalDateTime ahora = LocalDateTime.now();
        validacionTernariaRepository.insert(
                funcionarioId, dispositivo.getId(), entrada.getId(), token.getId(), ahora);

        Usuario propietario = entrada.getPropietarioActual();

        return ValidacionResponse.builder()
                .mensaje("ACCESO PERMITIDO")
                .entradaId(entrada.getId())
                .fechaValidacion(ahora)
                .propietario(ValidacionResponse.PropietarioDto.builder()
                        .id(propietario.getId())
                        .mail(propietario.getMail())
                        .numeroDoc(propietario.getNumeroDoc())
                        .build())
                .evento(ValidacionResponse.EventoDto.builder()
                        .id(entrada.getEvento().getId())
                        .equipoLocal(entrada.getEvento().getEquipoLocal())
                        .equipoVisitante(entrada.getEvento().getEquipoVisitante())
                        .fechaHora(entrada.getEvento().getFechaHora())
                        .build())
                .sector(ValidacionResponse.SectorDto.builder()
                        .id(entrada.getSector().getId())
                        .codigo(entrada.getSector().getCodigo())
                        .estadioNombre(entrada.getSector().getEstadio().getNombre())
                        .build())
                .build();
    }

    public List<ValidacionResponse> getValidaciones(Long funcionarioId) {
        return validacionTernariaRepository.findByFuncionarioId(funcionarioId)
                .stream()
                .map(vt -> {
                    Usuario propietario = vt.getEntrada().getPropietarioActual();
                    return ValidacionResponse.builder()
                            .entradaId(vt.getEntrada().getId())
                            .fechaValidacion(vt.getFechaHora())
                            .propietario(ValidacionResponse.PropietarioDto.builder()
                                    .id(propietario.getId())
                                    .mail(propietario.getMail())
                                    .numeroDoc(propietario.getNumeroDoc())
                                    .build())
                            .evento(ValidacionResponse.EventoDto.builder()
                                    .id(vt.getEntrada().getEvento().getId())
                                    .equipoLocal(vt.getEntrada().getEvento().getEquipoLocal())
                                    .equipoVisitante(vt.getEntrada().getEvento().getEquipoVisitante())
                                    .fechaHora(vt.getEntrada().getEvento().getFechaHora())
                                    .build())
                            .sector(ValidacionResponse.SectorDto.builder()
                                    .id(vt.getEntrada().getSector().getId())
                                    .codigo(vt.getEntrada().getSector().getCodigo())
                                    .estadioNombre(vt.getEntrada().getSector().getEstadio().getNombre())
                                    .build())
                            .build();
                })
                .toList();
    }
}
