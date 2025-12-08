package com.projeto.sistema.repositorio;

import org.springframework.data.jpa.repository.JpaRepository;
import com.projeto.sistema.modelo.Usuario;

public interface RepositorioUsuarios extends JpaRepository<Usuario, Long> {
    Usuario findByTelefone(String telefone);
    Usuario findByEmail(String email);
    Usuario findByNomeAndEmailAndTelefone(String nome, String email, String telefone);
    java.util.List<Usuario> findByIsAdminFalse();
}
