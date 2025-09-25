package com.projeto.sistema.repositorio;

import org.springframework.data.jpa.repository.JpaRepository;
import com.projeto.sistema.modelo.Usuario;

public interface UsuarioRepositorio extends JpaRepository<Usuario, Long> {
    
}
