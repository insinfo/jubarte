<?php
/**
 * Created by PhpStorm.
 * User: isaque
 * Date: 16/04/2018
 * Time: 19:31
 */

namespace Jubarte\Model\VO;


class ViewServidoresJson
{
    const TABLE_NAME = "view_servidores_json";
    const KEY_ID = "id";
    const ID_PESSOA = "idPessoa";
    const MATRICULA = "matricula";
    const DATA_ADMISSAO = "dataAdmissao";
    const DATA_EXONERACAO = "dataExoneracao";
    const ID_VINCULO = "idVinculo";
    const ID_CARGA_HORARIA = "idCargaHoraria";
    const ID_CARGO = "idCargo";
    const ID_FUNCAO_GRATIFICADA = "idFuncaoGratificada";
    const ID_LOTACAO = "idLotacao";
    const ID_LOCAL_TRABALHO = "idLocalTrabalho";
    const DATA_CADASTRO = "dataCadastro";
    const DATA_ALTERACAO = "dataAlteracao";
    const ATIVO = "ativo";
    const BIOMETRIA = "biometria";
    //parte pessoa
    const NOME = "nome";

    const TABLE_FIELDS = [
        self::ID_PESSOA,
        self::MATRICULA,
        self::DATA_ADMISSAO,
        self::DATA_EXONERACAO,
        self::ID_VINCULO,
        self::ID_CARGA_HORARIA,
        self::ID_CARGO,
        self::ID_FUNCAO_GRATIFICADA,
        self::ID_LOTACAO,
        self::ID_LOCAL_TRABALHO,
        self::DATA_CADASTRO,
        self::DATA_ALTERACAO,
        self::ATIVO,
        self::BIOMETRIA,
        //parte pessoa
        self::NOME
    ];

    public $id;
    public $idPessoa;
    public $matricula;
    public $dataAdmissao;
    public $dataExoneracao;
    public $idVinculo;
    public $idCargaHoraria;
    public $idCargo;
    public $idFuncaoGratificada;
    public $idLocalTrabalho;
    public $dataCadastro;
    public $dataAlteracao;
    public $ativo;
    public $biometria;
}