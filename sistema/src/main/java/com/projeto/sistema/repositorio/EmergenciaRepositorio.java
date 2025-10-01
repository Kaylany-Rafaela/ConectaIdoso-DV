package com.projeto.sistema.repositorio;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import com.projeto.sistema.modelo.Emergencia;
import com.projeto.sistema.modelo.StatusEmergencia;

public interface EmergenciaRepositorio extends JpaRepository<Emergencia, Long> {


    List<Emergencia> findByIdoso_IdAndStatus(Long idosoId, StatusEmergencia status);
}