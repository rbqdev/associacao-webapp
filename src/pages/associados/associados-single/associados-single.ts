import { Component } from '@angular/core';
import { ModalController, NavController, NavParams } from 'ionic-angular';

// Pages
import { AssociadosModal } from './../associados-modal/associados-modal';
import { AssociadosSingleModal } from './assoc-single-modal/assoc-single-modal';

// Providers
import { ApiFunctions } from './../../../providers/api-functions';
import { HelperFunctions } from './../../../providers/helper-functions';
import { Global } from './../../../providers/global';

@Component({
  selector: 'page-associados-single',
  templateUrl: 'associados-single.html'
})
export class AssociadosSinglePage {

    private segment = 'informacoes';
    private spinner: boolean = true;

    // Segment: Informaçoes
    private associado: any;
    //   private associado_status: any;

    // private advertencia: any;
    private advertencias: any = [];

    // Segment: Pagamentos
    private pagamentos: any = [];
    private contagemPagamentos: any = {
        pagos: 0,
        pendentes: 0
    }

    // Segment: Documentos
    private documentos: any = [];

    constructor(
        public navCtrl: NavController,
        public navParams: NavParams,
        public modalCtrl: ModalController,
        public api: ApiFunctions,
        public helperCtrl: HelperFunctions,
        public global: Global
    ){

        // Segment Informacoes
        this.associado = this.navParams.data.associadoData;
        this.global.set('informacoes-carregadas__associado-id-'+this.associado.id, this.associado );
        this.global.set('carregou_lista-single', true );

        // Tratar possivel erro de cadastro de data
        if( this.associado.data_registro_assoc.length > 20 ){
            this.associado.data_registro_assoc = this.helperCtrl.parse_date_banco( this.associado.data_registro_assoc );
        }

        // Segment - Pagamentos
        this.segment = this.navParams.get('segment') || 'informacoes';

    }

    ionViewWillEnter() {

        this.atualiza_informacoes_associado();

    }

    /*
        Funções do segment: Informações
    */
    atualiza_informacoes_associado( forcar_atualizar: boolean = false ) {

        if( forcar_atualizar === true || typeof this.global.get('informacoes-carregadas__associado-id-'+this.associado.id ) === 'undefined' ||  this.global.get('carregou_lista-single') === false ){

            let cursos = this.global.get('informacoes-carregadas__cursos');
            let onibus = this.global.get('informacoes-carregadas__onibus');

            this.spinner = false;
            this.api.getAuth('/associado/' + this.associado.id,
                result => {

                this.associado = this.helperCtrl.processa_size_fotos( result, false );

                for( let r = 0; r < onibus.length; r++ ){
                    if( parseInt(this.associado.onibus_id) === parseInt(onibus[r].id)  ){
                        this.associado.onibus_title = onibus[r].title +' - '+ onibus[r].turno;
                    }
                }

                for( let j = 0; j < cursos.length; j++ ){
                    if( parseInt(this.associado.curso_id) === parseInt(cursos[j].id) ){
                        this.associado.curso_slug = cursos[j].slug;
                    }
                }

                this.global.set( 'carregou_lista-single', true );
                this.global.set('informacoes-carregadas__associado-id-'+this.associado.id, this.associado );

                this.spinner = true;

                }, error => {

                    let toast = this.helperCtrl.mostra_toast('Não foi possivel buscar informações do associado!', null, 2000 );
                    toast.present();
                    this.spinner = true;
                }
            );

        } else {

            this.global.get('informacoes-carregadas__associado-id-'+this.associado.id, associado => {
                this.associado = associado;
            });

        }

    }

    modal_editar_associado( data: any ) {

        let modal = this.modalCtrl.create( AssociadosModal, {
            requisicao : 'editar',
            associado : data
        });
        modal.present();
        modal.onWillDismiss((data: any) => {
            if( data === true || data !== null && data !== undefined )
                this.atualiza_informacoes_associado( true );

        });

    }

    ultiliza_servico( dia: any ) {

        if( dia ) {
            return 'true';
        } else {
            return 'false';
        }

    }

    /*
        Funções do segment: Advertencias
    */
    atualiza_lista_advertencias( forcar_atualizar: boolean = false ){

        if( forcar_atualizar === true || typeof this.global.get('informacoes-carregadas__advertencias-id-'+this.associado.id ) === 'undefined' ||  this.global.get('carregou_lista-single') === false ){

            this.spinner = false;
            this.api.getAuth('/advertencias/'+ this.associado.id, result => {

                this.advertencias = result;
                this.global.set('carregou_lista-single', true );
                this.global.set('informacoes-carregadas__advertencias-id-'+this.associado.id, this.advertencias );

                this.spinner = true;

            }, error => {
                let toast = this.helperCtrl.mostra_toast('Não foi possivel listar as advertencias!', null, 2000 );
                toast.present();
                this.spinner = true;
            });

        } else {

            this.advertencias = this.global.get('informacoes-carregadas__advertencias-id-'+this.associado.id);

        }

    }

    modal_nova_advertencia( id_pessoa: any, nome_pessoa: string ){

        let modal = this.modalCtrl.create(
        AssociadosSingleModal,
        {
            requisicao: 'adicionar',
            requisicao_modal: 'advertencia',
            id: id_pessoa,
            nome: nome_pessoa,
            usuario_atual: this.global.get('usuario_atual')
        });
        modal.present();
        modal.onWillDismiss((data: any) => {
            if( data === true || data !== null && data !== undefined )
                this.atualiza_lista_advertencias( true );
        });

    }

    modal_editar_advertencia( data: any ) {

        let modal = this.modalCtrl.create( AssociadosSingleModal, {
            requisicao: 'editar',
            requisicao_modal: 'advertencia',
            advertencia: data
        });
        modal.present();
        modal.onWillDismiss((data: any) => {
        if( data === true || data !== null && data !== undefined )
            this.atualiza_lista_advertencias( true );
        });

    }

    deletar_advertencia( id: any ) {

        let alerta = this.helperCtrl.mostra_alert( 'Deletar', 'Deseja deletar a advertência?', deletar => {

            let loader = this.helperCtrl.mostra_loader( 'Deletando, aguarde...' );
            loader.present();

            this.api.postAuth(
                '/advertencias/delete/',
                {
                    'id' : id
                },
                sucesso => {

                    loader.dismiss();
                    let toast = this.helperCtrl.mostra_toast('Advertência deletada com sucesso!', null, 2000, 'success' );
                    toast.present();

                    this.atualiza_lista_advertencias( true );

                }, error => {

                    loader.dismiss();
                    let toast = this.helperCtrl.mostra_toast('Não foi possivel deletar a advertência!', null, 2000 );
                    toast.present();
            });

        });

        alerta.present();

    }

    /*
        Funções do segment: Pagamentos
    */
    atualiza_lista_pagamentos( forcar_atualizar: boolean = false ) {

        if( forcar_atualizar === true || typeof this.global.get('informacoes-carregadas__pagamentos-id-'+this.associado.id) === 'undefined' ||  this.global.get('carregou_lista-single') === false ){

            this.spinner = false;

            this.api.getAuth('/pagamentos/'+ this.associado.id, result => {

                this.pagamentos = this.processa_imagens( result );
                this.contagemPagamentos = this.contagem_pagamentos( result );
                this.global.set('carregou_lista-single', true );
                this.global.set('informacoes-carregadas__pagamentos-id-'+this.associado.id, this.pagamentos );
                this.global.set('informacoes-carregadas__contagem-pagamentos-id-'+this.associado.id, this.contagemPagamentos );
                this.spinner = true;

            }, error => {
                let toast = this.helperCtrl.mostra_toast('Não foi possivel listar os pagamentos!', null, 2000 );
                toast.present();
                this.spinner = true;
            });

        } else {

            this.global.get('informacoes-carregadas__pagamentos-id-'+this.associado.id, pagamentos => {
                this.pagamentos = pagamentos;
                this.contagemPagamentos = this.global.get('informacoes-carregadas__contagem-pagamentos-id-'+this.associado.id);
            });

        }

    }

    public contagem_pagamentos( data: any ){
        let contagem = {
            pagos     : 0,
            pendentes : 0,
        };
        data.forEach( element => {
            switch (element.pago){
                case 'true':
                    contagem.pagos++;
                break;
                case 'false':
                    contagem.pendentes++;
                break;
            }
        });
        return contagem;
    }

    modal_adicionar_pagamento( id_pessoa: any, nome_pessoa: string, mes: string = null, id?: any ){

        let usuario_atual = this.global.get('usuario_atual');
        if( this.associado.id !== usuario_atual.id ){
            if( this.associado.status !== 'isento' && this.associado.status !== 'afastado' && this.associado.status !== 'desassociado' ){
                let modal = this.modalCtrl.create( AssociadosSingleModal, {
                    requisicao: 'adicionar',
                    requisicao_modal: 'pagamento',
                    id_pessoa: id_pessoa,
                    nome_pessoa: nome_pessoa
                });
                modal.present();
                modal.onWillDismiss((data: any) => {
                    if( data === true || data !== null && data !== undefined )
                        this.atualiza_lista_pagamentos( true );
                });
            } else {

                let toast = this.helperCtrl.mostra_toast('Não é necessário atribuir pagamentos para um associado ' + this.associado.status, null, 2000 );
                toast.present();

            }

        } else {
            let toast = this.helperCtrl.mostra_toast('Ops! Você não pode adicionar seus proprios pagamentos.', null, 2000 );
            toast.present();
        }


    }

    modal_editar_pagamento( data: any ){

        let usuario_atual = this.global.get('usuario_atual');
        if( this.associado.id !== usuario_atual.id ){
            if( this.associado.status !== 'isento' && this.associado.status !== 'afastado' && this.associado.status !== 'desassociado' ){
                let modal = this.modalCtrl.create( AssociadosSingleModal, {
                    requisicao: 'editar',
                    requisicao_modal: 'pagamento',
                    pagamento: data
                });
                modal.present();
                modal.onWillDismiss((data: any) => {
                    if( data === true || data !== null && data !== undefined ) {
                        this.atualiza_lista_pagamentos( true );

                        if( !this.global.get('carregou_lista-geral') ) {
                            this.atualiza_informacoes_associado( true );
                        }
                    }
                });
            } else {
                let toast = this.helperCtrl.mostra_toast('Não é necessário atribuir pagamentos para um associado ' + this.associado.status, null, 2000 );
                toast.present();
            }
        } else {
            let toast = this.helperCtrl.mostra_toast('Ops! Você não pode editar seus proprios documentos.', null, 2000 );
            toast.present();
        }

    }

    deletar_pagamento( id: any ) {

        let usuario_atual = this.global.get('usuario_atual');

        if( this.associado.id !== usuario_atual.id ){

            let alerta = this.helperCtrl.mostra_alert( 'Deletar', 'Deseja deletar o pagamento?', deletar => {

                let loader = this.helperCtrl.mostra_loader( 'Deletando, aguarde...' );
                loader.present();

                this.api.postAuth(
                    '/pagamentos/delete/',
                    {
                        'id' : id
                    },
                    sucesso => {

                        loader.dismiss();
                        let toast = this.helperCtrl.mostra_toast('Pagamento deletado com sucesso!', null, 2000, 'success' );
                        toast.present();

                        this.atualiza_lista_pagamentos( true );

                    }, error => {

                        loader.dismiss();
                        let toast = this.helperCtrl.mostra_toast('Não foi possivel deletar o pagamento!', null, 2000 );
                        toast.present();
                });

            });

            alerta.present();

        } else {

            let toast = this.helperCtrl.mostra_toast('Ops! Você não pode deletar seus proprios documentos.', null, 2000 );
            toast.present();

        }

    }

    ver_comprovante_pagamento( url_comprovante: any ) {
        let modal = this.modalCtrl.create( AssociadosSingleModal, { requisicao_modal: 'comprovante_pagamento', imagem: url_comprovante } );
        modal.present();
    }


    /*
        Funções do segment: Documentos
    */
    atualiza_lista_documentos( forcar_atualizar: boolean = false ) {

        if( forcar_atualizar === true || typeof this.global.get('informacoes-carregadas__documentos-id-'+this.associado.id) === 'undefined' ||  this.global.get('carregou_lista-single') === false ){

            this.spinner = false;
            this.api.getAuth('/documentos/'+ this.associado.id, result => {

                this.documentos = this.processa_imagens(result);
                this.spinner = true;

                this.global.set('carregou_lista-single', true );
                this.global.set('informacoes-carregadas__documentos-id-'+this.associado.id, this.documentos );

            }, error => {
                let toast = this.helperCtrl.mostra_toast('Não foi possivel listar os documentos do associado!', null, 2000 );
                toast.present();

                this.spinner = true;
            });

        } else {

            this.documentos = this.global.get('informacoes-carregadas__documentos-id-'+this.associado.id);

        }

    }

    modal_adicionar_documento( id_pessoa: any, nome_pessoa: string ){

        let usuario_atual = this.global.get('usuario_atual');

        if( this.associado.id !== usuario_atual.id ){

            // Mostra Modal
            let modal = this.modalCtrl.create( AssociadosSingleModal, {
                requisicao: 'adicionar',
                requisicao_modal: 'documento',
                id_pessoa: id_pessoa,
                nome_pessoa: nome_pessoa
            });
            modal.present();
            modal.onWillDismiss((data: any) => {
                if( data === true || data !== null && data !== undefined )
                    this.atualiza_lista_documentos( true );
            });

        } else {

            let toast = this.helperCtrl.mostra_toast('Ops! Você não pode adicionar seus proprios documentos.', null, 2000 );
            toast.present();

        }

  }

    modal_editar_documento( data: any ){

        let usuario_atual = this.global.get('usuario_atual');

        if( this.associado.id !== usuario_atual.id ){

            // Mostra Modal
            let modal = this.modalCtrl.create( AssociadosSingleModal, {
                requisicao: 'editar',
                requisicao_modal: 'documento',
                documento: data
            });
            modal.present();
            modal.onWillDismiss((data: any) => {
                if( data === true || data !== null && data !== undefined )
                    this.atualiza_lista_documentos( true );
            });

        } else {

            let toast = this.helperCtrl.mostra_toast('Ops! Você não pode editar seus proprios documentos.', null, 2000 );
            toast.present();

        }

    }

    deletar_documento( id: any ) {

        let usuario_atual = this.global.get('usuario_atual');

        if( this.associado.id !== usuario_atual.id ){

            let alerta = this.helperCtrl.mostra_alert( 'Deletar', 'Deseja deletar o documento?', deletar => {

                let loader = this.helperCtrl.mostra_loader( 'Deletando, aguarde...' );
                loader.present();

                this.api.postAuth(
                    '/documentos/delete/',
                    {
                        'id' : id
                    },
                    sucesso => {

                        loader.dismiss();
                        let toast = this.helperCtrl.mostra_toast('Documento deletado com sucesso!', null, 2000, 'success' );
                        toast.present();

                        this.atualiza_lista_documentos( true );

                    }, error => {

                        loader.dismiss();
                        let toast = this.helperCtrl.mostra_toast('Não foi possivel deletar o documento!', null, 2000 );
                        toast.present();
                });

            });

            alerta.present();

        } else {

            let toast = this.helperCtrl.mostra_toast('Ops! Você não pode deletar seus proprios documentos.', null, 2000 );
            toast.present();

        }

    }

    ver_comprovante_documento( url_imagem: string ) {
        let modal = this.modalCtrl.create( AssociadosSingleModal, { requisicao_modal: 'comprovante_documento', imagem: url_imagem } );
        modal.present();
    }


    /*
        Processamento de Imagens
    */
    processa_imagens( data: any ){

        let imagens = data;

        imagens.forEach( element => {

            element.img_thumb = this.helperCtrl.parse_thumb_imagem( element.img, 'thumb' );
            element.img_media = this.helperCtrl.parse_thumb_imagem( element.img );

        });

        return data;

    }

}
