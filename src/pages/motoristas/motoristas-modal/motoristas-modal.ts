import { Component } from '@angular/core';
import { NavController, NavParams, ViewController } from 'ionic-angular';

import { ApiFunctions } from './../../../providers/api-functions';
import { HelperFunctions } from './../../../providers/helper-functions';
import { Global } from './../../../providers/global';

@Component({
  selector: 'page-motoristas-modal',
  templateUrl: 'motoristas-modal.html',
})
export class MotoristasModal {

  // Geral
  private title_page: string = 'Novo Motorista';
  private requisicao: string = 'adicionar';
  private requisicao_modal: string = 'motorista';
  private campo_desabilitado: boolean = false;
  private url_imagem: string;

  // Segment Informacoes
  private motorista: any = {
    id                  : '',
    nome                : '',
    rg                  : '',
    cpf                 : '',
    contato_1           : '',
    contato_2           : '',
    inst_1              : '',  
    turno_1             : '',
    inst_2              : '',
    turno_2             : '',
    qtdTurnos           : '1',  
    status              : 'ativo',
    tipo                : '',
    foto                : '',
    data_registro_assoc : '',
    data_registro_sis   : ''
  };

  private alterarFoto: boolean = false;

  // Segment: Documentos
  private documento: any = {
    id              : '',
    id_pessoa       : '',
    nome_pessoa     : '',
    data            : '',
    img             : '',
    tipo_documento  : '',
    documento_desc  : '',
    pasta           : '/motorista'
  };

  private alterarImagem: boolean = false;

  // Segment: Advertências
  private advertencia: any = {
    id              : '',
    id_advertido    : '', //Id do advertido
    nome_advertido  : '',
    id_autor        : '',
    nome_autor      : '',
    advertencia     : '',
    grau            : 'baixo'
  };

  // Masks INputs
  private cpfMask: any;
  private telMask: any;

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    public viewCtrl: ViewController,
    public api: ApiFunctions,
    public helperCtrl: HelperFunctions,
    public global: Global ) {

      this.requisicao = this.navParams.get('requisicao');
      this.requisicao_modal = this.navParams.get('requisicao_modal');

      this.cpfMask = [/[0-9]/, /\d/, /\d/, '.', /\d/, /\d/, /\d/, '.', /\d/, /\d/, /\d/, '-', /[0-9]/, /[0-9]/];
      this.telMask = ['(', /[0-9]/, /\d/, ')', ' ', /\d/, /\d/, /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/ , /\d/];

      if( this.requisicao_modal === 'motorista' ){

        if( this.requisicao === 'adicionar' ){
          this.motorista.data_registro_assoc = this.motorista.data_registro_sis = this.helperCtrl.get_dia_atual( true );
        }

        if( this.requisicao === 'editar' ){
          this.motorista = this.navParams.get('motorista');
          this.motorista.data_registro_assoc = this.helperCtrl.parse_date_app(this.motorista.data_registro_assoc);
          this.motorista.data_registro_sis = this.helperCtrl.parse_date_app(this.motorista.data_registro_sis);
        }

         this.campo_desabilitado = true;

      } else if( this.requisicao_modal === 'documento' ){

        if( this.requisicao === 'adicionar' ){
          this.title_page = 'Novo Documento';
          this.documento.id_pessoa     = this.navParams.data.id_pessoa;
          this.documento.nome_pessoa   = this.navParams.data.nome_pessoa;
        }

        if( this.requisicao === 'editar' ){
          this.title_page = 'Editar Documento';
          this.documento = this.navParams.data.documento;
        }

        let data_atual = this.helperCtrl.get_data_atual();
        this.documento.data = data_atual.timestamp;

      } else if ( this.requisicao_modal === 'comprovante_documento' ){
        
        this.title_page = 'Comprovante de Documento';
        this.url_imagem = this.navParams.get('imagem');

      } else if ( this.requisicao_modal === 'advertencia' ) {

        if( this.requisicao === 'adicionar' ){
          this.title_page = 'Nova Advertência';          
        }
        if( this.requisicao === 'editar' ){
          this.title_page = 'Editar Advertência';
          this.advertencia = this.navParams.data.advertencia;
        }

        this.advertencia.id_advertido = this.navParams.data.id;
        this.advertencia.nome_advertido = this.navParams.data.nome;
        this.advertencia.id_autor = this.navParams.data.usuario_atual.id;
        this.advertencia.nome_autor = this.navParams.data.usuario_atual.nome;

      }

  }

  public modal_dismiss(data?: any) {
    this.viewCtrl.dismiss(data);
  }

  public salvar( data: any ) {

    if( this.requisicao === 'adicionar' ){

      switch ( this.requisicao_modal ) {
        case 'motorista':
          this.crud_associado_single( '/motoristas/create/', data, 'Cadastrando motorista, aguarde...', 'Motorista cadastrado com sucesso!', 'Não foi possivel cadastrar o motorista!', 'motorista', 'informacoes', data['nome'] );
          break;
        case 'documento':
          this.crud_associado_single( '/documentos/create/', data, 'Inserindo documento, aguarde...', 'Documento inserido com sucesso!', 'Não foi possivel inserir o documento!', 'motorista', 'documento', data['nome_pessoa'] );
          break;
        case 'advertencia':
          this.crud_associado_single( '/advertencias/create/', data, 'Inserindo advertência, aguarde...', 'Advertência inserida com sucesso!', 'Não foi possivel inserir a advertência!', 'motorista', 'advertencia', data['nome_advertido'] );
          break;
        
      }

    }

    if( this.requisicao === 'editar' ){

      switch ( this.requisicao_modal ) {
        case 'motorista':
          this.crud_associado_single( '/motoristas/update/', data, 'Editando informações do motorista, aguarde...', 'Informações editadas com sucesso!', 'Não foi possivel editar as informações!', 'motorista', 'informacoes', data['nome'] );
          break;
        case 'documento':
          this.crud_associado_single( '/documentos/update/', data, 'Editando documento, aguarde...', 'Documento editado com sucesso!', 'Não foi possivel editar o documento!', 'motorista', 'documento', data['nome_pessoa'] );
          break;
        case 'advertencia':
          this.crud_associado_single( '/advertencias/update/', data, 'Editando advertência, aguarde...', 'Advertência editada com sucesso!', 'Não foi possivel inserir a advertência!', 'motorista', 'advertencia', data['nome_advertido'] );
          break;
        
      }
      
    }
    
  }

  public crud_associado_single( url: string, data: any, mensagem_loader: string, mensagem_sucesso: string, mensagem_error: string, objeto: string, objeto_desc: string, objeto_nome: string, funcao_toast: any = null ){
    
    if( this.validacao_campos(data) ){

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
  
            this.modal_dismiss( true );
            this.global.set( 'carregou_lista-geral', false );
            this.global.set( 'novo_log', true );
  
        }, error => {
            loader.dismiss();
            let toast = this.helperCtrl.mostra_toast( mensagem_error , null, 3000 );
            toast.present();
      });

    }
  
  }

  public console_imagem( id_input: string ){

    this.helperCtrl.console_imagem_helper( id_input, imagem => {
        if( this.requisicao_modal === 'motorista' ) this.motorista.foto = imagem ;
        if( this.requisicao_modal === 'documento' ) this.documento.img = imagem;
    });

  }

  public validacao_campos( data: any ) {

    /*
    * Validação todos o segmentos
    */
    if( this.requisicao === 'editar' && this.alterarImagem && !data.img.includes('data:image') ){
      
      let toast = this.helperCtrl.mostra_toast('A caixa "Alterar Imagem" está marcada. Por favor, insira uma nova imagem para poder finalizar!', null, 3000 );
      toast.present();

      return false;

    }

    if( this.requisicao_modal === 'motorista' ) {

      // Validacao para campos vazios
      if( data.nome === undefined || data.nome === '' || 
          data.rg === undefined || data.rg === '' ||
          data.cpf === undefined || data.cpf === '' ||
          data.inst_1 === undefined || data.inst_1 === '' || 
          data.contato_1 === undefined || data.contato_1 === '' ||         
          data.turno_1 === undefined || data.turno_1 === '' ||
          data.tipo === undefined || data.tipo === '' ||
          data.status === undefined || data.status === '' ||
          data.qtdTurnos === ''
      ){

        let toast = this.helperCtrl.mostra_toast('Por favor, preencha todos os campos corretamente para poder finalizar!', null, 3000 );
        toast.present();

        return false;

      }

      if( data.cpf.includes('_') ) {
        let toast = this.helperCtrl.mostra_toast('CPF Inválido!', null, 3000 );
        toast.present();
        return false;
      }
      if( data.contato_1.includes('_') || data.contato_2.includes('_') ) {
        let toast = this.helperCtrl.mostra_toast('Número de contato Inválido!', null, 3000 );
        toast.present();
        return false;
      }

      if( this.requisicao === 'adicionar' ) {
      
      } 

      if( this.requisicao === 'editar' ){

        if( !this.alterarFoto ){
          data.foto = '';
        }

      }

    }

    // Requisicao Documento 
    // -----------------------------------------

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

      if( this.requisicao === 'editar' ) {

        if( this.alterarImagem && data.img.indexOf('data:image/') === -1 ){

          let toast = this.helperCtrl.mostra_toast('Por favor, preencha todos os campos corretamente para poder finalizar!', null, 3000 );
          toast.present();
  
          return false;

        }

      }

    }

    return true;
    
  }

  public trimLastCharacter() {
    this.motorista.cpf = this.helperCtrl.trimLastCharacter( this.motorista.cpf, 14 );
    this.motorista.contato_1 = this.helperCtrl.trimLastCharacter( this.motorista.contato_1, 15 );
    if( this.motorista.contato_2 !== '' ) this.motorista.contato_2 = this.helperCtrl.trimLastCharacter( this.motorista.contato_2, 15 );
  }

}
