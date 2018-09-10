import { Component } from '@angular/core';
import { ModalController, NavController, NavParams } from 'ionic-angular';
import { MotoristasModal } from './../motoristas-modal/motoristas-modal';
import { ApiFunctions } from './../../../providers/api-functions';
import { HelperFunctions } from './../../../providers/helper-functions';
import { Global } from './../../../providers/global';

@Component({
  selector: 'page-motoristas-single',
  templateUrl: 'motoristas-single.html',
})
export class MotoristasSinglePage {

  segment = 'informacoes';
  imagem: string;
  spinner: boolean = true;
  spinner_advertencias: boolean = true;

  // Segment: Informaçoes
  motorista: any;

  advertencias: any = [];
  
  // Segment: Documentos
  documentos: any = [];

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    public modalCtrl: ModalController,
    public api: ApiFunctions,
    public helperCtrl: HelperFunctions,
    public global: Global ) {

      this.motorista = this.navParams.data.motorista;

  }

  ionViewWillEnter() {
    this.atualiza_lista_advertencias();
  }

  /* 
    Metodos do segment: Informações
  */
  atualiza_informacoes_motorista( forcar_atualizar: boolean = false ) {
    
      if( forcar_atualizar === true || typeof this.global.get('informacoes-carregadas__motorista-info') === 'undefined' ||  this.global.get('carregou') === false ){
        
        this.spinner = false;
        this.api.getAuth('/motoristas/' + this.motorista.id, 
          result => {

            result = this.helperCtrl.processa_size_fotos( result, false );
            this.motorista = result;
            this.spinner = true;

            this.global.set('carregou', true );
            this.global.set('informacoes-carregadas__motorista-info', this.motorista );

          }, error => {

            let toast = this.helperCtrl.mostra_toast('Não foi possivel buscar informações do motorista!', null, 2000 );
            toast.present();
            this.spinner = true; 
            
        });

      } else {

        this.motorista = this.global.get('informacoes-carregadas__motorista-info');
        
      }

  }

  modal_editar_motorista( data: any, cursos: any ) {
    let modal = this.modalCtrl.create( MotoristasModal, { 
      requisicao : 'editar',
      requisicao_modal: 'motorista', 
      motorista : data, 
    });
    modal.present();
    modal.onWillDismiss((data: any) => {
      if( data ){
          this.atualiza_informacoes_motorista( true );
      } 
    });
  }

  atualiza_lista_advertencias( forcar_atualizar: boolean = false ) {

      if( forcar_atualizar === true || typeof this.global.get('informacoes-carregadas__advertencias-motorista') === 'undefined' ||  this.global.get('carregou_lista-single') === false ){

        this.spinner_advertencias = false;
        this.api.getAuth('/advertencias/'+ this.motorista.id, result => {    

            this.advertencias = result;
            this.spinner_advertencias = true;

            this.global.set('carregou_lista-single', true );
            this.global.set('informacoes-carregadas__advertencias-motorista', this.advertencias );

        }, error => {
            let toast = this.helperCtrl.mostra_toast('Não foi possivel listar as advertencias!', null, 2000 );
            toast.present();
            this.spinner_advertencias = true;
        });
        
      } else {

        this.advertencias = this.global.get('informacoes-carregadas__advertencias-motorista');

      }

  }

  modal_adicionar_advertencia( id_pessoa: any, nome_pessoa: string ){
    
    let usuario_atual = this.global.get('usuario_atual');

    if( this.motorista.id !== usuario_atual.id ){

        let modal = this.modalCtrl.create( 
          MotoristasModal, 
          { 
            requisicao: 'adicionar', 
            requisicao_modal: 'advertencia',
            id: id_pessoa, 
            nome: nome_pessoa, 
            usuario_atual: usuario_atual
          });
          modal.present();
          modal.onWillDismiss((data: any) => {
            if( data === true || data !== null && data !== undefined )
                this.atualiza_lista_advertencias( true );
          });

    } else {

      let toast = this.helperCtrl.mostra_toast('Ops! Você não pode adicionar suas proprias advertências.', null, 2000 );
      toast.present();

    }

  }

  modal_editar_advertencia( data: any, id_pessoa: any, nome_pessoa: string ) {

    let usuario_atual = this.global.get('usuario_atual');

    if( this.motorista.id !== usuario_atual.id ){

      let modal = this.modalCtrl.create( 
        MotoristasModal, 
        { 
          requisicao: 'editar',
          requisicao_modal: 'advertencia',
          advertencia: data,
          id: id_pessoa, 
          nome: nome_pessoa,
          usuario_atual: usuario_atual
        });
        modal.present();
        modal.onWillDismiss((data: any) => {
          if( data === true || data !== null && data !== undefined )
            this.atualiza_lista_advertencias( true );
        });

    } else {

      let toast = this.helperCtrl.mostra_toast('Ops! Você não pode editar suas proprias advertências.', null, 2000 );
      toast.present();

    }

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
            this.global.set( 'novo_log', true );            

          }, error => {

            loader.dismiss();
            let toast = this.helperCtrl.mostra_toast('Não foi possivel deletar a advertência!', null, 2000 );
            toast.present();
        });
        
    });

    alerta.present();

  }

  /* 
    Funções do segment: Documentos
  */
  atualiza_lista_documentos( forcar_atualizar: boolean = false ) {
    
    if( forcar_atualizar === true || typeof this.global.get('informacoes-carregadas__documentos-id-'+this.motorista.id) === 'undefined' ||  this.global.get('carregou_lista-single') === false ){
      
      this.spinner = false;
      this.api.getAuth('/documentos/'+ this.motorista.id, result => {    
          
          this.documentos = this.processa_imagens(result);
          this.spinner = true;

          this.global.set('carregou_lista-single', true );
          this.global.set('informacoes-carregadas__documentos-id-'+this.motorista.id, this.documentos );

      }, error => {
          let toast = this.helperCtrl.mostra_toast('Não foi possivel listar os documentos do motorista!', null, 2000 );
          toast.present();

          this.spinner = true;
      });

    } else {

      this.documentos = this.global.get('informacoes-carregadas__documentos-id-'+this.motorista.id);

    }

  }

  // processa_imagens_documentos( data: any ){

  //     data.forEach( documento => {
  //         documento.img_thumb = this.helperCtrl.parse_thumb_imagem( documento.img, 'thumb' );
  //         documento.img_media = this.helperCtrl.parse_thumb_imagem( documento.img );
  //     });
      
  // }

  modal_adicionar_documento( id_pessoa: any, nome_pessoa: string ){
    
    let usuario_atual = this.global.get('usuario_atual');

    if( this.motorista.id !== usuario_atual.id ){

      // Mostra Modal
      let modal = this.modalCtrl.create( 
        MotoristasModal, 
        { 
          requisicao: 'adicionar',
          requisicao_modal: 'documento',
          id_pessoa: id_pessoa, 
          nome_pessoa: nome_pessoa
        });
      modal.present();
      
      // Executa essa funçao de o objeto DATA for passado ao fechar o modal
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

    if( this.motorista.id !== usuario_atual.id ){

      // Mostra Modal
      let modal = this.modalCtrl.create( 
        MotoristasModal, 
        { 
          requisicao: 'editar',
          requisicao_modal: 'documento',
          documento: data
        });
      modal.present();
      
      // Executa essa funçao de o objeto DATA for passado ao fechar o modal
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
            this.global.set( 'novo_log', true );            

          }, error => {

            loader.dismiss();
            let toast = this.helperCtrl.mostra_toast('Não foi possivel deletar o documento!', null, 2000 );
            toast.present();
        });
        
    });

    alerta.present();

  }

  ver_comprovante_documento( url_imagem: string ) {
    let modal = this.modalCtrl.create( MotoristasModal, { requisicao_modal: 'comprovante_documento', imagem: url_imagem } );
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
