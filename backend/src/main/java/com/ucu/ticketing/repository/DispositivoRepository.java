package com.ucu.ticketing.repository;

import com.ucu.ticketing.model.Dispositivo;
import com.ucu.ticketing.rowmapper.DispositivoRowMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.sql.PreparedStatement;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class DispositivoRepository {

    private final JdbcTemplate jdbc;

    public Optional<Dispositivo> findByDeviceUid(String deviceUid) {
        return jdbc.query(
            "SELECT id, funcionario_id, device_uid FROM ticketing.dispositivo WHERE device_uid = ?",
            new DispositivoRowMapper(), deviceUid).stream().findFirst();
    }

    public Optional<Dispositivo> findByDeviceUidAndFuncionarioId(String deviceUid, Long funcionarioId) {
        return jdbc.query(
            "SELECT id, funcionario_id, device_uid FROM ticketing.dispositivo WHERE device_uid = ? AND funcionario_id = ?",
            new DispositivoRowMapper(), deviceUid, funcionarioId).stream().findFirst();
    }

    public Long insert(Long funcionarioId, String deviceUid) {
        String sql = "INSERT INTO ticketing.dispositivo (funcionario_id, device_uid) VALUES (?, ?)";
        KeyHolder keyHolder = new GeneratedKeyHolder();
        jdbc.update(con -> {
            PreparedStatement ps = con.prepareStatement(sql, new String[]{"id"});
            ps.setLong(1, funcionarioId);
            ps.setString(2, deviceUid);
            return ps;
        }, keyHolder);
        return keyHolder.getKey().longValue();
    }
}
