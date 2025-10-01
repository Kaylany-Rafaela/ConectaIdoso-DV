package com.projeto.sistema.repositorio;

import org.springframework.data.jpa.repository.JpaRepository;
import com.projeto.sistema.modelo.Permissao;

public interface PermissaoRepositorio extends JpaRepository<Permissao, Long> {
    Permissao findByNome(String nome);
}