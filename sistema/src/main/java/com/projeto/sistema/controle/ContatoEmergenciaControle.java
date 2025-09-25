package com.projeto.sistema.controle;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.servlet.ModelAndView;

import com.projeto.sistema.modelo.ContatoEmergencia;
import com.projeto.sistema.repositorio.ContatoEmergenciaRepositorio;

@Controller
public class ContatoEmergenciaControle {
    @Autowired
	private ContatoEmergenciaRepositorio contatoEmergenciaRepositorio;

    @GetMapping("/cadastroContatoemergencia")
	public ModelAndView cadastrar(ContatoEmergencia contatoEmergencia) {
		ModelAndView mv = new ModelAndView("administrativo/cadastrocontatoEmergencia/cadastro");
		mv.addObject("contatoEmergencia", contatoEmergencia);
		return mv;
	}
    
    @GetMapping("/editarContatoemergencia/{id}")
	public ModelAndView editar(@PathVariable("id") Long id) {
		Optional<ContatoEmergencia> contatoEmergencia = contatoEmergenciaRepositorio.findById(id);
		return cadastrar(contatoEmergencia.get());
	}

    @GetMapping("/removerContatoemergencia/{id}")
	public ModelAndView remover(@PathVariable("id") Long id) {
		Optional<ContatoEmergencia> contatoEmergencia = contatoEmergenciaRepositorio.findById(id);
		contatoEmergenciaRepositorio.delete(contatoEmergencia.get());
		return listar();
	}

	
	@GetMapping("/listarcontatoEmergencia")
	public ModelAndView listar() {
		ModelAndView mv = new ModelAndView("administrativo/contatoEmergencia/lista");
		mv.addObject("listacontatoEmergencia", contatoEmergenciaRepositorio.findAll());
		return mv;
	}
   
    @GetMapping("/visualizarUsuario/{id}")
    public ModelAndView visualizar(@PathVariable("id") Long id) {
        ModelAndView mv = new ModelAndView("administrativo/contatoEmergencia/perfil"); 
        Optional<ContatoEmergencia> contatoEmergenciaEncontrado = contatoEmergenciaRepositorio.findById(id);
        if(contatoEmergenciaEncontrado .isPresent()) {
            mv.addObject("contatoEmergencia", contatoEmergenciaEncontrado .get());
        } else {
            return new ModelAndView("redirect:/listarContatoEmergencia");
        }
        return mv;
    }
	
	@PostMapping("/salvarcontatoEmergencia")
	public ModelAndView salvar(ContatoEmergencia contatoEmergencia, BindingResult result) {
		if(result.hasErrors()) {
			return cadastrar(contatoEmergencia);
		}
		contatoEmergenciaRepositorio.saveAndFlush(contatoEmergencia);
		return cadastrar(new ContatoEmergencia());
	}
}
