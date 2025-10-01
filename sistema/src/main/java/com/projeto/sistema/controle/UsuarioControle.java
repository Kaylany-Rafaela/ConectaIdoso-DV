package com.projeto.sistema.controle;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.servlet.ModelAndView;

import com.projeto.sistema.modelo.Usuario;
import com.projeto.sistema.repositorio.UsuarioRepositorio;

@Controller
public class UsuarioControle {
	@Autowired
	private UsuarioRepositorio usuarioRepositorio;
	
	@GetMapping("/cadastroUsuario")
	public ModelAndView cadastrar(Usuario usuario) {
		ModelAndView mv = new ModelAndView("administrativo/usuario/cadastro");
		mv.addObject("usuario", usuario);
		return mv;
	}
	
	@GetMapping("/editarUsuario/{id}")
	public ModelAndView editar(@PathVariable("id") Long id) {
		Optional<Usuario> usuario = usuarioRepositorio.findById(id);
		return cadastrar(usuario.get());
	}
	
	@GetMapping("/removerUsuario/{id}")
	public ModelAndView remover(@PathVariable("id") Long id) {
		Optional<Usuario> usuario = usuarioRepositorio.findById(id);
		usuarioRepositorio.delete(usuario.get());
		return listar();
	}
	
	@GetMapping("/listarUsuario")
	public ModelAndView listar() {
		ModelAndView mv = new ModelAndView("administrativo/usuario/lista");
		mv.addObject("listaUsuarios", usuarioRepositorio.findAll());
		return mv;
	}
   
    @GetMapping("/visualizarUsuario/{id}")
    public ModelAndView visualizar(@PathVariable("id") Long id) {
        ModelAndView mv = new ModelAndView("administrativo/usuario/perfil"); 
        Optional<Usuario> usuarioEncontrado = usuarioRepositorio.findById(id);
        if(usuarioEncontrado.isPresent()) {
            mv.addObject("usuario", usuarioEncontrado.get());
        } else {
            return new ModelAndView("redirect:/listarUsuario");
        }
        return mv;
}
	
	@PostMapping("/salvarUsuario")
	public ModelAndView salvar(Usuario usuario, BindingResult result) {
		if(result.hasErrors()) {
			return cadastrar(usuario);
		}
		usuarioRepositorio.saveAndFlush(usuario);
		return cadastrar(new Usuario());
	}
	
	

}
