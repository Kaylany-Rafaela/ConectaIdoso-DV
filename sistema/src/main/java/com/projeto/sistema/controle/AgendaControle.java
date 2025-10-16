package com.projeto.sistema.controle;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.servlet.ModelAndView;

import com.projeto.sistema.modelo.Agenda;
import com.projeto.sistema.repositorio.AgendaRepositorio;
import com.projeto.sistema.repositorio.RepositorioUsuarios;

@Controller
public class AgendaControle {

    @Autowired
    private AgendaRepositorio agendaRepositorio;

    
    @Autowired
    private RepositorioUsuarios RepositorioUsuarios;

    @GetMapping("/agenda/usuario/{usuarioId}")
    public ModelAndView listarPorUsuario(@PathVariable Long usuarioId) {
        ModelAndView mv = new ModelAndView("administrativo/agenda/lista");
        List<Agenda> eventos = agendaRepositorio.findByIdoso_IdOrderByDataInicioAsc(usuarioId);
        mv.addObject("eventosDaAgenda", eventos);
        mv.addObject("usuarioId", usuarioId); 
        return mv;
    }

    /**
     * Prepara o formulário para CADASTRAR um novo evento para um usuário específico.
     */
    @GetMapping("/agenda/cadastro/{usuarioId}")
    public ModelAndView cadastrar(@PathVariable Long usuarioId, Agenda agenda) {
        ModelAndView mv = new ModelAndView("administrativo/agenda/cadastro");
        RepositorioUsuarios.findById(usuarioId).ifPresent(agenda::setIdoso);
        mv.addObject("agenda", agenda);
        return mv;
    }

    /**
     * Prepara o formulário para EDITAR um evento existente.
     */
    @GetMapping("/agenda/editar/{eventoId}")
    public ModelAndView editar(@PathVariable Long eventoId) {
        Optional<Agenda> evento = agendaRepositorio.findById(eventoId);
        return cadastrar(evento.get().getIdoso().getId(), evento.get());
    }

    /**
     * Salva um evento .
     */
    @PostMapping("/agenda/salvar")
    public ModelAndView salvar(Agenda agenda, BindingResult result) {
        if (result.hasErrors()) {
            return cadastrar(agenda.getIdoso().getId(), agenda);
        }
        
        // criador do evento para teste
        // agenda.setCriador(usuarioLogado);
        
        agendaRepositorio.save(agenda);
        

        return new ModelAndView("redirect:/agenda/usuario/" + agenda.getIdoso().getId());
    }

    /**
     * Remove um evento da agenda.
     */
    @GetMapping("/agenda/remover/{eventoId}")
    public ModelAndView remover(@PathVariable Long eventoId) {
        
        Optional<Agenda> eventoOpt = agendaRepositorio.findById(eventoId);
        
        if (eventoOpt.isPresent()) {
            Agenda evento = eventoOpt.get();
            Long usuarioId = evento.getIdoso().getId(); 
            
            agendaRepositorio.delete(evento);
            
            return new ModelAndView("redirect:/agenda/usuario/" + usuarioId);
        }
        
        return new ModelAndView("redirect:/listarUsuario");
    }
}