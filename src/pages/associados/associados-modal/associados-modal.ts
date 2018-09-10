import { Component } from '@angular/core';
import { NavController, NavParams, ViewController } from 'ionic-angular';
import { ApiFunctions } from './../../../providers/api-functions';
import { HelperFunctions } from './../../../providers/helper-functions';
import { Global } from './../../../providers/global';
// import createNumberMask from 'text-mask-addons/dist/createNumberMask';

// @IonicPage()
@Component({
    selector: 'page-associados-modal',
    templateUrl: 'associados-modal.html'
})
export class AssociadosModal {

    title_page: string = 'Novo Associado';
    requisicao: string = 'adicionar';
    requisicao_modal: string = 'associado';

    associado: any = {
        nome: '',
        rg: '',
        cpf: '',
        email: '',
        matricula: '',
        curso_id: '',
        inst: '',        // Valor Padrão de novo associado
        turno: '',  // Valor Padrão de novo associado
        contato: '',
        status: 'regular',  // Valor Padrão de novo associado
        status_tipo: '',
        status_desc: '',
        onibus_id: '',
        senha: '',
        tipo: '', // Valor Padrão de novo associado
        cargo_servico: '',
        foto: '',
        dias_da_semana: {
            segunda: false,
            terca: false,
            quarta: false,
            quinta: false,
            sexta: false,
            sabado: false
        },
        admin: false,
        data_registro_assoc: '',
        data_registro_sis: ''
    };

    // Masks INputs
    cpfMask: any;
    telMask: any;

    campos_desabilitados: boolean = false;

    alterarFoto: boolean = false;
    alterarSenha: boolean = false;
    senhaAlterada: string;

    cursos: any;
    onibus_lista: any;


    constructor(
        public navCtrl: NavController,
        public navParams: NavParams,
        public viewCtrl: ViewController,
        public helperCtrl: HelperFunctions,
        public api: ApiFunctions,
        public global: Global
    ){

        this.requisicao = this.navParams.get('requisicao');
        
        this.cpfMask = [/[0-9]/, /\d/, /\d/, '.', /\d/, /\d/, /\d/, '.', /\d/, /\d/, /\d/, '-', /[0-9]/, /[0-9]/];
        this.telMask = ['(', /[0-9]/, /\d/, ')', ' ', /\d/, /\d/, /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/ , /\d/];

        // this.gerar_senha_aleatoria();

        // Se for um novo cadastro de associado
        if( this.requisicao === 'adicionar' ) {
            this.associado.data_registro_assoc = this.associado.data_registro_sis = this.helperCtrl.get_dia_atual( true );
        }

        // Se for uma edicao de associado
        if( this.requisicao === 'editar' ){

            this.associado = this.navParams.get('associado');

            this.title_page = 'Editar Associado';
            this.campos_desabilitados = true;

            this.associado.data_registro_assoc = this.helperCtrl.parse_date_app(this.associado.data_registro_assoc);
            this.associado.data_registro_sis = this.helperCtrl.parse_date_app(this.associado.data_registro_sis);
        }

    }

    ionViewWillEnter() {
        this.sincroniza_dados();
    }

    modal_dismiss(data?: any) {
        this.viewCtrl.dismiss(data);
    }

    salvar( data: any ) {

        if( this.validacao_campos(data) ){

            if( this.requisicao === 'adicionar' ) {

                data.data_registro_assoc = this.helperCtrl.get_dia_atual();

                this.crud_associado( '/associados/create/', data, 'Cadastrando...', 'Cadastrado com sucesso!', 'Não foi possivel realizar o cadastro.' );

            } else if ( this.requisicao === 'editar' ) {

                if( this.alterarSenha ){

                    let alerta = this.helperCtrl.mostra_alert( 'Alterar Senha?', 'A caixa "Alterar Senha" está marcada! Você deseja alterar a senha deste usuário?' , alterar => {
                        this.crud_associado( '/associados/update/', data, 'Editando informações...', 'Informações editadas com sucesso!', 'Não foi possivel realizar a edição.' );
                    });
                    alerta.present();

                } else {

                    this.crud_associado( '/associados/update/', data, 'Editando informações...', 'Informações editadas com sucesso!', 'Não foi possivel realizar a edição.' );

                }

            }

        }

    }

    crud_associado( url: string, data: any, messagem_loader: string, mensagem_sucesso: string, mensagem_error: string, funcao_toast: any = null ){
        let loader = this.helperCtrl.mostra_loader( messagem_loader );
        loader.present();

        // Log
        let usuario_atual = this.global.get('usuario_atual');
        data = this.api.formataInformacoesLog( data, usuario_atual, 'associado', 'informacoes', data['nome'] );

        // Insere um novo associado ao banco de dados
        this.api.postAuth(
            url,
            data,
            sucesso => {

                loader.dismiss();

                let toast = this.helperCtrl.mostra_toast( mensagem_sucesso, funcao_toast , 3000, 'success' );
                toast.present();

                this.global.set( 'carregou_lista-geral', false );
                this.global.set( 'novo_log', true );

                this.modal_dismiss( true );

            }, error => {

                loader.dismiss();
                let toast = this.helperCtrl.mostra_toast( mensagem_error , funcao_toast , 3000 );
                toast.present();

            }
        );
    }

    verificacao_status( itemSelected: any ) {

        this.associado.admin = ( this.associado.status_tipo === 'isento-servico' && ( this.associado.tipo === 'estagiario' || this.associado.tipo === 'diretor') ) ? true : false;

    }

    validacao_campos( data: any ) {

        if( this.onibus_lista.length === 0 || this.cursos.length === 0 ) {
            let toast = this.helperCtrl.mostra_toast('É preciso ter ao menos 1 curso e 1 onibus cadastrado para poder cadastrar um associado!', null, 3000 );
            toast.present();

            return false;
        }

        /*
        * Validação todos o segmentos
        */
        if( this.requisicao === 'editar' && this.alterarFoto && !data.foto.includes('data:image') ){

            let toast = this.helperCtrl.mostra_toast('A caixa "Alterar Imagem" está marcada. Por favor, insira uma nova imagem para poder finalizar!', null, 3000 );
            toast.present();

            return false;

        }

        // Validacao para campos vazios
        if( data.nome === undefined || data.nome === '' ||
            data.rg === undefined || data.rg === '' ||
            data.cpf === undefined || data.cpf === '' ||
            data.curso_id === undefined || data.curso_id === '' ||
            data.turno === undefined || data.turno === '' ||
            data.email === undefined || data.email === '' ||
            data.matricula === undefined || data.matricula === '' ||
            data.onibus_id === undefined || data.onibus_id === ''
        ){

            let toast = this.helperCtrl.mostra_toast('Por favor, preencha todos os campos corretamente para poder finalizar!', null, 3000 );
            toast.present();

            return false;

        }

        // Validaçoes de Status
        if( data.status === 'negociacao' || data.status === 'afastado' ){
            if( data.status_desc === '' ){
                let toast = this.helperCtrl.mostra_toast('Por favor, informe a descrição do status de '+data.status+' para poder finalizar!', null, 3000 );
                toast.present();

                return false;
            }
        }

        // Validaçao de Inputs
        if( !data.email.includes('@') || (!data.email.includes('.com') && !data.email.includes('.com.br') )) {
            let toast = this.helperCtrl.mostra_toast('Email inválido!', null, 3000 );
            toast.present();
            return false;
        }
        if( data.cpf.includes('_') ) {
            let toast = this.helperCtrl.mostra_toast('CPF Inválido!', null, 3000 );
            toast.present();
            return false;
        }
        if( data.contato.includes('_') ) {
            let toast = this.helperCtrl.mostra_toast('Número de contato Inválido!', null, 3000 );
            toast.present();
            return false;
        }

        if( this.requisicao === 'adicionar' ) {

            if( data.admin ) {

                if( data.status === 'inadimplente' ||
                    data.status === 'pendente' ||
                    data.status === 'negociacao' ||
                    data.status === 'afastado' ||
                    data.status === 'desassociado' ){

                    let toast = this.helperCtrl.mostra_toast('Só é permitido ser administrador do sistema, um associado com status de pagamentos regular e possuir no minimo 6 meses de associado!', null, 3000 );
                    toast.present();

                    return;

                }
            }
        }

        if( this.requisicao === 'editar' ){

            // Validacao se o associado possui pagamentos pendentes
            if( data.status === 'regular' || data.status === 'isento' ) {

                let pagamentos_lista = this.global.get('informacoes-carregadas__pagamentos-id-'+this.associado.id);
                let existePagamentoPendente = false;

                if( pagamentos_lista ){
                    pagamentos_lista.forEach( pagamento => {
                    if( pagamento.pago === false || pagamento.pago === 'false' )
                        existePagamentoPendente = true;
                    });
                }

                if( existePagamentoPendente ) {

                    let toast = this.helperCtrl.mostra_toast('Este associado possui pagamentos pendentes! Por favor, regularize os pagamentos dos mesmo.', null, 3000 );
                    toast.present();

                    return;

                }

            }

            if( !this.alterarFoto ){
                data.foto = '';
            }

            // Validacao de nova senha
            if( this.alterarSenha ) {

                data.nova_senha = this.senhaAlterada;

            } else {
                this.senhaAlterada = '';
                data.senha = '';
                data.nova_senha = '';
            }

        }

        // Validacao de Masks
        if( data.cpf.length > 14 ) data.cpf = data.cpf.slice(0, data.cpf.length-1);
        if( data.contato.length > 15 ) data.contato = data.contato.slice(0, data.contato.length-1);

        // Validacao para tipo do associado e Administrador do sistema
        if( data.status_tipo !== 'isento-servico' ) {
            // data.tipo = 'simples';
            if( data.admin === true ) data.admin = false;
        }

        return true;

    }

    trimLastCharacter() {
        this.associado.cpf = this.helperCtrl.trimLastCharacter( this.associado.cpf, 14 );
        this.associado.contato = this.helperCtrl.trimLastCharacter( this.associado.contato, 15 );
    }

    gerar_senha_aleatoria() {

        if( this.requisicao === 'adicionar' ) {
            this.associado.senha = this.helperCtrl.gerar_senha_aleatoria( 8 );
            return;
        }

        if( this.requisicao === 'editar' ){
        if( this.alterarSenha === true ) {
            this.associado.senha = this.helperCtrl.gerar_senha_aleatoria( 8 );
        } else {
            this.associado.senha = '';
        }
            return;
        }

    }

    console_imagem( id_input: string ){

        this.helperCtrl.console_imagem_helper( id_input, imagem => {
            this.associado.foto = imagem;
        });

    }

    sincroniza_dados( forcar_atualizar: boolean = false ){

        if( forcar_atualizar === true ||
            typeof this.global.get('informacoes-carregadas__cursos') === 'undefined' ||
            typeof this.global.get('informacoes-carregadas__onibus') === 'undefined' ||
            this.global.get('carregou_lista-geral') === false
        ){

            this.api.getAuth( '/sync/',
            result => {

                this.cursos = result.cursos;
                this.onibus_lista = result.onibus;
                this.global.set( 'carregou_lista-geral', true );
                this.global.set( 'informacoes-carregadas__cursos', this.cursos );
                this.global.set( 'informacoes-carregadas__onibus', this.onibus_lista );

            }, error => {

                let toast = this.helperCtrl.mostra_toast('Não foi possivel sincronizar os dados do sistema, tente novamente mais tarde!', null, 3000 );
                toast.present();

            });

        } else {

            this.cursos = this.global.get('informacoes-carregadas__cursos');
            this.onibus_lista = this.global.get('informacoes-carregadas__onibus');

        }

    }

    /*
    * Funcao necessaria para passar a lista de cursos tanto para o single page quanto para cadastro de um novo associado
    */

    mostra_acoes_cursos() {

        let buttonsActions = [
            {
                text: 'Adicionar novo curso',
                role: 'add',
                icon: 'add',
                cssClass: 'adicionar',
                handler: () => {
                this.acao_adicionar_curso();
                }
            },
            {
                text: 'Cancelar',
                role: 'cancel',
                icon: 'close',
                cssClass: 'cancelar'
            }
        ];

        let actions = this.helperCtrl.mostra_actionsheet( 'Cursos - Ações', buttonsActions );
        actions.present();
    }

    acao_adicionar_curso() {

        let alert = this.helperCtrl.mostra_alert_prompt(
            'Adicionar novo Curso',
            null,
            {
                'name' : 'title',
                'placeholder' : 'Digite o Curso',
                'value' : ''
            },
            'Salvar',
            curso => {

                let loader = this.helperCtrl.mostra_loader( 'Inserindo curso, aguarde...' );
                loader.present();

                let data = {
                    'title' : curso.title,
                    'slug'  : curso.title.split(' ').join('-').toLowerCase()
                }

                let usuario_atual = this.global.get('usuario_atual');
                data = this.api.formataInformacoesLog( data, usuario_atual, 'curso', '', usuario_atual.nome );

                this.api.postAuth(
                    '/cursos/create/',
                    data,
                    sucesso => {

                        loader.dismiss();
                        let toast = this.helperCtrl.mostra_toast('Curso inserido com sucesso!', null, 2000, 'success' );
                        toast.present();

                        this.sincroniza_dados( true );
                        this.global.set( 'novo_log', true );

                    }, error => {

                        loader.dismiss();
                        let toast = this.helperCtrl.mostra_toast('Algo deu errado com a inserção, tente novamente.', null, 3000 );
                        toast.present();

                    }
                );
            }
        );

        alert.present();

    }

}
