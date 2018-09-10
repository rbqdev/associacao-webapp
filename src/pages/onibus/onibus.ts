import { Component } from '@angular/core';
import { NavController, NavParams, ModalController, IonicPage } from 'ionic-angular';
import { OnibusSingle } from './onibus-single/onibus-single';
import { OnibusModal } from './onibus-modal/onibus-modal';
import { OnibusForm } from './onibus-form/onibus-form';
import { HelperFunctions } from './../../providers/helper-functions';
import { ApiFunctions } from './../../providers/api-functions';
import { Global } from './../../providers/global';

@IonicPage()
@Component({
  selector: 'page-onibus',
  templateUrl: 'onibus.html',
})
export class OnibusPage {

    segment_onibus: any = 'matutino';
    spinner_info_geral: boolean = true;
    spinner_onibus: boolean = true;

    informacoes_gerais: any = [];
    onibusLista: any = [];
    onibusContagem: any = {
        matutino: {
            semanal: 0,
            sabado: 0
        },
        vespertino: {
            semanal: 0,
            sabado: 0
        },
        noturno: {
            semanal: 0,
            sabado: 0
        }
    }

    constructor(
        public navCtrl: NavController,
        public navParams: NavParams,
        public modalCtrl: ModalController,
        public helperCtrl: HelperFunctions,
        public api: ApiFunctions,
        public global: Global ) {}

    ionViewWillEnter() {
        this.atualiza_informacoes_gerais();
        this.atualiza_lista_onibus();
    }

    atualiza_lista_onibus( forcar_atualizar: boolean = false ){

        if( forcar_atualizar === true ||
            typeof this.global.get('informacoes-carregadas__onibus') === 'undefined' ||
            this.global.get('informacoes-carregadas__onibus') === 'undefined' ||
            this.global.get('carregou_lista-geral') === false ||
            this.global.get('carregar_novamente') === true
        ){

            this.spinner_onibus = false;

            this.api.getAuth('/onibus/',
                result => {

                    this.onibusLista = result;
                    this.onibusContagem = this.contagem_onibus( this.onibusLista, this.onibusContagem);
                    this.global.set( 'carregou_lista-geral', true );
                    this.global.set( 'informacoes-carregadas__contagem-onibus', this.onibusContagem );
                    this.global.set( 'informacoes-carregadas__onibus', this.onibusLista );
                    this.global.set( 'carregar_novamente', false );
                    this.spinner_onibus = true;

                }, error => {

                    let toast = this.helperCtrl.mostra_toast('Não foi possivel listar os onibus!', null, 2000 );
                    toast.present();

                    this.spinner_onibus = true;

                }
            );

        } else {

            this.global.get('informacoes-carregadas__onibus', onibusLista => {
                this.onibusContagem = this.contagem_onibus(onibusLista, this.onibusContagem);
                this.onibusLista = onibusLista;
            });

        }

    }

    contagem_onibus( data: any, contagem: any ) {

        contagem.matutino.semanal = contagem.matutino.sabado = contagem.vespertino.semanal = contagem.vespertino.sabado = contagem.noturno.semanal = contagem.noturno.sabado = 0;

        for (var index = 0; index < data.length; index++) {
            if( data[index].turno === 'matutino' && data[index].encargo === 'semanal' ) contagem.matutino.semanal++;
            if( data[index].turno === 'matutino' && data[index].encargo === 'sabado' ) contagem.matutino.sabado++;
            if( data[index].turno === 'vespertino' && data[index].encargo === 'semanal' ) contagem.vespertino.semanal++;
            if( data[index].turno === 'vespertino' && data[index].encargo === 'sabado' ) contagem.vespertino.sabado++;
            if( data[index].turno === 'noturno' && data[index].encargo === 'semanal' ) contagem.noturno.semanal++;
            if( data[index].turno === 'noturno' && data[index].encargo === 'sabado' ) contagem.noturno.sabado++;
        }

        return contagem;

    }

    atualiza_informacoes_gerais( forcar_atualizar: boolean = false ) {

        if( forcar_atualizar === true ||
            typeof this.global.get('informacoes-carregadas__onibus_info_geral') === 'undefined' ||
            this.global.get('carregou_lista-geral') === false
        ){

            this.spinner_info_geral = false;
            this.api.getAuth('/onibus/get-info-geral/', result => {

                this.informacoes_gerais = result;
                this.spinner_info_geral = true;

                this.global.set( 'carregou_lista-geral', true );
                this.global.set( 'informacoes-carregadas__onibus_info_geral', this.informacoes_gerais );

            }, error => {
                let toast = this.helperCtrl.mostra_toast('Não foi possivel listar os motoristas!', null, 2000 );
                toast.present();
                this.spinner_info_geral = true;
            });

        } else {

            this.informacoes_gerais = this.global.get('informacoes-carregadas__onibus_info_geral');

        }

    }

    modal_editar_informacoes_gerais( informacoes: any = this.informacoes_gerais ) {
        let modal = this.modalCtrl.create(
            OnibusModal,
            {
                requisicao: 'editar',
                requisicao_modal: 'onibus_info_geral',
                informacoes: informacoes
            }
        );
        modal.present();
        modal.onWillDismiss((data: any) => {
        if( data )
            this.atualiza_informacoes_gerais( true );
        });
    }

    single_onibus( data: any, segment: string ) {
        this.navCtrl.push( OnibusSingle, { onibus: data });
    }

    adicionar_onibus() {
        this.navCtrl.push( OnibusForm, { requisicao: 'adicionar' });
    }

    modal_visualizacoes_associados() {
        let modal = this.modalCtrl.create( OnibusModal );
        modal.present();
    }

}
