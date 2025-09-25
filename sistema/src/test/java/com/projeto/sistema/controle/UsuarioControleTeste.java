package com.projeto.sistema.controle;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.view;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.model;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
public class UsuarioControleTeste {

    @Autowired
    private MockMvc mockMvc;

    @Test
    public void deveSalvarUsuarioComSucessoERetornarParaPaginaDeCadastro() throws Exception {
        // Simula uma requisição POST para "/salvarUsuario"
        mockMvc.perform(post("/salvarUsuario")
                // Define o tipo de conteúdo como se fosse um formulário web
                .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                // Adiciona os parâmetros que viriam do formulário
                .param("nome", "Usuario de Teste")
                .param("telefone", "999998888")
                .param("senha", "senha123")
                .param("tipoUsuario", "TESTADOR")
            )
            // Agora, verificamos as respostas esperadas
            .andExpect(status().isOk()) // Esperamos um status HTTP 200 OK
            .andExpect(view().name("administrativo/usuario/cadastro")) // VERIFICA se a view retornada é a correta
            .andExpect(model().attributeExists("usuario")); // VERIFICA se o modelo contém o objeto "usuario"
    }
}