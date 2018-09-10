import { Component } from '@angular/core';
import { ModalController, NavController } from 'ionic-angular';
import { AssociadosModal } from './associados-modal/associados-modal';
import { AssociadosSinglePage } from './associados-single/associados-single';
import { AssociadosFilter } from './associados-filter/associados-filter';
import { ApiFunctions } from './../../providers/api-functions';
import { HelperFunctions } from './../../providers/helper-functions';
import { Global } from './../../providers/global';

// @IonicPage()
@Component({
  selector: 'page-associados',
  templateUrl: 'associados.html'
})
export class AssociadosPage {

    private spinner: boolean = true;
    private associadosGrupos: any = [];
    private carregouTodosRegistros: boolean = false;
    private filtros: any = [];
    private termoPesquisado: string = '';

    constructor(
        private navCtrl: NavController,
        private modalCtrl: ModalController,
        private api: ApiFunctions,
        private helperCtrl: HelperFunctions,
        private global: Global
    ) {}

    ionViewWillEnter() {
        this.atualizaListaAssociados();
    }

    public atualizaListaAssociados( forcar_atualizar: boolean = false ){

        if( forcar_atualizar === true ||
            typeof this.global.get('informacoes-carregadas__associados') === 'undefined' ||
            this.global.get('informacoes-carregadas__associados') === 'undefined' ||
            this.global.get('carregou_lista-geral') === false
        ){

            this.spinner = false;
            this.global.get('filtros_selecionados', filtros_selecionados => {

                let url = '/associados?offset=' + 0;

                if( filtros_selecionados !== undefined &&
                    filtros_selecionados !== null &&
                    filtros_selecionados.length !== 0 &&
                    ( filtros_selecionados.status !== ''||
                      filtros_selecionados.inst !== '' ||
                      filtros_selecionados.turno !== '' ||
                      filtros_selecionados.curso !== ''
                    )
                ){
                    this.filtros = filtros_selecionados;
                    url += '&filtros=' + JSON.stringify(this.filtros);

                } else {
                    this.filtros = [];
                }

                this.api.getAuth(
                    url,
                    result => {

                        this.processaListaAssociados( result, lista => {

                            this.associadosGrupos = this.helperCtrl.processa_size_fotos( lista, true );
                            this.global.set( 'carregou_lista-geral', true );
                            this.global.set( 'informacoes-carregadas__associados', this.associadosGrupos );
                            this.carregouTodosRegistros = false;
                            this.spinner = true;

                        });

                    }, error => {

                        let toast = this.helperCtrl.mostra_toast('Não foi possivel listar os associados!', null, 2000 );
                        toast.present();

                        this.spinner = true;

                    }
                );
            });

        } else {

            this.global.get('filtros_selecionados', filtros_selecionados => {
                if( filtros_selecionados !== undefined &&
                    filtros_selecionados !== null &&
                    filtros_selecionados.length !== 0 &&
                    ( filtros_selecionados.status !== ''||
                      filtros_selecionados.inst !== '' ||
                      filtros_selecionados.turno !== '' ||
                      filtros_selecionados.curso !== ''
                    )
                ){
                    this.filtros = filtros_selecionados;
                }
                this.global.get('informacoes-carregadas__associados', associadosGrupo => {
                    this.associadosGrupos = associadosGrupo;
                });
            });

        }

    }

    public scrollInfinite(infiniteScroll) {

        if(!this.carregouTodosRegistros) {

            this.global.get('filtros_selecionados', filtros_selecionados => {

                let url = '/associados?offset=' + this.associadosGrupos.length;

                if( filtros_selecionados !== undefined &&
                    filtros_selecionados !== null &&
                    filtros_selecionados.length !== 0 &&
                    ( filtros_selecionados.status !== ''||
                      filtros_selecionados.inst !== '' ||
                      filtros_selecionados.turno !== '' ||
                      filtros_selecionados.curso !== ''
                    )
                ){
                    this.filtros = filtros_selecionados;
                    url += '&filtros=' + JSON.stringify(this.filtros);
                } else {
                    this.filtros = [];
                }

                this.api.getAuth(
                url,
                result => {

                    if( result.length !== 0 ) {
                        let listTemp = this.associadosGrupos;
                        result.forEach(element => {
                            listTemp.push(element);
                        });
                        this.processaListaAssociados( listTemp, lista => {
                            this.associadosGrupos = this.helperCtrl.processa_size_fotos( lista, true );
                            this.carregouTodosRegistros = false;
                        });
                        infiniteScroll.complete();
                    } else {
                        this.carregouTodosRegistros = true;
                        let toast = this.helperCtrl.mostra_toast( 'Todos os associados foram carregados', null, 1000 );
                        toast.present();
                    }

                }, error => {
                    let toast = this.helperCtrl.mostra_toast( 'Não foi possivel carregar mais registros', null, 1000 );
                    toast.present();
                });

            });


        } else {

            return false;

        }

    }

    public processaListaAssociados( data: any, sucessCallBack ) {

        let cursos = this.global.get('informacoes-carregadas__cursos');
        let onibus = this.global.get('informacoes-carregadas__onibus');

        for( let indexAssociado = 0; indexAssociado < data.length; indexAssociado++ ){

            for( let r = 0; r < onibus.length; r++ ){
                if( parseInt(data[indexAssociado].onibus_id) === parseInt(onibus[r].id)  ){
                    data[indexAssociado].onibus_title = onibus[r].title +' - '+ onibus[r].turno;
                }
            }

            for( let j = 0; j < cursos.length; j++ ){
                if( parseInt(data[indexAssociado].curso_id) === parseInt(cursos[j].id) ){
                    data[indexAssociado].curso_slug = cursos[j].slug;
                }
            }

        }

        sucessCallBack( data );
    }

    public pesquisarAssociados(){

        let alert = this.helperCtrl.mostra_alert_prompt(
            'Pesquisar Associado',
            'Busca pelo nome',
            {
              'name' : 'termoPesquisa',
              'placeholder' : 'Digite o nome para pesquisar',
              'value' : ''
            },
            'Pesquisar',
            callBack => {

                this.termoPesquisado = callBack.termoPesquisa;

                let loader = this.helperCtrl.mostra_loader( 'Buscando associados, aguarde...' );
                loader.present();

                this.api.getAuth(
                    '/associados/pesquisa?termoPesquisa=' + callBack.termoPesquisa,
                    sucessoRetorno => {

                        if( sucessoRetorno.length !== 0 ){
                            this.processaListaAssociados( sucessoRetorno, lista => {
                                this.associadosGrupos = this.helperCtrl.processa_size_fotos( lista, true );
                                loader.dismiss();
                            });
                        } else {
                            let toast = this.helperCtrl.mostra_toast('Nenhum associado encontrado com os termos digitados, tente novamente.', null, 2000 );
                            toast.present();
                            loader.dismiss();
                        }

                    }, error => {}
                );

            });

        alert.present();

    }

    public removeTermoPesquisa(){
        this.termoPesquisado = '';
        this.atualizaListaAssociados( true );
    }

    public removeFiltro( key: string ){
        this.filtros[key] = '';
        this.global.set('filtros_selecionados', this.filtros, callBack => {
            if(callBack){
                this.global.set('filtro_html_single', key);
                this.atualizaListaAssociados(true);
            }
        });
    }

    public modalAdicionarAssociado() {

        let modal = this.modalCtrl.create( AssociadosModal, { requisicao : 'adicionar', requisicao_modal : 'associado' });
        modal.present();
        modal.onWillDismiss((data: any) => {

            if( data ){
                this.atualizaListaAssociados( true );
            }

        });

    }

    public modalFiltrarAssociados() {
        let modal = this.modalCtrl.create( AssociadosFilter );
        modal.present();
        modal.onWillDismiss((data: any) => {

            if( data ){
                this.atualizaListaAssociados( true );
            }

        });
    }

    public singlePageAssociado( associadoData: any, segment: string = 'informacoes' ) {
        this.navCtrl.push(AssociadosSinglePage, {associadoData, segment });
    }

} // End Class
