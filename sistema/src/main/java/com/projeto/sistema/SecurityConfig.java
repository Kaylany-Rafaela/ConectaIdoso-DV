package com.projeto.sistema;


import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;

import static org.springframework.security.config.Customizer.withDefaults;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            // 1. Desabilita a proteção CSRF. Essencial para testes com Postman e para APIs REST.
            .csrf(csrf -> csrf.disable())

            // 2. Define as regras de autorização para as requisições HTTP.
            .authorizeHttpRequests(authorize -> authorize
                // Permite acesso público a essas URLs específicas.
                // Ideal para páginas de login, registro, e recursos estáticos (CSS, JS).
                .requestMatchers("/", "/login", "/cadastroUsuario", "/css/**", "/js/**", "/images/**").permitAll()
                
                // Permite requisições POST para salvar um usuário (cadastro público).
                .requestMatchers("/salvarUsuario").permitAll()
                
                // Exige autenticação para TODAS as outras requisições.
                .anyRequest().authenticated()
            )
            
            // 3. Habilita um formulário de login padrão gerado pelo Spring Security.
            // Se um usuário não logado tentar acessar uma página protegida, ele será redirecionado para /login.
            .formLogin(withDefaults())
            
            // 4. Habilita a autenticação via "Basic Auth", usada pelo Postman.
            .httpBasic(withDefaults());

        return http.build();
    }
}
