package com.projeto.sistema.repositorio;

import org.springframework.data.jpa.repository.JpaRepository;
import com.projeto.sistema.modelo.ContatoEmergencia;

public interface ContatoEmergenciaRepositorio extends JpaRepository<ContatoEmergencia, Long> {
    
}
