package com.projeto.sistema.controle;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.servlet.ModelAndView;

import com.projeto.sistema.modelo.ContatoEmergencia;
import com.projeto.sistema.repositorio.ContatoEmergenciaRepositorio;
import com.projeto.sistema.repositorio.UsuarioRepositorio;

@Controller
public class ContatoEmergenciaControle {

    @Autowired
    private ContatoEmergenciaRepositorio contatoEmergenciaRepositorio;

    @Autowired
    private UsuarioRepositorio usuarioRepositorio; 

    /**
     * LISTA todos os contatos de emergência de um usuário específico.
     * Esta é a sua página principal de contatos.
     */
    @GetMapping("/contatos/usuario/{usuarioId}")
    public ModelAndView listarPorUsuario(@PathVariable Long usuarioId) {
        ModelAndView mv = new ModelAndView("administrativo/contatos/lista");
        List<ContatoEmergencia> contatos = contatoEmergenciaRepositorio.findByUsuario_Id(usuarioId);
        mv.addObject("listaContatos", contatos);
        mv.addObject("usuarioId", usuarioId); 
        return mv;
    }

    /**
     * Prepara o formulário para ADICIONAR um novo contato para um usuário.
     */
    @GetMapping("/contatos/cadastro/{usuarioId}")
    public ModelAndView cadastrar(@PathVariable Long usuarioId, ContatoEmergencia contatoEmergencia) {
        ModelAndView mv = new ModelAndView("administrativo/contatos/cadastro");
        usuarioRepositorio.findById(usuarioId).ifPresent(contatoEmergencia::setUsuario);
        mv.addObject("contatoEmergencia", contatoEmergencia);
        return mv;
    }

    /**
     * Prepara o formulário para EDITAR um contato existente.
     */
    @GetMapping("/contatos/editar/{contatoId}")
    public ModelAndView editar(@PathVariable Long contatoId) {
        ModelAndView mv = new ModelAndView("administrativo/contatos/cadastro");
        Optional<ContatoEmergencia> contato = contatoEmergenciaRepositorio.findById(contatoId);
        mv.addObject("contatoEmergencia", contato.get());
        return mv;
    }

    /**
     * SALVA um novo contato ou as alterações de um contato existente.
     */
    @PostMapping("/contatos/salvar")
    public ModelAndView salvar(ContatoEmergencia contatoEmergencia) {
        contatoEmergenciaRepositorio.save(contatoEmergencia);
        return new ModelAndView("redirect:/contatos/usuario/" + contatoEmergencia.getUsuario().getId());
    }

    /**
     * EXCLUI um contato de emergência.
     */
    @GetMapping("/contatos/remover/{contatoId}")
    public ModelAndView remover(@PathVariable Long contatoId) {
        Optional<ContatoEmergencia> contatoOpt = contatoEmergenciaRepositorio.findById(contatoId);
        
        if (contatoOpt.isPresent()) {
            ContatoEmergencia contato = contatoOpt.get();
            Long usuarioId = contato.getUsuario().getId();
            
            contatoEmergenciaRepositorio.delete(contato);
            
            return new ModelAndView("redirect:/contatos/usuario/" + usuarioId);
        }
        
        return new ModelAndView("redirect:/listarUsuario");
    }
}