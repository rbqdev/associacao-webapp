import { Component } from '@angular/core';
import { NavController, NavParams, ViewController, reorderArray } from 'ionic-angular';

import { ApiFunctions } from './../../../providers/api-functions';
import { HelperFunctions } from './../../../providers/helper-functions';
import { Global } from './../../../providers/global';

@Component({
  selector: 'page-onibus-modal',
  templateUrl: 'onibus-modal.html',
})
export class OnibusModal {

    title_page: string = 'Informações Gerais';
    requisicao: string = '';
    requisicao_modal: string = '';

    // Informações Gerais
    informacoes: any = [''];
    form_items: any = [''];
    model_items: any = [''];

    constructor(
      public navCtrl: NavController,
      public navParams: NavParams,
      public viewCtrl: ViewController,
      public api: ApiFunctions,
      public helperCtrl: HelperFunctions,
      public global: Global ) {

        this.requisicao = this.navParams.get('requisicao');
        this.requisicao_modal = this.navParams.get('requisicao_modal');

        if( this.requisicao === 'editar' ) {

            if( this.requisicao_modal === 'onibus_info_geral' ){

                this.title_page = 'Informações Gerais dos Onibus';

                if( this.navParams.get('informacoes').informacoes !== undefined ){

                    this.informacoes = this.navParams.get('informacoes').informacoes;

                    if( this.informacoes.length !== 0 && this.informacoes.length !== undefined ) {
                        this.form_items = this.informacoes;
                        for(let i = 0; i < this.form_items.length; i++){
                            this.model_items[i] = this.form_items[i];
                        }
                    }

                }

            }

        }

    }

    modal_dismiss(data?: any) {
        this.viewCtrl.dismiss(data);
    }

    salvar( data: any ){

        if( this.requisicao_modal === 'onibus_info_geral' ) {
            this.informacoes.informacoes = data;
            this.editar_informacoes_gerais( this.informacoes );
        }

    }

    /* Informações Gerais */
    // -------------------------------

    adicionar_campo() {
        this.form_items.push('');
        this.model_items.push('');
    }

    remover_campo( index: any ) {
        if( this.form_items.length > 1 && this.model_items.length > 1 ){
            let alerta = this.helperCtrl.mostra_alert( 'Deletar', 'Deseja remover este campo?', deletar => {
                this.form_items.splice(index, 1);
                this.model_items.splice(index, 1);
            });
            alerta.present();
        } else {
            let toast = this.helperCtrl.mostra_toast('Não é possivel remover todos os campos!', null, 3000 );
            toast.present();
        }
    }

    reordenarCampo( index ) {
        this.model_items = reorderArray(this.model_items, index);
    }

    editar_informacoes_gerais( data: any ) {

        let body = {
            informacoes : data.informacoes,
            objeto      : 'geral'
        }
        if( this.navParams.get('informacoes').informacoes !== undefined ) {
            body['id'] = this.navParams.get('informacoes').id;
        }

        let usuario_atual = this.global.get('usuario_atual');
        body = this.api.formataInformacoesLog( body, usuario_atual, 'onibus', 'informacoes-gerais' );

        let loader = this.helperCtrl.mostra_loader( 'Editando, aguarde...' );
        loader.present();

        //Insere um novo motorista ao banco de dados
        this.api.postAuth(
            '/onibus/set-info-geral/',
            body,
            sucesso => {

                loader.dismiss();

                let toast = this.helperCtrl.mostra_toast('Editado com sucesso!', null, 3000, 'success' );
                toast.present();

                this.global.set( 'carregou_lista-geral', false );
                this.modal_dismiss( true );

            }, error => {

                loader.dismiss();

                let toast = this.helperCtrl.mostra_toast('Algo deu errado, tente novamente.', null, 2000 );
                toast.present();

            }
        );

    }

}
