package com.projeto.sistema.repositorio;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import com.projeto.sistema.modelo.Agenda;

public interface AgendaRepositorio extends JpaRepository<Agenda, Long> {

    List<Agenda> findByIdoso_IdOrderByDataInicioAsc(Long idDoUsuario);
}