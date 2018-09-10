import { Component } from '@angular/core';
import { NavParams, ViewController } from 'ionic-angular';
import { HelperFunctions } from './../../../../providers/helper-functions';
import { ApiFunctions } from './../../../../providers/api-functions';
import { Global } from './../../../../providers/global';
import createNumberMask from 'text-mask-addons/dist/createNumberMask';

// @IonicPage()
@Component({
  selector: 'assoc-single-modal',
  templateUrl: 'assoc-single-modal.html',
})
export class AssociadosSingleModal {

    private meses = [
        'janeiro', 'fevereiro', 'marco', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
    ];
    private title_page: string;
    private requisicao: any;
    private requisicao_modal: any;
    private campos_desabilitados: boolean = false;

    private pagamento: any = {
        id              : '',
        id_pessoa       : '',
        nome_pessoa     : '',
        valor           : '',
        mes             : '',
        ano             : '',
        data_pagamento  : '',
        img             : '',
        tipo_pagamento  : 'mensalidade',
        pasta           : '/associado',
        pago            : 'true',
        objeto          : 'associado',
        objeto_desc     : 'pagamento'
    };
    private valorPagamentoMask: any;

    private documento: any = {
        id              : '',
        id_pessoa       : '',
        nome_pessoa     : '',
        data            : '',
        img             : '',
        documento_desc  : '',
        tipo_documento  : '',
        pasta           : '/associado',
        objeto          : 'associado',
        objeto_desc     : 'documento'
    };

    private advertencia: any = {
        id              : '',
        id_advertido    : '',
        nome_advertido  : '',
        id_autor        : '',
        nome_autor      : '',
        advertencia     : '',
        grau            : 'baixo'
    };

    private url_imagem: any;
    private alterarImagem: boolean = false;

    constructor(
        private navParams: NavParams,
        private viewCtrl: ViewController,
        private helperCtrl: HelperFunctions,
        private api: ApiFunctions,
        private global: Global
    ){

        this.requisicao = this.navParams.get('requisicao');
        this.requisicao_modal = this.navParams.get('requisicao_modal');
        let data_atual = this.helperCtrl.get_data_atual();

        if( this.requisicao_modal === 'pagamento' ){

            this.valorPagamentoMask = createNumberMask({
                prefix: 'R$',
                suffix: '00',
                allowDecimal: true,
                requireDecimal: true
            });

            if( this.requisicao === 'adicionar' ){

                this.title_page               = 'Novo Pagamento';
                this.pagamento.id_pessoa      = this.navParams.data.id_pessoa;
                this.pagamento.nome_pessoa    = this.navParams.data.nome_pessoa;
                this.pagamento.data_registro  = this.pagamento.data_pagamento = data_atual.timestamp;
                this.pagamento.mes            = data_atual.mes;
                this.pagamento.ano            = data_atual.ano;

            }

            if( this.requisicao === 'editar' ){

                this.title_page               = 'Editar Pagamento';
                this.pagamento                = this.navParams.data.pagamento;
                this.pagamento.data_pagamento = data_atual.timestamp;

                this.campos_desabilitados = true;

            }

        } else if ( this.requisicao_modal === 'comprovante_pagamento' ){

            this.title_page = 'Comprovante de Pagamento';
            this.url_imagem = this.navParams.get('imagem');

        } else if ( this.requisicao_modal === 'documento' ){

            this.documento.data = data_atual.timestamp;

            if( this.requisicao === 'adicionar' ){

                this.title_page             = 'Novo Documento';
                this.documento.id_pessoa    = this.navParams.data.id_pessoa;
                this.documento.nome_pessoa  = this.navParams.data.nome_pessoa;

            }

            if( this.requisicao === 'editar' ){
                this.title_page     = 'Editar Documento';
                this.documento      = this.navParams.data.documento;
            }

        } else if ( this.requisicao_modal === 'comprovante_documento' ){

            this.title_page = 'Comprovante de Documento';
            this.url_imagem = this.navParams.get('imagem');

        } else if ( this.requisicao_modal === 'advertencia' ) {

            if( this.requisicao === 'adicionar' ){
                this.title_page                 = 'Nova Advertência';
                this.advertencia.id_advertido   = this.navParams.data.id;
                this.advertencia.nome_advertido = this.navParams.data.nome;
                this.advertencia.id_autor       = this.navParams.data.usuario_atual.id;
                this.advertencia.nome_autor     = this.navParams.data.usuario_atual.nome;
            }
            if( this.requisicao === 'editar' ){
                this.title_page     = 'Editar Advertência';
                this.advertencia    = this.navParams.data.advertencia;
            }

        }
    }

    public modal_dismiss(data?: any) {
        this.viewCtrl.dismiss(data);
    }

    /*
        Funções do segment: Pagamentos
    */
    public salvar_pagamento( data: any ) {

        if( this.requisicao === 'adicionar' ){
            this.crud_associado_single( '/pagamentos/create/', data, 'Inserindo pagamento, aguarde...', 'Pagamento inserido com sucesso!', 'Não foi possivel inserir o pagamento!', 'associado', 'pagamento', data['nome_pessoa'] );
        }

        if( this.requisicao === 'editar' ){

            this.crud_associado_single( '/pagamentos/update/', data, 'Inserindo pagamento, aguarde...', 'Pagamento inserido com sucesso!', 'Não foi possivel editar o pagamento!', 'associado', 'pagamento', data['nome_pessoa'] );

        }

    }

    /*
        Funções do segment: Documentos
    */
    public salvar_documento( data: any ) {

        if( this.requisicao === 'adicionar' ){
            this.crud_associado_single( '/documentos/create/', data, 'Inserindo documento, aguarde...', 'Documento inserido com sucesso!', 'Não foi possivel inserir o documento!', 'associado', 'documento', data['nome_pessoa'] );
        }

        if( this.requisicao === 'editar' ) {
            this.crud_associado_single( '/documentos/update/', data, 'Editando documento, aguarde...', 'Documento editado com sucesso!', 'Não foi possivel editar o documento!', 'associado', 'documento', data['nome_pessoa'] );
        }

    }

    /*
        Funções do segment: Advertencias
    */
    public salvar_advertencia( data: any ) {

        if( this.requisicao === 'adicionar' ){
            this.crud_associado_single( '/advertencias/create/', data, 'Inserindo advertência, aguarde...', 'Advertência inserida com sucesso!', 'Não foi possivel inserir a advertência!', 'associado', 'advertencia', data['nome_advertido'] );
        }

        if( this.requisicao === 'editar' ) {
            this.crud_associado_single( '/advertencias/update/', data, 'Editando advertência, aguarde...', 'Advertência editada com sucesso!', 'Não foi possivel inserir a advertência!', 'associado', 'advertencia', data['nome_advertido'] );
        }

    }

    public crud_associado_single( url: string, data: any, mensagem_loader: string, mensagem_sucesso: string, mensagem_error: string, objeto: string, objeto_desc: string, objeto_nome: string, funcao_toast: any = null){

        if( this.validacao_campos(data) ){

            if( this.requisicao === 'editar' ){
                data.pago = 'true';
            }

            let usuario_atual = this.global.get('usuario_atual');
            data = this.api.formataInformacoesLog( data, usuario_atual, objeto, objeto_desc, objeto_nome );

            let loader = this.helperCtrl.mostra_loader( mensagem_loader );
            loader.present();

            this.api.postAuth(
                url,
                data,
                sucesso => {

                    loader.dismiss();

                    let toast = this.helperCtrl.mostra_toast( mensagem_sucesso, null, 3000, 'success' );
                    toast.present();

                    this.global.set( 'carregou_lista-geral', false );
                    this.global.set( 'novo_log', true );

                    this.modal_dismiss( true );

                }, error => {

                    loader.dismiss();
                    let toast = this.helperCtrl.mostra_toast( mensagem_error , null, 3000 );
                    toast.present();

            });

        }

  }

    /*
        Imagens
    */
    public console_imagem( id_input: string ){

        this.helperCtrl.console_imagem_helper( id_input, imagem => {
            if( this.requisicao_modal === 'pagamento' ) this.pagamento.img = imagem;
            if( this.requisicao_modal === 'documento' ) this.documento.img = imagem;
        });

    }

    /*
        Validações do formulário do associado
    */
    public validacao_campos( data: any ) {

        /*
        * Validação todos o segmentos
        */
        if( this.requisicao === 'editar' && this.alterarImagem && !data.img.includes('data:image') ){

            let toast = this.helperCtrl.mostra_toast('A caixa "Alterar Imagem" está marcada. Por favor, insira uma nova imagem para poder finalizar!', null, 3000 );
            toast.present();

            return false;

        }

        /*
        * Validação dos Pagamentos
        */
        if( this.requisicao_modal === 'pagamento' ){

            let pagamentos = this.global.get('informacoes-carregadas__pagamentos-id-'+this.pagamento.id_pessoa);
            let contagemPagamentos = this.global.get('informacoes-carregadas__contagem-pagamentos-id-'+this.pagamento.id_pessoa);

            // Verifica se algum dos campos está vazio
            if( data.id_pessoa === undefined || data.id_pessoa === '' ||
                data.nome_pessoa === undefined || data.nome_pessoa === '' ||
                data.valor === undefined || data.valor === '' ||
                data.mes === undefined || data.mes === '' ||
                data.ano === undefined || data.ano === '' ||
                data.data_registro === undefined || data.data_registro === '' ||
                data.data_pagamento === undefined || data.data_pagamento === '' ||
                data.tipo_pagamento === undefined || data.tipo_pagamento === ''
            ){

                let toast = this.helperCtrl.mostra_toast('Por favor, preencha todos os campos corretamente para poder finalizar!', null, 3000 );
                toast.present();

                return false;

            }

            // Verifica se o campo imagem esta vazio
            if( this.requisicao === 'adicionar' && (data.img === undefined || data.img === '') ) {
                let toast = this.helperCtrl.mostra_toast('Por favor, preencha todos os campos corretamente para poder finalizar!', null, 3000 );
                toast.present();

                return false;
            }

            // Verifica se o associado possui algum pagamento pendente
            // Verifica se já existe um pagamento referente ao mes que esta tentando ser efetuado
            let existePagamentoPendente = false;
            let jaExistePagamento = false;

            for (let i = 0; i < pagamentos.length; i++) {
                if( pagamentos[i].tipo_pagamento === data.tipo_pagamento && pagamentos[i].mes === data.mes && pagamentos[i].ano === data.ano && ( pagamentos[i].pago === 'true' || pagamentos[i].pago === true  )) {
                    jaExistePagamento = true;
                    break;
                }

                if( contagemPagamentos.pendentes !== 0 && pagamentos[i].mes !== data.mes && pagamentos[i].ano !== data.ano && (pagamentos[i].pago === 'false' || pagamentos[i].pago === false )) {
                    existePagamentoPendente = true;
                    break;
                }
            }

            if( jaExistePagamento ){

                let toast = this.helperCtrl.mostra_toast('Já existe um pagamento referente ao mês selecionado no ano atual. Por favor selecione outro mês.', null, 3000 );
                toast.present();
                return false;

            }

            if( existePagamentoPendente ) {
                let toast = this.helperCtrl.mostra_toast('Este associado possui pagamentos pendentes! Por favor regularize os meses em aberto para poder realizar novos pagamentos.', null, 3000 );
                toast.present();

                return false;
            }

            // Verifica se a requisicao é uma edicao, e se existe algum campo vazio
            // Verifica tambem se o associado possui ou nao um pagamento pendente sendo efetuado, para moficar o status do mesmo para regular
            if( this.requisicao === 'editar' ) {

                // Se é um pagamento pendente
                if(( contagemPagamentos.pendentes === 0 || contagemPagamentos.pendentes === 1) && (!this.alterarImagem || data.img === undefined || data.img === '') ) {
                    let toast = this.helperCtrl.mostra_toast('Por favor, preencha todos os campos corretamente para poder finalizar!', null, 3000 );
                    toast.present();

                    return false;
                }

                if( contagemPagamentos.pendentes === 0 || contagemPagamentos.pendentes === 1 ) {
                    data.status_para_regular = true;
                }
            }

            return true;

        }

        /*
        * Validação dos Documentos
        */
        if( this.requisicao_modal === 'documento' ){

            if( data.id_pessoa === undefined || data.id_pessoa === '' ||
                data.nome_pessoa === undefined || data.nome_pessoa === '' ||
                data.data === undefined || data.data === '' ||
                data.img === undefined || data.img === '' ||
                data.tipo_documento === undefined || data.tipo_documento === '' ||
                ( data.tipo_documento === 'outro' && data.documento_desc === '' )
            ){

                let toast = this.helperCtrl.mostra_toast('Por favor, preencha todos os campos corretamente para poder finalizar!', null, 3000 );
                toast.present();

                return false;

            }

            return true;

        }

        /*
        * Validação das Advertências
        */
        if( this.requisicao_modal === 'advertencia' ){

            if( this.requisicao === 'adicionar' ){

                if( data.advertencia === undefined || data.advertencia === '' ||
                    data.grau === undefined || data.grau === '' ||
                    data.id_autor === undefined || data.id_autor === '' ||
                    data.nome_autor === undefined || data.nome_autor === ''
                ){

                    let toast = this.helperCtrl.mostra_toast('Por favor, preencha todos os campos corretamente para poder finalizar!', null, 3000 );
                    toast.present();

                    return false;

                }

                return true;

            }

            if( this.requisicao === 'editar' ){
                if( data.advertencia === undefined || data.advertencia === '' ||
                    data.grau === undefined || data.grau === ''
                ){

                    let toast = this.helperCtrl.mostra_toast('Por favor, preencha todos os campos corretamente para poder finalizar!', null, 3000 );
                    toast.present();

                    return false;

                }

                return true;

            }


        }

        return false;

    }

}