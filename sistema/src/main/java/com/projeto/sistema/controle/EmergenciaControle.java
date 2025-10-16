package com.projeto.sistema.controle;

import java.time.LocalDateTime;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.projeto.sistema.modelo.Emergencia;
import com.projeto.sistema.modelo.StatusEmergencia;
import com.projeto.sistema.modelo.Usuario;
import com.projeto.sistema.repositorio.EmergenciaRepositorio;
import com.projeto.sistema.repositorio.RepositorioUsuarios;

@RestController
public class EmergenciaControle {

    @Autowired
    private EmergenciaRepositorio emergenciaRepositorio;

    @Autowired
    private RepositorioUsuarios RepositorioUsuarios;

    // DTO simples para receber a descrição opcional do Postman
    public static class EmergenciaRequest {
        public String descricao;
    }

    @PostMapping("/emergencias/disparar/{usuarioId}")
    public ResponseEntity<Emergencia> dispararEmergencia(
            @PathVariable Long usuarioId,
            @RequestBody(required = false) EmergenciaRequest request) {

        Usuario usuario = RepositorioUsuarios.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado!"));

        Emergencia novaEmergencia = new Emergencia();
        novaEmergencia.setIdoso(usuario);
        
        String descricao = (request != null && request.descricao != null) 
                           ? request.descricao 
                           : "Pedido de ajuda urgente!";
        novaEmergencia.setDescricao(descricao);
        
        novaEmergencia.setDataHora(LocalDateTime.now());
        novaEmergencia.setStatus(StatusEmergencia.PENDENTE);

        // Salva a emergência no banco de dados
        Emergencia emergenciaSalva = emergenciaRepositorio.save(novaEmergencia);

        System.out.println("!!! EMERGÊNCIA DISPARADA !!! Notificar contatos do usuário: " + usuario.getNome());


        // Retorna a emergência criada com o status HTTP 201
        return new ResponseEntity<>(emergenciaSalva, HttpStatus.CREATED);
    }
}