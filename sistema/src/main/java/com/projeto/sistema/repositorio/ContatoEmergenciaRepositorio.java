package com.projeto.sistema.repositorio;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import com.projeto.sistema.modelo.ContatoEmergencia;

public interface ContatoEmergenciaRepositorio extends JpaRepository<ContatoEmergencia, Long> {

    List<ContatoEmergencia> findByUsuario_Id(Long usuarioId);
}