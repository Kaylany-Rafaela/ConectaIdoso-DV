package com.projeto.sistema.controle;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;

import com.projeto.sistema.modelo.Usuario;
import com.projeto.sistema.repositorio.RepositorioUsuarios;

@RestController
@RequestMapping("/usuarios")
public class ControleUsuario {
	@Autowired
	private RepositorioUsuarios RepositorioUsuarios;

	@PostMapping(value = "/cadastrar", consumes = "application/json")
	public ResponseEntity<?> register(@RequestBody Usuario usuario) {
        Usuario usuarioBanco = RepositorioUsuarios.findByTelefone(usuario.getTelefone());
        if (usuarioBanco != null) {
            return ResponseEntity.status(401).body("Já existe um usuário com esse telefone");
        }
        Usuario usuarioEmail = RepositorioUsuarios.findByEmail(usuario.getEmail());
        if (usuarioEmail != null) {
            return ResponseEntity.status(401).body("Já existe um usuário com esse email");
        }
		Usuario usuarioSalvo = RepositorioUsuarios.save(usuario);
		System.out.println("Usuário cadastrado com sucesso!");
		return ResponseEntity.ok(usuarioSalvo);
	}

	@PostMapping(value = "/login", consumes = "application/json")
    public ResponseEntity<?> login(@RequestBody Usuario loginRequest) {
        // Tenta encontrar por email primeiro, se não encontrar tenta por telefone
        Usuario usuario = null;
        if (loginRequest.getEmail() != null && !loginRequest.getEmail().isEmpty()) {
            usuario = RepositorioUsuarios.findByEmail(loginRequest.getEmail());
        } else if (loginRequest.getTelefone() != null && !loginRequest.getTelefone().isEmpty()) {
            usuario = RepositorioUsuarios.findByTelefone(loginRequest.getTelefone());
        }
        
        if (usuario != null && usuario.getSenha().equals(loginRequest.getSenha())) {
            // Senha confere
            return ResponseEntity.ok(usuario);
        } else {
            // Falha na autenticação
            return ResponseEntity.status(401).body("Email/Telefone ou senha incorretos");
        }
    }

    @PostMapping(value = "/redefinir-senha", consumes = "application/json")
    public ResponseEntity<?> redefinirSenha(@RequestBody Usuario redefinirRequest) {
        // Busca o usuário pelos dados fornecidos (nome, email e telefone)
        Usuario usuario = RepositorioUsuarios.findByNomeAndEmailAndTelefone(
            redefinirRequest.getNome(), 
            redefinirRequest.getEmail(), 
            redefinirRequest.getTelefone()
        );
        
        if (usuario != null) {
            // Usuário encontrado, atualiza a senha
            usuario.setSenha(redefinirRequest.getSenha());
            RepositorioUsuarios.save(usuario);
            System.out.println("Senha redefinida com sucesso para o usuário: " + usuario.getNome());
            return ResponseEntity.ok("Senha redefinida com sucesso!");
        } else {
            // Dados não conferem
            return ResponseEntity.status(404).body("Usuário não encontrado. Verifique os dados informados.");
        }
    }
}
