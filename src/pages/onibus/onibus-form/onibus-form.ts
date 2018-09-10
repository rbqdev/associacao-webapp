import { Component } from '@angular/core';
import { NavController, NavParams, reorderArray } from 'ionic-angular';

import { ApiFunctions } from './../../../providers/api-functions';
import { HelperFunctions } from './../../../providers/helper-functions';
import { Global } from './../../../providers/global';

@Component({
  selector: 'page-onibus-form',
  templateUrl: 'onibus-form.html',
})
export class OnibusForm {

    title_page: string = 'Cadastrar Onibus';

    requisicao: string;
    requisicao_page: string;

    onibus: any = {
        title: '',
        status: 'onibus_ativo',
        turno: '',
        encargo: '',
        avisos: [''],
        contatos: [{ id_contato: '', contato: '' }],
        hora_saida: '',
        hora_retorno: '',
        qtd_rotas: '1',
        rota_1: {
            pontos_pocoes: [],
            pontos_conquista: []
        },
        rota_2: {
            pontos_pocoes: [],
            pontos_conquista: []
        },
        admin_id: '',
        admin_nome:''
    };

    avisos_form: any = [''];
    avisos_model: any = [''];

    contatos_form: any = [''];
    contatos_model: any = [{ id_contato: '', contato: '' }];

    pontos_pocoes_1_form: any = [''];
    pontos_pocoes_1_model: any = [{ ponto: '', bairro: '',referencia: '' }];
    pontos_pocoes_2_form: any = [''];
    pontos_pocoes_2_model: any = [{ ponto: '', bairro: '',referencia: '' }];
    pontos_conquista_1_form: any = [''];
    pontos_conquista_1_model: any = [{ ponto: '', bairro: '',referencia: '' }];
    pontos_conquista_2_form: any = [''];
    pontos_conquista_2_model: any = [{ ponto: '', bairro: '',referencia: '' }];

    hide_div_informacoes: boolean = false;
    hide_div_qtd_rotas: boolean = false;
    hide_div_rota_1: boolean = false;
    hide_div_rota_2: boolean = false;

    telMask: any;

    constructor(
        public navCtrl: NavController,
        public navParams: NavParams,
        public api: ApiFunctions,
        public helperCtrl: HelperFunctions,
        public global: Global 
    ){

        let usuario_atual = this.global.get('usuario_atual');
        this.requisicao = this.navParams.get('requisicao');
        this.telMask = ['(', /[0-9]/, /\d/, ')', ' ', /\d/, /\d/, /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/ , /\d/];
        this.onibus.admin_id = usuario_atual.id;
        this.onibus.admin_nome = usuario_atual.nome;

        if( this.requisicao === 'editar' ) {

            this.title_page = 'Editar Onibus';
            this.onibus = this.navParams.get('onibus');

            this.avisos_form = this.onibus.avisos;
                for(let i = 0; i < this.avisos_form.length; i++){
                this.avisos_model[i] = this.avisos_form[i];
            }

            this.contatos_form = this.onibus.contatos;
                for(let i = 0; i < this.contatos_form.length; i++){
                this.contatos_model[i] = this.contatos_form[i];
            }

            this.pontos_pocoes_1_form = this.onibus.rota_1.pontos_pocoes;
                for(let i = 0; i < this.pontos_pocoes_1_form.length; i++){
                this.pontos_pocoes_1_model[i] = this.pontos_pocoes_1_form[i];
            }

            this.pontos_conquista_1_form = this.onibus.rota_1.pontos_conquista;
                for(let i = 0; i < this.pontos_conquista_1_form.length; i++){
                this.pontos_conquista_1_model[i] = this.pontos_conquista_1_form[i];
            }

            this.pontos_pocoes_2_form = this.onibus.rota_2.pontos_pocoes;
                for(let i = 0; i < this.pontos_pocoes_2_form.length; i++){
                this.pontos_pocoes_2_model[i] = this.pontos_pocoes_2_form[i];
            }

            this.pontos_conquista_2_form = this.onibus.rota_2.pontos_conquista;
                for(let i = 0; i < this.pontos_conquista_2_form.length; i++){
                this.pontos_conquista_2_model[i] = this.pontos_conquista_2_form[i];
            }

        }

    }

    page_dismiss(data?: any) {
        this.navCtrl.pop();
    }

    salvar( data: any ){

        data.avisos = this.avisos_model;
        data.contatos = this.contatos_model;
        data.rota_1.pontos_pocoes = this.pontos_pocoes_1_model;
        data.rota_1.pontos_conquista =  this.pontos_conquista_1_model;
        data.rota_2.pontos_pocoes = this.pontos_pocoes_2_model;
        data.rota_2.pontos_conquista =  this.pontos_conquista_2_model;

        if( this.requisicao === 'adicionar' ) {

            this.crud_onibus( '/onibus/create/', data, 'Cadastrando onibus...', 'Onibus cadastrado com sucesso!', 'Não foi possivel realizar o cadastro.', 'onibus', 'informacoes', data['title'] );

        }

        if( this.requisicao === 'editar' ) {

            this.crud_onibus( '/onibus/update/', data, 'Editando onibus...', 'Onibus editado com sucesso!', 'Não foi possivel realizar a edição.', 'onibus', 'informacoes', data['title'] );

        }

    }

    crud_onibus( url: string, data: any, messagem_loader: string, mensagem_sucesso: string, mensagem_error: string, objeto: string, objeto_desc: string, objeto_nome: string, funcao_toast: any = null ){

        if( this.validacao_campos(data) ){

            let usuario_atual = this.global.get('usuario_atual');
            data = this.api.formataInformacoesLog( data, usuario_atual, objeto, objeto_desc, objeto_nome );

            let loader = this.helperCtrl.mostra_loader( messagem_loader );
            loader.present();

            // Insere um novo associado ao banco de dados
            this.api.postAuth(
                url,
                data,
                sucesso => {

                    loader.dismiss();
                    let toast = this.helperCtrl.mostra_toast( mensagem_sucesso, funcao_toast , 3000, 'success' );
                    toast.present();

                    this.page_dismiss( true );
                    this.global.set( 'carregou_lista-geral', false );
                    this.global.set( 'novo_log', true );

                }, error => {

                    loader.dismiss();
                    let toast = this.helperCtrl.mostra_toast( mensagem_error , funcao_toast , 3000 );
                    toast.present();

                }
            );

        }

    }

    validacao_campos( data: any ) {

        if(
            data.title === '' || data.title === undefined ||
            data.status === '' || data.status === undefined ||
            data.turno === '' || data.turno === undefined ||
            data.encargo === '' || data.encargo === undefined ||
            data.hora_saida === '' || data.hora_saida === undefined ||
            data.hora_retorno === '' || data.hora_retorno === undefined ||
            data.avisos.length === 0 || data.avisos === undefined
        ){

            let toast = this.helperCtrl.mostra_toast('Por favor, preencha todos os campos corretamente para poder finalizar!', null, 3000 );
            toast.present();

            return false;

        }

        // Contatos
        for (let index = 0; index < data.contatos.length; index++) {
            if( data.contatos[index].id_contato === '' || data.contatos[index].contato === '' ) {
                let toast = this.helperCtrl.mostra_toast('Por favor, preencha todos os campos de contato!', null, 3000 );
                toast.present();
                return false;
            }
        }

        for (let i = 0; i < data.rota_1.pontos_pocoes.length; i++) {
            if( data.rota_1.pontos_pocoes[i].ponto === '' ) {
                let toast = this.helperCtrl.mostra_toast('Existe campos de pontos vazios na rota de Poções, por favor, preencha todos os campos corretamente!', null, 3000 );
                toast.present();
                return false;
            }
        }

        for (let j = 0; j < data.rota_1.pontos_conquista.length; j++) {
            if( data.rota_1.pontos_conquista[j].ponto === '' ) {
                let toast = this.helperCtrl.mostra_toast('Existe campos de pontos vazios na rota de Vitória da Conquista, por favor, preencha todos os campos corretamente!', null, 3000 );
                toast.present();
                return false;
            }
        }

        if( this.onibus.qtd_rotas === '2' ){

            for (let i = 0; i < data.rota_2.pontos_pocoes.length; i++) {
                if( data.rota_2.pontos_pocoes[i].ponto === '' ) {
                    let toast = this.helperCtrl.mostra_toast('Existe campos de pontos vazios na rota 2 de Poções, por favor, preencha todos os campos corretamente!', null, 3000 );
                    toast.present();
                    return false;
                }
            }

            for (let j = 0; j < data.rota_2.pontos_conquista.length; j++) {
                if( data.rota_2.pontos_conquista[j].ponto === '' ) {
                    let toast = this.helperCtrl.mostra_toast('Existe campos de pontos vazios na rota 2 de Vitória da Conquista, por favor, preencha todos os campos corretamente!', null, 3000 );
                    toast.present();
                    return false;
                }
            }

        }

        // if( this.requisicao === 'adicionar' ) {

        // }

        if( this.requisicao === 'editar' ) {

            if(!data.id) {
                let toast = this.helperCtrl.mostra_toast('O identificador do onibus não foi encontrado pelo sistema, por favor entre em contato com o suporte.', null, 3000 );
                toast.present();

                return false;
            }

        }

        return true;

    }

    adicionar_campo_texto( grupo: string ) {

        switch( grupo ) {

            case 'avisos':
                if( this.avisos_form.length !== 5 && this.avisos_model.length !== 5 ){
                    this.avisos_form.push('');
                    this.avisos_model.push('');
                } else {
                    let toast = this.helperCtrl.mostra_toast('O limite máximo para campos de avisos é 5', null, 3000 );
                    toast.present();
                }
            break;
            case 'contatos':
                if( this.contatos_form.length !== 3 && this.contatos_form.length !== 3 ){
                    this.contatos_form.push('');
                    this.contatos_model.push({ id_contato: '', contato: '' });
                } else {
                    let toast = this.helperCtrl.mostra_toast('O limite máximo para campos de contato é 5', null, 3000 );
                    toast.present();
                }
            break;
            case 'pontos_pocoes_1':
                if( this.pontos_pocoes_1_form.length !== 20 && this.pontos_pocoes_1_model.length !== 20 ){
                    this.pontos_pocoes_1_form.push('');
                    this.pontos_pocoes_1_model.push({ ponto: '', bairro: '', referencia: '' });
                } else {
                    let toast = this.helperCtrl.mostra_toast('O limite máximo para campos de rota é 20', null, 3000 );
                    toast.present();
                }
            break;
            case 'pontos_conquista_1':
                if( this.pontos_conquista_1_form.length !== 20 && this.pontos_conquista_1_model.length !== 20 ){
                    this.pontos_conquista_1_form.push('');
                    this.pontos_conquista_1_model.push({ ponto: '', bairro: '', referencia: '' });
                } else {
                    let toast = this.helperCtrl.mostra_toast('O limite máximo para campos de rota é 20', null, 3000 );
                    toast.present();
                }
            break;
            case 'pontos_pocoes_2':
                if( this.pontos_pocoes_2_form.length !== 20 && this.pontos_pocoes_2_model.length !== 20 ){
                    this.pontos_pocoes_2_form.push('');
                    this.pontos_pocoes_2_model.push({ ponto: '', bairro: '', referencia: '' });
                } else {
                    let toast = this.helperCtrl.mostra_toast('O limite máximo para campos de rota é 20', null, 3000 );
                    toast.present();
                }
            break;
            case 'pontos_conquista_2':
                if( this.pontos_conquista_2_form.length !== 20 && this.pontos_conquista_2_model.length !== 20 ){
                    this.pontos_conquista_2_form.push('');
                    this.pontos_conquista_2_model.push({ ponto: '', bairro: '', referencia: '' });
                } else {
                    let toast = this.helperCtrl.mostra_toast('O limite máximo para campos de rota é 20', null, 3000 );
                    toast.present();
                }
            break;

        }

    }

    remover_campo_texto( index: any, grupo: string ) {

        let alerta = this.helperCtrl.mostra_alert( 'Deletar', 'Deseja remover este campo?', deletar => {

            switch( grupo ) {
                case 'avisos':
                    this.avisos_form.splice(index, 1);
                    this.avisos_model.splice(index, 1);
                break;
                case 'contatos':
                    if( this.contatos_form.length !== 1 && this.contatos_model.length !== 1 ){
                        this.contatos_form.splice(index, 1);
                        this.contatos_model.splice(index, 1);
                    } else {
                        let toast = this.helperCtrl.mostra_toast('É necessário existir ao menos 1 campo de contato', null, 3000 );
                        toast.present();
                    }
                break;
                case 'pontos_pocoes_1':
                    if( this.pontos_pocoes_1_form.length !== 1 && this.pontos_pocoes_1_model.length !== 1 ){
                        this.pontos_pocoes_1_form.splice(index, 1);
                        this.pontos_pocoes_1_model.splice(index, 1);
                    } else {
                        let toast = this.helperCtrl.mostra_toast('É necessário existir ao menos 1 campo de rota', null, 3000 );
                        toast.present();
                    }
                break;
                case 'pontos_conquista_1':
                    if( this.pontos_conquista_1_form.length !== 1 && this.pontos_conquista_1_model.length !== 1 ){
                        this.pontos_conquista_1_form.splice(index, 1);
                        this.pontos_conquista_1_model.splice(index, 1);
                    } else {
                        let toast = this.helperCtrl.mostra_toast('É necessário existir ao menos 1 campo de rota', null, 3000 );
                        toast.present();
                    }
                break;
                case 'pontos_pocoes_2':
                    if( this.pontos_pocoes_2_form.length !== 1 && this.pontos_pocoes_2_model.length !== 1 ){
                        this.pontos_pocoes_2_form.splice(index, 1);
                        this.pontos_pocoes_2_model.splice(index, 1);
                    } else {
                        let toast = this.helperCtrl.mostra_toast('É necessário existir ao menos 1 campo de rota.', null, 3000 );
                        toast.present();
                    }
                break;
                case 'pontos_conquista_2':
                    if( this.pontos_conquista_2_form.length !== 1 && this.pontos_conquista_2_model.length !== 1 ){
                        this.pontos_conquista_2_form.splice(index, 1);
                        this.pontos_conquista_2_model.splice(index, 1);
                    } else {
                        let toast = this.helperCtrl.mostra_toast('É necessário existir ao menos 1 campo de rota.', null, 3000 );
                        toast.present();
                    }
                break;

            }

        });
        alerta.present();

    }

    reordenarCampos( index, grupo: string ) {

        switch( grupo ) {

            case 'avisos':
                this.avisos_model = reorderArray( this.avisos_model, index );
                break;
            case 'contatos':
                this.contatos_model = reorderArray( this.contatos_model, index );
                break;
            case 'pontos_pocoes_1':
                this.pontos_pocoes_1_model = reorderArray( this.pontos_pocoes_1_model, index );
                break;
            case 'pontos_conquista_1':
                this.pontos_conquista_1_model = reorderArray( this.pontos_conquista_1_model, index );
                break;
            case 'pontos_pocoes_2':
                this.pontos_pocoes_1_model = reorderArray( this.pontos_pocoes_1_model, index );
                break;
            case 'pontos_conquista_2':
                this.pontos_conquista_1_model = reorderArray( this.pontos_conquista_1_model, index );
                break;

        }

    }

    toggleShowHideDiv( div: string ) {

        switch( div ) {
            case 'informacoes':
                this.hide_div_informacoes = ( !this.hide_div_informacoes ) ? true : false;
                break;
            case 'qtd_rotas':
                this.hide_div_qtd_rotas = ( !this.hide_div_qtd_rotas ) ? true : false;
                break;
            case 'rota_1':
                this.hide_div_rota_1 = ( !this.hide_div_rota_1 ) ? true : false;
                break;
            case 'rota_2':
                this.hide_div_rota_2 = ( !this.hide_div_rota_2 ) ? true : false;
                break;
        }

    }

    trimLastCharacter() {
        for( let i = 0; i < this.contatos_model.length; i++ ){
            if( this.contatos_model[i].contato ) {
                this.contatos_model[i].contato = this.helperCtrl.trimLastCharacter( this.contatos_model[i].contato, 15 );
            }
        }
    }

}
