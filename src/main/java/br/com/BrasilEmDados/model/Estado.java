
package br.com.BrasilEmDados.model;

import jakarta.persistence.*;

@Entity
@Table(name = "estados")
public class Estado {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String nome;

    @Column(nullable = false, unique = true, length = 2)
    private String sigla;

    @Column(nullable = false)
    private String regiao;

    public Estado() {
    }

    public Estado(String nome, String sigla, String regiao) {
        this.nome = nome;
        this.sigla = sigla;
        this.regiao = regiao;
    }

    public Long getId() {
        return id;
    }

    public String getNome() {
        return nome;
    }

    public String getSigla() {
        return sigla;
    }

    public String getRegiao() {
        return regiao;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public void setSigla(String sigla) {
        this.sigla = sigla;
    }

    public void setRegiao(String regiao) {
        this.regiao = regiao;
    }
}
