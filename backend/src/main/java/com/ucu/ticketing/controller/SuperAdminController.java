package com.ucu.ticketing.controller;

import com.ucu.ticketing.dto.request.CrearAdminPaisRequest;
import com.ucu.ticketing.dto.request.CrearFuncionarioRequest;
import com.ucu.ticketing.dto.response.UsuarioCreadoResponse;
import com.ucu.ticketing.service.SuperAdminService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/superadmin")
@RequiredArgsConstructor
@Tag(name = "SuperAdmin", description = "Gestión de usuarios del sistema")
public class SuperAdminController {

    private final SuperAdminService superAdminService;

    @PostMapping("/admins-pais")
    @Operation(summary = "Crear un Admin País")
    public ResponseEntity<UsuarioCreadoResponse> crearAdminPais(@Valid @RequestBody CrearAdminPaisRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(superAdminService.crearAdminPais(req));
    }

    @PostMapping("/funcionarios")
    @Operation(summary = "Crear un Funcionario")
    public ResponseEntity<UsuarioCreadoResponse> crearFuncionario(@Valid @RequestBody CrearFuncionarioRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(superAdminService.crearFuncionario(req));
    }
}
