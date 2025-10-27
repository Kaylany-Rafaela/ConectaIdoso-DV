package com.projeto.sistema.modelo;

import java.io.Serializable;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Transient;
import jakarta.persistence.Table;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;

@Entity
@Table(name = "emergencias")
public class Emergencia implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_emergencia")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_idoso", nullable = false)
    @JsonIgnore // evita serializar o objeto Usuario inteiro ao retornar Emergencia
    private Usuario idoso;


    // Armazena o telefone (ou identificação) do contato que será usado na ligação.
    // Copia o valor do campo 'contato' do usuário no momento do registro.
    @Column(name = "contato_usuario")
    private String contatoUsuario;

    private String descricao;

    @Column(name = "data_hora")
    private LocalDateTime dataHora;

    @Enumerated(EnumType.STRING)
    private StatusEmergencia status;


    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Usuario getIdoso() {
        return idoso;
    }

    public void setIdoso(Usuario idoso) {
        this.idoso = idoso;
    }

    // contato relation removed — armazenamos o contato do usuário em contatoUsuario

    public String getDescricao() {
        return descricao;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }

    public LocalDateTime getDataHora() {
        return dataHora;
    }

    public void setDataHora(LocalDateTime dataHora) {
        this.dataHora = dataHora;
    }

    public StatusEmergencia getStatus() {
        return status;
    }

    public void setStatus(StatusEmergencia status) {
        this.status = status;
    }

    public String getContatoUsuario() {
        return contatoUsuario;
    }

    public void setContatoUsuario(String contatoUsuario) {
        this.contatoUsuario = contatoUsuario;
    }

    /**
     * Retorna o id do usuário que acionou a emergência. Não é persistido separadamente
     * (é derivado da associação com Usuario) e é exposto no JSON como "usuarioId".
     */
    @Transient
    @JsonProperty("usuarioId")
    public Long getUsuarioId() {
        return (idoso != null) ? idoso.getId() : null;
    }
}