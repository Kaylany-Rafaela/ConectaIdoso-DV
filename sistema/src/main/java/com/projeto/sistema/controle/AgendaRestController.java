package com.projeto.sistema.controle;

import java.time.LocalDateTime;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.projeto.sistema.modelo.Agenda;
import com.projeto.sistema.modelo.Usuario;
import com.projeto.sistema.repositorio.AgendaRepositorio;
import com.projeto.sistema.repositorio.RepositorioUsuarios;

@RestController
@RequestMapping("/api/agenda")
public class AgendaRestController {

    @Autowired
    private AgendaRepositorio agendaRepo;

    @Autowired
    private RepositorioUsuarios usuariosRepo;

    @PostMapping(consumes = "application/json")
    public ResponseEntity<?> criarEvento(@RequestBody Map<String, String> body) {
        String descricao = body.get("descricao");
        String titulo = body.get("titulo");
        String dataHoraStr = body.get("dataHora");
        String cor = body.get("cor");
        String idosoIdStr = body.get("idosoId");
        String criadorIdStr = body.get("criadorId");

        if (descricao == null || dataHoraStr == null || idosoIdStr == null) {
            return ResponseEntity.badRequest().body("Campos obrigatórios: descricao, dataHora, idosoId");
        }

        try {
            LocalDateTime dataHora = LocalDateTime.parse(dataHoraStr);
            Long idosoId = Long.parseLong(idosoIdStr);
            Usuario idoso = usuariosRepo.findById(idosoId).orElse(null);
            if (idoso == null) return ResponseEntity.status(404).body("Usuário (idoso) não encontrado");

            Usuario criador = null;
            if (criadorIdStr != null) {
                try { criador = usuariosRepo.findById(Long.parseLong(criadorIdStr)).orElse(null); } catch(Exception e) { criador = null; }
            }

            Agenda evento = new Agenda();
            evento.setDescricao(descricao);
            evento.setTitulo(titulo);
            evento.setDataHora(dataHora);
            evento.setCor(cor != null ? cor : "#e67e22");
            evento.setIdoso(idoso);
            if (criador != null) evento.setCriador(criador);

            Agenda salvo = agendaRepo.save(evento);
            return ResponseEntity.ok(salvo);
        } catch (DateTimeParseException dte) {
            return ResponseEntity.badRequest().body("Formato de data/hora inválido. Use ISO-8601, ex: 2025-11-16T14:00:00");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Erro ao salvar evento: " + e.getMessage());
        }
    }

    @GetMapping("/usuario/{id}")
    public ResponseEntity<?> eventosDoUsuario(@PathVariable Long id) {
        List<Agenda> lista = agendaRepo.findByIdoso_IdOrderByDataHoraAsc(id);
        return ResponseEntity.ok(lista);
    }

    @GetMapping("/usuarios/nao-admin")
    public ResponseEntity<?> listarUsuariosNaoAdmin() {
        return ResponseEntity.ok(usuariosRepo.findByIsAdminFalse());
    }
}
