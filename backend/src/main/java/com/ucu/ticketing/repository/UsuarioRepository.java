package com.ucu.ticketing.repository;

import com.ucu.ticketing.model.Usuario;
import com.ucu.ticketing.rowmapper.UsuarioRowMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.sql.PreparedStatement;
import java.util.List;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class UsuarioRepository {

    private final JdbcTemplate jdbc;

    public Optional<Usuario> findById(Long id) {
        String sql = """
            SELECT id, mail, password, pais_doc, tipo_doc, numero_doc,
                   pais_dir, localidad, calle, numero_dir, codigo_postal, rol
            FROM ticketing.usuario WHERE id = ?
            """;
        return jdbc.query(sql, new UsuarioRowMapper(), id).stream().findFirst();
    }

    public Optional<Usuario> findByMail(String mail) {
        String sql = """
            SELECT id, mail, password, pais_doc, tipo_doc, numero_doc,
                   pais_dir, localidad, calle, numero_dir, codigo_postal, rol
            FROM ticketing.usuario WHERE mail = ?
            """;
        return jdbc.query(sql, new UsuarioRowMapper(), mail).stream().findFirst();
    }

    public List<Usuario> findAll() {
        return jdbc.query(
            "SELECT id, mail, password, pais_doc, tipo_doc, numero_doc, pais_dir, localidad, calle, numero_dir, codigo_postal, rol FROM ticketing.usuario",
            new UsuarioRowMapper());
    }

    public boolean existsByMail(String mail) {
        Integer count = jdbc.queryForObject(
            "SELECT COUNT(*) FROM ticketing.usuario WHERE mail = ?", Integer.class, mail);
        return count != null && count > 0;
    }

    public boolean existsByPaisDocAndTipoDocAndNumeroDoc(String paisDoc, String tipoDoc, String numeroDoc) {
        Integer count = jdbc.queryForObject(
            "SELECT COUNT(*) FROM ticketing.usuario WHERE pais_doc = ? AND tipo_doc = ? AND numero_doc = ?",
            Integer.class, paisDoc, tipoDoc, numeroDoc);
        return count != null && count > 0;
    }

    public Long insert(Usuario u) {
        String sql = """
            INSERT INTO ticketing.usuario
                (mail, password, pais_doc, tipo_doc, numero_doc,
                 pais_dir, localidad, calle, numero_dir, codigo_postal, rol)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """;
        KeyHolder keyHolder = new GeneratedKeyHolder();
        jdbc.update(con -> {
            PreparedStatement ps = con.prepareStatement(sql, new String[]{"id"});
            ps.setString(1, u.getMail());
            ps.setString(2, u.getPassword());
            ps.setString(3, u.getPaisDoc());
            ps.setString(4, u.getTipoDoc());
            ps.setString(5, u.getNumeroDoc());
            ps.setString(6, u.getPaisDir());
            ps.setString(7, u.getLocalidad());
            ps.setString(8, u.getCalle());
            ps.setString(9, u.getNumeroDir());
            ps.setString(10, u.getCodigoPostal());
            ps.setString(11, u.getRol());
            return ps;
        }, keyHolder);
        return keyHolder.getKey().longValue();
    }
}
