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
import jakarta.persistence.Table;

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
    private Usuario idoso;


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_contato")
    private ContatoEmergencia contato;

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

    public ContatoEmergencia getContato() {
        return contato;
    }

    public void setContato(ContatoEmergencia contato) {
        this.contato = contato;
    }

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
}