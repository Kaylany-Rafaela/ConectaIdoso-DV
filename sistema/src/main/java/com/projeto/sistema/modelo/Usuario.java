package com.projeto.sistema.modelo;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Set;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

@Entity
@Table(name="usuario")
// MUDANÇA 1: Implementa a interface UserDetails do Spring Security
public class Usuario implements Serializable, UserDetails {
    
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_usuario")
    private Long id;

    private String nome;
    private String telefone;
    private String senha;
    private String tipo_usuario;
    private LocalDateTime data_cadastro;
    private LocalDateTime data_login;

    // RELACIONAMENTO COM PERMISSOES ---
    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
        name = "usuario_permissao",
        joinColumns = @JoinColumn(name = "usuario_id"),
        inverseJoinColumns = @JoinColumn(name = "permissao_id")
    )
    private Set<Permissao> permissoes;

    @OneToMany(mappedBy = "usuario", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference("usuario-contatos")
    private List<ContatoEmergencia> contatosDeEmergencia;

    @OneToMany(mappedBy = "cadastrador", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference("usuario-biblioteca")
    private List<Biblioteca> conteudosCadastrados;

    @OneToMany(mappedBy = "idoso", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference("agenda-idoso")
    private List<Agenda> agendaEventos;



    public Long getId() { 
        return id; 
    }
    public void setId(Long id) { 
        this.id = id; 
    }

    public String getNome() { 
        return nome; 
    }
    public void setNome(String nome) { 
        this.nome = nome; 
    }

    public String getTelefone() { 
        return telefone; 
    }
    public void setTelefone(String telefone) { 
        this.telefone = telefone; 
    }

    public String getSenha() { 
        return senha; 
    }
    public void setSenha(String senha) { 
        this.senha = senha; 
    }

    public String getTipo_usuario() { 
        return tipo_usuario; 
    }
    public void setTipo_usuario(String tipo_usuario) { 
        this.tipo_usuario = tipo_usuario; 
    }

    public LocalDateTime getData_cadastro() { 
        return data_cadastro; 
    }
    public void setData_cadastro(LocalDateTime data_cadastro) { 
        this.data_cadastro = data_cadastro; 
    }

    public LocalDateTime getData_login() { 
        return data_login; 
    }
    public void setData_login(LocalDateTime data_login) { 
        this.data_login = data_login; 
    }

    public Set<Permissao> getPermissoes() { 
        return permissoes; 
    }
    public void setPermissoes(Set<Permissao> permissoes) { 
        this.permissoes = permissoes; 
    }

    public List<ContatoEmergencia> getContatosDeEmergencia() { 
        return contatosDeEmergencia; 
    }
    public void setContatosDeEmergencia(List<ContatoEmergencia> contatosDeEmergencia) { 
        this.contatosDeEmergencia = contatosDeEmergencia; 
    }

    public List<Biblioteca> getConteudosCadastrados() { 
        return conteudosCadastrados; 
    }
    public void setConteudosCadastrados(List<Biblioteca> conteudosCadastrados) { 
        this.conteudosCadastrados = conteudosCadastrados; 
    }

    public List<Agenda> getAgendaEventos() { 
        return agendaEventos; 
    }
    public void setAgendaEventos(List<Agenda> agendaEventos) { 
        this.agendaEventos = agendaEventos; 
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return this.permissoes;
    }

    @Override
    public String getPassword() {
        return this.senha;
    }

    @Override
    public String getUsername() {
        return this.telefone;
    }

    @Override
    public boolean isAccountNonExpired() { 
        return true; 
    }

    @Override
    public boolean isAccountNonLocked() { 
        return true; 
    }

    @Override
    public boolean isCredentialsNonExpired() { 
        return true; 
    }

    @Override
    public boolean isEnabled() { 
        return true; 
    }
}