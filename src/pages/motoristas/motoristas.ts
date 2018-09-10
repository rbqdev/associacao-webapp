import { Component } from '@angular/core';
import { IonicPage, ModalController, NavController, NavParams } from 'ionic-angular';
import { MotoristasSinglePage } from './motoristas-single/motoristas-single';
import { MotoristasModal } from './motoristas-modal/motoristas-modal';
import { ApiFunctions } from './../../providers/api-functions';
import { HelperFunctions } from './../../providers/helper-functions';
import { Global } from './../../providers/global';

@IonicPage()
@Component({
  selector: 'page-motoristas',
  templateUrl: 'motoristas.html',
})
export class MotoristasPage {

    private motoristasGrupos: any [];
    private contagemMotoristasGrupo: any = [];

    private segment: string = 'ativos';
    private spinner: boolean = true;

    constructor(
        public navCtrl: NavController,
        public navParams: NavParams,
        public modalCtrl: ModalController,
        public api: ApiFunctions,
        public helperCtrl: HelperFunctions,
        public global: Global ) {
    }

    ionViewWillEnter() {
        this.atualiza_lista_motoristas();
    }

    atualiza_lista_motoristas( forcar_atualizar: boolean = false ){

        if( forcar_atualizar === true ||
            typeof this.global.get('informacoes-carregadas__motoristas') === 'undefined' ||
            this.global.get('carregou_lista-geral') === false ){

            this.spinner = false;
            this.api.getAuth('/motoristas/',
            result => {

                this.motoristasGrupos = this.helperCtrl.processa_size_fotos( result );

                this.processa_lista_motoristas( this.motoristasGrupos, lista => {

                    this.motoristasGrupos = lista;
                    this.global.set('carregou_lista-geral', true );
                    this.global.set('informacoes-carregadas__motoristas', this.motoristasGrupos );
                    this.global.set('informacoes-carregadas__motoristas-contagem', this.contagemMotoristasGrupo );
                    this.spinner = true;

                });


            }, error => {

                let toast = this.helperCtrl.mostra_toast('Não foi possivel listar os motoristas!', null, 2000 );
                toast.present();

                this.spinner = true;

            });

        } else {

            this.motoristasGrupos = this.global.get('informacoes-carregadas__motoristas');
            this.contagemMotoristasGrupo = this.global.get('informacoes-carregadas__motoristas-contagem');

        }

    }

    processa_lista_motoristas( data: any, sucessCallBack) {

        let processaMotoristas: any = data;
        let motoristasLista = [];
        let grupo = {
            hide: false,
            ativos: [{
                aeesp: [],
                contratado: []
            }],
            inativos: [],
            qtdAtivos: 0,
            qtdNaoAtivos: 0
        };
        motoristasLista.push(grupo);

        // Adiciona os assciados no grupo de acordo a sua instituicao
        motoristasLista.forEach((grupo: any) => {
            // Adiciona o associado no grupo pertencente, com status de associado ou desassociado
            processaMotoristas.forEach((motorista: any) => {
                // Insere um novo atributo HIDE para processamento de filtragem dos motoristas
                motorista.hide = false;

                if( motorista.status === 'inativo' ){

                    grupo.inativos.push(motorista);
                    // Contagem da quantidade atual na listagem de motoristas
                    if( motorista.hide === false || motorista.hide === 'false' ) {
                        grupo.qtdNaoAtivos++;
                    }

                } else {

                    if( motorista.tipo === 'motorista-aeesp' ){
                        grupo.ativos[0].aeesp.push(motorista);
                    } else {
                        grupo.ativos[0].contratado.push(motorista);
                    }

                    // Contagem da quantidade atual na listagem de motoristas
                    if( motorista.hide === false || motorista.hide === 'false' ) {
                        grupo.qtdAtivos++;
                    }

                }
            });

        });

        sucessCallBack( motoristasLista );
    }

    modal_adicionar_motorista() {

        let modal = this.modalCtrl.create( MotoristasModal, { requisicao : 'adicionar', requisicao_modal : 'motorista' });
        modal.present();
        modal.onWillDismiss((data: any) => {
            if( data ){
                this.atualiza_lista_motoristas( true );
            }
        });

    }

    single_motorista( motorista: any, segment: string = 'informacoes' ) {
        this.navCtrl.push(MotoristasSinglePage, {motorista, segment });
    }

}
