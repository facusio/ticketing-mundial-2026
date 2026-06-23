package com.ucu.ticketing.service;

import com.ucu.ticketing.dto.request.CrearAdminPaisRequest;
import com.ucu.ticketing.dto.request.CrearFuncionarioRequest;
import com.ucu.ticketing.dto.response.UsuarioCreadoResponse;
import com.ucu.ticketing.exception.ReglaNegocioException;
import com.ucu.ticketing.model.Usuario;
import com.ucu.ticketing.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class SuperAdminService {

    private final UsuarioRepository usuarioRepository;
    private final AdminPaisRepository adminPaisRepository;
    private final FuncionarioRepository funcionarioRepository;
    private final TelefonoRepository telefonoRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public UsuarioCreadoResponse crearAdminPais(CrearAdminPaisRequest req) {
        validarUnicidad(req.getMail(), req.getPaisDoc(), req.getTipoDoc(), req.getNumeroDoc());

        Usuario usuario = Usuario.builder()
                .mail(req.getMail())
                .password(passwordEncoder.encode(req.getPassword()))
                .paisDoc(req.getPaisDoc())
                .tipoDoc(req.getTipoDoc())
                .numeroDoc(req.getNumeroDoc())
                .paisDir(req.getPaisDir())
                .localidad(req.getLocalidad())
                .calle(req.getCalle())
                .numeroDir(req.getNumeroDir())
                .codigoPostal(req.getCodigoPostal())
                .rol("ADMIN_PAIS")
                .build();

        Long id = usuarioRepository.insert(usuario);
        adminPaisRepository.insert(id, req.getPaisJurisdiccion(), LocalDate.now());
        req.getTelefonos().forEach(t -> telefonoRepository.insert(id, t.getNumero()));

        return UsuarioCreadoResponse.builder().id(id).mail(req.getMail()).rol("ADMIN_PAIS").build();
    }

    @Transactional
    public UsuarioCreadoResponse crearFuncionario(CrearFuncionarioRequest req) {
        validarUnicidad(req.getMail(), req.getPaisDoc(), req.getTipoDoc(), req.getNumeroDoc());

        if (funcionarioRepository.findByLegajo(req.getNumeroLegajo()).isPresent()) {
            throw new ReglaNegocioException("Ya existe un funcionario con el legajo: " + req.getNumeroLegajo());
        }

        Usuario usuario = Usuario.builder()
                .mail(req.getMail())
                .password(passwordEncoder.encode(req.getPassword()))
                .paisDoc(req.getPaisDoc())
                .tipoDoc(req.getTipoDoc())
                .numeroDoc(req.getNumeroDoc())
                .paisDir(req.getPaisDir())
                .localidad(req.getLocalidad())
                .calle(req.getCalle())
                .numeroDir(req.getNumeroDir())
                .codigoPostal(req.getCodigoPostal())
                .rol("FUNCIONARIO")
                .build();

        Long id = usuarioRepository.insert(usuario);
        funcionarioRepository.insert(id, req.getNumeroLegajo());
        req.getTelefonos().forEach(t -> telefonoRepository.insert(id, t.getNumero()));

        return UsuarioCreadoResponse.builder().id(id).mail(req.getMail()).rol("FUNCIONARIO").build();
    }

    private void validarUnicidad(String mail, String paisDoc, String tipoDoc, String numeroDoc) {
        if (usuarioRepository.existsByMail(mail)) {
            throw new ReglaNegocioException("Ya existe un usuario con el mail: " + mail);
        }
        if (usuarioRepository.existsByPaisDocAndTipoDocAndNumeroDoc(paisDoc, tipoDoc, numeroDoc)) {
            throw new ReglaNegocioException("Ya existe un usuario con ese documento");
        }
    }
}
