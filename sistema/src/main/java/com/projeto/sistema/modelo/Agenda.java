package com.projeto.sistema.modelo;

import java.io.Serializable;
import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonBackReference;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name="agenda")
public class Agenda implements Serializable {
    
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_evento")
    private Long id;

    private String titulo;
    private String descricao;

    @Column(name = "data_inicio")
    private LocalDateTime dataInicio;

    @Column(name = "data_fim")
    private LocalDateTime dataFim;

    @Column(name = "notificacao_sonora")
    private boolean notificacaoSonora;

    @Column(name = "notificacao_visual")
    private boolean notificacaoVisual;


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_idoso")
    @JsonBackReference("agenda-idoso")
    private Usuario idoso;


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_criador")
    @JsonBackReference("agenda-criador")
    private Usuario criador;

 

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitulo() {
        return titulo;
    }

    public void setTitulo(String titulo) {
        this.titulo = titulo;
    }

    public String getDescricao() {
        return descricao;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }

    public LocalDateTime getDataInicio() {
        return dataInicio;
    }

    public void setDataInicio(LocalDateTime dataInicio) {
        this.dataInicio = dataInicio;
    }

    public LocalDateTime getDataFim() {
        return dataFim;
    }

    public void setDataFim(LocalDateTime dataFim) {
        this.dataFim = dataFim;
    }

    public boolean isNotificacaoSonora() {
        return notificacaoSonora;
    }

    public void setNotificacaoSonora(boolean notificacaoSonora) {
        this.notificacaoSonora = notificacaoSonora;
    }

    public boolean isNotificacaoVisual() {
        return notificacaoVisual;
    }

    public void setNotificacaoVisual(boolean notificacaoVisual) {
        this.notificacaoVisual = notificacaoVisual;
    }

    public Usuario getIdoso() {
        return idoso;
    }

    public void setIdoso(Usuario idoso) {
        this.idoso = idoso;
    }

    public Usuario getCriador() {
        return criador;
    }

    public void setCriador(Usuario criador) {
        this.criador = criador;
    }
}