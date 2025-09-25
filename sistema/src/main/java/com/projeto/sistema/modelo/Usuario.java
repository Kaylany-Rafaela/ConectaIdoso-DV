package com.projeto.sistema.modelo;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

@Entity
@Table(name="usuario")
public class Usuario implements Serializable {
    
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_usuario")
    private Long id;

    private String nome;
    private String telefone;
    private String senha;
    private Boolean tipo_usuario;
    private LocalDateTime data_cadastro;
    private LocalDateTime data_login;

    @OneToMany(mappedBy = "usuario", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<ContatoEmergencia> contatosDeEmergencia;

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

    public Boolean getTipoUsuario() {
        return tipo_usuario;
    }

    public void setTipoUsuario(Boolean tipo_usuario) {
        this.tipo_usuario = tipo_usuario;
    }

    public LocalDateTime getDataCadastro() {
        return data_cadastro;
    }

    public void setDataCadastro(LocalDateTime data_cadastro) {
        this.data_cadastro = data_cadastro;
    }

    public LocalDateTime getDataLogin() {
        return data_login;
    }

    public void setDataLogin(LocalDateTime data_cadastro) {
        this.data_login = data_cadastro;
    }

    public List<ContatoEmergencia> getContatosDeEmergencia() {
        return contatosDeEmergencia;
    }

    public void setContatosDeEmergencia(List<ContatoEmergencia> contatosDeEmergencia) {
        this.contatosDeEmergencia = contatosDeEmergencia;
    }
}
