package com.projeto.sistema.controle;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.servlet.ModelAndView;

import com.projeto.sistema.modelo.Biblioteca;
import com.projeto.sistema.repositorio.BibliotecaRepositorio;
import com.projeto.sistema.repositorio.UsuarioRepositorio; 

@Controller
public class BibliotecaControle {

    @Autowired
    private BibliotecaRepositorio bibliotecaRepositorio;
    
    @Autowired
    private UsuarioRepositorio usuarioRepositorio; 

    /**
     * LISTA todo o conteúdo da biblioteca para todos os usuários.
     */
    @GetMapping("/biblioteca")
    public ModelAndView listar() {
        ModelAndView mv = new ModelAndView("administrativo/biblioteca/lista");
        List<Biblioteca> conteudos = bibliotecaRepositorio.findAll();
        mv.addObject("listaDeConteudos", conteudos);
        return mv;
    }

    /**
     * Prepara o formulário para CADASTRAR um novo conteúdo.
     */
    @GetMapping("/biblioteca/cadastro")
    public ModelAndView cadastrar(Biblioteca biblioteca) {
        ModelAndView mv = new ModelAndView("administrativo/biblioteca/cadastro");
        mv.addObject("biblioteca", biblioteca);
        // Para um sistema real cadastrador será passado
        // Usuario usuarioLogado = ... busca o usuário da sessão de segurança ...
        // biblioteca.setCadastrador(usuarioLogado);
        return mv;
    }

    /**
     * Prepara o formulário para EDITAR um conteúdo existente.
     */
    @GetMapping("/biblioteca/editar/{id}")
    public ModelAndView editar(@PathVariable Long id) {
        Optional<Biblioteca> conteudo = bibliotecaRepositorio.findById(id);
        return cadastrar(conteudo.get());
    }

    /**
     * SALVA um novo conteúdo ou as alterações de um existente.
     */
    @PostMapping("/biblioteca/salvar")
    public ModelAndView salvar(Biblioteca biblioteca) {

        if (biblioteca.getCadastrador() == null) {

            usuarioRepositorio.findById(1L).ifPresent(biblioteca::setCadastrador);
        }
        
        if (biblioteca.getId() == null) {
            biblioteca.setDataCriacao(LocalDateTime.now());
        }
        
        bibliotecaRepositorio.save(biblioteca);
        
        return new ModelAndView("redirect:/biblioteca");
    }

    /**
     * REMOVE um conteúdo da biblioteca.
     */
    @GetMapping("/biblioteca/remover/{id}")
    public ModelAndView remover(@PathVariable Long id) {
        bibliotecaRepositorio.deleteById(id);
        return new ModelAndView("redirect:/biblioteca");
    }
}