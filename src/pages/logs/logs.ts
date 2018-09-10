import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController } from 'ionic-angular';
import { Global } from './../../providers/global';
import { HelperFunctions } from './../../providers/helper-functions';
import { ApiFunctions } from './../../providers/api-functions';
import { LogsFilter } from './logs-filter/logs-filter';

@IonicPage()
@Component({
  selector: 'page-logs',
  templateUrl: 'logs.html',
})
export class LogsPage {

    private logsGrupo = [];
    private carregouTodosRegistros: boolean = false;
    private spinner: boolean = true;
    private logsFiltros: any = [];

    constructor(
        public navCtrl: NavController,
        public navParams: NavParams,
        public modalCtrl: ModalController,
        public global: Global,
        public helperCtrl: HelperFunctions,
        public api: ApiFunctions ){
    }

    ionViewWillEnter() {
        this.atualiza_lista_logs_usuarios();
    }

    public atualiza_lista_logs_usuarios( forcar_atualizar: boolean = false ){

        if( forcar_atualizar === true ||
            typeof this.global.get('informacoes-carregadas__logs') === 'undefined' ||
            this.global.get('novo_log') === true ||
            this.global.get('carregou_lista-geral') === false
        ){

            this.global.get('logs-filtros_selecionados', global_filtro => {

                let url = '/logs?offset=' + 0;

                if( global_filtro !== undefined &&
                    global_filtro !== null &&
                    global_filtro.length !== 0 &&
                    ( global_filtro.acao !== ''|| global_filtro.objeto !== '' )
                ){
                    this.logsFiltros = global_filtro;
                    url += '&filtros=' + JSON.stringify(this.logsFiltros);
                } else {
                    this.logsFiltros = [];
                }

                this.spinner = false;
                this.api.getAuth(
                    url,
                    logs => {

                        this.logsGrupo = logs;
                        this.global.set( 'carregou_lista-geral', true );
                        this.global.set( 'informacoes-carregadas__logs', this.logsGrupo );
                        this.global.set( 'novo_log', false );
                        this.carregouTodosRegistros = false;
                        this.spinner = true;

                    }, error => {

                        let toast = this.helperCtrl.mostra_toast('Não foi possivel os logs dos usuários, tente novamente mais tarde!', null, 3000 );
                        toast.present();
                        this.spinner = true;

                    }
                );
            });

        } else {

            this.global.get('logs-filtros_selecionados', global_filtro => {
                if(global_filtro !== undefined && global_filtro !== null){
                    this.logsFiltros = global_filtro;
                }
                this.global.get('informacoes-carregadas__logs', logs => {
                    this.logsGrupo = logs;
                });
            });

        }

    }

    public scrollInfinite(infiniteScroll) {

        if(!this.carregouTodosRegistros) {

            this.global.get('logs-filtros_selecionados', global_filtro => {

                let url = '/logs?offset=' + this.logsGrupo.length;

                if( global_filtro !== undefined &&
                    global_filtro !== null &&
                    global_filtro.length !== 0 &&
                    ( global_filtro.acao !== ''|| global_filtro.objeto !== '' )
                ){
                    this.logsFiltros = global_filtro;
                    url += '&filtros=' + JSON.stringify(this.logsFiltros);
                } else {
                    this.logsFiltros = [];
                }

                this.api.getAuth(
                    url,
                    logs => {
                        if( logs.length !== 0 ) {
                            logs.forEach(element => {
                                this.logsGrupo.push(element);
                            });
                            infiniteScroll.complete();
                        } else {
                            this.carregouTodosRegistros = true;
                            let toast = this.helperCtrl.mostra_toast( 'Todos os registros foram carregados', null, 3000 );
                            toast.present();
                        }
                    }, error => {
                        let toast = this.helperCtrl.mostra_toast( 'Não foi possivel carregar mais registros', null, 3000 );
                        toast.present();
                    }
                );
            });

        } else {

            return false;

        }

    }

    public pesquisarLogs(){

        let alert = this.helperCtrl.mostra_alert_prompt(
            'Pesquisar Log',
            'Busca por autor, objeto ou descrição ',
            {
                'name' : 'termoPesquisa',
                'placeholder' : 'Digite o termo de pesquisa',
                'value' : ''
            },
            'Pesquisar',
            callBack => {

                let loader = this.helperCtrl.mostra_loader( 'Buscando logs, aguarde...' );
                loader.present();

                this.api.getAuth(
                    '/logs/pesquisa?termoPesquisa=' + callBack.termoPesquisa,
                    sucessoRetorno => {

                        if( sucessoRetorno.length !== 0 ){

                            this.logsGrupo = sucessoRetorno;
                            loader.dismiss();

                        } else {
                            let toast = this.helperCtrl.mostra_toast('Nenhum log encontrado com os termos digitados, tente novamente.', null, 2000 );
                            toast.present();
                            loader.dismiss();
                        }

                    }, error => {
                        console.log(error);
                    }
                );

            });

        alert.present();

    }

    public modalFiltrarLogs() {
        let modal = this.modalCtrl.create( LogsFilter );
        modal.present();
        modal.onWillDismiss((data: any) => {

            if( data ){
                this.atualiza_lista_logs_usuarios( true );
            }

        });
    }

    public removeFiltro( key: string ){
        this.logsFiltros[key] = '';
        this.global.set('logs-filtros_selecionados', this.logsFiltros, callBack => {
            if(callBack){
                this.global.set('log-filtro_html_single', key);
                this.atualiza_lista_logs_usuarios(true);
            }
        });
    }


}
