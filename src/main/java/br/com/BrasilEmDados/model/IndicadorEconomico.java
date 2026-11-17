
package br.com.BrasilEmDados.model;

import java.math.BigDecimal;

import jakarta.persistence.*;

@Entity
@Table(name = "indicadores_economicos")
public class IndicadorEconomico {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nome;

    @Column(nullable = false, precision = 20, scale = 2)
    private BigDecimal valor;

    @Column(nullable = false)
    private Integer anoReferencia;

    private String unidade;

    private String fonte;

    @ManyToOne
    @JoinColumn(name = "estado_id", nullable = false)
    private Estado estado;

    public IndicadorEconomico() {
    }

    public IndicadorEconomico(String nome, BigDecimal valor,
            Integer anoReferencia, String unidade,
            String fonte, Estado estado) {
        this.nome = nome;
        this.valor = valor;
        this.anoReferencia = anoReferencia;
        this.unidade = unidade;
        this.fonte = fonte;
        this.estado = estado;
    }

    public Long getId() {
        return id;
    }

    public String getNome() {
        return nome;
    }

    public BigDecimal getValor() {
        return valor;
    }

    public Integer getAnoReferencia() {
        return anoReferencia;
    }

    public String getUnidade() {
        return unidade;
    }

    public String getFonte() {
        return fonte;
    }

    public Estado getEstado() {
        return estado;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public void setValor(BigDecimal valor) {
        this.valor = valor;
    }

    public void setAnoReferencia(Integer anoReferencia) {
        this.anoReferencia = anoReferencia;
    }

    public void setUnidade(String unidade) {
        this.unidade = unidade;
    }

    public void setFonte(String fonte) {
        this.fonte = fonte;
    }

    public void setEstado(Estado estado) {
        this.estado = estado;
    }

}
