import { Component } from '@angular/core';
import { NavController, NavParams, ViewController } from 'ionic-angular';

import { HelperFunctions } from './../../../providers/helper-functions';
import { ApiFunctions } from './../../../providers/api-functions';
import { Global } from './../../../providers/global';


@Component({
  selector: 'page-modals',
  templateUrl: 'home-modal.html',
})
export class HomeModal {

  requisicao: string = 'adicionar';
  requisicao_modal: string;
  title_modal: string = 'Adicionar';

  // Homepage - Tarefas
  tarefa: any = {
    tarefa       : '',
    prioridade   : 'baixa',
    id_autor     : '',
    nome_autor   : ''
  }

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public viewCtrl: ViewController,
    public api: ApiFunctions,
    public helperCtrl: HelperFunctions,
    public global: Global ) {

      this.requisicao = this.navParams.data.requisicao;
      this.requisicao_modal = this.navParams.data.requisicao_modal;

      if( this.requisicao_modal === 'tarefa' ){
        if( this.requisicao === 'adicionar' ){
          this.title_modal = 'Adicionar Tarefa';
        }
        if( this.requisicao === 'editar' ){
          this.title_modal = 'Editar Tarefa';
          this.tarefa = this.navParams.data.tarefa;
        }
      }

  }

  modal_dismiss(data?: any) {
    this.viewCtrl.dismiss(data);
  }

  salvar( data: any ) {

    if( this.requisicao_modal === 'tarefa' ){

      if( this.validacao_campos( data ) ) {
        if( this.requisicao === 'adicionar' )
          this.crud_tarefas( '/tarefas/create/', data, 'Inserindo a tarefa, aguarde...', 'Tarefa inserida com sucesso', 'Não foi possivel inserir a tarefa' );
          // this.inserir_tarefa( data );
        if( this.requisicao === 'editar' )
          this.crud_tarefas( '/tarefas/update/', data, 'Editando a tarefa, aguarde...', 'Tarefa editada com sucesso', 'Não foi possivel editar a tarefa' );
          // this.editar_tarefa( data );
      }

    }

  }

  public crud_tarefas( url: string, data: any, mensagem_loader: string, mensagem_sucesso: string, mensagem_error: string, funcao_toast: any = null ){

    if( this.validacao_campos(data) ){

      // Log
      let usuario_atual = this.global.get('usuario_atual');
      data = this.api.formataInformacoesLog( data, usuario_atual, 'sistema', 'tarefa' );

      let loader = this.helperCtrl.mostra_loader( mensagem_loader );
      loader.present();

      this.api.postAuth(
        url,
        data,
        sucesso => {

            loader.dismiss();
            let toast = this.helperCtrl.mostra_toast( mensagem_sucesso, null, 3000, 'success' );
            toast.present();

            this.modal_dismiss( true );
            this.global.set( 'novo_log', true );

        }, error => {
            loader.dismiss();
            let toast = this.helperCtrl.mostra_toast( mensagem_error , null, 3000 );
            toast.present();
      });

    }

  }

  validacao_campos( data: any ) {

    // Validacao para campos vazios
    if( data.tarefa === undefined || data.tarefa === '' ||
        data.prioridade === undefined || data.prioridade === ''
    ){

      let toast = this.helperCtrl.mostra_toast('Por favor, preencha todos os campos corretamente para poder finalizar!', null, 3000 );
      toast.present();

      return false;

    }

    return true;

  }

}
