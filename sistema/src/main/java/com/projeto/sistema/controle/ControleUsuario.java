package com.projeto.sistema.controle;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestBody;
import java.util.Map;
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

    @PostMapping(value = "/associar-admin", consumes = "application/json")
    public ResponseEntity<?> associarAdmin(@RequestBody Map<String, String> body) {
        // Dados esperados no body: telefoneIdoso OR emailIdoso, nomeAdm, telefoneAdm, emailAdm, senhaAdm
        String telefoneIdoso = body.get("telefoneIdoso");
        String emailIdoso = body.get("emailIdoso");

        Usuario usuarioExistente = null;
        if (telefoneIdoso != null && !telefoneIdoso.isEmpty()) {
            usuarioExistente = RepositorioUsuarios.findByTelefone(telefoneIdoso);
        }
        if (usuarioExistente == null && emailIdoso != null && !emailIdoso.isEmpty()) {
            usuarioExistente = RepositorioUsuarios.findByEmail(emailIdoso);
        }

        if (usuarioExistente == null) {
            return ResponseEntity.status(404).body("Usuário associado (idoso) não encontrado");
        }

        // atualiza o contato de emergência do usuário existente com o telefone do admin
        String telefoneAdm = body.get("telefoneAdm");
        if (telefoneAdm == null || telefoneAdm.isEmpty()) {
            return ResponseEntity.status(400).body("Telefone do administrador é obrigatório para associação");
        }

        usuarioExistente.setContato(telefoneAdm);
        // se houver endereco do idoso no body, atualiza
        String enderecoIdoso = body.get("enderecoIdoso");
        if (enderecoIdoso != null && !enderecoIdoso.isEmpty()) {
            usuarioExistente.setEndereco(enderecoIdoso);
        }
        RepositorioUsuarios.save(usuarioExistente);

        // cria o usuário administrador
        String nomeAdm = body.get("nomeAdm");
        String emailAdm = body.get("emailAdm");
        String senhaAdm = body.get("senhaAdm");

        if (nomeAdm == null || emailAdm == null || senhaAdm == null) {
            return ResponseEntity.status(400).body("Dados incompletos do administrador");
        }

        // Verifica duplicidade por telefone ou email
        Usuario dupTelefone = RepositorioUsuarios.findByTelefone(telefoneAdm);
        if (dupTelefone != null) {
            return ResponseEntity.status(401).body("Já existe um usuário com esse telefone do administrador");
        }
        Usuario dupEmail = RepositorioUsuarios.findByEmail(emailAdm);
        if (dupEmail != null) {
            return ResponseEntity.status(401).body("Já existe um usuário com esse email do administrador");
        }

    Usuario admin = new Usuario(nomeAdm, telefoneAdm, telefoneIdoso, senhaAdm, emailAdm);
    // se houver endereco para o admin no body, defina-o
    String enderecoAdm = body.get("enderecoAdm");
    if (enderecoAdm != null && !enderecoAdm.isEmpty()) {
        admin.setEndereco(enderecoAdm);
    }
    admin.setIsAdmin(true);
    Usuario adminSalvo = RepositorioUsuarios.save(admin);

        return ResponseEntity.ok(adminSalvo);
    }

    @GetMapping(value = "/{id}")
    public ResponseEntity<?> getUsuarioPorId(@PathVariable Long id) {
        java.util.Optional<com.projeto.sistema.modelo.Usuario> opt = RepositorioUsuarios.findById(id);
        if (opt.isPresent()) {
            return ResponseEntity.ok(opt.get());
        } else {
            return ResponseEntity.status(404).body("Usuário não encontrado");
        }
    }

    @GetMapping(value = "/por-telefone/{telefone}")
    public ResponseEntity<?> getUsuarioPorTelefone(@PathVariable String telefone) {
        Usuario u = RepositorioUsuarios.findByTelefone(telefone);
        if (u == null) {
            return ResponseEntity.status(404).body("Usuário não encontrado");
        }
        return ResponseEntity.ok(u);
    }

    @PostMapping(value = "/atualizar/{id}", consumes = "application/json")
    public ResponseEntity<?> atualizarUsuario(@PathVariable Long id, @RequestBody Map<String, String> dados) {
        java.util.Optional<Usuario> opt = RepositorioUsuarios.findById(id);
        if (!opt.isPresent()) {
            return ResponseEntity.status(404).body("Usuário não encontrado");
        }
        
        Usuario usuario = opt.get();
        
        // Atualiza os campos fornecidos
        if (dados.containsKey("nome") && dados.get("nome") != null) {
            usuario.setNome(dados.get("nome"));
        }
        if (dados.containsKey("telefone") && dados.get("telefone") != null) {
            // Verifica se já existe outro usuário com esse telefone
            Usuario usuarioComTelefone = RepositorioUsuarios.findByTelefone(dados.get("telefone"));
            if (usuarioComTelefone != null && !usuarioComTelefone.getId().equals(id)) {
                return ResponseEntity.status(401).body("Já existe um usuário com esse telefone");
            }
            usuario.setTelefone(dados.get("telefone"));
        }
        if (dados.containsKey("endereco") && dados.get("endereco") != null) {
            usuario.setEndereco(dados.get("endereco"));
        }
        if (dados.containsKey("email") && dados.get("email") != null) {
            // Verifica se já existe outro usuário com esse email
            Usuario usuarioComEmail = RepositorioUsuarios.findByEmail(dados.get("email"));
            if (usuarioComEmail != null && !usuarioComEmail.getId().equals(id)) {
                return ResponseEntity.status(401).body("Já existe um usuário com esse email");
            }
            usuario.setEmail(dados.get("email"));
        }
        if (dados.containsKey("contato") && dados.get("contato") != null) {
            usuario.setContato(dados.get("contato"));
        }
        
        Usuario usuarioAtualizado = RepositorioUsuarios.save(usuario);
        System.out.println("Usuário atualizado com sucesso: " + usuario.getNome());
        return ResponseEntity.ok(usuarioAtualizado);
    }
}
