package com.projeto.sistema.repositorio;
import org.springframework.data.jpa.repository.JpaRepository;
import com.projeto.sistema.modelo.Biblioteca;

public interface BibliotecaRepositorio extends JpaRepository<Biblioteca, Long> {
    
}
