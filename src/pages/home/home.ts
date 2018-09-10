
import { Component } from '@angular/core';
import { NavController, ModalController } from 'ionic-angular';
import { Global } from './../../providers/global';
import { ApiFunctions } from './../../providers/api-functions';
import { HelperFunctions } from './../../providers/helper-functions';
import { HomeModal } from './home-modal/home-modal';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  // Usuário atual do sistema
  usuario_atual: any;
  spinner: boolean = true;

  tarefas: any;
  tarefaChecked: boolean = false;

  constructor(
    public navCtrl: NavController,
    public modalCtrl: ModalController,
    public helperCtrl: HelperFunctions,
    public api: ApiFunctions,
    public global: Global ) {

      this.usuario_atual = this.global.get('usuario_atual');

  }

  ionViewWillEnter() {

      this.atualiza_lista_tarefas();

  }

  /*
  * Tarefas
  */
  atualiza_lista_tarefas( forcar_atualizar: boolean = false ){

    if( forcar_atualizar === true || typeof this.global.get('informacoes-carregadas__tarefas') === 'undefined' || this.global.get('carregou_lista-geral') === false ){

      this.spinner = false;
      this.api.getAuth('/tarefas/', result => {

          this.tarefas = this.processa_tarefas(result);

          this.global.set( 'carregou_lista-geral', true );
          this.global.set('informacoes-carregadas__tarefas', this.tarefas );
          this.spinner = true;

      }, error => {
          let toast = this.helperCtrl.mostra_toast('Não foi possivel listar as tarefas!', null, 2000 );
          toast.present();
          this.spinner = true;
      });

    } else {
        this.tarefas = this.global.get('informacoes-carregadas__tarefas');
    }

  }

  processa_tarefas( data: any ) {

    let tarefasGrupo: any = {
      abertas : [],
      fechadas : []
    };

    data.forEach(element => {
      element.id_autor = parseInt(element.id_autor);
      if( element.status === 'aberta' ) tarefasGrupo.abertas.push(element);
      if( element.status === 'fechada' ) tarefasGrupo.fechadas.push(element);
    });

    let tarefas = [];
    tarefas.push(tarefasGrupo);

    return tarefas;

  }

  nova_tarefa() {

    let modal = this.modalCtrl.create(
      HomeModal,
      {
        requisicao: 'adicionar',
        requisicao_modal: 'tarefa',
        usuario_atual: this.usuario_atual
      });
      modal.present();
      modal.onWillDismiss((data: any) => {
        if( data !== null && data !== undefined )
            this.atualiza_lista_tarefas( true );
      });

  }

  editar_tarefa( data: any ) {

    if( data.id_autor === this.usuario_atual.id ) {
      let modal = this.modalCtrl.create(
        HomeModal,
        {
          requisicao: 'editar',
          requisicao_modal: 'tarefa',
          tarefa: data
        });
        modal.present();
        modal.onWillDismiss((data: any) => {
          if( data !== null && data !== undefined )
            this.atualiza_lista_tarefas( true );

        });
    } else {
      let toast = this.helperCtrl.mostra_toast( 'Você não tem permissão para esta ação!', null, 3000 );
      toast.present();
    }

  }

  deletar_tarefa( data: any ) {

    if( data.id_autor === this.usuario_atual.id ) {

      let alerta = this.helperCtrl.mostra_alert( 'Deletar', 'Deseja deletar a tarefa?', deletar => {

          let usuario_atual = this.global.get('usuario_atual');
          data = this.api.formataInformacoesLog( data, usuario_atual, 'sistema', 'tarefa' );

          let loader = this.helperCtrl.mostra_loader( 'Deletando, aguarde...' );
          loader.present();

          this.api.postAuth(
            '/tarefas/delete/',
            data,
            sucesso => {

              loader.dismiss();
              let toast = this.helperCtrl.mostra_toast('Tarefa deletada com sucesso!', null, 2000, 'success' );
              toast.present();

							this.atualiza_lista_tarefas( true );
              this.global.set( 'novo_log', true );

            }, error => {

              loader.dismiss();
              let toast = this.helperCtrl.mostra_toast('Não foi possivel deletar a tarefa!', null, 2000 );
              toast.present();
          });

      });
      alerta.present();

    } else {
      let toast = this.helperCtrl.mostra_toast('Você não tem permissão para modificar a tarefa de outra pessoa!', null, 2000 );
      toast.present();
    }

  }

  mostra_acoes_tarefa( tarefa: any ) {

    let buttonsActions = [
        {
            text: 'Editar',
            role: 'editar',
            icon: 'create',
            cssClass: 'editar',
            handler: () => {
              this.editar_tarefa(tarefa);
            }
        },
        {
            text: 'Deletar',
            role: 'deletar',
            icon: 'trash',
            cssClass: 'deletar',
            handler: () => {
              this.deletar_tarefa(tarefa);
            }
        },
        {
            text: 'Cancelar',
            role: 'cancel',
            icon: 'close',
            cssClass: 'cancelar'
        }
    ];

    let actions = this.helperCtrl.mostra_actionsheet( 'Tarefa - Ações', buttonsActions );
    actions.present();
  }

  modifica_status_tarefa( id: any, checked: boolean ) {

    let texto = '';
    let status = '';
    let toastColor = 'success';
    let toastMessage = 'Tarefa Concluida!';

    if( checked ){
      texto = 'Conclui';
      status = 'fechada';
    } else {
      texto = 'Abri';
      status = 'aberta';
      toastColor = 'default',
      toastMessage = 'Tarefa em Aberto!'
    }

    let loader = this.helperCtrl.mostra_loader( texto+'ndo, aguarde...' );
    loader.present();

    this.api.postAuth(
      '/tarefas/status/',
      {
        'id' : id,
        'status' : status
      },
      sucesso => {

        loader.dismiss();
        let toast = this.helperCtrl.mostra_toast( toastMessage, null, 1500, toastColor );
        toast.present();

        this.atualiza_lista_tarefas( true );

      }, error => {

        loader.dismiss();
        let toast = this.helperCtrl.mostra_toast('Erro ao tentar fazer esta ação, tente mais tarde!', null, 1500 );
        toast.present();
    });

  }

}
