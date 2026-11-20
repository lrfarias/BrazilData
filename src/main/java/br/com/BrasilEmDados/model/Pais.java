package br.com.BrasilEmDados.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDateTime;

@Entity
@Table(name = "paises")
public class Pais {

    @Id
    @Column(length = 3)
    private String iso3;

    @Column(length = 3)
    private String ccn3;

    private String nome;
    private String flag;
    private String capital;
    private String continente;
    private String regiaoGeo;
    private String vocacao;

    @Column(length = 10)
    private String moeda;
    private String moedaNome;
    private Double moedaBrl;

    private Double pib;
    private String pibAno;

    private Double pibPpc;
    private String pibPpcAno;

    private Double pibPc;
    private String pibPcAno;

    private Double pop;
    private String popAno;

    private Double cresc;
    private String crescAno;

    private Double infla;
    private String inflaAno;

    private Double imposto;
    private String impostoAno;

    private Double gini;
    private String giniAno;

    private Double idh;
    private String idhAno;

    private Integer setorServ;
    private Integer setorInd;
    private Integer setorAgro;
    private Integer setorAdm;

    private LocalDateTime atualizadoEm;

    public Pais() {
    }

    // Getters e Setters
    public String getIso3() {
        return iso3;
    }

    public void setIso3(String iso3) {
        this.iso3 = iso3;
    }

    public String getCcn3() {
        return ccn3;
    }

    public void setCcn3(String ccn3) {
        this.ccn3 = ccn3;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getFlag() {
        return flag;
    }

    public void setFlag(String flag) {
        this.flag = flag;
    }

    public String getCapital() {
        return capital;
    }

    public void setCapital(String capital) {
        this.capital = capital;
    }

    public String getContinente() {
        return continente;
    }

    public void setContinente(String continente) {
        this.continente = continente;
    }

    public String getRegiaoGeo() {
        return regiaoGeo;
    }

    public void setRegiaoGeo(String regiaoGeo) {
        this.regiaoGeo = regiaoGeo;
    }

    public String getVocacao() {
        return vocacao;
    }

    public void setVocacao(String vocacao) {
        this.vocacao = vocacao;
    }

    public String getMoeda() {
        return moeda;
    }

    public void setMoeda(String moeda) {
        this.moeda = moeda;
    }

    public String getMoedaNome() {
        return moedaNome;
    }

    public void setMoedaNome(String moedaNome) {
        this.moedaNome = moedaNome;
    }

    public Double getMoedaBrl() {
        return moedaBrl;
    }

    public void setMoedaBrl(Double moedaBrl) {
        this.moedaBrl = moedaBrl;
    }

    public Double getPib() {
        return pib;
    }

    public void setPib(Double pib) {
        this.pib = pib;
    }

    public String getPibAno() {
        return pibAno;
    }

    public void setPibAno(String pibAno) {
        this.pibAno = pibAno;
    }

    public Double getPibPpc() {
        return pibPpc;
    }

    public void setPibPpc(Double pibPpc) {
        this.pibPpc = pibPpc;
    }

    public String getPibPpcAno() {
        return pibPpcAno;
    }

    public void setPibPpcAno(String pibPpcAno) {
        this.pibPpcAno = pibPpcAno;
    }

    public Double getPibPc() {
        return pibPc;
    }

    public void setPibPc(Double pibPc) {
        this.pibPc = pibPc;
    }

    public String getPibPcAno() {
        return pibPcAno;
    }

    public void setPibPcAno(String pibPcAno) {
        this.pibPcAno = pibPcAno;
    }

    public Double getPop() {
        return pop;
    }

    public void setPop(Double pop) {
        this.pop = pop;
    }

    public String getPopAno() {
        return popAno;
    }

    public void setPopAno(String popAno) {
        this.popAno = popAno;
    }

    public Double getCresc() {
        return cresc;
    }

    public void setCresc(Double cresc) {
        this.cresc = cresc;
    }

    public String getCrescAno() {
        return crescAno;
    }

    public void setCrescAno(String crescAno) {
        this.crescAno = crescAno;
    }

    public Double getInfla() {
        return infla;
    }

    public void setInfla(Double infla) {
        this.infla = infla;
    }

    public String getInflaAno() {
        return inflaAno;
    }

    public void setInflaAno(String inflaAno) {
        this.inflaAno = inflaAno;
    }

    public Double getImposto() {
        return imposto;
    }

    public void setImposto(Double imposto) {
        this.imposto = imposto;
    }

    public String getImpostoAno() {
        return impostoAno;
    }

    public void setImpostoAno(String impostoAno) {
        this.impostoAno = impostoAno;
    }

    public Double getGini() {
        return gini;
    }

    public void setGini(Double gini) {
        this.gini = gini;
    }

    public String getGiniAno() {
        return giniAno;
    }

    public void setGiniAno(String giniAno) {
        this.giniAno = giniAno;
    }

    public Double getIdh() {
        return idh;
    }

    public void setIdh(Double idh) {
        this.idh = idh;
    }

    public String getIdhAno() {
        return idhAno;
    }

    public void setIdhAno(String idhAno) {
        this.idhAno = idhAno;
    }

    public Integer getSetorServ() {
        return setorServ;
    }

    public void setSetorServ(Integer setorServ) {
        this.setorServ = setorServ;
    }

    public Integer getSetorInd() {
        return setorInd;
    }

    public void setSetorInd(Integer setorInd) {
        this.setorInd = setorInd;
    }

    public Integer getSetorAgro() {
        return setorAgro;
    }

    public void setSetorAgro(Integer setorAgro) {
        this.setorAgro = setorAgro;
    }

    public Integer getSetorAdm() {
        return setorAdm;
    }

    public void setSetorAdm(Integer setorAdm) {
        this.setorAdm = setorAdm;
    }

    public LocalDateTime getAtualizadoEm() {
        return atualizadoEm;
    }

    public void setAtualizadoEm(LocalDateTime atualizadoEm) {
        this.atualizadoEm = atualizadoEm;
    }
}